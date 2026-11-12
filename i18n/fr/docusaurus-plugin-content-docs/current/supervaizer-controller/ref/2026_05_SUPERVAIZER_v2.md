# Supervaizer v2 {#supervaizer-v2}


> **Créé :** 2026-05-16
> **Mis à jour :** 2026-10-11

Supervaizer v2 est le nouveau contrat d'opération entre un contrôleur d'agent et Supervaize Studio.

L'objectif est simple : Studio doit pouvoir exploiter de nombreux agents différents via une interface générique unique, tandis que chaque agent reste propriétaire de son propre vocabulaire métier et de sa propre logique métier.

## Couches {#layering}

Supervaizer v2 est organisé en couches, et non monolithique :

| Couche | Propriétaire | Rôle |
| --- | --- | --- |
| A2A | protocole/exécution | découverte, Agent Card, point de terminaison de contrôleur JSON-RPC, événements SSE |
| A2UI | protocole/charge utile de surface | forme des documents d'interface pour les formulaires, tableaux de bord, tables, vues de détail et surfaces personnalisées |
| Supervaizer v2 | SDK Supervaizer + agent | sémantique des jobs, cases, étapes, ressources, jeux de données, artefacts, surfaces, actions et de la synchronisation |
| Studio | Supervaize Studio | authentification, permissions, rendu, persistance, interrogation (polling), politique hors ligne et workflow de l'opérateur |
| Agent | auteur de l'agent | objets métier, gestionnaires d'actions, validation, modifications de ressources, contenu des artefacts et instantanés d'état |

La règle clé : **le protocole universel définit la forme ; l'agent définit le vocabulaire.**

Par exemple, Supervaizer v2 définit qu'un case a une voie (`lane`), mais c'est l'agent qui décide quelles voies existent. Studio sait rendre `setup`, `work` et `deliverable`, mais des voies personnalisées peuvent aussi être déclarées et rendues de façon générique.

## Gestion des versions {#versioning}

Les versions du protocole Supervaizer v2 sont indépendantes de la version du paquet Python.

| Constante | Signification |
| --- | --- |
| `SUPERVAIZER_V2_CONTRACT_VERSION` | La version du contrat sémantique de Supervaizer v2. |
| `SUPERVAIZER_V2_A2A_VERSION` | La version du protocole A2A que le contrôleur annonce. |
| `SUPERVAIZER_V2_A2UI_VERSION` | La version des documents A2UI que le contrôleur émet. |

Chaque enregistrement déclare aussi `a2ui_catalog_version`, la version, propre à l'agent, de ses documents de surface. Studio peut s'en servir pour détecter qu'un agent a modifié son catalogue d'interface, même si la version A2UI partagée n'a pas changé.

Comme A2UI n'a pas encore atteint la version 1.0, les agents doivent épingler dans l'enregistrement la version A2UI prise en charge. Studio doit rejeter explicitement les versions incompatibles, sans deviner.

## Enregistrement {#registration}

Un agent déclare la prise en charge de v2 via `supervaizer_v2_registration` sur l'`Agent`.

La voie recommandée est `build_v2_agent_registration()` :

```python
from supervaizer import Agent
from supervaizer.contracts import (
    V2ResourceDefinition,
    build_v2_agent_registration,
)

registration = build_v2_agent_registration(
    agent_slug="research-agent",
    display_name="Research Agent",
    a2ui_catalog_version="research-agent.2026-05-16",
    surfaces=[
        "job.start",
        "case.step.awaiting",
        "case.step.detail",
        "mission.analytics",
    ],
    actions=[
        "job.start",
        "job.stop",
        "step.awaiting.submit",
    ],
    case_lanes=[
        {"id": "setup", "label": "Setup"},
        {"id": "work", "label": "Work", "default": True},
        {"id": "deliverable", "label": "Deliverables"},
    ],
    artifact_types=[
        {"type": "transcript", "label": "Transcript"},
        {"type": "synthesis", "label": "Synthesis"},
    ],
    job_policy={"sync": {"action": "job.sync"}},
    resources=[
        V2ResourceDefinition(
            id="contacts",
            label="Contacts",
            auto_surface=True,
            operations=["list", "create", "update", "import"],
        )
    ],
)

agent = Agent(
    name="Research Agent",
    version="1.0.0",
    supervaizer_v2_registration=registration,
    # v1 fields may still exist during transition in older agents,
    # but new v2 agents should model Studio operation through v2.
)
```

Seuls trois arguments sont obligatoires. `agent_slug` doit être égal à `Agent.slug` (le `name` transformé en slug) ; une différence fait échouer la création de l'`Agent`. `display_name` est le nom que Studio affiche. `a2ui_catalog_version` est votre propre version pour vos documents de surface.

Les autres arguments d'identité ont des valeurs par défaut : `agent_id` est le slug, `controller_url` est `/a2a`, et `agent_card_url` est la route de carte sans version `/.well-known/agents/<slug>_agent.json`. `a2ui_version` et `a2a_version` prennent par défaut les versions épinglées par cette version du SDK. Ne les passez que pour les remplacer.

L'enregistrement v2 est exposé dans l'Agent Card A2A sous `supervaizer.v2`.

Cela ne remplace pas le processus existant d'enregistrement du serveur dans Studio. L'identité du serveur, l'échange de clés publiques et le traitement des charges utiles chiffrées relèvent toujours du parcours d'enregistrement Studio habituel. L'extension v2 indique à Studio comment exploiter le contrôleur déjà enregistré.

### Introduction {#introduction}

Un agent peut passer `introduction=` à `Agent` (un `V2AgentIntroduction` ou un dict). Studio construit l'entrée de la liste des agents et l'ouverture de la conversation à partir de ce seul bloc. Sans lui, l'agent s'affiche avec `name` et `description` uniquement, comme avant.

| Champ | Type | Règle |
| --- | --- | --- |
| `tagline` | `str` | obligatoire, 120 caractères au plus, texte brut |
| `summary` | `str` | obligatoire, 300 caractères au plus, ce que fait l'agent |
| `example_goals` | `list[str]` | de 1 à 5 éléments de 120 caractères au plus chacun ; Studio les propose comme premiers messages suggérés |
| `avatar_url` | `str \| None` | URL https, facultatif |

```python
agent = Agent(
    name="Research Agent",
    version="1.0.0",
    supervaizer_v2_registration=registration,
    introduction={
        "tagline": "Turns a question into a sourced brief",
        "summary": "Collects sources, drafts a synthesis and asks for review.",
        "example_goals": ["Brief me on a market", "Review these three reports"],
    },
)
```

Le bloc voyage sous la clé `introduction` de la charge utile d'enregistrement de l'agent (`AgentRegistrationContract.introduction`) et il est omis lorsqu'il n'est pas défini.

### Description complète {#full-description}

