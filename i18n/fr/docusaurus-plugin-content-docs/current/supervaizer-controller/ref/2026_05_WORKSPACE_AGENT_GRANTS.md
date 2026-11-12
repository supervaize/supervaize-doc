# Workspace Agent Grants {#workspace-agent-grants}

> **Créé :** 2026-05-18
> **Mis à jour :** 2026-09-25

Ce document décrit le modèle d'autorisation de Supervaizer v2 pour les agents partagés. Le côté SDK est implémenté dans `supervaizer.workspace_authorization` ; Studio gère les autorisations (grants) et émet les jetons.

Le problème n'est pas le routage. Un slug d'espace de travail permet d'acheminer une requête, mais il ne prouve pas que l'espace de travail a approuvé l'agent. Si les agents acceptent `tenant_slug` ou `workspace_slug` comme source d'autorité, un développeur d'agent pourrait simuler des appels Studio pour un autre espace de travail, puis lire ou modifier des données côté agent sans l'accord de cet espace de travail.

Le modèle recommandé repose sur un **Workspace Agent Grant** (autorisation d'agent pour un espace de travail) géré par Studio, associé à un jeton d'autorisation d'espace de travail de courte durée, signé par Studio, sur chaque requête de Studio vers l'agent.

## Décision {#decision}

Studio doit être la source de vérité pour l'approbation d'un espace de travail.

Lorsqu'un administrateur d'espace de travail accepte un agent, Studio crée une autorisation durable. Cela vaut aussi bien pour les espaces de travail destinataires d'agents partagés que pour l'espace de travail propriétaire de son propre agent. L'espace de travail propriétaire ne contourne pas l'autorisation à l'exécution : il doit disposer d'une autorisation acceptée, avec une liaison explicite à un espace de travail côté agent, avant que Studio puisse exploiter l'agent.

```text
WorkspaceAgentGrant
- id
- workspace_id
- workspace_slug
- agent_id
- server_id
- offered_by_workspace_id
- accepted_agent_version
- accepted_contract_fingerprint
- accepted_by_admin_id
- accepted_at
- revoked_by_user_id
- status: accepted | revoked | suspended
- scopes
- acceptance_snapshot
- created_at
- revoked_at
```

Toute requête de Studio vers l'agent qui utilise des données de l'espace de travail doit inclure un jeton d'autorisation d'espace de travail signé. L'agent vérifie ce jeton avant de faire confiance à un contexte d'espace de travail, de tenant, de ressource, de jeu de données, de job ou d'action.

Les slugs bruts ne sont jamais des primitives d'autorisation.

## Modèle de confiance {#trust-model}

Supervaizer v2 distingue plusieurs besoins de confiance :

| Besoin | Mécanisme existant ou nouveau | Objectif |
| --- | --- | --- |
| Authentification de l'agent auprès de Studio | `SUPERVAIZE_API_KEY` | Permet à l'agent d'appeler les API Studio et d'envoyer des événements du contrôleur. |
| Authentification du transport de Studio vers l'agent | `SUPERVAIZER_API_KEY` | Permet à Studio d'appeler le contrôleur de l'agent. |
| Clé publique de l'agent | enregistrement du serveur existant | Permet à Studio de chiffrer les données sensibles à destination de l'agent. |
| Autorisation d'espace de travail | nouveau jeton d'autorisation signé par Studio | Prouve qu'un administrateur d'espace de travail a accepté cet agent et que la requête est limitée à cette autorisation. |

La clé publique de l'agent protège la confidentialité. Elle ne prouve pas qu'un espace de travail a accepté l'agent. L'approbation de l'espace de travail exige le jeton d'autorisation signé.

## Choix de la clé de signature {#signing-key-decision}

L'autorisation d'espace de travail utilise une famille de clés de signature Studio dédiée, distincte de la signature des artefacts de skills et distincte de la clé publique de l'agent échangée lors de l'enregistrement du serveur.

L'algorithme du jeton est **EdDSA avec des clés Ed25519**. Supervaizer v2 doit rejeter les jetons signés avec tout autre algorithme JWT.

Studio ne doit pas dupliquer le code cryptographique pour chaque usage de signature. L'implémentation partagée doit fournir des primitives Ed25519 réutilisables pour :

- la génération de paires de clés
- la génération d'identifiants de clé
- la signature de JWT compacts
- la génération de JWK publiques
- la génération de charges utiles JWKS

La signature des artefacts de skills et celle des autorisations d'espace de travail peuvent stocker leurs clés dans des tables distinctes et exposer des points de terminaison JWKS distincts, mais elles doivent appeler le même code d'assistance Ed25519 partagé. La séparation porte sur les domaines de confiance et la politique de rotation, pas sur la duplication de la logique de signature.

## Exigence d'agent sans état {#stateless-agent-requirement}

Les agents peuvent ne pas avoir de mémoire locale persistante. Le modèle d'autorisation doit donc être sans état du point de vue de l'agent.

Studio stocke l'autorisation. Studio signe un jeton de courte durée. L'agent vérifie le jeton à chaque requête et construit un contexte de requête de confiance uniquement pour cette requête.

L'agent n'a besoin que d'éléments de confiance stables, configurés par des variables d'environnement :

| Variable | Objectif |
| --- | --- |
| `SUPERVAIZER_WORKSPACE_AUTH_REQUIRED` | `true` active la vérification (par défaut `false`) |
| `SUPERVAIZER_WORKSPACE_AUTH_ISSUER` | Valeur attendue de `iss` (URL de l'émetteur Studio) |
| `SUPERVAIZER_WORKSPACE_AUTH_PUBLIC_KEY` ou `SUPERVAIZER_WORKSPACE_AUTH_JWKS_URL` | Clé publique Ed25519 (PEM) ou point de terminaison JWKS |
| `SUPERVAIZER_WORKSPACE_AUTH_AUDIENCE` | Valeur de remplacement facultative pour `aud` attendu |
| `SUPERVAIZER_WORKSPACE_AUTH_LEEWAY_SECONDS` | Tolérance de décalage d'horloge, 30 par défaut |

Pour le Studio de production, `SUPERVAIZER_WORKSPACE_AUTH_ISSUER` vaut `https://studio.supervaize.com`. L'URL JWKS utilise l'origine de l'API Studio et le slug de l'espace de travail, par exemple `https://app.supervaize.com/w/your-workspace-slug/api/v1/workspace-agent-grants/jwks/`. Dans Studio, ouvrez **Developer → Environment variables** pour copier les valeurs générées pour l'espace de travail. Ces paramètres d'émetteur et de JWKS sont des données de vérification publiques, pas des secrets d'API. Pour un autre déploiement de Studio, utilisez ses valeurs générées afin que l'émetteur corresponde aux jetons qu'il signe. Si un déploiement personnalisé remplace la variable côté serveur `STUDIO_PUBLIC_ORIGIN`, définissez la même valeur dans la variable de build du frontend Studio `VITE_STUDIO_PUBLIC_ORIGIN`.

Lorsque les points de terminaison A2A sont activés et que le contrôleur s'enregistre auprès de Studio, `Server.launch()` refuse de démarrer tant que `REQUIRED=true`, `ISSUER` et une source de clé ne sont pas tous définis. Le mode local (`supervaizer start --local`) ignore cette vérification. L'agent n'a pas besoin de stocker les autorisations localement.

## Structure du jeton {#token-shape}

Le jeton est un JWT compact signé avec EdDSA.

Revendications (claims) recommandées :

```json
{
  "iss": "https://studio.supervaize.com",
  "aud": "supervaizer-server:01SERVER",
  "sub": "workspace-agent-grant:01GRANT",
  "grant_id": "01GRANT",
  "workspace_id": "01WORKSPACE",
  "workspace_slug": "recipient-workspace",
  "agent_id": "01AGENT",
  "agent_slug": "my-agent",
  "server_id": "01SERVER",
  "scopes": [
    "supervaizer/surface.load",
    "supervaizer/action.invoke",
    "resource.contacts.list",
    "job.start"
  ],
  "agent_workspace_ref": "01AGENTWORKSPACE",
  "iat": 1779100000,
  "exp": 1779100600,
  "jti": "01TOKEN"
}
```

`workspace_slug` est purement informatif. L'identité de confiance est `workspace_id` associé à `grant_id`.

`agent_workspace_ref` est utile pour les agents sans état. S'il est présent, Studio possède la liaison entre l'autorisation d'espace de travail Studio et la référence d'espace de travail côté agent. S'il est absent, l'agent peut résoudre la liaison depuis un magasin de données externe de confiance, à l'aide de `grant_id` ou de `workspace_id`. Les agents qui ne peuvent pas résoudre cette liaison depuis un autre magasin de confiance doivent exiger `agent_workspace_ref` et échouer explicitement lorsqu'il est absent.

## Enregistrement de la liaison d'espace de travail {#workspace-binding-registration}

Les agents qui ont besoin d'un enregistrement côté agent avant que Studio puisse les exploiter déclarent un bloc générique `workspace_binding` dans l'enregistrement Supervaizer v2. Ce bloc ne nomme aucun concept propre à un agent, comme tenant, compte ou projet.

```json
{
  "workspace_binding": {
    "required": true,
    "modes": ["bind_existing", "create_and_bind"],
    "reference_label": "Agent workspace reference",
    "reference_help": "Select or create the agent-side record this Studio workspace may access.",
    "reference_placeholder": "Example: workspace-prod",
    "existing": {
      "action": "workspace_binding.options",
      "value_field": "agent_workspace_ref",
      "label_field": "display_name"
    },
    "create": {
      "surface": "workspace_binding.create",
      "action": "workspace_binding.create"
    }
  }
}
```

Supervaizer traite exactement deux actions et une surface comme des capacités d'amorçage :

- `workspace_binding.options` et `workspace_binding.create` peuvent s'exécuter avant l'existence de l'autorisation d'espace de travail ; les identifiants personnalisés configurés dans `existing.action` ou `create.action` ne sont pas exemptés.
- `workspace_binding.options` liste les enregistrements existants côté agent qui peuvent être liés.
- `workspace_binding.create` crée un nouvel enregistrement côté agent et renvoie le `agent_workspace_ref` que Studio doit stocker dans l'autorisation.
- La surface `workspace_binding.create` peut exposer un formulaire A2UI pour collecter les champs nécessaires à la création de l'enregistrement côté agent.

Ces appels d'amorçage exigent toujours l'authentification de transport habituelle de Studio vers l'agent, via `SUPERVAIZER_API_KEY`. Ils n'exigent pas de jeton d'autorisation d'espace de travail existant, car ils servent à créer l'autorisation que les futurs jetons représenteront. Toute surface et toute action hors amorçage restent bloquées tant que Studio n'envoie pas un jeton d'autorisation d'espace de travail valide.

## Transport de la requête {#request-transport}

Le transport préféré est un en-tête HTTP :

```text
X-Supervaize-Workspace-Authorization: Bearer <signed-token>
```

Pour les requêtes JSON-RPC A2A, Studio doit aussi exposer le contexte d'espace de travail vérifié dans le modèle de requête Supervaizer v2, une fois la vérification du SDK effectuée. Les gestionnaires de l'agent doivent recevoir un contexte structuré de confiance au lieu d'analyser eux-mêmes les en-têtes.

Le SDK doit échouer avant de transmettre la requête au gestionnaire lorsque le jeton est absent, invalide, expiré, destiné à une mauvaise audience, à un mauvais agent ou à un mauvais serveur, révoqué par introspection, ou lorsqu'il manque une portée (scope) requise.

## Flux d'exécution {#runtime-flow}

### 1. Enregistrement de l'agent {#1-agent-registration}

Le développeur de l'agent configure l'enregistrement normal du serveur :

- `SUPERVAIZE_API_KEY` pour les appels de l'agent vers Studio
- l'identité du serveur
- la clé publique
- l'enregistrement Supervaizer v2 et les métadonnées de l'Agent Card A2A

Cela n'accorde pas l'accès à l'espace de travail de chaque tenant. L'agent devient seulement connu de Studio.

### 2. Partage de l'agent {#2-agent-sharing}

Studio peut présenter l'agent à un autre espace de travail comme partageable ou installable. Tant qu'un utilisateur autorisé ne l'a pas accepté, l'espace de travail destinataire n'a aucune autorisation active.

L'interface de l'espace de travail cible doit afficher l'agent comme **en attente d'acceptation**, et non comme un agent installé ou utilisable. Les agents en attente ne doivent pas apparaître comme agents d'exécution sélectionnables dans les parcours de mission et de job.

### 3. Acceptation par l'administrateur {#3-admin-acceptance}

Un administrateur d'espace de travail ou un utilisateur gestionnaire d'agents accepte l'agent. Studio crée `WorkspaceAgentGrant(status="accepted")` avec des portées explicites et, pour les agents qui exigent une liaison d'espace de travail sans état, un `agent_workspace_ref` obligatoire.

L'acceptation doit être explicite et traçable. Studio enregistre :

- qui a accepté l'agent
- quand il a été accepté
- quel espace de travail l'a accepté
- quels agent et serveur ont été acceptés
- quelle version de l'agent et quelle empreinte du contrat v2 ont été acceptées
- quelles portées ont été accordées
- les conditions ou le résumé d'acceptation présentés à l'utilisateur

Si l'agent modifie plus tard ses portées déclarées, l'identité de son serveur, ses attentes de signature ou l'empreinte de son contrat, Studio doit exiger une nouvelle acceptation avant d'activer la capacité étendue.

### 4. Studio appelle l'agent {#4-studio-calls-agent}

Pour `surface.load`, `action.invoke`, les opérations sur les ressources, les requêtes sur les jeux de données, `job.start` et `job.sync`, Studio envoie :

- `SUPERVAIZER_API_KEY` pour l'authentification du transport
- le jeton d'autorisation d'espace de travail pour l'autorisation d'espace de travail
- la charge utile de requête Supervaizer v2 habituelle

### 5. Vérification par le SDK {#5-sdk-verification}

Supervaizer vérifie le jeton (`EdDSA` uniquement, `X-Supervaize-Workspace-Authorization: Bearer <token>`) et expose les revendications vérifiées aux gestionnaires sous la forme `WorkspaceAuthorizationClaims` :

```text
WorkspaceAuthorizationClaims
- iss, aud, sub, iat, exp, jti
- grant_id
- workspace_id
- workspace_slug (informational)
- agent_id
- agent_slug
- server_id
- scopes (non-empty)
- agent_workspace_ref (optional)
```

Les gestionnaires utilisent ces revendications. Ils ne doivent pas se fier à `workspace_slug`, à `tenant_slug` ni aux filtres de ressources fournis par l'appelant comme preuve d'autorisation.

## Révocation {#revocation}

Les jetons sont de courte durée, idéalement de 5 à 15 minutes.

Les autorisations révoquées ou suspendues cessent de fonctionner à l'expiration des jetons existants. Le SDK n'interroge pas l'état des autorisations (pas d'introspection) ; pour les opérations à haut risque, Studio peut ajouter une introspection avant d'émettre ou de transmettre un jeton :

- `job.start`
- les imports de ressources
- les modifications de ressources
- les exports de jeux de données
- l'accès aux artefacts sensibles

Si l'introspection est activée et que Studio ne peut pas confirmer l'autorisation, la requête échoue par refus (fail closed).

## Impact sur l'interface de Studio {#studio-ui-impact}

Studio doit faire du partage d'agent un parcours d'installation explicite dans l'espace de travail cible.

### États de l'agent dans l'espace de travail cible {#target-workspace-agent-states}

Studio doit distinguer au moins ces états dans l'espace de travail cible :

| État | Signification | Comportement de Studio |
| --- | --- | --- |
| `available` | L'agent a été partagé ou rendu installable, mais aucun utilisateur de l'espace de travail cible ne l'a accepté. | Afficher l'appel à l'action d'installation ou d'acceptation uniquement aux administrateurs d'espace de travail et aux gestionnaires d'agents. Interdire l'usage dans les missions et les jobs. |
| `accepted` | Un administrateur d'espace de travail ou un gestionnaire d'agents a accepté l'agent. | Afficher l'agent comme utilisable dans les parcours de mission et de job, selon les portées et les permissions. |
| `revoked` | L'espace de travail a retiré l'agent. | Masquer l'agent des parcours habituels de mission et de job. Les jobs existants restent visibles selon la politique d'audit, mais les nouveaux appels échouent. |
| `suspended` | Studio ou l'espace de travail offrant l'agent a désactivé l'autorisation. | Afficher un état désactivé clair et bloquer les appels. |

### Écran d'acceptation {#acceptance-screen}

L'écran d'acceptation doit fournir assez d'informations pour qu'un administrateur ou un gestionnaire d'agents prenne une décision éclairée :

- nom de l'agent et éditeur
- espace de travail offrant l'agent, ou propriétaire
- identité du serveur contrôleur
- version de l'agent
- version du contrat Supervaizer v2
- portées demandées et leur signification pour l'utilisateur
- ressources et jeux de données que l'agent veut exposer
- indication précisant si l'agent accédera à des données propres à l'espace de travail
- la liaison d'espace de travail côté agent, si elle est configurée
- liens vers les conditions, la documentation et les informations de confidentialité et de sécurité, lorsqu'ils sont disponibles

L'action principale doit être explicite, par exemple `Accept agent for this workspace`. Un membre ordinaire doit voir que l'approbation d'un administrateur est requise, et non une erreur générique ou une page d'agent vide.

### Enregistrement de l'acceptation {#recording-acceptance}

Studio doit stocker un instantané d'acceptation immuable dans l'autorisation. Cet instantané doit conserver ce que l'utilisateur a accepté, même si l'agent modifie plus tard son enregistrement.

Instantané minimal :

```json
{
  "agent_name": "My Agent",
  "agent_slug": "my-agent",
  "server_id": "01SERVER",
  "agent_version": "1.0.0",
  "supervaizer_contract_version": 2,
  "a2a_version": "0.2.6",
  "a2ui_version": "v0.8",
  "a2ui_catalog_version": "my-agent.2026-05-18",
  "scopes": ["job.start", "resource.contacts.list"],
  "resources": ["contacts"],
  "datasets": ["progress_metrics"],
  "accepted_by_user_id": "01USER",
  "accepted_at": "2026-05-18T11:30:00Z"
}
```

### Révocation par retrait de l'agent {#revocation-by-removing-the-agent}

Retirer l'agent de l'espace de travail cible doit révoquer le `WorkspaceAgentGrant`.

Studio enregistre :

- qui a retiré l'agent
- quand il a été retiré
- le motif, s'il est fourni
- l'identifiant de l'autorisation précédente
- les jobs actifs concernés, le cas échéant

Après la révocation :

- Studio doit cesser d'émettre des jetons d'autorisation d'espace de travail pour cette autorisation.
- Les appels de l'agent concernant les ressources, les jeux de données, les artefacts, `job.start` et la validation humaine (HITL) doivent échouer avec une erreur claire d'autorisation révoquée.
- Les jobs et les cases existants doivent rester visibles comme enregistrements historiques et d'audit, sauf si la politique produit les supprime explicitement.
- Les jobs en cours d'exécution doivent suivre la politique de révocation de l'espace de travail, probablement `fail_in_studio` ou `cancel_requested`, et non se poursuivre silencieusement.

Aucun repli vers une nouvelle autorisation ne doit se produire sans une nouvelle acceptation explicite.

## Accès aux données côté agent {#agent-side-data-access}

Les gestionnaires de l'agent déduisent le tenant ou le magasin de données à partir des revendications vérifiées (`workspace_id`, `grant_id`, `agent_workspace_ref`), jamais d'un slug brut de la requête. Si le jeton est valide mais qu'aucune liaison d'espace de travail côté agent n'existe, l'échec doit être explicite :

```text
Workspace is authorized in Studio but has no agent-side workspace binding.
```

Ne revenez pas à une correspondance par slug.

## Politique d'échec {#failure-policy}

Pas de supposition ni de repli implicite.

Le système doit échouer avec des erreurs explicites dans les cas suivants :

- aucun jeton d'autorisation d'espace de travail n'est fourni
- le jeton est expiré ou mal formé
- le jeton n'a pas été signé par Studio
- l'audience du jeton ne correspond pas au serveur
- l'agent du jeton ne correspond pas à l'agent appelé
- l'espace de travail du jeton n'a aucune autorisation acceptée
- l'autorisation est révoquée ou suspendue
- il manque au jeton une portée requise
- la liaison d'espace de travail côté agent est absente

Studio doit présenter ces échecs aux opérateurs comme des erreurs de configuration ou d'autorisation, et non comme des tableaux vides ou des échecs de chargement génériques.

## Critères d'acceptation {#acceptance-criteria}

- Un agent partagé ne peut pas lister de ressources pour un espace de travail tant qu'un administrateur de cet espace de travail n'a pas accepté l'agent.
- Un administrateur d'espace de travail ou un gestionnaire d'agents doit accepter explicitement un agent partagé avant qu'il apparaisse dans les parcours de mission et de job.
- Studio enregistre qui a accepté quoi, quand, et sous quel contrat et quelles portées.
- Retirer un agent d'un espace de travail révoque l'autorisation et arrête l'émission de nouveaux jetons.
- Un `workspace_slug` ou un `tenant_slug` falsifié ne peut pas donner accès.
- Une clé d'API de transport valide, sans jeton d'autorisation d'espace de travail, ne peut pas accéder aux ressources propres à un espace de travail.
- Un jeton d'espace de travail valide pour un espace de travail ne peut pas accéder à un autre espace de travail.
- Un jeton d'espace de travail valide pour un agent ne peut pas accéder à un autre agent.
- Un agent sans persistance locale peut quand même vérifier chaque requête.
- Les autorisations révoquées cessent d'autoriser les requêtes à l'expiration du jeton, et immédiatement pour les opérations qui utilisent l'introspection.
- Studio et les agents affichent des erreurs claires en cas d'autorisation manquante, de portée manquante et de liaison d'espace de travail manquante.

## Identité du serveur et démarrage {#server-identity-and-startup}

- Une autorisation est liée à l'identité du serveur Studio enregistré (`server.register.details.server_id`), jamais à un identifiant d'instance de processus éphémère. Le SDK la lit dans `SUPERVAIZER_SERVER_ID` et génère un nouvel UUID par processus lorsqu'elle n'est pas définie ; les déploiements doivent donc définir `SUPERVAIZER_SERVER_ID` (et `SUPERVAIZER_PRIVATE_KEY`) pour conserver une identité stable entre les redémarrages et les instances.
- Les échecs de la négociation d'enregistrement sont des échecs de démarrage, pas des échecs latents à l'exécution. L'agent doit refuser de démarrer lorsque Studio n'a pas conservé la clé d'API effective du contrôleur, ou lorsque la réponse de la négociation ne contient pas les données nécessaires pour vérifier les appels de Studio vers l'agent.
- Les contrôles de l'empreinte du contrat distinguent les changements qui étendent les droits (nouvelles portées, nouvel accès aux données) des simples rafraîchissements sans conséquence. Seuls les changements qui étendent les droits exigent une nouvelle acceptation explicite.


*Importé le 2026-11-06 15:07:19*
