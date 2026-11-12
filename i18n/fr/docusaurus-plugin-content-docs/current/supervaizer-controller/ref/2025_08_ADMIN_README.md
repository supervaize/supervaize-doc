# Interface d'administration de Supervaizer {#supervaizer-admin-interface}

> **Créé le :** 2025-08-05
> **Mis à jour le :** 2026-10-11

Une interface web montée sur `/manage` pour inspecter les jobs et les cases, suivre l'état du serveur et des agents, et tester les agents grâce à un banc d'essai propre à chaque agent. Elle repose sur FastAPI, les templates Jinja, TinyDB, et HTMX/Alpine/Tailwind chargés depuis des CDN.

## Activation {#enabling}

```python
from supervaizer import Agent, Server

server = Server(agents=[my_agent], admin_interface=True)  # default: True
server.launch()
```

Au lancement, le serveur journalise `Deploy admin interface @ <public_url>/manage`. Le montage exige aussi une clé d'API, toujours présente : `SUPERVAIZER_API_KEY`, une clé générée automatiquement, ou `local-dev` en mode local.

## Modèle d'accès {#access-model}

Tout le routeur `/manage` (HTTP et WebSocket) est protégé par `require_tailscale`. Aucune clé d'API n'intervient.

- L'adresse IP du client doit appartenir à la plage CGNAT de Tailscale, `100.64.0.0/10`.
- En mode local (`supervaizer start --local`, qui définit `SUPERVAIZER_LOCAL_MODE=true`), les adresses de boucle locale (loopback) sont également autorisées.
- Derrière un reverse proxy, `X-Forwarded-For` n'est pris en compte que si le pair direct figure dans `TRUSTED_PROXIES` (CIDR séparés par des virgules). Sinon, l'adresse du pair est utilisée : un proxy non approuvé est donc refusé.
- Les requêtes refusées reçoivent une réponse HTTP 403 et sont journalisées au niveau `WARNING` avec l'IP, le chemin et le motif.

`SUPERVAIZER_API_KEY` protège `/api/*` et `/a2a`, pas `/manage`. `ADMIN_ALLOWED_IPS` et l'ancien préfixe `/admin` ont été supprimés dans la version 0.15.0. Consultez [2025_08_REST_API.md](2025_08_REST_API.md) pour le tableau complet des surfaces exposées.

## Pages {#pages}

| URL | Rôle |
| --- | --- |
| `/manage/` | Tableau de bord : nombre de jobs et de cases par statut, informations de stockage, activité récente (5 derniers jobs et cases) |
| `/manage/jobs` | Liste des jobs avec filtres (`status`, `agent_name`, `search`, `sort`, `limit`, `skip`), fenêtre de détails, mise à jour du statut, suppression |
| `/manage/cases` | Liste des cases avec filtres (`status`, `job_id`, `search`, `sort`), coût par case, lien vers le job parent |
| `/manage/server` | Identité du serveur, état d'enregistrement, URL publique |
| `/manage/agents` | Agents enregistrés et leurs méthodes |
| `/manage/agents/{slug}/workbench` | Banc d'essai pour les agents v1 : lancer un job, suivre les cases et les étapes, répondre aux demandes de validation humaine, exécuter, annuler ou planifier des étapes. Les mises à jour du job arrivent sur `/manage/agents/{slug}/workbench/jobs/{job_id}/ws` |
| `/manage/console` | Console de journaux en direct alimentée par `/manage/log-stream` (server-sent events) |

Les listes de jobs et de cases se rafraîchissent automatiquement toutes les 30 secondes. Les jobs sont créés depuis le banc d'essai ou l'API, pas depuis la liste des jobs.

Le banc d'essai exécute uniquement `job_start` v1. `POST /manage/agents/{slug}/workbench/start` renvoie HTTP 400 (`Agent has no methods defined: the workbench runs v1 jobs only`) pour un agent qui a un enregistrement v2 et aucune `methods`, et il ne crée pas de job. Pilotez cet agent via `POST /a2a`. Index des workflows : [product/feature-map.md](https://github.com/supervaize/supervaizer/blob/main/docs/product/feature-map.md).

## Endpoints sous `/manage/api` {#endpoints-under-manageapi}

JSON :

| Méthode | Chemin | Rôle |
| --- | --- | --- |
| GET | `/manage/api/stats` | Compteurs du tableau de bord |
| GET | `/manage/api/server/status` | État du serveur et de l'enregistrement |
| POST | `/manage/api/server/register` | Déclenche l'enregistrement auprès de Studio |
| GET | `/manage/api/agents`, `/manage/api/agents/{slug}` | Détails d'un agent |
| POST | `/manage/api/jobs/{job_id}/status`, `/manage/api/cases/{case_id}/status` | Corps `{"status": "<EntityStatus>"}` |
| DELETE | `/manage/api/jobs/{job_id}` | Supprime un job et ses cases |
| DELETE | `/manage/api/cases/{case_id}` | Supprime une case |
| POST | `/manage/api/console/execute` | Exécute une commande de la console |

Fragments HTML pour HTMX (pas du JSON) : `GET /manage/api/jobs`, `/manage/api/jobs/{job_id}`, `/manage/api/cases`, `/manage/api/cases/{case_id}`, `/manage/api/recent-activity`.

Les routes du banc d'essai se trouvent sous `/manage/agents/{slug}/workbench/...` (start, stop, status, answer, execute, cancel, schedule, jobs, console). `/manage/test-log`, `/manage/test-loguru` et `/manage/debug-queue` sont des outils d'aide au développement.

## Stockage {#storage}

Les jobs et les cases sont des objets `WorkflowEntity` stockés via `StorageManager` dans les tables TinyDB `Job` et `Case`. Le stockage est en mémoire, sauf si `SUPERVAIZER_PERSISTENCE=true` (ou `supervaizer start --persist`) : les données sont alors écrites sous `DATA_STORAGE_PATH` (par défaut `./data`). Consultez [2025_08_PERSISTENCE.md](2025_08_PERSISTENCE.md).

## Dépannage {#troubleshooting}

| Symptôme | Cause |
| --- | --- |
| 403 sur `/manage` depuis votre poste | L'IP du client n'est pas une adresse Tailscale et le mode local est désactivé |
| 403 derrière un proxy | Le proxy ne figure pas dans `TRUSTED_PROXIES` : l'IP transmise est donc ignorée |
| 404 sur `/manage` | `admin_interface=False` |
| Listes vides après un redémarrage | La persistance est désactivée ; définissez `SUPERVAIZER_PERSISTENCE=true` |
| Le démarrage du banc d'essai renvoie 400 pour un agent v2 | L'agent n'a pas de `methods` v1. Le banc d'essai ne peut pas le démarrer ; utilisez `POST /a2a` |

Vérification locale rapide : `supervaizer start --local`, puis ouvrez `http://127.0.0.1:8000/manage/`.


*Uploaded on 2026-11-06 15:07:19*