Un agent peut passer `full_description=` à `Agent` (un `V2AgentFullDescription` ou un dict) pour fournir une description détaillée de lui-même : ce qu'il fait, comment il fonctionne, ses limites, des exemples. Studio l'affiche sur la page de détail de l'agent. `description` reste le résumé en une ligne et `introduction` reste le court bloc de la liste des agents ; aucun des deux n'est requis pour `full_description`.

| Champ | Type | Règle |
| --- | --- | --- |
| `format` | `"markdown"` ou `"html"` | `markdown` par défaut |
| `content` | `str` | obligatoire, de 1 à 100 000 caractères, pas uniquement des espaces |

Le SDK se contente de typer et de borner le contenu. Studio assainit le HTML, y compris celui qu'il produit à partir du markdown, avant l'affichage : les scripts, les gestionnaires d'événements et les URL non sûres sont supprimés. Rédigez un contenu qui se lit bien sans eux.

```python
agent = Agent(
    name="Research Agent",
    version="1.0.0",
    supervaizer_v2_registration=registration,
    full_description={
        "format": "markdown",
        "content": (
            "# Research Agent\n\n"
            "Collects sources, drafts a synthesis and asks for review.\n\n"
            "## Limits\n\n- Public web sources only\n- One brief per job\n"
        ),
    },
)
```

Le bloc voyage sous la clé `full_description` de la charge utile d'enregistrement de l'agent (`AgentRegistrationContract.full_description`) et il est omis lorsqu'il n'est pas défini.

### Catalogue de facturation {#billing-catalog}

Un agent qui facture son travail peut passer `billing_catalog=` à `Agent` (une liste de `BillingCatalogItem` ou de dicts). Chaque élément nomme une référence (SKU) pour laquelle l'agent peut déclarer une consommation. Le catalogue ne contient aucun prix : l'espace de travail propriétaire fixe le prix de chaque SKU dans Studio.

| Champ | Type | Règle |
| --- | --- | --- |
| `sku` | `str` | de 1 à 64 caractères, `^[a-z0-9_]+$`, unique dans le catalogue |
| `unit` | `str` | de 1 à 32 caractères, par exemple `minute` ou `token` |
| `description` | `str` | 255 caractères au plus, `""` par défaut |

```python
agent = Agent(
    name="Research Agent",
    version="1.0.0",
    supervaizer_v2_registration=registration,
    billing_catalog=[
        {"sku": "brief", "unit": "brief", "description": "One sourced brief"}
    ],
)
```

La liste voyage sous la clé `billing_catalog` de la charge utile d'enregistrement de l'agent (`AgentRegistrationContract.billing_catalog`) et elle est omise lorsqu'elle n'est pas définie. L'agent déclare ensuite des enregistrements `BillableConsumption` avec `Account.report_consumption`. Consultez [Billable consumption](2026_10_BILLABLE_CONSUMPTION.md) pour les enregistrements, les reçus et les règles d'idempotence.

### Lancement planifié {#scheduled-start}

Définissez `scheduled_start=True` sur `build_v2_agent_registration()` pour annoncer `capabilities.scheduled_start: true`. La valeur par défaut `False` omet la clé, y compris dans les enregistrements existants. Cette capacité n'est disponible que pour les agents v2. L'enregistrement doit déclarer `job.start` dans ses actions, y compris les actions dérivées de `job_policy.setup`.

Studio gère la planification et appelle l'action `job.start` existante lorsqu'un déclenchement arrive à échéance. Il envoie la même entrée d'action qu'un lancement manuel, avec un `idempotency_key` stable pour chaque occurrence. Un agent qui annonce le lancement planifié doit renvoyer le job d'origine lorsque Studio réessaie avec la même clé. L'agent ne déclare pas d'action `job.schedule` et n'exécute pas d'horloge.

Chaque enregistrement publie la valeur courante. Si un agent omet ensuite la clé ou envoie `false`, Studio met ses planifications en pause. Un responsable de mission doit les reprendre une fois que l'agent annonce de nouveau `true`. Consultez [Scheduled start](2026_10_SCHEDULED_START.md) pour le contrat complet.

## Points de contrôle de règles {#rule-checkpoints}

Les points de contrôle de règles (rule checkpoints) sont une option explicite pour un contrôleur qui encadre de façon coopérative un effet externe. Les agents qui ne déclarent pas cette capacité n'annoncent ni la prise en charge des points de contrôle ni l'action de reprise.

```python
from supervaizer import RuleCheckpointGate
from supervaizer.contracts import V2ActionRequest, build_v2_agent_registration

registration = build_v2_agent_registration(
    agent_id="research-agent",
    agent_slug="research-agent",
    display_name="Research Agent",
    agent_card_url="/.well-known/agents/v1.0.0/research-agent_agent.json",
    controller_url="/a2a",
    a2ui_catalog_version="research-agent.2026-09-29",
    rule_checkpoints={
        "phases": ["before", "after"],
        "secret_refs": ["case.metadata.customer_reference"],
    },
)


async def perform_step(account, case, start_input):
    # `start_input` is the full V2ActionRequest received by the controller.
    # Studio supplies the opaque rule_snapshot when this job is governed.
    job_start = V2ActionRequest.model_validate(start_input)
    gate = RuleCheckpointGate.from_job_start(
        account,
        job_start,
        secret_refs=("case.metadata.customer_reference",),
    )

    await case.run_guarded_step(
        gate=gate,
        occurrence_id="stable-occurrence-id",
        step_id="opaque-proposed-step-id",
        before_context={"operation": "opaque-operation"},
        effect=perform_external_effect,
        after_context=lambda result: {
            "operation": "opaque-operation",
            "outcome": result,
        },
        advance=advance_case,
    )
```

`Case.run_guarded_step()` signale d'abord le case à Studio, puis demande une décision `before`, n'exécute l'effet qu'après `allow`, demande une décision `after`, et n'avance qu'une fois que cette décision est aussi `allow`. Une décision `pause` attend l'action `rule.checkpoint.resume` du contrôleur ; il n'y a pas d'interrogation. Un `allow` `before` persisté permet de poursuivre l'effet en toute sécurité après un redémarrage. L'assistant enregistre qu'un effet a démarré avant de l'appeler, de sorte que la reprise ne rejoue jamais un effet externe incertain. Lorsqu'une réponse `after` s'est perdue, utilisez `recover_guarded_step()` avec la gate d'origine, le résultat et la fonction de rappel de contexte `after`. Il vérifie que cette fonction produit le même contexte, réessaie uniquement le point de contrôle `after` d'origine, puis avance une seule fois sur `allow`.

