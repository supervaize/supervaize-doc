# Prise en charge des protocoles {#protocol-support}

> **Créé :** 2025-08-06
> **Mis à jour :** 2026-09-25

SUPERVAIZER utilise plusieurs couches de protocoles. Elles sont liées, mais remplissent des rôles différents :

| Couche | Rôle dans Supervaizer | État actuel |
| --- | --- | --- |
| **A2A** | Transport et découverte : Agent Cards, URL du contrôleur, appels de méthodes JSON-RPC et flux d'événements. | Implémenté pour la découverte, `supervaizer/action.invoke`, `supervaizer/surface.load` et l'observation SSE. |
| **A2UI** | Charges utiles de surface : documents d'interface déclaratifs pour les formulaires, tableaux de bord, vues de détail et workflows de ressources montées rendus par Studio. | Implémenté comme format de charge utile renvoyé par `supervaizer/surface.load`. |
| **AG-UI** | Exécution en direct agent-utilisateur : flux d'événements bidirectionnel pour les messages en streaming, les appels d'outils, les mises à jour d'état et les sessions d'agent interactives. | Ne fait pas partie de l'exécution du MVP ; l'enregistrement v2 ne transporte que la métadonnée facultative `ag_ui_version`. |
| **Supervaizer v2** | Sémantique applicative : jobs, cases, étapes, ressources, jeux de données, surfaces, actions, artefacts et politique de synchronisation et de mode hors ligne. | Implémenté comme le contrat d'opération de Studio, au-dessus d'A2A et d'A2UI. |

Le modèle détaillé de Supervaizer v2 est documenté dans [2026_05_SUPERVAIZER_v2.md](2026_05_SUPERVAIZER_v2.md).

## Protocole Agent-to-Agent (A2A) {#agent-to-agent-a2a-protocol}

### Vue d'ensemble {#overview}

SUPERVAIZER implémente une découverte d'agents de type [A2A](https://a2a-protocol.org/) et un point de terminaison de contrôleur JSON-RPC. L'Agent Card est le format propre à Supervaizer (`schema_version: a2a_2023_v1`) et ne suit pas champ par champ le schéma AgentCard d'A2A en amont.

### Fonctionnalités A2A implémentées {#implemented-a2a-features}

- **Découverte d'agents** : `/.well-known/agents.json` liste tous les agents servis par le contrôleur
- **Agent Cards** : `/.well-known/agents/v{version}/{agent_slug}_agent.json`, ainsi que la route historique sans version `/.well-known/agents/{agent_slug}_agent.json`. Le champ `api_endpoints[].url` de la carte pointe vers `/api/supervaizer/agents/{agent_slug}`, `human_url` vers la page d'instructions de cet agent, et `authentication` déclare l'en-tête `X-API-Key`. `version_info.changelog_url` n'apparaît que lorsque l'agent définit `release_notes_url`
- **Surveillance de l'état de santé** : état du système et des agents à l'adresse `/.well-known/health`
- **Point de terminaison de contrôleur JSON-RPC** : `POST /a2a` prend en charge les méthodes Supervaizer v2, dont `supervaizer/action.invoke` et `supervaizer/surface.load` ; les requêtes exigent `X-API-Key` avec la portée d'écriture
- **Server-Sent Events** : `GET /a2a/events` diffuse en continu les effets des actions Supervaizer v2 pour les observateurs qui ont besoin d'un flux en direct ; les requêtes exigent `X-API-Key` avec la portée de lecture

### Extension Supervaizer v2 de l'Agent Card {#supervaizer-v2-agent-card-extension}

Lorsqu'un agent déclare `supervaizer_v2_registration`, son Agent Card A2A inclut une extension `supervaizer.v2`. Studio lit cette extension pour valider la compatibilité des protocoles et découvrir :

