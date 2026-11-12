# Référence du modèle : noyau {#model-reference-core}

**Version :** 1.9.0

### `account.Account`

**Hérite de :** [`account.AccountAbstract`](#accountaccountabstract)

_Aucun champ supplémentaire par rapport à la classe parente._

### `account.AccountAbstract`

**Hérite de :** [`common.SvBaseModel`](model_extra.md#commonsvbasemodel)

Modèle de compte pour l'API de contrôle Supervaize.

Il représente un compte qui permet de s'authentifier et de communiquer
avec l'API SaaS Supervaize. Les paramètres du compte sont fournis par Supervaize.com.
Créez un compte sur [https://supervaize.com/](https://supervaize.com/)

L'identifiant du compte est généré par Supervaize.com. La clé d'API du compte est fournie
par Supervaize.com et sert à authentifier les requêtes vers l'API de contrôle Supervaize.
L'URL de l'API est fournie par Supervaize.com ; c'est l'URL de l'API SaaS Supervaize.

Le compte fournit des méthodes pour enregistrer des serveurs et des agents, envoyer des événements
et communiquer avec la plateforme Supervaize.



Attributs :
    workspace_id (str): L'identifiant de l'espace de travail fourni par Supervaize.com
    api_key (str): La clé d'API fournie par Supervaize.com pour l'authentification
    api_url (str): L'URL de l'API SaaS Supervaize fournie par Supervaize.com

#### Champs du modèle {#model-fields}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `workspace_id` | `str` | **required** | L'identifiant de l'espace de travail fourni par Supervaize.com |
| `api_key` | `str` | **required** | La clé d'API fournie par Supervaize.com pour l'authentification |
| `api_url` | `str` | **required** | L'URL de l'API SaaS Supervaize fournie par Supervaize.com |

#### Exemple {#example}

```json

{
  "workspace_id": "ws_1234567890abcdef",
  "api_key": "sk_1234567890abcdef",
  "api_url": "https://app.supervaize.com"
}

```

### `agent.Agent`

**Hérite de :** [`agent.AgentAbstract`](#agentagentabstract)

_Aucun champ supplémentaire par rapport à la classe parente._

### `agent.AgentAbstract`

**Hérite de :** [`common.SvBaseModel`](model_extra.md#commonsvbasemodel)

        Modèle d'agent pour l'API de contrôle Supervaize.

        Il représente un agent que vous pouvez enregistrer auprès de l'API de contrôle Supervaize.
        Il contient des métadonnées sur l'agent (nom, version, description, etc.), ainsi que
        les méthodes qu'il prend en charge et les configurations de paramètres éventuelles.

        L'identifiant de l'agent est généré automatiquement à partir du nom et doit correspondre.

        Exemple :
        ```python
        Agent(
    name="Email AI Agent",
    author="@parthshr370",  # Author of the agent
    developer="@alain_sv",  # Developer of the controller
    maintainer="@aintainer",
    editor="AI Editor",
    version="1.0.0",
    description="AI-powered email processing agent that can fetch, analyze, generate responses, and send/draft emails",
    tags=["email", "ai", "automation", "communication"],
    methods=AgentMethods(
        job_start=process_email_method, # Job start method
        job_stop=job_stop, # Job stop method
        job_status=job_status, # Job status method
        chat=None,
        custom=None,
    ),
    parameters_setup=ParametersSetup.from_list([
        Parameter(
            name="IMAP_USERNAME",
            description="IMAP username for email access",
            is_environment=True,
            is_secret=False,
        ),
        Parameter(
            name="IMAP_PASSWORD",
            description="IMAP password for email access",
            is_environment=True,
            is_secret=True,
        ),
    ]),
)
        ```

#### Champs du modèle {#model-fields-1}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **required** | Nom d'affichage de l'agent |
| `id` | `str` | **required** | Identifiant stable dérivé du nom via shortuuid.uuid(name=...). Renommer l'agent change cette valeur. |
| `author` | `str` | `None` | Auteur de l'agent |
| `developer` | `str` | `None` | Développeur de l'intégration du contrôleur |
| `maintainer` | `str` | `None` | Mainteneur de l'intégration |
| `editor` | `str` | `None` | Éditeur (en général une entreprise) |
| `version` | `str` | '' | Chaîne de version |
| `release_notes_url` | `str` | `None` | URL des notes de version correspondant à cette version de l'agent |
| `description` | `str` | '' | Description de ce que fait l'agent |
| `introduction` | `V2AgentIntroduction` | `None` | Bloc de présentation facultatif pour la liste des agents (accroche, résumé, exemples d'objectifs, avatar) |
| `full_description` | `V2AgentFullDescription` | `None` | Contenu long facultatif en markdown ou en HTML pour la page de détail de l'agent. Le SDK se limite à le typer et à en borner la taille ; Studio le nettoie. |
| `billing_catalog` | `list[supervaizer.contracts.BillingCatalogItem]` | `None` | SKU facturables facultatifs (sku, unit, description) dont l'agent déclare la consommation. Aucun prix : Studio les tarifie par espace de travail. |
| `tags` | `list[str]` | `None` | Étiquettes pour classer l'agent |
| `methods` | `AgentMethods` | `None` | Méthodes prises en charge par cet agent |
| `parameters_setup` | `ParametersSetup` | `None` | Configuration des paramètres |
| `server_agent_id` | `str` | `None` | Identifiant attribué par le serveur - Ne le définissez pas manuellement |
| `server_agent_status` | `str` | `None` | Statut actuel sur le serveur - Ne le définissez pas manuellement |
| `server_agent_onboarding_status` | `str` | `None` | Statut d'intégration - Ne le définissez pas manuellement |
| `max_execution_time` | `int` | 3600 | Durée d'exécution maximale en secondes, 1 heure par défaut |
| `supervaize_instructions_template_path` | `str` | `None` | Chemin facultatif vers un fichier modèle personnalisé pour la page supervaize_instructions.html |
| `instructions_path` | `str` | 'supervaize_instructions.html' | Chemin où la page d'instructions Supervaize est servie (relatif au chemin de l'agent) |
| `custom_routes` | `Any` | `None` | FastAPI APIRouter facultatif ; monté sur l'application API à `/api/agents/{slug}/...` |
| `data_resources` | `list[data_resource.DataResource]` | — | Ressources de données que cet agent expose pour l'accès CRUD de Studio |
| `supervaizer_v2_registration` | `SupervaizerV2AgentRegistrationContract` | `None` | Contrat d'enregistrement Supervaizer v2 facultatif pour les intégrations Studio A2A/A2UI |
| `v2_methods` | `V2AgentMethods` | `None` | Déclarations facultatives des méthodes Supervaizer v2 au niveau de l'agent |

### `agent.AgentMethod`

**Hérite de :** [`agent.AgentMethodAbstract`](#agentagentmethodabstract)

_Aucun champ supplémentaire par rapport à la classe parente._

### `agent.AgentMethodAbstract`

Représente une méthode que vous pouvez appeler sur un agent.

Attributs :
    name: Nom d'affichage de la méthode
    method: Nom de la méthode réelle dans le code du projet, appelée avec les paramètres fournis
    params: voir ci-dessous
    fields: voir ci-dessous
    description: Description facultative de ce que fait la méthode


1. params : format dictionnaire
   Un simple dictionnaire clé-valeur de paramètres transmis à
   AgentMethod.method sous forme de kwargs.
   Exemple :

```json
{
  "verbose": true,
  "timeout": 60,
  "max_retries": 3
}
```


2. fields : format champs de formulaire
   Ce sont les valeurs demandées à l'utilisateur dans l'interface Supervaize
   et également transmises sous forme de kwargs à AgentMethod.method.
   Une liste de spécifications de champs pour générer des formulaires et l'interface, selon la
   définition de django.forms.fields
   voir : https://docs.djangoproject.com/en/5.1/ref/forms/fields/
   Chaque champ est un dictionnaire avec des propriétés comme :
   - name: identifiant du champ
   - type: type Python du champ pour la validation pydantic - remarque : ChoiceField et MultipleChoiceField sont de type list[str]
   - field_type: type de champ (l'un de : CharField, IntegerField, BooleanField, ChoiceField, MultipleChoiceField)
   - choices: pour les champs à choix, liste de paires [valeur, libellé]
   - default: (facultatif) valeur par défaut du champ
   - widget: widget d'interface à utiliser (par exemple RadioSelect, TextInput)
   - required: indique si le champ est obligatoire

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **required** | Nom de la méthode |
| `method` | `str` | **required** | Nom de la méthode dans le code du projet, appelée avec les paramètres fournis |
| `params` | `dict[str, typing.Any]` | `None` | Un simple dictionnaire clé-valeur de paramètres transmis à AgentMethod.method sous forme de kwargs |
| `fields` | `list[supervaizer.agent.AgentMethodField]` | `None` | Une liste de spécifications de champs pour générer des formulaires et l'interface, selon la définition de django.forms.fields |
| `description` | `str` | `None` | Description facultative de ce que fait la méthode |
| `is_async` | `bool` | False | Indique si la méthode est asynchrone |
| `timeout` | `int` | 600 | Durée maximale automatique d'un job en secondes. Utilisez None pour les jobs qui doivent s'exécuter jusqu'à ce que Studio les arrête manuellement. |
| `nodes` | `CaseNodes` | `None` | Définition des nœuds de case (= étapes) pour cette méthode |

#### Exemple {#example-1}

```json

{
  "name": "start",
  "method": "example_agent.example_synchronous_job_start",
  "params": {
    "action": "start"
  },
  "fields": [
    {
      "name": "Company to research",
      "type": "str",
      "field_type": "CharField",
      "max_length": 100,
      "required": true
    }
  ],
  "description": "Start the collection of new competitor summary"
}

```

### `agent.AgentMethodField`

Représente la spécification d'un champ pour générer des formulaires et l'interface dans la plateforme Supervaize.

Les champs servent à définir les paramètres de saisie collectés via
l'interface et transmis sous forme de kwargs à AgentMethod.method. Ils suivent les définitions
de champs des formulaires Django par souci de cohérence.


- [Widgets Django](https://docs.djangoproject.com/en/5.2/ref/forms/widgets/)


** field_type  - types de champs disponibles ** [Classes de champs Django](https://docs.djangoproject.com/en/5.2/ref/forms/fields/#built-in-field-classes)

    - `CharField` - Saisie de texte
    - `IntegerField` - Saisie de nombre
    - `BooleanField` - Case à cocher
    - `ChoiceField` - Liste déroulante avec options
    - `MultipleChoiceField` - Sélection multiple
    - `JSONField` - Saisie de données JSON

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **required** | Nom du champ - affiché dans l'interface |
| `type` | `Any` | **required** | Type Python du champ pour la validation pydantic - remarque : ChoiceField et MultipleChoiceField sont de type list[str] |
| `field_type` | `FieldTypeEnum` \| `str` | `CharField` | Type de champ pour la persistance |
| `description` | `str` | `None` | Description du champ - affichée dans l'interface |
| `choices` | `list[tuple[str, str]]` \| `list[str]` | `None` | Pour les champs à choix, liste de paires [valeur, libellé] |
| `default` | `Any` | `None` | Valeur par défaut du champ - affichée dans l'interface |
| `widget` | `str` | `None` | Widget d'interface à utiliser (par exemple RadioSelect, TextInput) - sous forme de nom de widget Django |
| `required` | `bool` | False | Indique si le champ est obligatoire pour envoyer le formulaire |

#### Exemples {#examples}

**Exemple 1 :**

```json

{
  "name": "color",
  "type": "list[str]",
  "field_type": "MultipleChoiceField",
  "choices": [
    [
      "B",
      "Blue"
    ],
    [
      "R",
      "Red"
    ],
    [
      "G",
      "Green"
    ]
  ],
  "widget": "RadioSelect",
  "required": true
}

```

**Exemple 2 :**

```json

{
  "name": "age",
  "type": "int",
  "field_type": "IntegerField",
  "widget": "NumberInput",
  "required": false
}

```

### `parameter.ParametersSetup`

**Hérite de :** [`common.SvBaseModel`](model_extra.md#commonsvbasemodel)

Modèle ParametersSetup pour l'API de contrôle Supervaize.

Il représente un ensemble de paramètres qu'un agent peut utiliser.
Il contient un dictionnaire de paramètres, où la clé est le nom du paramètre
et la valeur est l'objet paramètre.

Exemple :
```python
ParametersSetup.from_list([
    Parameter(name="parameter1", value="value1"),
    Parameter(name="parameter2", value="value2", description="desc2"),
])
```

#### Champs du modèle {#model-fields-2}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `definitions` | `dict[str, parameter.Parameter]` | **required** | Un dictionnaire de paramètres, où la clé est le nom du paramètre et la valeur est l'objet paramètre. |

### `parameter.Parameter`

**Hérite de :** [`parameter.ParameterAbstract`](#parameterparameterabstract)

_Aucun champ supplémentaire par rapport à la classe parente._

### `parameter.ParameterAbstract`

**Hérite de :** [`common.SvBaseModel`](model_extra.md#commonsvbasemodel)

Modèle de base des paramètres d'agent, qui définit la configuration et les métadonnées.

Les paramètres peuvent être des variables d'environnement, des secrets ou de simples valeurs
de configuration utilisées par les agents pendant l'exécution. La plateforme Supervaize utilise ce
modèle pour gérer les définitions et les valeurs des paramètres.

#### Champs du modèle {#model-fields-3}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `name` | `str` | **required** | Nom du paramètre, tel qu'il est utilisé dans le code de l'agent |
| `description` | `str` | `None` | Description du paramètre, utilisée dans l'interface Supervaize |
| `is_environment` | `bool` | False | Indique si le paramètre est défini comme variable d'environnement |
| `value` | `str` | `None` | Valeur du paramètre - fournie par la plateforme Supervaize |
| `is_secret` | `bool` | False | Indique si le paramètre est un secret - masqué à l'utilisateur dans l'interface Supervaize |
| `is_required` | `bool` | False | Indique si le paramètre est obligatoire, utilisé dans l'interface Supervaize |

#### Exemple {#example-2}

```json

{
  "name": "OPEN_API_KEY",
  "description": "OpenAPI Key",
  "is_environment": true,
  "is_secret": true,
  "is_required": true
}

```

### `server.Server`

**Hérite de :** [`server.ServerAbstract`](#serverserverabstract)

_Aucun champ supplémentaire par rapport à la classe parente._

### `server.ServerAbstract`

**Hérite de :** [`common.SvBaseModel`](model_extra.md#commonsvbasemodel)

Serveur d'API du contrôleur Supervaize.

Le serveur est une application FastAPI (voir https://fastapi.tiangolo.com/ pour le détail et les paramètres avancés)

Il représente l'instance de serveur principale, qui gère les agents et fournit
les points de terminaison de l'API de contrôle Supervaize. Il gère l'enregistrement des agents,
l'exécution des jobs et la communication avec la plateforme Supervaize.

Vous pouvez configurer le serveur avec différents points de terminaison (A2A, ACP, interface d'administration)
et il prend en charge le chiffrement et le déchiffrement des paramètres avec des clés RSA.

Notez que lorsque le compte superviseur est défini, le protocole A2A est activé automatiquement pour fournir les points de terminaison de HEALTH CHECK.

public_url: URL complète (schéma et port compris) à utiliser pour les connexions sortantes et l'enregistrement.
            C'est particulièrement important dans les environnements Docker, où l'adresse
            de liaison (0.0.0.0) ne peut pas servir aux connexions sortantes. Définissez
            'host.docker.internal' pour Docker, ou le nom de service approprié
            dans les environnements de conteneurs.
            Exemples :
            - Dans Docker, définissez 'http://host.docker.internal' pour joindre la machine hôte
            - Dans Kubernetes, utilisez plutôt le nom du service ou le DNS externe
            Si elle n'est pas fournie, l'hôte d'écoute est utilisé.

#### Champs du modèle {#model-fields-4}

| Champ | Type | Valeur par défaut | Description |
|---|---|---|---|
| `server_id` | `str` | — | Identifiant unique du serveur (variable d'environnement SUPERVAIZER_SERVER_ID ou uuid persistant) |
| `scheme` | `str` | **required** | Schéma d'URL (http ou https) |
| `host` | `str` | **required** | Hôte sur lequel lier le serveur (par exemple 0.0.0.0 pour toutes les interfaces) |
| `port` | `int` | **required** | Port sur lequel lier le serveur |
| `environment` | `str` | **required** | Nom de l'environnement (par exemple dev, staging, prod) |
| `mac_addr` | `str` | **required** | Adresse MAC utilisée pour identifier le serveur |
| `debug` | `bool` | **required** | Indique s'il faut activer le mode débogage |
| `agents` | `list[agent.Agent]` | **required** | Liste des agents à enregistrer auprès du serveur |
| `app` | `FastAPI` | **required** | Instance de l'application FastAPI |
| `reload` | `bool` | **required** | Indique s'il faut activer le rechargement automatique |
| `supervisor_account` | `Account` | `None` | Compte du superviseur - peut être créé sur supervaize.com |
| `a2a_endpoints` | `bool` | True | Indique s'il faut activer les points de terminaison A2A |
| `private_key` | `RSAPrivateKey` | **required** | Clé privée RSA pour le chiffrement des paramètres secrets - Utilisée dans la communication serveur-agent - Inutile pour l'utilisateur |
| `public_key` | `RSAPublicKey` | **required** | Clé publique RSA pour le chiffrement des paramètres secrets - Utilisée dans la communication agent-serveur - Inutile pour l'utilisateur |
| `public_url` | `str` | `None` | URL publique, schéma et port compris, à utiliser pour les connexions entrantes |
| `api_key` | `str` | `None` | Impose la clé d'API d'accès aux points de terminaison supervaizer - si elle n'est pas fournie, une clé aléatoire est générée |
| `workspace_authorization` | `V2WorkspaceAuthorizationSettings` | — | Paramètres facultatifs du vérificateur d'autorisation d'espace de travail signée par Studio |

#### Exemples {#examples-1}

**Exemple 1 :**

```json

{
  "agents": "[agent]",
  "a2a_enabled": true,
  "supervisor_account": null
}

```

**Exemple 2 :**

```json

{
  "scheme": "http",
  "host": "0.0.0.0",
  "port": 8000,
  "environment": "dev",
  "mac_addr": "00-11-22-33-44-55",
  "debug": false,
  "reload": false,
  "a2a_endpoints": true
}

```


*Mis en ligne le 2026-10-30 09:09:43*
