# Surfaces d'API et authentification {#api-surfaces-and-authentication}

> **Créé le :** 2025-08-06
> **Mis à jour le :** 2026-10-11

Supervaizer expose la documentation générée par FastAPI, plus quatre surfaces de routes avec des règles d'accès différentes.

## Surfaces de routes {#route-surfaces}

| Surface | Règle d'accès |
| --- | --- |
| `/`, `/.well-known/*`, `/docs`, `/redoc`, `/openapi.json` | Public, sans authentification |
| `/api/*` (par exemple `/api/supervaizer/...`, `/api/agents/{slug}/...`) | En-tête `X-API-Key` obligatoire ; 401 s'il est absent ou incorrect. Monté uniquement quand les identifiants Studio sont configurés ou que le mode local est actif |
| `POST /a2a`, `GET /a2a/events` | `X-API-Key` avec le droit `write` pour `/a2a`, le droit `read` pour `/a2a/events` ; 403 quand le droit est insuffisant |
| `/manage/*` (interface d'administration et banc d'essai) | Uniquement depuis une IP cliente Tailscale, sans clé d'API. Consultez [2025_08_ADMIN_README.md](2025_08_ADMIN_README.md) |

Index des workflows : [product/feature-map.md](https://github.com/supervaize/supervaizer/blob/main/docs/product/feature-map.md).

## Ressources de données {#data-resources}

Les callbacks `DataResource` sont montés sur `/api/agents/{slug}/data/{name}/` (liste, détail, création, mise à jour, suppression et `import/`). Ils reposent sur le routeur `/api` : ils exigent donc `X-API-Key`, et les écritures exigent aussi le droit d'écriture. Ils ne sont pas sous `/api/supervaizer`. Un jeton d'autorisation d'espace de travail est requis à chaque appel, y compris en mode local. Une route n'est enregistrée que si son callback est défini. Consultez [product/feature-map.md](https://github.com/supervaize/supervaizer/blob/main/docs/product/feature-map.md).

## Clé d'API {#api-key}

- `SUPERVAIZER_API_KEY` enregistre à l'import une clé de droit `write`. `write` inclut `read`.
- Hors mode local, si la variable n'est pas définie, une clé est générée au démarrage et seule son empreinte est journalisée. Définissez explicitement `SUPERVAIZER_API_KEY` si vous devez appeler vous-même `/api` ou `/a2a`.
- Le mode local (`supervaizer start --local`) utilise la clé `local-dev`.
- Les requêtes refusées sont journalisées au niveau `WARNING` avec l'IP, le chemin, le motif et un aperçu tronqué de la clé, jamais la clé brute.

## Documentation interactive {#interactive-documentation}

| Interface | URL | Notes |
| --- | --- | --- |
| Swagger UI | `http://localhost:8000/docs` | Testez des requêtes dans le navigateur |
| ReDoc | `http://localhost:8000/redoc` | Référence en lecture seule |
| Schéma OpenAPI | `http://localhost:8000/openapi.json` | OpenAPI 3.1, lisible par une machine |

Le schéma ne déclare aucun schéma de sécurité : Swagger n'affiche donc pas de bouton **Authorize**. Pour appeler une route protégée depuis Swagger, ouvrez l'opération, cliquez sur **Try it out** et renseignez le champ d'en-tête `X-API-Key`.

## Spécification OpenAPI versionnée {#committed-openapi-spec}

`docs/api/openapi.json` est généré par `just generate-docs` à partir de `src/supervaizer/examples/controller_template`. Les routes propres à un agent qui y figurent appartiennent à cet exemple ; la spécification de votre contrôleur se trouve sur `/openapi.json` du serveur en cours d'exécution.


*Uploaded on 2026-11-06 15:07:19*