- les versions de protocole épinglées : `supervaizer_contract_version`, `a2a_version`, `a2ui_version`, `ag_ui_version` (facultatif) et `a2ui_catalog_version`, propre à l'agent
- les URL du contrôleur et la prise en charge des transports
- les surfaces et les actions prises en charge
- les voies de cases et les types d'artefacts
- les contrats de ressources, de jeux de données et de tableaux de bord
- la politique de job, y compris la prise en charge de `job.sync` et le comportement hors ligne

Cette extension ne **remplace pas** le modèle de confiance existant pour l'enregistrement du serveur auprès de Studio. L'enregistrement dans Studio reste responsable de l'identité du serveur, de l'échange de clés publiques et du traitement des charges utiles chiffrées. L'Agent Card A2A annonce le contrat opérationnel v2 une fois le contrôleur connu.

### Autorisation d'espace de travail {#workspace-authorization}

Les slugs d'espace de travail et de tenant ne suffisent pas pour autoriser l'accès à un agent partagé. Un contrôleur Supervaizer v2 doit les traiter uniquement comme des indications d'affichage et de routage.

Le modèle d'agent partagé repose sur un Workspace Agent Grant géré par Studio et sur un jeton d'autorisation d'espace de travail de courte durée, signé par Studio. Studio envoie le jeton avec les requêtes de Studio vers l'agent, et le SDK Supervaizer le vérifie avant de transmettre la requête aux gestionnaires. Cela permet à des agents sans état de servir plusieurs espaces de travail en toute sécurité, sans stocker localement l'état des autorisations.

Studio envoie le jeton dans l'en-tête `X-Supervaize-Workspace-Authorization: Bearer <token>`. Lorsque `SUPERVAIZER_WORKSPACE_AUTH_REQUIRED` n'est pas défini, tout appel `/a2a` hors amorçage échoue avec l'erreur JSON-RPC `-32030 workspace_authorization_not_configured`.

Le mode local est la seule exception. Lorsque `SUPERVAIZER_LOCAL_MODE=true`, que le serveur n'a pas de `supervisor_account` et qu'aucun paramètre d'autorisation d'espace de travail n'est présent (`enabled`, `issuer`, `audience`, `public_key_pem` ou `jwks_url`), `/a2a` traite les requêtes sans jeton. Les gestionnaires reçoivent un `V2VerifiedWorkspaceContext` non vérifié avec `grant_id="local-mode"` (`LOCAL_MODE_WORKSPACE_GRANT_ID`), l'espace de travail de la requête, l'`id` de l'agent du contrôleur et exactement les portées dont l'appel a besoin. Le serveur journalise un avertissement au démarrage. Si un compte Studio est rattaché ou si l'un de ces paramètres est présent, même sans `SUPERVAIZER_WORKSPACE_AUTH_REQUIRED=true`, la vérification normale avec refus par défaut s'applique, que le mode local soit actif ou non. Les routes de ressources de données de l'agent ne bénéficient pas de ce contournement.

Voir [2026_05_WORKSPACE_AGENT_GRANTS.md](2026_05_WORKSPACE_AGENT_GRANTS.md).

### Méthodes JSON-RPC Supervaizer v2 {#supervaizer-v2-json-rpc-methods}

Supervaizer v2 expose actuellement deux méthodes JSON-RPC A2A :

