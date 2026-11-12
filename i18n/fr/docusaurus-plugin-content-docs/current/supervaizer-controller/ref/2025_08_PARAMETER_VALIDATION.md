# Validation des paramètres (méthodes v1) {#parameter-validation-v1-methods}

> **Créé le :** 2025-08-12
> **Mis à jour le :** 2026-09-25

> **Hérité.** Ces endpoints valident à la demande les champs `AgentMethod` v1 et les valeurs `Parameter` des agents. Les agents Supervaizer v2 valident plutôt dans leur surface `job.start` et dans les gestionnaires d'actions (voir [2026_05_SUPERVAIZER_v2.md](2026_05_SUPERVAIZER_v2.md)).

## Deux types de paramètres {#two-parameter-kinds}

| Type | Classe | Types de valeurs | Endpoint |
| --- | --- | --- | --- |
| Paramètres d'agent (secrets, clés d'API, URL) | `Parameter` via `ParametersSetup` | toujours des chaînes | `validate-agent-parameters` |
| Champs du job (entrées de la méthode) | `AgentMethod.fields` | `str`, `int`, `bool`, `list`, `dict`, `float` | `validate-method-fields` |

## Endpoints {#endpoints}

Les deux sont des `POST /api/supervaizer/agents/{agent_slug}/...`, exigent `X-API-Key` avec le droit d'écriture, et n'existent que si le serveur a un `supervisor_account` ou fonctionne en mode local. Ils renvoient toujours HTTP 200 ; c'est l'indicateur `valid` qui porte le résultat. Le démarrage d'un job (`POST .../jobs`) ne valide **pas** : appelez donc d'abord ces endpoints si vous voulez un retour anticipé.

### `validate-agent-parameters` {#validate-agent-parameters}

Requête :

```json
{ "encrypted_agent_parameters": "<encrypted string>" }
```

La charge utile déchiffrée canonique est la liste que Studio envoie et que le démarrage d'un job (`POST .../jobs`) consomme : `[{ "name": "PARAM_NAME", "value": "..." }, ...]`. Les clés supplémentaires de chaque élément (`description`, `is_secret`, ...) sont ignorées. Envoyez la même chaîne chiffrée aux deux endpoints. Un paramètre obligatoire dont la valeur est `null` est considéré comme manquant. La forme objet `{ "PARAM_NAME": "value" }` reste acceptée ici, mais le démarrage d'un job la rejette.

Réponse :

```json
{
  "valid": false,
  "message": "Agent parameter validation failed",
  "errors": [
    "Required parameter 'API_KEY' is missing",
    "Parameter 'MAX_RETRIES' must be a string, got int"
  ],
  "invalid_parameters": {
    "API_KEY": "Required parameter 'API_KEY' is missing",
    "MAX_RETRIES": "Parameter 'MAX_RETRIES' must be a string, got int"
  }
}
```

Autres issues : un agent sans `parameters_setup` renvoie `valid: true` (« Agent has no parameter setup defined ») ; un échec de déchiffrement renvoie `valid: false` ; un élément de liste sans `name` de type chaîne ou sans `value`, ou une charge utile qui n'est ni une liste ni un objet, renvoie `valid: false` ; l'absence de `encrypted_agent_parameters` valide un objet vide.

### `validate-method-fields` {#validate-method-fields}

Requête (`method_name` vaut `job_start` par défaut) :

```json
{
  "method_name": "job_start",
  "job_fields": { "company_name": "Google", "max_results": 10, "subscribe_updates": true }
}
```

Réponse :

```json
{
  "valid": false,
  "message": "Method field validation failed",
  "errors": [
    "Required field 'company_name' is missing",
    "Field 'max_results' must be an integer, got str"
  ],
  "invalid_fields": {
    "company_name": "Required field 'company_name' is missing",
    "max_results": "Field 'max_results' must be an integer, got str"
  }
}
```

Les contrôles de type couvrent les types Python simples listés plus haut. Les champs déclarés avec une étiquette de type sous forme de chaîne (`"str"`) ou un type générique (`list[str]`) ne sont pas contrôlés, et `True` passe un contrôle `int`. Les noms de champs inconnus et les noms de méthodes inconnus (« Method 'X' not found », « Agent has no methods defined ») sont signalés comme des erreurs.

## Utilisation par programmation {#programmatic-use}

```python
agent.parameters_setup.validate_parameters({"API_KEY": "..."})
method.validate_method_fields({"company_name": "Google"})
```

Les deux renvoient la même structure `valid` / `errors` / `invalid_*` que les endpoints.


*Uploaded on 2026-11-06 15:07:19*