`rule_snapshot` et son jeton de point de contrôle sont des entrées opaques du contrôleur. Ne les construisez pas, ne les modifiez pas, ne les journalisez pas et ne les placez pas dans le contexte métier de l'agent. La gate ne publie les points de contrôle que sur `{account.api_url}/api/v1/rule-checkpoints/` ; elle ignore le `checkpoint_url` de l'instantané, de sorte qu'un instantané falsifié ne peut pas envoyer les identifiants du contrôleur à un autre hôte. Une décision `rule.checkpoint.resume` vaut `allow` ou `stop` ; le contrôleur rejette `pause`, et le point de contrôle continue d'attendre. Une gate appartient à un agent, un job et un case, et le contrôleur rejette une reprise destinée à un autre. Un `V2ActionRequest` nomme son agent ; pour un `JobStartRequest` v1, passez `agent_slug` à `RuleCheckpointGate.from_job_start()`. `secret_refs` déclare les chemins dont Studio doit exclure les valeurs du contexte des points de contrôle ; déclarez chaque chemin de secret métier fourni par l'auteur de l'agent. Les identifiants de la plateforme sont exclus par la plateforme et ne doivent jamais être propagés comme des secrets métier déclarés.

## Autorisation d'espace de travail {#workspace-authorization}

Les slugs d'espace de travail et de tenant ne sont pas des primitives d'autorisation. Ce sont uniquement des indications d'affichage et de routage.

Lorsque Studio exploite un agent partagé dans un autre espace de travail, Studio doit prouver que l'administrateur de l'espace de travail destinataire a accepté l'agent. Le modèle v2 repose sur un Workspace Agent Grant géré par Studio, accompagné d'un jeton d'autorisation d'espace de travail de courte durée, signé par Studio, sur chaque requête de Studio vers l'agent.

Les agents peuvent être sans état. Ils n'ont pas besoin de conserver les autorisations localement. L'agent vérifie le jeton à chaque requête et utilise le contexte d'autorisation vérifié pour l'accès aux ressources, les requêtes sur les jeux de données, `job.start`, `job.sync`, les artefacts et les actions de validation humaine (HITL).

Si un agent exige un enregistrement côté agent avant d'accepter un espace de travail, il peut
déclarer `workspace_binding` dans son enregistrement v2. Exactement deux identifiants d'action,
`workspace_binding.options` et `workspace_binding.create`, ainsi que la surface
`workspace_binding.create`, sont des capacités d'amorçage : elles exigent toujours
l'authentification de transport de Studio vers l'agent, mais elles s'exécutent avant l'existence d'un jeton
d'autorisation d'espace de travail. Les identifiants personnalisés configurés dans
`workspace_binding.existing.action` ou `create.action` ne sont pas exemptés. Toute
autre action et toute autre surface échoue par refus par défaut sans jeton d'autorisation d'espace de travail
valide, quel que soit le `scope` qu'elle déclare ; le répartiteur (dispatcher) ne consulte pas
`V2ActionDefinition.scope` pour l'autorisation.

Consultez [2026_05_WORKSPACE_AGENT_GRANTS.md](2026_05_WORKSPACE_AGENT_GRANTS.md) pour le plan d'implémentation.

## Gestionnaires d'exécution {#runtime-handlers}

Les agents enregistrent des gestionnaires d'actions et de surfaces sur le `Server`.

```python
from supervaizer import Server
from supervaizer.contracts import V2ActionRequest, V2ActionResult, V2SurfaceRequest

server = Server(agents=[agent])


@server.v2_surface("job.start", agent_slug="research-agent")
def load_job_start(request: V2SurfaceRequest) -> dict:
    return {
        "surface": request.surface,
        "document": {
            "type": "Form",
            "fields": [
                {"id": "topic_id", "label": "Topic", "type": "string"},
            ],
            "submit": {"label": "Start research", "action": "job.start"},
        },
    }


@server.v2_action("job.start", agent_slug="research-agent")
def start_job(request: V2ActionRequest) -> V2ActionResult:
    topic_id = request.input["topic_id"]
    return V2ActionResult(
        status="ok",
        effects=[{"type": "job.started", "data": {"topic_id": topic_id}}],
    )
```

Les gestionnaires de surface renvoient des documents A2UI. Les gestionnaires d'actions exécutent la logique métier et renvoient des effets typés, avec éventuellement un instantané complet `job_state` pour la convergence de la synchronisation.

Un gestionnaire peut renvoyer le modèle typé ou un simple dict ; le SDK valide les deux. Un résultat de surface a besoin de `surface` et `document` ; `a2ui_version` et `a2ui_catalog_version` sont facultatifs. Un résultat d'action a besoin de `status` (`ok` ou `error`).

`agent_slug` sur le décorateur n'est facultatif que lorsque le serveur ne porte qu'un seul agent. Le mode local ajoute l'agent Hello World intégré ; passez donc `agent_slug` si vous utilisez `supervaizer start --local`.

## Modèle de base {#core-model}

### Job {#job}

Un job est un travail engagé que Studio suit pour un agent.

Studio peut charger `job.start` avant qu'un job existe. Dans ce cas, la requête peut inclure `draft_session_id`. Les agents doivent le traiter comme un contexte d'interface transitoire. L'état métier persistant doit être créé au `job.start`, pas au chargement de la surface.

La convergence des statuts passe par `job.sync`. `job.sync` n'a pas besoin d'être strictement idempotent au sens de réponses identiques octet pour octet. Il doit être **convergent** : des appels répétés pour le même état externe doivent amener Studio à la même projection de job, de cases et d'étapes.

L'instantané du job (`job_state.job`) est un modèle ouvert. Studio y lit deux clés facultatives :

- `information.cost.total_cost` : le coût du job. Studio additionne les coûts des étapes dans le coût de chaque case, mais il prend le coût du job dans cette valeur.
- `display` : le vocabulaire de l'agent pour les listes de jobs et la ligne de titre du job. Les clés sont `entity_label`, `state_label` et `primary_action_label`, chacune étant une chaîne de 120 caractères au plus. Studio les remplace à chaque `job_state` reçu et revient à son propre vocabulaire lorsque le statut du job a évolué entre-temps.

### Case {#case}

Un case est une unité de travail à l'intérieur d'un job. Les cases déclarent une voie (`lane`), qui est une indication de rendu.

La voie par défaut est `work`. Les agents peuvent déclarer des voies standard ou personnalisées :

- `setup` : préparation et revue préalable
- `work` : exécution principale
- `deliverable` : livrables finaux et revues
- des voies personnalisées comme `extract`, `transform`, `load`, `verify`

Studio rend les voies inconnues de façon générique.

### Étape {#step}

Une étape (step) est une activité observable à l'intérieur d'un case.

Dans le modèle actuel du SDK :