| Méthode                     | Objectif                                                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supervaizer/surface.load`  | Charger un document A2UI propre à l'agent pour une surface connue, comme `job.start`, `case.step.awaiting` ou `mission.analytics`.                   |
| `supervaizer/action.invoke` | Invoquer une action typée de l'agent, comme `job.start`, `job.sync`, `step.awaiting.submit`, `resource.contacts.create` ou `dataset.session_metrics.query`. |

Les deux méthodes sont limitées par `agent_slug`. Dans les contrôleurs multi-agents, les gestionnaires doivent être enregistrés pour le bon slug d'agent.

En dehors de l'exception du mode local ci-dessus, chaque action et chaque surface exige un jeton d'autorisation d'espace de travail signé par Studio, sauf l'ensemble d'amorçage : les actions `workspace_binding.options` et
`workspace_binding.create`, ainsi que la surface `workspace_binding.create`.
Ces appels servent avant l'existence d'un Workspace Agent Grant ; ils exigent donc
l'authentification de transport normale de Studio vers l'agent, mais pas de jeton d'autorisation
d'espace de travail.

### État du transport {#transport-status}

Le MVP actuel annonce :

- `json_rpc: true`
- `sse: true`
- `push_notifications: false`

Les notifications push A2A ne sont volontairement pas annoncées tant qu'elles ne sont pas implémentées. Les indicateurs d'interopérabilité A2A externe, comme les tâches entrantes et la délégation sortante, valent `false` par défaut et ne doivent être activés que lorsqu'un contrôleur implémente réellement ces flux.

### Épinglage de la version d'A2UI {#a2ui-version-pinning}

Les enregistrements Supervaizer v2 incluent une version figée du protocole A2UI et une version de catalogue A2UI propre à l'agent. Elles sont indépendantes de la version du paquet Python :

- `SUPERVAIZER_V2_CONTRACT_VERSION` identifie le contrat sémantique Supervaizer v2.
- `SUPERVAIZER_V2_A2A_VERSION` identifie la version du protocole A2A prise en charge.
- `SUPERVAIZER_V2_A2UI_VERSION` identifie la version de charge utile A2UI prise en charge.
- `a2ui_catalog_version` identifie le catalogue de documents de surface propre à l'agent.

Studio doit rejeter explicitement les versions de protocole incompatibles, au lieu de tenter un rendu au mieux.

## Protocole Agent-to-User Interface (A2UI) {#agent-to-user-interface-a2ui-protocol}

SUPERVAIZER utilise le [protocole A2UI](https://a2ui.org/) pour les documents d'interface pilotés par l'agent. A2UI est un protocole d'interface déclaratif : les agents renvoient des descriptions structurées de composants, et les clients les rendent avec leurs propres widgets natifs, sans exécuter de code arbitraire fourni par l'agent.

Liens utiles vers les sources :

- [A2UI home](https://a2ui.org/)
- [What is A2UI?](https://a2ui.org/introduction/what-is-a2ui/)
- [A2UI v0.8 specification](https://a2ui.org/specification/v0.8-a2ui/)
- [A2UI v0.9 specification](https://a2ui.org/specification/v0.9-a2ui/)

Dans Supervaizer v2, A2UI sert aux charges utiles de surface :

- les formulaires `job.start`
- les formulaires ou interfaces de revue de validation humaine (HITL) `case.step.awaiting`
- les vues de détail riches d'étape et d'artefact `case.step.detail`
- les tableaux de bord `mission.analytics`
- les pages `mission.agent.overview`
- les vues de ressources montées, comme les éditeurs de prompts, les constructeurs de scénarios ou les parcours d'import de contacts

Les surfaces de validation humaine montées peuvent renvoyer des types de documents A2UI spécialisés, comme `DocumentReview`, via la charge utile générique `V2SurfaceResult.document`. Supervaizer la garde opaque et la type uniquement comme un transport de document A2UI ; l'agent déclare la surface et l'action, et Studio rend le document.

Les vues d'import de ressources montées peuvent renvoyer `ResourceImport`. Ce document déclare les champs contextuels, les formats de fichier acceptés, les colonnes des lignes et l'action de soumission. Studio s'en sert pour communiquer et faire respecter la structure d'import, tandis que l'agent reste responsable de la validation et de la persistance.

Les déclarations de tableaux de bord se trouvent dans le contrat d'enregistrement Supervaizer v2. Les widgets peuvent pointer vers des jeux de données, des actions typées ou des données en ligne, et peuvent déclarer `visualization: { type: "vega-lite", spec: ... }` avec la grammaire JSON [Vega-Lite](https://vega.github.io/vega-lite/). Cela reprend l'idée utile de déclaration de graphiques dans le contrat générique, sans ressusciter les routes REST AnalyticsResource.

SUPERVAIZER ne rend pas A2UI. Le contrôleur transporte les documents A2UI via `supervaizer/surface.load` ; Studio valide la `a2ui_version` déclarée et rend le document.

## Protocole Agent-User Interaction (AG-UI) {#agent-user-interaction-ag-ui-protocol}

AG-UI est l'[Agent-User Interaction Protocol](https://docs.ag-ui.com/introduction). C'est un protocole événementiel qui relie les back-ends d'agents aux applications destinées aux utilisateurs lorsque l'interaction est en direct, en streaming et bidirectionnelle.

Liens utiles vers les sources :

- [AG-UI documentation](https://docs.ag-ui.com/introduction)
- [AG-UI core architecture](https://docs.ag-ui.com/concepts/architecture)
- [AG-UI agents concept](https://docs.ag-ui.com/concepts/agents)
- [AG-UI GitHub repository](https://github.com/ag-ui-protocol/ag-ui)

AG-UI convient bien pour :

- les messages d'assistant et les sorties partielles en streaming
- l'exposition des appels d'outils et de leurs résultats pendant qu'ils se produisent
- la synchronisation de l'état en direct de l'agent vers un frontend
- les workflows collaboratifs de type conversation
- les interactions d'interruption, d'approbation ou de validation humaine en direct

Dans le MVP de Supervaizer v2, AG-UI n'est **pas** l'exécution utilisée pour la gestion des jobs dans Studio. Studio exploite actuellement les agents via les actions JSON-RPC A2A, les documents de surface A2UI et les instantanés `job.sync`. L'enregistrement v2 comporte un champ facultatif `ag_ui_version` afin qu'un agent puisse annoncer plus tard une exécution AG-UI compatible, sans modifier le reste du contrat v2.

La répartition prévue est la suivante :

| Besoin                                                                    | Utiliser       |
| ------------------------------------------------------------------------- | -------------- |
| Découvrir un agent et appeler les méthodes du contrôleur                  | A2A            |
| Rendre un formulaire, un tableau de bord, une vue de détail ou un workflow Studio stable | A2UI           |
| Exécuter une session agent-utilisateur en streaming et en direct          | AG-UI          |
| Conserver et réconcilier l'état opérationnel de Studio                    | Supervaizer v2 |

### Exemples A2A {#a2a-examples}

```bash
# Discovering Agents
curl https://your-server/.well-known/agents.json

