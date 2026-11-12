# Référence des modèles (extra) {#model-reference-extra}

**Version :** 1.9.0

### `contracts.BillableConsumption`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Une quantité facturable utilisée par un agent pour un job Studio.

#### Champs du modèle {#model-fields}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `sku` | `str` | **obligatoire** | SKU déclaré dans le billing_catalog de l'agent. |
| `quantity` | `Decimal` | **obligatoire** | Quantité positive de unit, avec au plus 18 chiffres dont 6 décimales ; envoyée sous forme de chaîne décimale. |
| `unit` | `str` | **obligatoire** | Unité de la quantité. |
| `job_id` | `str` | **obligatoire** | Job Studio que l'enregistrement facture. |
| `case_id` | `str` | `None` | Case Studio, le cas échéant. |
| `idempotency_key` | `str` | **obligatoire** | Une clé par unité de travail et par SKU. Studio comptabilise une clé une seule fois ; un renvoi reçoit la réponse duplicate. |
| `agent_cost_usd` | `Decimal` | `None` | Indication facultative de ce que l'agent a payé, en USD. Non facturé. |
| `description` | `str` | `None` | Texte brut court ; aucune donnée personnelle. |
| `occurred_at` | `AwareDatetime` | **obligatoire** | Moment où la consommation a eu lieu ; ISO 8601 avec fuseau horaire. |

### `contracts.ConsumptionReceipt`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Réponse de Studio pour un enregistrement d'un rapport de consommation.

#### Champs du modèle {#model-fields-1}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `idempotency_key` | `str` | **obligatoire** |  |
| `status` | `Literal['accepted', 'duplicate', 'rejected']` | **obligatoire** | accepted : comptabilisé. duplicate : la clé a déjà été reçue ; rien n'est comptabilisé à nouveau. rejected : définitif, ne renvoyez pas. |
| `reason` | `str` | `None` | Raison du rejet d'un enregistrement, par exemple unknown_sku. |

### `common.SvBaseModel`

Modèle de base de tous les modèles Supervaize.

_Aucun champ trouvé._

### `telemetry.Telemetry`