- `activity` vaut `operation` ou `delegation`
- `status` porte l'état du cycle de vie, comme pending, active, awaiting, completed, failed ou cancelled (une chaîne libre ; ces valeurs sont la convention que Studio rend)
- `awaiting` porte l'état de validation humaine (HITL) lorsque Studio doit recueillir une saisie de l'opérateur : une `reason` obligatoire, la `surface` et l'`action` à utiliser, `fields`, et `reopenable` (`False` par défaut), qui indique si une étape ayant reçu une réponse peut être rouverte et soumise de nouveau
- `outputs` porte les artefacts produits

La validation humaine n'est donc pas un type d'étape. Elle est représentée par `status="awaiting"` accompagné d'un objet `awaiting` contenant une surface, une action et des champs.

La `surface` d'attente peut renvoyer n'importe quel document A2UI valide via `V2SurfaceResult.document`. Pour les workflows de revue montés, les agents peuvent renvoyer un document générique `DocumentReview` qui contient le contenu du document, les métadonnées de soumission et des champs typés. Supervaizer n'interprète pas la sémantique de la revue de document ; Studio rend le document A2UI et invoque l'action déclarée, en général `step.awaiting.submit`.

Exemple :

```python
V2SurfaceResult(
    surface="case.step.awaiting",
    a2ui_version="v0.8",
    document={
        "type": "DocumentReview",
        "document": {
            "title": "Review",
            "field": "review_text",
            "language": "markdown",
            "value": "# Draft\n\nReview this content.",
            "validation": [
                {"id": "readiness", "label": "Ready for approval", "status": "review"}
            ],
        },
        "submit": {"action": "step.awaiting.submit", "label": "Approve"},
        "fields": [
            {
                "id": "review_text",
                "label": "Review text",
                "type": "text",
                "multiline": True,
                "required": True,
            },
            {
                "id": "approve_review",
                "label": "Approve review",
                "type": "boolean",
                "required": True,
            },
        ],
    },
)
```

#### Champs de fichier {#file-fields}

Une étape en attente peut demander un fichier à l'opérateur. L'agent déclare un champ avec `type: "file"` dans la liste `fields`. L'`id` et le `label` sont choisis par l'agent ; les autres clés sont des clés du protocole :

```json
{"id": "report_file", "label": "Insights report (.md)", "type": "file",
 "accept": ".md,text/markdown", "max_bytes": 1048576, "storage": "studio",
 "required": true}
```

- `accept` liste les extensions et les types de média autorisés.
- `max_bytes` est la taille de fichier maximale que Studio accepte pour ce champ.
- `storage` choisit où résident les octets et ce que reçoit l'agent (voir le tableau).

| `storage` | Valeur dans la réponse de validation humaine | Qui conserve les octets |
| --- | --- | --- |
| `studio` | `{"storage": "studio", "file_id", "filename", "media_type", "size", "sha256"}` | Studio, dans un stockage privé. L'agent ne reçoit qu'une référence. |
| `inline` | `{"storage": "inline", "filename", "media_type", "size", "encoding", "content"}` dans le JSON de l'action | L'agent. Le contenu voyage dans la requête d'action. |

Avec `storage: "inline"`, le JSON complet de l'action, contenu compris, doit rester sous la limite de taille du corps de requête de Studio. Choisissez `studio` pour les fichiers qui peuvent approcher cette limite.

Les champs de fichier sont pris en charge dans les étapes `case.step.awaiting` et dans les composants `Form` d'un document `job.configurator`. Les modèles du contrat acceptent déjà ces clés comme clés supplémentaires ; les agents n'ont donc besoin d'aucune modification du SDK.

### Artefact {#artifact}

Les artefacts sont des sorties dont l'agent est propriétaire. Le protocole ne définit que la forme de la référence :

- `id`
- `type`
- `title`, identifiant externe et type de média facultatifs

#### Artefacts stockés par Studio {#studio-stored-artifacts}

Un agent peut émettre un artefact dont Studio détient déjà les octets, par exemple un fichier que l'opérateur a téléversé via un champ de fichier `storage: "studio"`. La référence porte les clés habituelles plus deux autres : `"storage": "studio"` et `"file_id"` (l'identifiant de fichier Studio) :

```json
{"id": "report:<report_id>", "type": "report", "title": "Quarterly report",
 "media_type": "text/markdown", "storage": "studio", "file_id": "<studio file id>"}
```

Studio sert un tel artefact depuis son propre stockage. Il n'appelle pas l'action `artifact.get` de l'agent pour cela. Le contrôle d'accès reste inchangé : l'appelant a toujours besoin de l'autorisation `artifact.get` pour lire l'artefact.

Les types d'artefacts comme `transcript`, `synthesis`, `report`, `metric` ou `decision` appartiennent à l'enregistrement de l'agent. Studio peut rendre richement les types d'artefacts connus et se rabattre sur des aperçus génériques pour les types inconnus.

## Ressources {#resources}

Les ressources sont des objets métier dont l'agent est propriétaire et que Studio peut gérer de façon générique.

Exemples :

- projects
- contacts
- prompts
- scenarios
- project_contacts

Une déclaration de ressource peut inclure :

- des opérations comme `list`, `get`, `create`, `update`, `delete`, `import`
- `scope` (`workspace`, `mission` ou `job`) et `requires_context` (`["workspace.id"]` par défaut)
- des métadonnées d'affichage pour le titre, les colonnes et les champs de recherche
- des champs de formulaire simples
- des sources d'options typées adossées à des ressources
- des vues personnalisées montées pour les cas où un CRUD générique ne suffit pas

Le comportement dynamique ne doit pas être implémenté sous forme de fonctions de rappel Python opaques. Il doit se réduire à :

- un comportement déclaratif local à A2UI dans le document de surface, ou
- des appels d'actions typées comme `resource.contacts.list`, `resource.contacts.create` ou une action de validation propre à l'agent.

Cela évite de reproduire le modèle v1 de fonctions de rappel pour les choix dynamiques.

### Contexte de mission pour les appels DataResource {#mission-context-on-dataresource-calls}

Studio envoie le contexte DataResource dans des en-têtes : `X-Supervaize-Workspace-Id`, `X-Supervaize-Workspace-Slug`, `X-Supervaize-Mission-Id`, `X-Supervaize-Agent-Slug` et `X-Supervaize-Request-Id`. Depuis la version 1.8.0, un appel dans une portée de mission peut aussi envoyer `X-Supervaize-Mission-Metadata` : l'objet JSON `Mission.metadata` de Studio, en UTF-8, encodé en base64url (remplissage facultatif), 4096 octets au plus une fois encodé. Utilisez `build_data_resource_context_headers(..., mission_metadata=...)` pour l'écrire.