# Agent card
curl https://your-server/.well-known/agents/v1.0.0/myagent_agent.json
```

Avec un contrôleur en cours d'exécution, les routes A2A sont listées sous le tag `Protocol A2A` dans l'interface Swagger à l'adresse `http://127.0.0.1:8000/docs`.

### Pas encore implémenté {#not-yet-implemented}

- **Notifications push A2A** : livraison par rappel (callback) à la place de l'interrogation JSON-RPC ou de l'observation SSE. Non annoncées tant qu'elles ne sont pas implémentées.
- **Exécution AG-UI** : exécution de streaming bidirectionnelle facultative pour les sessions d'agent en direct. Les enregistrements ne transportent que la métadonnée `ag_ui_version`.

## Activer la prise en charge des protocoles {#enabling-protocol-support}

Les points de terminaison A2A sont activés par défaut. `a2a_endpoints=False` n'est respecté que pour un serveur autonome ; lorsqu'un `supervisor_account` est défini ou que le mode local est actif, le serveur le force de nouveau à `True`.

```python
server = Server(
    agents=[agent],
    a2a_endpoints=True,  # Enable A2A protocol support (default: True)
)
```

Pour les dernières spécifications des protocoles, consultez [a2a-protocol.org](https://a2a-protocol.org/), [a2ui.org](https://a2ui.org/) et [docs.ag-ui.com](https://docs.ag-ui.com/introduction).


*Importé le 2026-11-06 15:07:19*