**Hérite de :** [`telemetry.TelemetryModel`](#telemetrytelemetrymodel)

Classe de base de toutes les données de télémétrie du système de contrôle Supervaize.

La télémétrie représente les données de supervision et d'observabilité envoyées par les agents au système de contrôle.
Cela comprend les logs, métriques, événements, traces, exceptions, diagnostics et la télémétrie personnalisée.

Hérite de TelemetryModel, qui définit les attributs de base de la télémétrie :
    - agentId : l'ID de l'agent qui envoie la télémétrie
    - type : l'enum TelemetryType indiquant la catégorie de télémétrie (logs, metrics, etc.)
    - category : l'enum TelemetryCategory pour le domaine fonctionnel (system, application, etc.)
    - severity : l'enum TelemetrySeverity indiquant l'importance (debug, info, warning, etc.)
    - details : un dictionnaire contenant les détails propres à la télémétrie

_Aucun champ supplémentaire par rapport à la classe parente._

### `contracts.ConsumptionReport`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Corps de ``POST /w/<workspace>/api/v1/billing/consumption/``.

#### Champs du modèle {#model-fields-2}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `agent_slug` | `str` | **obligatoire** | Slug de l'agent qui envoie le rapport. |
| `records` | `list[contracts.BillableConsumption]` | **obligatoire** |  |

### `contracts.ConsumptionReportResponse`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Réponse de Studio à un rapport de consommation : un accusé par enregistrement, dans l'ordre.

#### Champs du modèle {#model-fields-3}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `results` | `list[contracts.ConsumptionReceipt]` | **obligatoire** |  |

### `agent.AgentCustomMethodParams`

**Hérite de :** [`agent.AgentMethodParams`](#agentagentmethodparams)

#### Champs du modèle {#model-fields-4}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `method_name` | `str` | **obligatoire** |  |

### `agent.AgentJobContextBase`

Modèle de base des paramètres de contexte de job de l'agent

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `job_context` | `JobContext` | **obligatoire** |  |
| `job_fields` | `dict[str, Any]` | **obligatoire** |  |

### `agent.AgentMethodParams`

Paramètres de méthode pour les opérations de l'agent.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `params` | `dict[str, Any]` | — | Un dictionnaire simple clé-valeur des paramètres qui seront transmis à AgentMethod.method sous forme de kwargs |

### `agent.AgentMethods`

**Hérite de :** [`agent.AgentMethodsAbstract`](#agentagentmethodsabstract)

_Aucun champ supplémentaire par rapport à la classe parente._

### `agent.AgentMethodsAbstract`

Classe de base pour créer des modèles Pydantic.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `job_start` | `AgentMethod` | **obligatoire** |  |
| `job_stop` | `AgentMethod` | `None` |  |
| `job_status` | `AgentMethod` | `None` |  |
| `human_answer` | `AgentMethod` | `None` |  |
| `chat` | `AgentMethod` | `None` |  |
| `custom` | `dict[str, supervaizer.agent.AgentMethod]` | `None` |  |

### `agent.AgentResponse`

Modèle de réponse des endpoints d'agent, valeurs fournies par Agent.registration_info

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** |  |
| `id` | `str` | **obligatoire** |  |
| `author` | `str` | `None` |  |
| `developer` | `str` | `None` |  |
| `maintainer` | `str` | `None` |  |
| `editor` | `str` | `None` |  |
| `version` | `str` | **obligatoire** |  |
| `release_notes_url` | `str` | `None` |  |
| `api_path` | `str` | **obligatoire** |  |
| `description` | `str` | **obligatoire** |  |
| `tags` | `list[str]` | `None` |  |
| `methods` | `AgentMethods` | `None` |  |
| `parameters_setup` | `list[dict[str, typing.Any]]` | `None` |  |
| `server_agent_id` | `str` | `None` |  |
| `server_agent_status` | `str` | `None` |  |
| `server_agent_onboarding_status` | `str` | `None` |  |

### `contracts.BillingCatalogItem`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Un SKU facturable qu'un agent déclare à l'enregistrement.

Le catalogue ne contient aucun prix : l'espace de travail propriétaire fixe le prix de chaque SKU dans Studio.

#### Champs du modèle {#model-fields-5}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `sku` | `str` | **obligatoire** | Identifiant du SKU : 1 à 64 lettres minuscules, chiffres ou tirets bas. |
| `unit` | `str` | **obligatoire** | Unité que compte une quantité, comme minute ou token (1 à 32). |
| `description` | `str` | '' | Texte brut affiché avec le SKU. |

### `case.CaseNodes`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-6}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `nodes` | `list[case.CaseNode]` | [] |  |

### `data_resource.DataResource`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

Déclare une ressource de données nommée que l'agent expose pour l'accès CRUD de Studio.

L'agent fournit des fonctions de rappel pour chaque opération. Le SDK génère
automatiquement les routes FastAPI correspondantes.

Exemple ::

    contacts_resource = DataResource(
        name="contacts",
        display_name="Contacts",
        fields=[
            DataResourceField(name="id", editable=Editable.NEVER, visible_on=["list", "detail"]),
            DataResourceField(name="email", field_type=FieldType.EMAIL, required=True),
        ],
        on_list=lambda: repo.list_all(),
        on_get=lambda item_id: repo.get(item_id),
        on_create=lambda data: repo.create(data),
        on_update=lambda item_id, data: repo.update(item_id, data),
        on_delete=lambda item_id: repo.delete(item_id),
    )

#### Champs du modèle {#model-fields-7}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** | Identifiant de ressource sûr pour une URL, par exemple 'contacts'. Lettres minuscules, chiffres, tirets bas et traits d'union uniquement ; doit commencer par une lettre ou un chiffre. |
| `display_name` | `str` | '' |  |
| `description` | `str` | '' |  |
| `fields` | `list[data_resource.DataResourceField]` | — |  |
| `read_only` | `bool` | False |  |
| `importable` | `bool` | False | Active la route d'import CSV en masse |
| `scope` | `Literal['workspace', 'mission', 'job']` | 'workspace' | Périmètre de contexte Studio pour cette ressource. |
| `requires_context` | `list[str]` | — | Clés de contexte que Studio doit envoyer pour le contrôle d'accès à la ressource. |
| `on_list` | `collections.abc.Callable[..., list[dict[str, typing.Any]]]` | `None` |  |
| `on_get` | `collections.abc.Callable[..., dict[str, typing.Any] | None]` | `None` |  |
| `on_create` | `collections.abc.Callable[..., dict[str, typing.Any]]` | `None` |  |
| `on_update` | `collections.abc.Callable[..., dict[str, typing.Any] | None]` | `None` |  |
| `on_delete` | `collections.abc.Callable[..., bool]` | `None` |  |
| `on_import` | `collections.abc.Callable[..., dict[str, typing.Any]]` | `None` |  |

### `job.Job`

**Hérite de :** [`job.AbstractJob`](#jobabstractjob)

Les jobs sont généralement créés par la plateforme, et non par l'agent.

Arguments :
    id (str) : identifiant unique du job, fourni par la plateforme
    agent_name (str) : nom (slug) de l'agent qui exécute le job
    status (EntityStatus) : statut actuel du job
    job_context (JobContext) : informations de contexte du job
    payload (Any, optional) : données de payload du job. Valeur par défaut : None
    result (Any, optional) : données de résultat du job. Valeur par défaut : None
    error (str, optional) : message d'erreur si le job a échoué. Valeur par défaut : None
    responses (list[JobResponse], optional) : liste des réponses du job. Valeur par défaut : liste vide
    finished_at (datetime, optional) : date de fin du job. Valeur par défaut : None
    created_at (datetime, optional) : date de création du job. Valeur par défaut : None

_Aucun champ supplémentaire par rapport à la classe parente._

### `job.JobContext`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-8}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `workspace_id` | `str` | **obligatoire** |  |
| `job_id` | `str` | **obligatoire** |  |
| `started_by` | `str` | **obligatoire** |  |
| `started_at` | `datetime` | **obligatoire** |  |
| `mission_id` | `str` | **obligatoire** |  |
| `mission_name` | `str` | **obligatoire** |  |
| `mission_context` | `Any` | `None` |  |
| `job_instructions` | `JobInstructions` | `None` |  |

### `job.JobResponse`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-9}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `job_id` | `str` | **obligatoire** |  |
| `status` | `<enum 'EntityStatus'>` | **obligatoire** |  |
| `message` | `str` | **obligatoire** |  |
| `payload` | `dict[str, typing.Any]` | `None` |  |
| `error_message` | `str` | `None` |  |
| `error_traceback` | `str` | `None` |  |

### `event.JobStartConfirmationEvent`

**Hérite de :** [`event.Event`](#eventevent)

_Aucun champ supplémentaire par rapport à la classe parente._

### `contracts.SupervaizerV2AgentRegistrationContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-10}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `supervaizer_contract_version` | `Literal[2]` | 2 |  |
| `agent` | `V2AgentIdentity` | **obligatoire** |  |
| `versions` | `V2ProtocolVersions` | **obligatoire** |  |
| `a2a` | `V2A2AController` | **obligatoire** |  |
| `capabilities` | `V2AgentCapabilities` | — |  |
| `job_policy` | `V2JobPolicy` | — |  |
| `resources` | `list[contracts.V2ResourceDefinition]` | — |  |
| `datasets` | `list[contracts.V2DatasetDefinition]` | — |  |
| `dashboards` | `list[contracts.V2DashboardDefinition]` | — |  |
| `workspace_binding` | `V2WorkspaceBindingDefinition` | `None` |  |

### `contracts.V2ActionDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Métadonnées déclarées pour une action d'agent invocable.

Les consommateurs autorisent, regroupent et filtrent les actions à partir de ces champs. Ils ne doivent
jamais être déduits de la chaîne d'identifiant : `id` est fourni par l'appelant à
l'invocation ; l'analyser par motif transforme une décision d'autorisation en
quelque chose que l'appelant contrôle.

#### Champs du modèle {#model-fields-11}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** | Action identifier used to invoke the action. |
| `mutating` | `bool` | True | Indique si l'invocation de l'action modifie l'état côté agent. Vaut True par défaut, de sorte qu'une action non déclarée exige une permission d'écriture. |
| `scope` | `Literal['workspace', 'mission', 'job']` | 'job' | Contexte dans lequel l'action s'exécute. |
| `label` | `str` | `None` | Courte légende qu'un consommateur peut afficher à la place d'une légende déduite de l'identifiant. Texte brut ; affichage uniquement, jamais utilisé pour une autorisation. |
| `description` | `str` | `None` | Une ou deux phrases en langage clair qu'un consommateur peut afficher comme texte d'aide, par exemple dans une infobulle. Texte brut ; affichage uniquement, jamais utilisé pour une autorisation. |
| `kind` | `Literal['command', 'help']` | 'command' | Les actions `help` proposent ou vérifient un brouillon pour `target_field` et doivent déclarer `mutating=False`. Omis lorsque la valeur est `command`. |
| `target_field` | `str` | `None` | Identifiant du champ de configuration dont le brouillon est renseigné par le résultat d'une action `help`. |
| `dry_run` | `bool` | False | Exécution de test définie par son résultat : peut créer des données temporaires côté agent et entraîner un coût de modèle, n'envoie jamais de communication externe et n'apparaît jamais dans les résultats ni dans les compteurs de synchronisation. Omis lorsque la valeur est False. |

### `contracts.V2ActionRequest`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-12}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `request_id` | `str` | **obligatoire** |  |
| `actor` | `V2ActorContext` | **obligatoire** |  |
| `workspace` | `V2WorkspaceContext` | **obligatoire** |  |
| `mission_id` | `str` | **obligatoire** |  |
| `agent_slug` | `str` | **obligatoire** |  |
| `surface` | `str` | **obligatoire** |  |
| `action` | `str` | **obligatoire** |  |
| `input` | `dict[str, Any]` | — |  |
| `idempotency_key` | `str` | `None` |  |
| `draft_session_id` | `str` | `None` |  |
| `job_id` | `str` | `None` |  |
| `case_id` | `str` | `None` |  |
| `step_id` | `str` | `None` |  |
| `mission` | `V2MissionContext` | `None` |  |
| `workspace_authorization` | `V2VerifiedWorkspaceContext` | `None` |  |

### `contracts.V2AgentFullDescription`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Description longue qu'un consommateur affiche sur la page de détail de l'agent.

Le SDK se limite à typer le contenu et à en borner la taille. Le consommateur nettoie le HTML
(et le HTML qu'il produit à partir du markdown) avant l'affichage.

#### Champs du modèle {#model-fields-13}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `format` | `Literal['markdown', 'html']` | 'markdown' | Balisage de ``content``. |
| `content` | `str` | **obligatoire** | Corps en Markdown ou HTML, de 1 à 100 000 caractères, sans être uniquement des espaces. Non nettoyé par le SDK ; le consommateur le nettoie. |

### `contracts.V2AgentIntroduction`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Bloc de présentation en texte brut qu'un consommateur affiche avant qu'aucun job n'existe.

#### Champs du modèle {#model-fields-14}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `tagline` | `str` | **obligatoire** |  |
| `summary` | `str` | **obligatoire** | Ce que fait l'agent, en une ou deux phrases. |
| `example_goals` | `list[str]` | **obligatoire** | Premières demandes suggérées qu'un consommateur peut proposer telles quelles. |
| `avatar_url` | `str` | `None` |  |

### `contracts.V2AgentMethod`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-15}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `method` | `str` | **obligatoire** |  |
| `params` | `dict[str, Any]` | — |  |
| `description` | `str` | `None` |  |
| `is_async` | `bool` | False |  |
| `timeout` | `int` | 600 |  |

### `contracts.V2AgentMethods`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-16}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `refresh` | `V2AgentMethod` | `None` |  |
| `custom` | `dict[str, contracts.V2AgentMethod]` | — |  |

### `case.Case`

**Hérite de :** [`case.CaseAbstractModel`](#casecaseabstractmodel)

_Aucun champ supplémentaire par rapport à la classe parente._

### `case.CaseAbstractModel`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-17}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `job_id` | `str` | **obligatoire** |  |
| `name` | `str` | **obligatoire** |  |
| `account` | `ForwardRef('Account')` | **obligatoire** |  |
| `description` | `str` | **obligatoire** |  |
| `status` | `<enum 'EntityStatus'>` | **obligatoire** |  |
| `updates` | `list[case.CaseNodeUpdate]` | [] |  |
| `total_cost` | `float` | 0.0 |  |
| `final_delivery` | `dict[str, typing.Any]` | `None` |  |
| `finished_at` | `datetime` | `None` |  |
| `metadata` | `dict[str, Any]` | — | Métadonnées métier fournies par l'agent (par ex. contexte du contact) |

### `case.CaseNode`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-18}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** |  |
| `type` | `<enum 'CaseNodeType'>` | **obligatoire** |  |
| `factory` | `Any` | `None` |  |
| `description` | `str` | '' |  |
| `can_be_confirmed` | `bool` | False |  |

### `case.CaseNodeUpdate`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

CaseNodeUpdate est une classe qui représente une mise à jour d'un nœud de case.


Retourne :
    CaseNodeUpdate : objet CaseNodeUpdate

#### Champs du modèle {#model-fields-19}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `index` | `int` | `None` |  |
| `cost` | `float` | `None` |  |
| `name` | `str` | `None` |  |
| `payload` | `dict[str, typing.Any]` | `None` |  |
| `is_final` | `bool` | False |  |
| `upsert` | `bool` | False |  |
| `error` | `str` | `None` |  |
| `scheduled_at` | `datetime` | `None` |  |
| `scheduled_method` | `str` | `None` |  |
| `scheduled_params` | `dict[str, typing.Any]` | `None` |  |
| `scheduled_status` | `str` | `None` |  |

### `context.ContextCitation`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-20}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `ref` | `str` | **obligatoire** |  |
| `title` | `str` | **obligatoire** |  |
| `source_type` | `str` | **obligatoire** |  |
| `version` | `int` | **obligatoire** |  |

### `context.ContextOpenResponse`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-21}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `ref` | `str` | **obligatoire** |  |
| `title` | `str` | **obligatoire** |  |
| `scope` | `Literal['workspace', 'mission']` | **obligatoire** |  |
| `source_type` | `str` | **obligatoire** |  |
| `version` | `int` | **obligatoire** |  |
| `instructions` | `str` | '' |  |
| `tags` | `list[str]` | — |  |
| `content` | `str` | **obligatoire** |  |
| `citations` | `list[context.ContextCitation]` | — |  |

### `context.ContextSearchResponse`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-22}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `query` | `str` | **obligatoire** |  |
| `results` | `list[context.ContextSearchResult]` | — |  |

### `context.ContextSearchResult`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-23}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `ref` | `str` | **obligatoire** |  |
| `title` | `str` | **obligatoire** |  |
| `scope` | `Literal['workspace', 'mission']` | **obligatoire** |  |
| `source_type` | `str` | **obligatoire** |  |
| `version` | `int` | **obligatoire** |  |
| `tags` | `list[str]` | — |  |
| `excerpt` | `str` | '' |  |
| `score` | `int` | 0 |  |
| `citation` | `ContextCitation` | `None` |  |

### `contracts.AgentMethodContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-24}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** |  |
| `method` | `str` | **obligatoire** |  |
| `params` | `dict[str, typing.Any]` | `None` |  |
| `fields` | `list[supervaizer.contracts.AgentMethodFieldContract | dict[str, typing.Any]]` | `None` |  |
| `description` | `str` | `None` |  |
| `is_async` | `bool` | False |  |
| `timeout` | `int` | 600 |  |
| `nodes` | `dict[str, typing.Any]` | `None` |  |

### `contracts.AgentMethodFieldContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-25}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** |  |
| `type` | `str` | `None` |  |
| `field_type` | `str` | 'CharField' |  |
| `description` | `str` | `None` |  |
| `choices` | `list[typing.Any]` | `None` |  |
| `default` | `Any` | `None` |  |
| `widget` | `str` | `None` |  |
| `required` | `bool` | False |  |

### `contracts.AgentMethodsContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-26}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `job_start` | `AgentMethodContract` | **obligatoire** |  |
| `job_stop` | `AgentMethodContract` | `None` |  |
| `job_status` | `AgentMethodContract` | `None` |  |
| `human_answer` | `AgentMethodContract` | `None` |  |
| `chat` | `AgentMethodContract` | `None` |  |
| `custom` | `dict[str, supervaizer.contracts.AgentMethodContract]` | `None` |  |

### `contracts.AgentRegistrationContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Schéma minimal des payloads d'enregistrement d'agent consommés par Studio.

#### Champs du modèle {#model-fields-27}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | `None` |  |
| `slug` | `str` | **obligatoire** |  |
| `name` | `str` | **obligatoire** |  |
| `api_path` | `str` | **obligatoire** |  |
| `release_notes_url` | `str` | `None` |  |
| `methods` | `AgentMethodsContract` \| `dict[str, typing.Any]` | — |  |
| `parameters_setup` | `list[dict[str, Any]]` | — |  |
| `data_resources` | `list[contracts.DataResourceContract | dict[str, Any]]` | — |  |
| `introduction` | `ForwardRef('V2AgentIntroduction | None')` | `None` | Texte de présentation qu'un consommateur affiche pour l'agent dans la liste des agents ; omis s'il n'est pas défini. |
| `full_description` | `ForwardRef('V2AgentFullDescription | None')` | `None` | Markdown ou HTML long qu'un consommateur affiche sur la page de détail de l'agent ; omis s'il n'est pas défini. Le SDK se limite à le typer et à en borner la taille ; le consommateur le nettoie avant l'affichage. |
| `billing_catalog` | `ForwardRef('list[BillingCatalogItem] | None')` | `None` | SKU facturables pour lesquels l'agent peut déclarer une consommation ; omis s'il n'est pas défini. Aucun prix : l'espace de travail propriétaire fixe le prix de chaque SKU dans Studio. |

### `contracts.CaseUpdateEvent`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-28}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** |  |
| `payload` | `dict[str, Any]` | — |  |
| `cost` | `float` | 0.0 |  |
| `index` | `int` | `None` |  |
| `is_final` | `bool` | False |  |

### `contracts.CaseUpdateRequest`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-29}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `answer` | `dict[str, Any]` | **obligatoire** |  |
| `message` | `str` | `None` |  |

### `contracts.ContractModel`

Classe de base des modèles de contrat de transmission gérés par le SDK.

_Aucun champ trouvé._

### `contracts.ControllerContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Surface canonique du contrôleur annoncée par un serveur Supervaizer.

#### Champs du modèle {#model-fields-30}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `controller_contract_version` | `str` | '1.0' |  |
| `api_base_path` | `str` | '/api' |  |
| `endpoints` | `dict[str, str]` | — |  |

### `contracts.DataResourceContextContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-31}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `workspace_id` | `str` | `None` |  |
| `workspace_slug` | `str` | `None` |  |
| `mission_id` | `str` | `None` |  |
| `mission` | `V2MissionContext` | `None` |  |
| `agent_slug` | `str` | `None` |  |
| `request_id` | `str` | `None` |  |

### `contracts.DataResourceContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-32}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** |  |
| `display_name` | `str` | **obligatoire** |  |
| `description` | `str` | '' |  |
| `fields` | `list[contracts.DataResourceFieldContract]` | — |  |
| `read_only` | `bool` | False |  |
| `importable` | `bool` | False |  |
| `operations` | `dict[str, bool]` | — |  |
| `scope` | `Literal['workspace', 'mission', 'job']` | 'workspace' |  |
| `requires_context` | `list[str]` | — |  |

### `contracts.DataResourceFieldContract`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-33}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** |  |
| `field_type` | `str` | 'string' |  |
| `label` | `str` | `None` |  |
| `required` | `bool` | False |  |
| `editable` | `str` | 'always' |  |
| `visible_on` | `list[str]` | — |  |
| `description` | `str` | `None` |  |
| `related_resource` | `str` | `None` |  |
| `sensitive` | `bool` | False |  |
| `display_label` | `str` | `None` |  |

### `contracts.DataResourceListResponse`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Forme de réponse structurée pour les opérations de liste de DataResource.

#### Champs du modèle {#model-fields-34}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `items` | `list[dict[str, Any]]` | — |  |

### `contracts.JobStartRequest`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-35}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `job_context` | `dict[str, Any]` | **obligatoire** |  |
| `job_fields` | `dict[str, Any]` | — |  |
| `encrypted_agent_parameters` | `str` | `None` |  |
| `rule_snapshot` | `ForwardRef('RuleCheckpointSnapshot | None')` | `None` |  |

### `contracts.RuleCheckpointRequest`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-36}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `occurrence_id` | `str` | **obligatoire** |  |
| `phase` | `Literal['before', 'after']` | **obligatoire** |  |
| `snapshot_hash` | `str` | **obligatoire** |  |
| `job_id` | `str` | **obligatoire** |  |
| `case_id` | `str` | **obligatoire** |  |
| `step_id` | `str` | **obligatoire** |  |
| `context` | `dict[str, Any]` | **obligatoire** |  |
| `secret_refs` | `list[str]` | — |  |

### `contracts.RuleCheckpointResponse`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-37}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `checkpoint_id` | `str` | **obligatoire** |  |
| `status` | `Literal['allow', 'pause', 'stop']` | **obligatoire** |  |
| `snapshot_hash` | `str` | **obligatoire** |  |
| `input_hash` | `str` | **obligatoire** |  |

### `contracts.RuleCheckpointResume`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-38}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `checkpoint_id` | `str` | **obligatoire** |  |
| `job_id` | `str` | **obligatoire** |  |
| `case_id` | `str` | **obligatoire** |  |
| `agent_slug` | `str` | **obligatoire** |  |
| `occurrence_id` | `str` | **obligatoire** |  |
| `phase` | `Literal['before', 'after']` | **obligatoire** |  |
| `status` | `Literal['allow', 'stop']` | **obligatoire** |  |
| `snapshot_hash` | `str` | **obligatoire** |  |
| `input_hash` | `str` | **obligatoire** |  |
| `decision_id` | `str` | **obligatoire** |  |

### `contracts.RuleCheckpointSnapshot`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Instantané figé et opaque des règles fourni par Studio pour un job encadré.

#### Champs du modèle {#model-fields-39}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `hash` | `str` | **obligatoire** |  |
| `checkpoint_url` | `str` | **obligatoire** |  |
| `version` | `Literal[1]` | **obligatoire** |  |
| `checkpoint_token` | `str` | **obligatoire** |  |

### `contracts.ServerRegistrationContract`

**Hérite de :** [`contracts.ControllerContract`](#contractscontrollercontract)

Schéma minimal des détails de server.register.

#### Champs du modèle {#model-fields-40}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `server_id` | `str` | **obligatoire** |  |
| `url` | `str` | **obligatoire** |  |
| `uri` | `str` | **obligatoire** |  |
| `api_version` | `str` | **obligatoire** |  |
| `controller_version` | `str` | `None` |  |
| `environment` | `str` | `None` |  |
| `agents` | `list[contracts.AgentRegistrationContract]` | — |  |

### `contracts.V2A2AController`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-41}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `agent_card_url` | `str` | **obligatoire** |  |
| `controller_url` | `str` | **obligatoire** |  |
| `transport` | `V2A2ATransport` | — |  |
| `external_interop` | `V2A2AExternalInterop` | — |  |

### `contracts.V2A2AExternalInterop`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-42}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `inbound_tasks` | `bool` | False |  |
| `outbound_delegation` | `bool` | False |  |

### `contracts.V2A2ATransport`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-43}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `json_rpc` | `bool` | True |  |
| `sse` | `bool` | True |  |
| `push_notifications` | `bool` | False |  |

### `contracts.V2A2UIResourceImportColumn`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-44}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `label` | `str` | `None` |  |
| `type` | `str` | 'string' |  |
| `required` | `bool` | False |  |

### `contracts.V2A2UIResourceImportDocument`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Surface d'import de ressources au format A2UI, consommée par Studio.

#### Champs du modèle {#model-fields-45}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `type` | `Literal['ResourceImport']` | 'ResourceImport' |  |
| `id` | `str` | **obligatoire** |  |
| `title` | `str` | **obligatoire** |  |
| `resource` | `str` | **obligatoire** |  |
| `accepted_formats` | `list[Literal['csv', 'xlsx']]` | — |  |
| `fields` | `list[contracts.V2ResourceFieldDefinition]` | — |  |
| `columns` | `list[contracts.V2A2UIResourceImportColumn]` | — |  |
| `submit` | `V2A2UISubmitDefinition` | **obligatoire** |  |
| `state` | `dict[str, Any]` | — |  |

### `contracts.V2A2UISubmitDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-46}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `action` | `str` | **obligatoire** |  |
| `label` | `str` | `None` |  |

### `contracts.V2ActionResult`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-47}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `status` | `Literal['ok', 'error']` | **obligatoire** |  |
| `effects` | `list[contracts.V2Effect]` | — |  |
| `job_state` | `ForwardRef('V2JobStateSnapshot | None')` | `None` |  |
| `replay_safety` | `V2ReplaySafetyMetadata` | `None` |  |
| `setup_plan` | `dict[str, typing.Any]` \| `V2SetupPlan` | `None` |  |
| `draft` | `V2FieldDraft` | `None` |  |
| `dry_run` | `V2DryRunOutcome` | `None` |  |

### `contracts.V2ActorContext`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-48}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `user_id` | `str` | **obligatoire** |  |

### `contracts.V2AgentCapabilities`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-49}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `surfaces` | `list[str]` | — |  |
| `surface_definitions` | `list[contracts.V2SurfaceDefinition]` | — | Textes d'affichage des surfaces déclarées, au plus un par identifiant. Omis de l'enregistrement sérialisé lorsque la liste est vide. |
| `actions` | `list[contracts.V2ActionDefinition]` | — |  |
| `case_lanes` | `list[contracts.V2CaseLaneDefinition]` | — |  |
| `artifact_types` | `list[contracts.V2ArtifactTypeDefinition]` | — |  |
| `rule_checkpoints` | `ForwardRef('V2RuleCheckpointCapability | None')` | `None` |  |
| `scheduled_start` | `bool` | False |  |

### `contracts.V2AgentIdentity`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-50}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `slug` | `str` | **obligatoire** |  |
| `display_name` | `str` | **obligatoire** |  |

### `contracts.V2ArtifactRef`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-51}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `type` | `str` | **obligatoire** |  |
| `title` | `str` | `None` |  |
| `external_id` | `str` | `None` |  |
| `media_type` | `str` | `None` |  |

### `contracts.V2ArtifactTypeDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-52}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `type` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |
| `renderer_surface` | `str` | `None` |  |

### `contracts.V2AwaitingFieldDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-53}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |
| `type` | `str` | 'boolean' |  |
| `required` | `bool` | False |  |
| `item_fields` | `list[supervaizer.contracts.V2SetupFieldDefinition]` | `None` |  |
| `default` | `Any` | `None` |  |
| `description` | `str` | `None` |  |
| `placeholder` | `str` | `None` |  |
| `multiline` | `bool` | False |  |
| `min_rows` | `int` | `None` |  |
| `options` | `list[supervaizer.contracts.V2FieldOption]` | `None` |  |
| `options_source` | `V2ResourceFieldOptionsSource` | `None` |  |
| `depends_on` | `V2FieldDependsOn` | `None` |  |
| `validation` | `V2FieldValidation` | `None` |  |

### `contracts.V2AwaitingState`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-54}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `reason` | `str` | **obligatoire** |  |
| `surface` | `str` | **obligatoire** |  |
| `action` | `str` | **obligatoire** |  |
| `fields` | `list[contracts.V2AwaitingFieldDefinition]` | — |  |
| `reopenable` | `bool` | False | Indique si une étape déjà traitée peut être rouverte et soumise à nouveau avec des valeurs modifiées. |

### `contracts.V2CaseLaneDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-55}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |
| `default` | `bool` | False |  |

### `contracts.V2CaseSnapshot`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-56}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `lane` | `str` | 'work' |  |
| `title` | `str` | `None` |  |
| `status` | `str` | `None` |  |
| `external_id` | `str` | `None` |  |
| `metadata` | `dict[str, Any]` | — |  |
| `steps` | `list[contracts.V2StepSnapshot]` | — |  |

### `contracts.V2ContextAssignment`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-57}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `items` | `list[contracts.V2ContextAssignmentItem]` | **obligatoire** |  |
| `mission_id` | `str` | `None` |  |
| `job_id` | `str` | **obligatoire** |  |
| `assigned_at` | `str` | **obligatoire** |  |

### `contracts.V2ContextAssignmentItem`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-58}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `ref` | `str` | **obligatoire** |  |
| `version` | `int` | **obligatoire** |  |
| `scope` | `Literal['workspace', 'mission']` | **obligatoire** |  |
| `title` | `str` | **obligatoire** |  |

### `contracts.V2CostEstimate`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Une fourchette de coût ou un inconnu explicite, jamais un nombre unique.

#### Champs du modèle {#model-fields-59}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `status` | `Literal['estimated', 'unknown']` | **obligatoire** |  |
| `unit` | `str` | `None` | Libellé libre affiché tel quel, par exemple USD, tokens ou crédits. |
| `min` | `float` | `None` |  |
| `max` | `float` | `None` |  |
| `basis` | `str` | `None` | Texte brut, par exemple 'for 50 responses'. |

### `contracts.V2DashboardDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-60}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |
| `surface` | `str` | 'mission.analytics' |  |
| `widgets` | `list[contracts.V2DashboardWidgetDefinition]` | — |  |

### `contracts.V2DashboardWidgetDataRef`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-61}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `mode` | `Literal['ref', 'action', 'inline']` | 'ref' |  |
| `datasetId` | `str` | `None` |  |
| `action` | `str` | `None` |  |
| `input` | `dict[str, Any]` | — |  |
| `values` | `list[dict[str, typing.Any]]` \| `dict[str, typing.Any]` | `None` |  |

### `contracts.V2DashboardWidgetDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-62}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `title` | `str` | **obligatoire** |  |
| `data` | `V2DashboardWidgetDataRef` | `None` |  |
| `layout` | `dict[str, Any]` | — |  |
| `visualization` | `V2DashboardWidgetVisualization` | — |  |

### `contracts.V2DashboardWidgetVisualization`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-63}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `type` | `Literal['table', 'metric', 'vega-lite', 'custom']` | 'table' |  |
| `spec` | `dict[str, typing.Any]` | `None` |  |

### `contracts.V2DatasetDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-64}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |
| `auto_surface` | `bool` | False |  |
| `scope` | `Literal['workspace', 'mission', 'job']` | 'workspace' |  |
| `display` | `V2ResourceDisplayDefinition` | `None` |  |

### `contracts.V2DryRunOutcome`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Ce qu'une action en mode dry-run a laissé derrière elle.

#### Champs du modèle {#model-fields-65}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `expires_at` | `datetime` | `None` |  |
| `deletable` | `bool` | **obligatoire** |  |
| `cost_incurred` | `V2CostEstimate` | `None` |  |

### `contracts.V2Effect`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-66}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `type` | `str` | **obligatoire** |  |
| `job_id` | `str` | `None` |  |
| `case_id` | `str` | `None` |  |
| `step_id` | `str` | `None` |  |
| `resource` | `str` | `None` |  |
| `dataset` | `str` | `None` |  |
| `artifact_id` | `str` | `None` |  |
| `status` | `str` | `None` |  |
| `message` | `str` | `None` |  |
| `count` | `int` | `None` |  |
| `item` | `dict[str, typing.Any]` | `None` |  |
| `items` | `list[dict[str, typing.Any]]` | `None` |  |
| `rows` | `list[dict[str, typing.Any]]` | `None` |  |
| `errors` | `list[dict[str, typing.Any]]` | `None` |  |
| `gaps` | `list[dict[str, typing.Any]]` | `None` |  |
| `summary` | `dict[str, typing.Any]` | `None` |  |
| `case` | `dict[str, typing.Any]` | `None` |  |
| `data` | `dict[str, typing.Any]` | `None` |  |

### `contracts.V2FieldDependsOn`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Active un champ uniquement tant qu'un champ parent contient l'une des valeurs listées.

#### Champs du modèle {#model-fields-67}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `field` | `str` | **obligatoire** | Identifiant du champ parent ; les parents peuvent s'enchaîner. |
| `in_` | `list[str]` | **obligatoire** | Valeurs du parent, converties en chaînes, qui activent ce champ. |

### `contracts.V2FieldDraft`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Sortie d'une action d'aide : une valeur proposée pour un champ de configuration, jamais appliquée automatiquement.

#### Champs du modèle {#model-fields-68}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `field` | `str` | **obligatoire** | Identifiant du champ de configuration cible. |
| `value` | `Any` | `None` | Valeur proposée ; None pour un résultat de validation seule. |
| `suggestions` | `list[contracts.V2Suggestion]` | — |  |

### `contracts.V2FieldOption`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Un choix sélectionnable. Les chaînes seules sont rejetées afin que les libellés restent explicites.

#### Champs du modèle {#model-fields-69}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `value` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |

### `contracts.V2FieldValidation`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Règles qu'un consommateur applique avant la soumission. Chaque règle doit convenir au type du champ.

#### Champs du modèle {#model-fields-70}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `min_length` | `int` | `None` |  |
| `max_length` | `int` | `None` |  |
| `pattern` | `str` | `None` | Expression régulière, sous-ensemble compatible avec ECMAScript. |
| `min` | `float` | `None` |  |
| `max` | `float` | `None` |  |
| `min_items` | `int` | `None` |  |
| `max_items` | `int` | `None` |  |
| `message` | `str` | `None` | Affiché à la place de l'erreur de validation générique. |

### `contracts.V2JobPolicy`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-71}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `default_timeout_seconds` | `int` | `None` |  |
| `offline_start_policy` | `Literal['block']` | 'block' |  |
| `offline_running_policy` | `Literal['fail_in_studio']` | 'fail_in_studio' |  |
| `sync` | `V2JobSyncPolicy` | `None` |  |
| `setup` | `V2JobSetupPolicy` | `None` |  |

### `contracts.V2JobSetupPolicy`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Actions génériques de configuration de job déclarées par l'agent.

#### Champs du modèle {#model-fields-72}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `preview_action` | `str` | 'job.start.preview' |  |
| `start_action` | `str` | 'job.start' |  |
| `submit_action` | `str` | 'step.awaiting.submit' |  |
| `action_scopes` | `list[Literal['workspace', 'job', 'case', 'step']]` | — |  |
| `plan` | `ForwardRef('dict[str, Any] | V2SetupPlan | None')` | `None` |  |

### `contracts.V2JobSnapshot`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-73}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `agent_slug` | `str` | **obligatoire** |  |
| `mission_id` | `str` | **obligatoire** |  |
| `status` | `str` | **obligatoire** |  |
| `source` | `V2JobSource` | **obligatoire** |  |

### `contracts.V2JobSource`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-74}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `type` | `Literal['fresh_start', 'external']` | **obligatoire** |  |
| `external_ref` | `str` | `None` |  |
| `previous_job_id` | `str` | `None` |  |
| `target_type` | `str` | `None` | Type d'objet métier déclaré par l'agent pour les sources externes (par ex. project). Vocabulaire ouvert, contrairement aux champs fixés par le protocole comme l'activity d'une étape. |

### `contracts.V2JobStateSnapshot`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-75}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `job` | `V2JobSnapshot` | **obligatoire** |  |
| `cases` | `list[contracts.V2CaseSnapshot]` | — |  |

### `contracts.V2JobSyncPolicy`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-76}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `action` | `str` | 'job.sync' |  |
| `supported_statuses` | `list[str]` | — |  |

### `contracts.V2JobSyncResult`

**Hérite de :** [`contracts.V2ActionResult`](#contractsv2actionresult)

#### Champs du modèle {#model-fields-77}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `external_ref` | `str` | `None` |  |
| `external_version` | `str` | `None` |  |
| `sync_cursor` | `str` | `None` |  |
| `observed_at` | `str` | `None` |  |

### `contracts.V2MissionContext`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Mission Studio envoyée avec une requête. Le SDK ne lit pas les clés de ``metadata``.

#### Champs du modèle {#model-fields-78}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `name` | `str` | `None` |  |
| `metadata` | `dict[str, Any]` | — |  |

### `contracts.V2MountedResourceViewDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Surcharge d'agent qui monte une surface A2UI sur une vue de ressource complète.

#### Champs du modèle {#model-fields-79}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `view` | `str` | **obligatoire** | Vue de ressource générée remplacée par le montage (par ex. import, edit). |
| `surface` | `str` | **obligatoire** | Identifiant de la surface A2UI enregistrée servie pour cette vue de ressource. |

### `contracts.V2ProtocolVersions`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-80}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `a2ui_version` | `str` | **obligatoire** |  |
| `a2ui_catalog_version` | `str` | **obligatoire** |  |
| `a2a_version` | `str` | **obligatoire** |  |
| `ag_ui_version` | `str` | `None` |  |

### `contracts.V2ReplaySafetyMetadata`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-81}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `dedupe_keys` | `list[str]` | — |  |
| `stable_external_ids_required` | `bool` | True |  |
| `strictly_idempotent_response` | `bool` | False |  |
| `convergent` | `bool` | True |  |

### `contracts.V2ResourceDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-82}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |
| `auto_surface` | `bool` | False |  |
| `scope` | `Literal['workspace', 'mission', 'job']` | 'workspace' |  |
| `requires_context` | `list[str]` | — |  |
| `operations` | `list[str]` | — |  |
| `display` | `V2ResourceDisplayDefinition` | `None` |  |
| `fields` | `list[contracts.V2ResourceFieldDefinition]` | — |  |
| `mounted_views` | `list[contracts.V2MountedResourceViewDefinition]` | — |  |

### `contracts.V2ResourceDisplayDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-83}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `title_field` | `str` | `None` |  |
| `columns` | `list[str]` | — |  |
| `search_fields` | `list[str]` | — |  |

### `contracts.V2ResourceFieldDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-84}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |
| `type` | `str` | 'string' |  |
| `required` | `bool` | False |  |
| `read_only` | `bool` | False |  |
| `multiline` | `bool` | False |  |
| `options_source` | `V2ResourceFieldOptionsSource` | `None` |  |
| `item_fields` | `list[supervaizer.contracts.V2SetupFieldDefinition]` | `None` |  |
| `default` | `Any` | `None` |  |
| `description` | `str` | `None` |  |
| `placeholder` | `str` | `None` |  |
| `min_rows` | `int` | `None` |  |
| `options` | `list[supervaizer.contracts.V2FieldOption]` | `None` |  |
| `depends_on` | `V2FieldDependsOn` | `None` |  |
| `validation` | `V2FieldValidation` | `None` |  |

### `contracts.V2ResourceFieldOptionsSource`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-85}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `type` | `Literal['resource']` | 'resource' |  |
| `resource` | `str` | **obligatoire** |  |
| `value_field` | `str` | 'id' |  |
| `label_field` | `str` | `None` |  |

### `contracts.V2RuleCheckpointCapability`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Prise en charge facultative des points de contrôle de règles avant/après de Studio.

#### Champs du modèle {#model-fields-86}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `version` | `Literal[1]` | 1 |  |
| `phases` | `list[Literal['before', 'after']]` | **obligatoire** |  |
| `secret_refs` | `list[str]` | — |  |

### `contracts.V2SetupFieldDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Un champ de saisie qu'un consommateur affiche pendant la configuration guidée.

Types connus : string, text, boolean, integer, number, date, select,
multi_select, resource_ref, file, list. Les types inconnus sont affichés comme string.
Un champ `list` déclare `item_fields` (un seul niveau d'imbrication) et sa valeur est
une liste de dicts indexés par l'identifiant du champ d'élément, jamais du texte libre.

#### Champs du modèle {#model-fields-87}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `label` | `str` | **obligatoire** |  |
| `type` | `str` | 'string' |  |
| `item_fields` | `list[supervaizer.contracts.V2SetupFieldDefinition]` | `None` |  |
| `required` | `bool` | False |  |
| `default` | `Any` | `None` |  |
| `description` | `str` | `None` |  |
| `placeholder` | `str` | `None` |  |
| `multiline` | `bool` | False |  |
| `min_rows` | `int` | `None` |  |
| `options` | `list[supervaizer.contracts.V2FieldOption]` | `None` |  |
| `options_source` | `V2ResourceFieldOptionsSource` | `None` |  |
| `depends_on` | `V2FieldDependsOn` | `None` |  |
| `validation` | `V2FieldValidation` | `None` |  |

### `contracts.V2SetupPlan`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Plan de configuration typé ; il se sérialise en `confirmation_required` et `steps[]`.

#### Champs du modèle {#model-fields-88}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `confirmation_required` | `bool` | True |  |
| `steps` | `list[contracts.V2SetupStep]` | — |  |
| `cost_estimate` | `V2CostEstimate` | `None` |  |

### `contracts.V2SetupStep`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-89}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `title` | `str` | **obligatoire** |  |
| `description` | `str` | `None` |  |
| `status` | `Literal['pending', 'awaiting', 'done', 'skipped']` | 'pending' |  |
| `fields` | `list[contracts.V2SetupFieldDefinition]` | — |  |
| `help_actions` | `list[str]` | — | Identifiants des actions déclarées avec kind='help' dans l'enregistrement. |

### `contracts.V2StepSnapshot`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-90}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `activity` | `Literal['operation', 'delegation']` | **obligatoire** |  |
| `status` | `str` | **obligatoire** |  |
| `title` | `str` | `None` |  |
| `external_id` | `str` | `None` |  |
| `awaiting` | `V2AwaitingState` | `None` |  |
| `outputs` | `list[contracts.V2ArtifactRef]` | — |  |

### `contracts.V2Suggestion`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-91}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `message` | `str` | **obligatoire** |  |
| `severity` | `Literal['info', 'warning', 'error']` | **obligatoire** |  |
| `field` | `str` | `None` |  |
| `proposed_value` | `Any` | `None` |  |

### `contracts.V2SurfaceDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

Texte d'affichage pour une surface déclarée.

`capabilities.surfaces` reste une liste d'identifiants, de sorte que les consommateurs continuent de faire correspondre
les surfaces par chaîne ; une définition ajoute seulement un texte lisible pour l'un de
ces identifiants.

#### Champs du modèle {#model-fields-92}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** | Identifiant de la surface, tel qu'il figure dans `capabilities.surfaces`. |
| `label` | `str` | `None` | Courte légende qu'un consommateur peut afficher à la place d'une légende déduite de l'identifiant. Texte brut ; affichage uniquement, jamais utilisé pour une autorisation. |
| `description` | `str` | `None` | Une ou deux phrases en langage clair qu'un consommateur peut afficher comme texte d'aide, par exemple dans une infobulle. Texte brut ; affichage uniquement, jamais utilisé pour une autorisation. |

### `contracts.V2SurfaceRequest`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-93}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `request_id` | `str` | **obligatoire** |  |
| `actor` | `V2ActorContext` | **obligatoire** |  |
| `workspace` | `V2WorkspaceContext` | **obligatoire** |  |
| `mission_id` | `str` | **obligatoire** |  |
| `agent_slug` | `str` | **obligatoire** |  |
| `surface` | `str` | **obligatoire** |  |
| `input` | `dict[str, Any]` | — |  |
| `draft_session_id` | `str` | `None` |  |
| `job_id` | `str` | `None` |  |
| `case_id` | `str` | `None` |  |
| `step_id` | `str` | `None` |  |
| `mission` | `V2MissionContext` | `None` |  |
| `workspace_authorization` | `V2VerifiedWorkspaceContext` | `None` |  |

### `contracts.V2SurfaceResult`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-94}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `surface` | `str` | **obligatoire** |  |
| `a2ui_version` | `str` | `None` |  |
| `a2ui_catalog_version` | `str` | `None` |  |
| `document` | `dict[str, Any]` | — |  |

### `contracts.V2VerifiedWorkspaceContext`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-95}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `grant_id` | `str` | **obligatoire** |  |
| `workspace_id` | `str` | **obligatoire** |  |
| `workspace_slug` | `str` | `None` |  |
| `agent_id` | `str` | **obligatoire** |  |
| `agent_slug` | `str` | **obligatoire** |  |
| `server_id` | `str` | **obligatoire** |  |
| `scopes` | `list[str]` | — |  |
| `agent_workspace_ref` | `str` | `None` |  |

### `contracts.V2WorkspaceAuthorizationSettings`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-96}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `enabled` | `bool` | False |  |
| `issuer` | `str` | `None` |  |
| `audience` | `str` | `None` |  |
| `public_key_pem` | `str` | `None` |  |
| `jwks_url` | `str` | `None` |  |
| `leeway_seconds` | `int` | 30 |  |

### `contracts.V2WorkspaceBindingCreateDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-97}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `surface` | `str` | 'workspace_binding.create' |  |
| `action` | `str` | 'workspace_binding.create' |  |
| `fields` | `list[contracts.V2ResourceFieldDefinition]` | — |  |

### `contracts.V2WorkspaceBindingDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-98}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `required` | `bool` | False |  |
| `modes` | `list[Literal['bind_existing', 'create_and_bind']]` | — |  |
| `reference_label` | `str` | 'Agent workspace reference' |  |
| `reference_help` | `str` | 'Select or create the agent-side record this Studio workspace may access.' |  |
| `reference_placeholder` | `str` | 'Example: workspace-prod' |  |
| `existing` | `V2WorkspaceBindingExistingDefinition` | `None` |  |
| `create` | `V2WorkspaceBindingCreateDefinition` | `None` |  |

### `contracts.V2WorkspaceBindingExistingDefinition`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-99}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `action` | `str` | 'workspace_binding.options' |  |
| `value_field` | `str` | 'agent_workspace_ref' |  |
| `label_field` | `str` | 'display_name' |  |

### `contracts.V2WorkspaceContext`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-100}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `slug` | `str` | `None` |  |

### `data_resource.DataResourceContext`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

Contexte de requête Studio transmis aux callbacks de DataResource.

#### Champs du modèle {#model-fields-101}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `workspace_id` | `str` | `None` |  |
| `workspace_slug` | `str` | `None` |  |
| `mission_id` | `str` | `None` |  |
| `mission` | `V2MissionContext` | `None` |  |
| `agent_slug` | `str` | **obligatoire** |  |
| `request_id` | `str` | `None` |  |
| `workspace_authorization` | `V2VerifiedWorkspaceContext` | `None` |  |

### `data_resource.DataResourceField`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

Décrit un champ unique d'une DataResource pour l'affichage dans Studio.

#### Champs du modèle {#model-fields-102}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **obligatoire** | Nom de colonne ou d'attribut |
| `field_type` | `<enum 'FieldType'>` | `string` | Une valeur parmi : string, integer, boolean, date, datetime, text, email, url |
| `label` | `str` | `None` | Libellé lisible ; par défaut name.title() |
| `required` | `bool` | False | Obligatoire dans le formulaire de création |
| `editable` | `<enum 'Editable'>` | `always` |  |
| `visible_on` | `list[str]` | — | Vues qui affichent ce champ : list, detail, create, edit |
| `description` | `str` | `None` | Texte d'aide affiché dans Studio |
| `related_resource` | `str` | `None` | Nom d'une autre DataResource que ce champ référence par clé étrangère |
| `sensitive` | `bool` | False | True lorsque Studio doit masquer ce champ pour les utilisateurs non gestionnaires |

### `deploy.drivers.base.DeploymentPlan`

Plan de déploiement contenant toutes les actions à effectuer.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `platform` | `str` | **obligatoire** |  |
| `service_name` | `str` | **obligatoire** |  |
| `environment` | `str` | **obligatoire** |  |
| `region` | `str` | **obligatoire** |  |
| `project_id` | `str` | `None` |  |
| `actions` | `list[deploy.drivers.base.ResourceAction]` | [] |  |
| `total_cost_estimate` | `str` | `None` |  |
| `estimated_duration` | `str` | `None` |  |
| `current_image` | `str` | `None` |  |
| `current_url` | `str` | `None` |  |
| `current_status` | `str` | `None` |  |
| `target_image` | `str` | **obligatoire** |  |
| `target_port` | `int` | 8000 |  |
| `target_env_vars` | `dict[str, str]` | {} |  |
| `target_secrets` | `dict[str, str]` | {} |  |

### `deploy.drivers.base.DeploymentResult`

Résultat d'une opération de déploiement.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `success` | `bool` | **obligatoire** |  |
| `service_url` | `str` | `None` |  |
| `service_id` | `str` | `None` |  |
| `revision` | `str` | `None` |  |
| `image_digest` | `str` | `None` |  |
| `status` | `str` | 'unknown' |  |
| `health_status` | `str` | 'unknown' |  |
| `deployment_time` | `float` | `None` |  |
| `error_message` | `str` | `None` |  |
| `error_details` | `dict[str, typing.Any]` | `None` |  |

### `deploy.state.DeploymentState`

Modèle d'état du déploiement.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `version` | `int` | 2 | Version du format du fichier d'état |
| `service_name` | `str` | **obligatoire** | Nom du service déployé |
| `platform` | `str` | **obligatoire** | Plateforme cible (cloud-run|aws-app-runner|do-app-platform) |
| `environment` | `str` | **obligatoire** | Environnement (dev|staging|prod) |
| `region` | `str` | **obligatoire** | Région du fournisseur |
| `project_id` | `str` | `None` | Projet GCP / compte AWS / projet DO |
| `image_tag` | `str` | **obligatoire** | Tag de l'image Docker |
| `image_digest` | `str` | `None` | Empreinte (digest) de l'image Docker |
| `service_url` | `str` | `None` | URL publique du service |
| `revision` | `str` | `None` | Révision ou version du service |
| `created_at` | `datetime` | — | Date de création du déploiement |
| `updated_at` | `datetime` | — | Date de dernière mise à jour |
| `status` | `str` | 'unknown' | Statut du déploiement |
| `health_status` | `str` | 'unknown' | Statut du contrôle de santé |
| `port` | `int` | 8000 | Port de l'application |
| `api_key_generated` | `bool` | False | Indique si la clé d'API a été générée |
| `rsa_key_generated` | `bool` | False | Indique si la clé RSA a été générée |
| `provider_data` | `dict[str, Any]` | — | Données propres à la plateforme |

### `deploy.drivers.base.ResourceAction`

Représente une action à effectuer sur une ressource.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `resource_type` | `<enum 'ResourceType'>` | **obligatoire** |  |
| `action_type` | `<enum 'ActionType'>` | **obligatoire** |  |
| `resource_name` | `str` | **obligatoire** |  |
| `description` | `str` | **obligatoire** |  |
| `cost_estimate` | `str` | `None` |  |
| `metadata` | `dict[str, typing.Any]` | `None` |  |

### `deploy.health.HealthCheckConfig`

Configuration des opérations de contrôle de santé.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `timeout` | `int` | 60 |  |
| `max_retries` | `int` | 5 |  |
| `base_delay` | `float` | 1.0 |  |
| `max_delay` | `float` | 30.0 |  |
| `backoff_multiplier` | `float` | 2.0 |  |
| `success_threshold` | `int` | 1 |  |
| `endpoints` | `list[str]` | `None` |  |

### `deploy.health.HealthCheckResult`

Résultat d'une opération de contrôle de santé.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `status` | `<enum 'HealthStatus'>` | **obligatoire** |  |
| `response_time` | `float` | **obligatoire** |  |
| `status_code` | `int` | `None` |  |
| `error_message` | `str` | `None` |  |
| `endpoint` | `str` | `None` |  |
| `timestamp` | `float` | 0.0 |  |

### `event.AbstractEvent`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-103}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `source` | `dict[str, Any]` | **obligatoire** |  |
| `account` | `Any` | **obligatoire** |  |
| `type` | `<enum 'EventType'>` | **obligatoire** |  |
| `object_type` | `str` | **obligatoire** |  |
| `details` | `dict[str, Any]` | **obligatoire** |  |

### `event.AgentRegisterEvent`

**Hérite de :** [`event.Event`](#eventevent)

Événement envoyé lorsqu'un agent s'enregistre auprès du système de contrôle.

Test dans tests/test_agent_register_event.py

_Aucun champ supplémentaire par rapport à la classe parente._

### `event.CaseStartEvent`

**Hérite de :** [`event.Event`](#eventevent)

_Aucun champ supplémentaire par rapport à la classe parente._

### `event.CaseUpdateEvent`

**Hérite de :** [`event.Event`](#eventevent)

_Aucun champ supplémentaire par rapport à la classe parente._

### `event.Event`

**Hérite de :** [`event.AbstractEvent`](#eventabstractevent)

Classe de base de tous les événements du système de contrôle Supervaize.

Les événements représentent des messages envoyés par les agents au système de contrôle pour communiquer
des statuts, des anomalies, des livrables et d'autres informations.

Hérite de AbstractEvent, qui définit les attributs de base de l'événement :
    - source : la source ou l'origine de l'événement (par ex. URI de l'agent ou du serveur)
    - type : l'enum EventType indiquant la catégorie de l'événement
    - account : le compte auquel l'événement appartient
    - details : un dictionnaire contenant les détails propres à l'événement

Tests dans tests/test_event.py

_Aucun champ supplémentaire par rapport à la classe parente._

### `event.JobFinishedEvent`

**Hérite de :** [`event.Event`](#eventevent)

_Aucun champ supplémentaire par rapport à la classe parente._

### `event.ServerRegisterEvent`

**Hérite de :** [`event.Event`](#eventevent)

_Aucun champ supplémentaire par rapport à la classe parente._

### `job.AbstractJob`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-104}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | **obligatoire** |  |
| `name` | `str` | **obligatoire** |  |
| `agent_name` | `str` | **obligatoire** |  |
| `status` | `<enum 'EntityStatus'>` | **obligatoire** |  |
| `job_context` | `JobContext` | **obligatoire** |  |
| `payload` | `Any` | `None` |  |
| `result` | `Any` | `None` |  |
| `error` | `str` | `None` |  |
| `responses` | `list[job.JobResponse]` | [] |  |
| `finished_at` | `datetime` | `None` |  |
| `created_at` | `datetime` | `None` |  |
| `agent_parameters` | `list[dict[str, typing.Any]]` | `None` |  |
| `case_ids` | `list[str]` | [] |  |
| `metadata` | `dict[str, Any]` | — | Métadonnées métier fournies par l'agent (par ex. contexte de l'objet source) |

### `job.JobInstructions`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

#### Champs du modèle {#model-fields-105}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `max_cases` | `int` | `None` |  |
| `max_duration` | `int` | `None` |  |
| `max_cost` | `float` | `None` |  |
| `stop_on_warning` | `bool` | False |  |
| `stop_on_error` | `bool` | True |  |
| `job_start_time` | `float` | `None` |  |

### `protocol.a2a.controller.JsonRpcError`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-106}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `code` | `int` | **obligatoire** |  |
| `message` | `str` | **obligatoire** |  |
| `data` | `dict[str, typing.Any]` | `None` |  |

### `protocol.a2a.controller.JsonRpcRequest`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-107}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `jsonrpc` | `Literal['2.0']` | '2.0' |  |
| `id` | `str` \| `int` | `None` |  |
| `method` | `str` | **obligatoire** |  |
| `params` | `dict[str, Any]` | — |  |

### `protocol.a2a.controller.JsonRpcResponse`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-108}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `jsonrpc` | `Literal['2.0']` | '2.0' |  |
| `id` | `str` \| `int` | `None` |  |
| `result` | `dict[str, typing.Any]` | `None` |  |
| `error` | `JsonRpcError` | `None` |  |

### `routes.CaseUpdateRequest`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

Modèle de requête pour mettre à jour un case avec la réponse à une question.

#### Champs du modèle {#model-fields-109}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `answer` | `dict[str, Any]` | **obligatoire** |  |
| `message` | `str` | `None` |  |

### `server_utils.ErrorResponse`

Modèle de réponse d'erreur standard

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `error` | `str` | **obligatoire** |  |
| `error_type` | `<enum 'ErrorType'>` | **obligatoire** |  |
| `detail` | `str` | `None` |  |
| `timestamp` | `datetime` | datetime.datetime(2026, 10, 30, 9, 9, 43, 241638) |  |
| `status_code` | `int` | **obligatoire** |  |

### `routes.RegistrationRefreshRequest`

**Hérite de :** [`common.SvBaseModel`](#commonsvbasemodel)

Modèle de requête pour renvoyer l'événement d'enregistrement du serveur.

#### Champs du modèle {#model-fields-110}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `reason` | `str` | `None` |  |
| `requested_at` | `str` | `None` |  |

### `server_info.ServerInfo`

Informations complètes du serveur pour le stockage.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `id` | `str` | 'server_instance' |  |
| `host` | `str` | **obligatoire** |  |
| `port` | `int` | **obligatoire** |  |
| `api_version` | `str` | **obligatoire** |  |
| `environment` | `str` | **obligatoire** |  |
| `agents` | `list[dict[str, str]]` | **obligatoire** |  |
| `start_time` | `float` | **obligatoire** |  |
| `created_at` | `str` | **obligatoire** |  |
| `updated_at` | `str` | **obligatoire** |  |

### `telemetry.TelemetryModel`

Classe de base pour créer des modèles Pydantic.

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `agentId` | `str` | **obligatoire** |  |
| `type` | `<enum 'TelemetryType'>` | **obligatoire** |  |
| `category` | `<enum 'TelemetryCategory'>` | **obligatoire** |  |
| `severity` | `<enum 'TelemetrySeverity'>` | **obligatoire** |  |
| `details` | `dict[str, Any]` | **obligatoire** |  |

### `workspace_authorization.WorkspaceAuthorizationClaims`

**Hérite de :** [`contracts.ContractModel`](#contractscontractmodel)

#### Champs du modèle {#model-fields-111}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `iss` | `str` | **obligatoire** |  |
| `aud` | `str` \| `list[str]` | **obligatoire** |  |
| `sub` | `str` | `None` |  |
| `grant_id` | `str` | **obligatoire** |  |
| `workspace_id` | `str` | **obligatoire** |  |
| `workspace_slug` | `str` | `None` |  |
| `agent_id` | `str` | **obligatoire** |  |
| `agent_slug` | `str` | **obligatoire** |  |
| `server_id` | `str` | **obligatoire** |  |
| `scopes` | `list[str]` | — |  |
| `agent_workspace_ref` | `str` | `None` |  |
| `iat` | `int` | `None` |  |
| `exp` | `int` | **obligatoire** |  |
| `jti` | `str` | `None` |  |


*Téléversé le 2026-10-30 09:09:43*