Le SDK renseigne `DataResourceContext.mission` (un `V2MissionContext` avec l'`id` issu de `X-Supervaize-Mission-Id` et les `metadata` décodées). Sans l'en-tête de métadonnées, `context.mission` vaut `None`. La route renvoie HTTP 400 et n'appelle pas la fonction de rappel lorsque l'en-tête de métadonnées est présent sans `X-Supervaize-Mission-Id`, ne se décode pas en objet JSON, ou est trop volumineux.

L'en-tête n'est pas signé. Utilisez les métadonnées de mission pour restreindre les résultats, pas comme frontière d'accès.

## Jeux de données {#datasets}

Les jeux de données sont des tables orientées lecture ou des flux de métriques que Studio peut interroger via des actions typées.

Un jeu de données déclare :

- `id`
- `label`
- des colonnes d'affichage
- `scope` (`workspace`, `mission` ou `job` ; `workspace` par défaut)
- `auto_surface=True` pour obtenir une surface `mission.agent.dataset.<id>` générée par Studio

Le SDK dérive une action `dataset.<id>.query` (`mutating=False`) pour chaque jeu de données, avec ou sans surface automatique. Studio peut rendre le résultat dans des tables et des tableaux de bord génériques, y compris les surfaces `mission.analytics`.

## Tableaux de bord {#dashboards}

Les tableaux de bord sont des métadonnées d'enregistrement déclaratives pour des vues rendues par Studio. Ils ne créent pas de routes AnalyticsResource et n'impliquent aucune logique métier d'analyse propre à un agent.

Un tableau de bord déclare :

- `id`
- `label`
- `surface`, `mission.analytics` par défaut
- `widgets`

Chaque widget peut référencer des données issues d'un jeu de données, d'une action typée ou de données d'exemple en ligne. Les widgets portent un objet `visualization` dont le `type` est `table`, `metric`, `vega-lite` ou `custom`. Pour les graphiques Vega-Lite, utilisez `visualization.type = "vega-lite"` et placez la spécification JSON Vega-Lite dans `visualization.spec`. Studio est responsable du rendu et de la validation de la visualisation ; Supervaizer ne fait que transporter le contrat typé.

Les surfaces `mission.analytics` et `job.analytics` renvoient un document A2UI `Dashboard` avec des `datasets` (chacun avec des `metrics` KPI facultatifs), des `controls` et des `widgets`. Studio interroge chaque jeu de données via son action `dataset.<id>.query` et lit les lignes dans l'effet `dataset.queried` (`dataset`, `count`, `rows`). Sur `job.analytics`, la requête porte le `job_id` ; l'agent restreint chaque jeu de données à ce job. La forme du document, les réducteurs de métriques et les types de contrôles se trouvent dans le [guide d'analyse des jobs et des missions](https://docs.runwaize.com/docs/supervaizer-controller/job-analytics).

Exemple :

```python
registration = build_v2_agent_registration(
    # ...
    datasets=[
        {
            "id": "progress_metrics",
            "label": "Progress Metrics",
            "auto_surface": True,
            "display": {"columns": ["label", "value"]},
        }
    ],
    dashboards=[
        {
            "id": "mission_overview",
            "label": "Mission Overview",
            "widgets": [
                {
                    "id": "progress_chart",
                    "title": "Progress",
                    "data": {"mode": "ref", "datasetId": "progress_metrics"},
                    "visualization": {
                        "type": "vega-lite",
                        "spec": {
                            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
                            "mark": "bar",
                            "encoding": {
                                "x": {"field": "label", "type": "nominal"},
                                "y": {"field": "value", "type": "quantitative"},
                            },
                        },
                    },
                }
            ],
        }
    ],
)
```

## Surfaces {#surfaces}

Les surfaces sont des points d'entrée d'interface nommés. Un gestionnaire de surface renvoie un document A2UI.

Identifiants de surface courants :

| Surface | Objectif |
| --- | --- |
| `job.start` | Formulaire utilisé avant `job.start`. |
| `case.step.awaiting` | Formulaire de validation humaine ou interface de revue pour une étape en attente. |
| `case.step.detail` | Vue de détail riche pour une étape ou un artefact. |
| `mission.analytics` | Tableau de bord au niveau de la mission, sur les jeux de données de l'agent. |
| `job.analytics` | Tableau de bord au niveau du job, affiché sur chaque page de job. |
| `job.configurator` | Écran Configure d'un job, défini par l'agent. |
| `mission.agent.overview` | Vue d'ensemble de l'agent et liens rapides, facultatifs. |
| `mission.agent.resource.<resource_id>` | Surface CRUD de ressource générée par Studio. |
| `mission.agent.dataset.<dataset_id>` | Surface de jeu de données générée par Studio. |

`job.configurator` renvoie un document `Configurator` : des sections de composants Studio de confiance (`Form`, `ResourceList`, `TemplateComposer`, `Review`, `Table`), chacune reliée à des actions déclarées de portée job par des liaisons explicites. Supervaizer transporte le document sans le typer dans `V2SurfaceResult.document` ; Studio le valide et refuse un document qui enfreint son contrat. La forme du document, les règles de révision et de conflit et les versions de schéma se trouvent dans le [guide du Job Configurator](https://docs.runwaize.com/docs/supervaizer-controller/job-configurator).

Les vues de ressources montées utilisent dans Studio une URL en forme de ressource, mais laissent l'agent remplacer toute une vue, comme `edit` ou `import`, par une surface A2UI personnalisée.

Pour les imports, les agents doivent utiliser la forme de document A2UI `ResourceImport`. Le document déclare :

- `resource`, par exemple `campaign_contacts`
- `accepted_formats`, actuellement `csv` et éventuellement `xlsx`
- des `fields` contextuels, comme un sélecteur de campagne obligatoire
- des `columns` de lignes, comme `email` et `phone_number`
- `submit.action`, par exemple `resource.campaign_contacts.import`

Studio lit ce document pour afficher le format requis, valider les lignes CSV avant la soumission et acheminer l'action typée. L'agent reste responsable des contrôles de tenant, de la validation métier, de la persistance et du renvoi d'effets typés. Si un import modifie un job existant, l'action peut renvoyer un `job_state` de premier niveau ; Studio le traite comme un `job.sync` et met à jour (upsert) les cases et les étapes renvoyés.

## Actions {#actions}

Les actions sont des commandes typées invoquées via JSON-RPC A2A.

Identifiants d'action courants :

| Action | Objectif |
| --- | --- |
| `job.start` | Engager un nouveau job et démarrer le travail de l'agent. |
| `job.stop` | Arrêter ou annuler le travail de l'agent. |
| `job.sync` | Renvoyer un instantané d'état convergent pour Studio. |
| `step.awaiting.submit` | Soumettre la saisie de l'opérateur pour une étape de validation humaine. |
| `context.assign` | Affecter à un job une sélection de contexte Studio figée ; l'agent récupère le contenu via `ContextClient` et stocke la provenance (`ref`, `version`, `hash`, `synced_at`). |
| `resource.<id>.<operation>` | Exécuter une opération de ressource. |
| `dataset.<id>.query` | Interroger un jeu de données dont l'agent est propriétaire. |
| `artifact.get` | Charger le contenu d'un artefact par référence. |
| `job.start.preview` | Prévisualiser un plan de configuration du job avant `job.start` ; déclaré via `job_policy.setup`. |
| `workspace_binding.options`, `workspace_binding.create` | Actions d'amorçage qui lient un enregistrement côté agent à un espace de travail Studio. |
| `agent.refresh`, `agent.custom.<method>` | Méthodes au niveau de l'agent, déclarées via `V2AgentMethods`. |

Les requêtes d'action incluent `request_id`, `actor`, `workspace`, `mission_id`, `agent_slug`, `surface`, `action`, `input`, ainsi que des champs de corrélation facultatifs comme `job_id`, `case_id`, `step_id`, `draft_session_id` et `idempotency_key`. Après vérification, le SDK injecte `workspace_authorization` (un `V2VerifiedWorkspaceContext`) afin que les gestionnaires utilisent les revendications vérifiées plutôt que les en-têtes.

### Contexte de mission {#mission-context}

Depuis la version 1.8.0, `V2ActionRequest` et `V2SurfaceRequest` ont un champ facultatif `mission` (`V2MissionContext` : `id`, `name`, `metadata`). `metadata` est l'objet JSON `Mission.metadata` de Studio. Le SDK le transporte sans lire ses clés ; l'agent est propriétaire de toute convention à l'intérieur (par exemple, Agent Interviewer lit `metadata.filter.contact`). La validation exige `mission.id == mission_id` et refuse un `metadata` qui n'est pas un objet JSON, y compris une chaîne encodée en JSON. Studio envoie les métadonnées de mission courantes à chaque requête. Les agents ne doivent pas les mettre en cache dans le job.

### Métadonnées d'action {#action-metadata}

Depuis la version 1.6.0, `capabilities.actions` est sérialisé comme une liste d'objets `V2ActionDefinition`, chacun avec `id`, `mutating` (l'invocation modifie-t-elle l'état côté agent ?) et `scope` (`workspace`, `mission` ou `job`). Les consommateurs autorisent et regroupent les actions à partir de ces métadonnées au lieu de rechercher des motifs dans les identifiants.

- Les chaînes simples sont toujours acceptées dans `build_v2_agent_registration(actions=...)` et sont converties en `mutating=True, scope="job"`, la lecture la plus restrictive par défaut.
- Les actions dérivées héritent des métadonnées de leur définition : les opérations de ressource prennent `V2ResourceDefinition.scope` et restent `mutating=True` sauf déclaration contraire, les requêtes de jeux de données sont `mutating=False`, `job_policy.setup.preview_action` est `mutating=False`, et les actions de liaison d'espace de travail ont la portée `workspace`.
- L'ordre de priorité est explicite > dérivé > simple : un `V2ActionDefinition` explicite dans `actions=` remplace les métadonnées dérivées, quelle que soit sa position, et la première mention fixe l'ordre.
- `job_policy.setup` (`V2JobSetupPolicy`) déclare `preview_action`, `start_action` et `submit_action` (par défaut `job.start.preview`, `job.start`, `step.awaiting.submit`), les `action_scopes` auxquelles ils s'appliquent (vide par défaut) et un `plan`. `V2ActionResult.setup_plan` renvoie le plan à Studio. Les deux acceptent un `V2SetupPlan` ou un dict : un dict passe tel quel ; un `V2SetupPlan` est sérialisé en `confirmation_required` (`true` par défaut), `steps[]` et un `cost_estimate` facultatif. Voir [Plan de configuration et schéma de champ](#setup-plan-and-field-schema).

### Plan de configuration et schéma de champ {#setup-plan-and-field-schema}

Un `V2SetupPlan` est la forme typée de `job_policy.setup.plan` et de `V2ActionResult.setup_plan`. Chaque `V2SetupStep` a un `id` (unique dans le plan), un `title` (120 caractères au plus), une `description` facultative (300 au plus), un `status` (`pending` par défaut, `awaiting`, `done`, `skipped`), des `fields` et des `help_actions`. Chaque id de `help_actions` doit être déclaré dans `capabilities.actions` avec `kind="help"` ; le validateur d'enregistrement le vérifie une fois les actions déclarées et dérivées fusionnées.

`V2SetupFieldDefinition` décrit une saisie. `V2AwaitingFieldDefinition` et `V2ResourceFieldDefinition` acceptent les mêmes clés facultatives ; les clés non définies restent hors du flux, de sorte que les enregistrements existants se sérialisent comme avant.

| Clé | Règle |
| --- | --- |
| `id`, `label` | obligatoires |
| `type` | `string` par défaut. Types connus : `string`, `text`, `boolean`, `integer`, `number`, `date`, `select`, `multi_select`, `resource_ref`, `file`, `list`. Les types inconnus sont rendus comme `string`. |
| `item_fields` | obligatoire lorsque `type="list"`, rejeté sinon. Un seul niveau d'imbrication : un champ d'élément ne peut pas être un `list`. La valeur d'un champ `list` est une liste de dicts indexés par id de champ d'élément, jamais du texte libre. |
| `required` | `false` par défaut |
| `default`, `placeholder` | facultatifs |
| `description` | 300 caractères au plus, affichée en info-bulle |
| `multiline`, `min_rows` | `min_rows` vaut au moins 1 et n'est autorisé qu'avec `multiline` |
| `options` | `[{"value", "label"}]` ; les chaînes simples sont rejetées |
| `options_source` | `V2ResourceFieldOptionsSource`, inchangé |
| `depends_on` | `{"field": "<parent id>", "in": [<stringified parent values>]}` ; le champ n'est actif que tant que la valeur du parent figure dans la liste, et les parents s'enchaînent |
| `validation` | `V2FieldValidation` : `min_length`, `max_length`, `pattern` conviennent à `string`, `text` et aux types inconnus ; `min`, `max` conviennent à `integer` et `number` ; `min_items`, `max_items` conviennent à `multi_select` et `list` ; `message` remplace l'erreur générique. Une règle qui ne convient pas au type du champ est rejetée. |

`V2CostEstimate` porte `status` (`estimated` ou `unknown`), `unit` (un libellé libre comme `USD`, `tokens` ou `credits`, affiché tel quel), `min`, `max` (au moins `min`, tous deux au moins 0) et `basis` (texte brut, 300 caractères au plus). Avec `status="unknown"`, `unit`, `min` et `max` doivent être absents. Les clients affichent une fourchette ou « inconnu », jamais un nombre unique.

```python
from supervaizer import V2CostEstimate, V2SetupFieldDefinition, V2SetupPlan, V2SetupStep

plan = V2SetupPlan(
    steps=[
        V2SetupStep(
            id="scope",
            title="Scope",
            fields=[
                V2SetupFieldDefinition(
                    id="goal",
                    label="Goal",
                    type="text",
                    multiline=True,
                    min_rows=4,
                    required=True,
                ),
                V2SetupFieldDefinition(
                    id="mode",
                    label="Mode",
                    type="select",
                    options=[
                        {"value": "fast", "label": "Fast"},
                        {"value": "custom", "label": "Custom"},
                    ],
                ),
                V2SetupFieldDefinition(
                    id="budget",
                    label="Budget",
                    type="number",
                    depends_on={"field": "mode", "in": ["custom"]},
                    validation={"min": 0, "message": "Budget cannot be negative"},
                ),
            ],
            help_actions=["goal.suggest"],
        )
    ],
    cost_estimate=V2CostEstimate(
        status="estimated", unit="credits", min=5, max=20, basis="for 50 runs"
    ),
)
registration = build_v2_agent_registration(
    ...,
    actions=[
        {
            "id": "goal.suggest",
            "kind": "help",
            "mutating": False,
            "target_field": "goal",
        }
    ],
    job_policy={"setup": {"plan": plan}},
)
```

Deux comportements de Studio s'appliquent à ces champs :

- Un champ `select` obligatoire n'a pas de choix vide. Studio affiche son `placeholder` jusqu'à ce que l'utilisateur choisisse.
- Pour un agent qui déclare un plan de configuration, Studio ajoute le nom du job à l'entrée de prévisualisation sous `name`, de sorte que le plan n'a pas besoin d'en demander un. Une valeur `name` provenant des propres champs du plan prévaut.

### Actions d'aide et essais à blanc {#help-actions-and-dry-runs}

`V2ActionDefinition` a trois clés facultatives, toutes omises du flux à leur valeur par défaut :

- `kind` : `"command"` (par défaut) ou `"help"`. Une action d'aide propose ou vérifie un brouillon pour un champ de configuration pendant la configuration guidée. Elle doit déclarer `mutating=False` ; le SDK rejette une action d'aide qui modifie l'état.
- `target_field` : l'id du champ de configuration dont le résultat remplit le brouillon. Autorisé uniquement avec `kind="help"`.
- `dry_run` : `False` par défaut. Une action d'essai à blanc est un test défini par son résultat, pas par l'endroit où elle stocke les données. Elle PEUT créer des données temporaires côté agent et PEUT engendrer un coût de modèle. Elle NE DOIT envoyer AUCUNE communication externe. Elle NE DOIT PAS apparaître dans les résultats, les jeux de données, les tableaux de bord ni les décomptes de `job.sync`.

Une action d'aide reçoit `input = {"field": "<target field id>", "values": {<current draft values>}}` et répond avec `V2ActionResult.draft` (`V2FieldDraft`) : `field`, `value` (la valeur proposée, `None` pour une simple vérification) et `suggestions` (`V2Suggestion` : `message`, `severity` `info`, `warning` ou `error`, `field` et `proposed_value` facultatifs). Studio affiche `value` comme un brouillon modifiable du champ cible et ne l'applique jamais de lui-même. Pour un champ `list`, `draft.value` a la forme de valeur du champ : une liste de dicts indexés par id de champ d'élément.

Une action d'essai à blanc répond avec `V2ActionResult.dry_run` (`V2DryRunOutcome`) : `expires_at`, `deletable` et `cost_incurred` (un `V2CostEstimate`, affiché lorsqu'il est présent). Studio signale distinctement les actions d'essai à blanc.

```python
actions = [
    {"id": "goal.suggest", "kind": "help", "mutating": False, "target_field": "goal"},
    {"id": "job.test", "dry_run": True, "label": "Test run"},
]
```

### Textes d'affichage {#display-text}

Les surfaces et les actions peuvent porter un `label` (un intitulé) et une `description` (un texte d'aide en langage courant, comme une info-bulle) facultatifs, afin que Studio puisse afficher les propres termes de l'agent sur les boutons qu'il génère pour elles. Les deux sont du texte brut, de 300 caractères au plus, et servent uniquement à l'affichage : ils ne sont jamais une entrée d'autorisation.

```python
registration = build_v2_agent_registration(
    ...,
    surfaces=[
        "case.step.detail",
        {
            "id": "mission.agent.overview",
            "label": "Overview",
            "description": "Summary of what this agent manages for the mission.",
        },
    ],
    actions=[
        {
            "id": "job.stop",
            "mutating": True,
            "scope": "job",
            "label": "Stop",
            "description": "Stop the job; work already done is kept.",
        },
    ],
)
```

- `capabilities.surfaces` reste une liste de chaînes d'identifiants. Le texte des surfaces est sérialisé dans la liste voisine `capabilities.surface_definitions` (`V2SurfaceDefinition` : `id`, `label`, `description`), avec au plus une entrée par id déclaré.
- Le texte des actions est sérialisé sur chaque entrée de `capabilities.actions`.
- Le texte non défini est omis, de sorte qu'un enregistrement sans texte se sérialise comme avant.
- Une surface dérivée automatiquement, comme `mission.agent.resource.<id>`, se décrit en la déclarant explicitement dans `surfaces=`. Un `V2ActionDefinition` explicite remplace toujours les métadonnées dérivées ; répétez donc `mutating` et `scope` lorsque vous ajoutez du texte à une action dérivée.

### Sémantique de l'affectation de contexte {#context-assignment-semantics}

`context.assign` porte une charge utile `V2ContextAssignment` : les éléments sélectionnés (`ref`, `version`, `scope`, `title`), le `job_id`, un `mission_id` facultatif et un `assigned_at` horodaté par Studio. Une liste `items` vide est une affectation explicite de « aucun contexte », pas une erreur. `mission_id` est obligatoire dès qu'un élément a la portée mission.

La charge utile contient volontairement des références, pas du contenu. À la réception, l'agent récupère chaque élément une seule fois via `ContextClient.open()` et fige le contenu renvoyé comme son propre instantané, avec la provenance (`ref`, `version`, `hash` du contenu, `synced_at`). `ContextClient.open()` renvoie la `version` courante de l'élément ; l'agent DOIT la comparer à la `version` affectée et faire échouer toute l'affectation avec une erreur explicite lorsqu'elles diffèrent : l'élément a changé entre la sélection et la synchronisation, et l'opérateur doit réaffecter. Les agents ne doivent pas stocker silencieusement du contenu sous une version qui ne lui correspond pas, ni relire le contexte Studio pendant l'exécution du job ; un nouveau `context.assign` est le seul moyen de le rafraîchir.

## Synchronisation et sémantique hors ligne {#sync-and-offline-semantics}

Studio gère le cycle de vie des jobs côté opérateur, mais l'agent gère l'état métier réel. `job.sync` est le point de réconciliation entre les deux.

Comportement recommandé :

- les nouveaux lancements passent par `job.start`
- un travail externe déjà démarré peut être chargé en créant un job Studio et en appelant `job.sync`
- les appels de synchronisation répétés doivent être convergents
- les agents hors ligne bloquent les nouveaux lancements
- si Studio marque un job en cours comme échoué parce que l'agent est hors ligne, la reprise ultérieure doit utiliser un nouveau job plus `job.sync`

## Idempotence {#idempotency}

La confirmation d'une configuration (`job.start`) doit pouvoir être réessayée sans risque. Ces règles font partie du contrat v2 ; elles n'ajoutent aucun champ.

- La **clé d'opération** est `V2ActionRequest.idempotency_key`. Le `job_setup` de Studio l'exige déjà à la prévisualisation et à la confirmation ; elle garde la même valeur pour la prévisualisation, la confirmation et chaque nouvel essai.
- Les **identités** sont `mission_id` et `job_id`, attribuées par Studio avant la confirmation et envoyées sans changement à chaque nouvel essai.
- Règles de l'agent pour `job.start` : même clé + mêmes identités → renvoyer le résultat d'origine, ne rien créer. Même clé + entrée ou identités différentes → `status: "error"` avec `errors[0].code = "idempotency_conflict"`. Le résultat définit `replay_safety.strictly_idempotent_response = True`.
- Règles du client après un résultat incertain (délai dépassé, jeton expiré) : réutiliser la même clé et les mêmes identités. Ne jamais créer de nouvelle clé pour un nouvel essai. Résoudre l'issue avant de proposer une nouvelle configuration.
- Assistant de conformité dans les utilitaires de test du SDK : `assert_confirm_idempotent(handler, request)` (exporté depuis `supervaizer`, implémenté dans `supervaizer.testing`) appelle le gestionnaire deux fois et vérifie que les résultats sont égaux et qu'aucun nouvel effet n'apparaît au second appel. Les agents doivent livrer un test qui l'appelle.

```python
from supervaizer import assert_confirm_idempotent


def test_job_start_is_idempotent() -> None:
    assert_confirm_idempotent(start_job, request_with_idempotency_key)
```

## A2A, A2UI et AG-UI {#a2a-a2ui-and-ag-ui}

Supervaizer v2 utilise actuellement :

- A2A pour la découverte des Agent Cards, les appels JSON-RPC `/a2a` et l'observation SSE `/a2a/events`
- A2UI pour les documents de surface rendus par Studio, comme `job.start`, `case.step.awaiting`, `case.step.detail` et `mission.analytics`
- la sémantique Supervaizer v2 pour les jobs, cases, étapes, ressources, jeux de données, actions, artefacts et la politique de synchronisation et de mode hors ligne

Le transport actuel annonce JSON-RPC et SSE, pas les notifications push A2A.

AG-UI n'est pas requis pour le MVP. C'est la bonne couche pour de futures sessions agent-utilisateur en streaming et en direct, où Studio a besoin d'événements bidirectionnels, de messages en streaming, de la visualisation des appels d'outils, de la synchronisation d'état en direct ou de parcours d'interruption et d'approbation. Les enregistrements peuvent inclure la métadonnée `ag_ui_version` pour cette future exécution, mais le flux v2 implémenté fonctionne avec des documents de surface A2UI et des actions typées.

## Migration depuis la v1 {#migration-from-v1}

Le modèle v2 remplace volontairement le comportement v1 des champs, des choix dynamiques et de l'interrogation des jobs.

| Concept v1 | Remplacement v2 |
| --- | --- |
| `AgentMethodField` pour le lancement d'un job dans Studio | surface A2UI `job.start` |
| `dynamic_choices_callback` (supprimé en 1.0.0 ; le passer lève une erreur) | sources d'options de ressources typées ou actions typées |
| `job_poll` (supprimé ; le passer lève une erreur) | `job.sync` |
| charges utiles de validation humaine propres au contrôleur | surface `case.step.awaiting` plus `step.awaiting.submit` |
| hypothèses figées de Studio sur les sorties de l'agent | types d'artefacts déclarés par l'agent et surfaces `case.step.detail` |

Les nouveaux agents doivent modéliser l'intégration à Studio via v2 dès le départ.

## Liste de contrôle minimale pour un agent v2 {#minimal-checklist-for-a-v2-agent}

- Déclarez `supervaizer_v2_registration`.
- Définissez `a2ui_catalog_version`. `a2ui_version` et `a2a_version` prennent par défaut les versions épinglées par le SDK.
- Déclarez au moins une surface, en général `job.start`.
- Enregistrez `job.start`.
- Enregistrez `job.sync` si Studio a besoin de convergence ou de rattrapage des statuts.
- Déclarez les ressources et les jeux de données que Studio doit gérer de façon générique.
- Enregistrez des gestionnaires pour chaque action déclarée.
- Utilisez l'état `awaiting` pour la validation humaine.
- Renvoyez des identifiants externes stables dans les instantanés de job, de case, d'étape et d'artefact.
- Gardez la validation métier dans les actions de l'agent, pas dans des chemins de code propres à Studio.

## Règles de conception {#design-rules}

Ces décisions sont figées pour v2 et s'appliquent à tout agent construit sur le SDK :

- v2 ne conserve pas le comportement v1 des choix dynamiques, de l'interrogation des jobs ni des mises à jour de cases historiques. Lorsque le chemin du contrôleur Supervaize est actif, les opérations de l'espace de travail passent par v2.
- Pas de supposition ni de repli implicite : une autorisation d'espace de travail manquante, une liaison d'espace de travail manquante, un identifiant de serveur ou d'agent qui ne correspond pas et des portées manquantes échouent avec des erreurs explicites qui nomment la configuration manquante.
- Studio gère le rendu générique et les enregistrements d'acceptation. Les agents gèrent le vocabulaire métier et valident chaque modification métier.
- `server.register.details.server_id` est l'identité du contrôleur sur laquelle Studio s'appuie. Elle vient de `SUPERVAIZER_SERVER_ID`, ou d'un nouvel UUID par processus lorsqu'elle n'est pas définie ; définissez donc la variable dans chaque environnement déployé pour garder des autorisations stables entre les redémarrages et les instances.
- Si `SUPERVAIZER_API_KEY` n'est pas défini, le SDK génère une clé au démarrage et ne journalise que son empreinte. Le démarrage vérifie que Studio a conservé la clé effective, et une différence fait échouer le démarrage au lieu de produire plus tard des erreurs 401 répétées sur `/a2a`.
- Les erreurs de configuration propres à un agent sont signalées avant le début du travail, comme des erreurs de configuration et non comme des échecs de transport.
- Les résultats d'action peuvent renvoyer un instantané `job_state` de premier niveau afin que Studio matérialise immédiatement les cases, puis converge via `job.sync`.


*Importé le 2026-11-06 15:07:19*
