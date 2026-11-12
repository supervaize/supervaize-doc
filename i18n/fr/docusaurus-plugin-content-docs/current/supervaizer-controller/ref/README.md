# Supervaizer {#supervaizer}

> **Créé le :** 2024-12-28
> **Mis à jour le :** 2026-10-11

Supervaizer est le SDK Python de contrôleur qui expose des agents IA à Supervaize Studio grâce au contrat d'opérations Supervaizer v2.

Supervaizer v2 s'appuie sur :

- [A2A](https://a2a-protocol.org/) pour la découverte, les Agent Cards, les appels JSON-RPC au contrôleur et les événements SSE
- [A2UI](https://a2ui.org/) pour les documents de surface d'interface rédigés par l'agent et affichés par Studio
- La sémantique Supervaizer v2 pour les Jobs, Cases, Steps, Resources, Datasets, Surfaces, Actions, Artifacts et la convergence `job.sync`

Supervaizer ne contient aucune logique métier d'agent. Les agents déclarent leurs ressources, surfaces, actions et artefacts ; Studio consomme cette déclaration comme une interface d'opérations générique.

> **Bêta :** Supervaizer v2 est en cours de développement actif. Les versions du protocole sont figées dans le contrat d'enregistrement, et les versions incompatibles doivent échouer explicitement.

## Pour commencer {#start-here}

- [Carte des fonctionnalités du produit](https://github.com/supervaize/supervaizer/blob/main/docs/product/feature-map.md) — workflows, routes et le test pytest qui couvre chacun
- [Concepts de Supervaizer v2](2026_05_SUPERVAIZER_v2.md)
- [Protocoles : A2A, A2UI, AG-UI et Supervaizer v2](2026_05_PROTOCOLS.md)
- [Référence de la CLI](2025_08_CLI.md)
- [Surfaces d'API et authentification](2025_08_REST_API.md)
- [Interface d'administration et banc d'essai](2025_08_ADMIN_README.md)
- [Dépôt de l'exemple Hello World](https://github.com/supervaize/supervaize_hello_world)
- [Agent Hello World local intégré](https://github.com/supervaize/supervaizer/blob/main/src/supervaizer/examples/hello_world_agent.py)
- [Skill d'intégration Supervaizer](https://github.com/supervaize/supervaizer/tree/main/skills/supervaizer-integration) — permet à un agent de code (Claude Code, Cursor, Codex) d'intégrer pas à pas un agent Python existant
- Guides Studio : [Job Configurator (écran Configure)](https://docs.runwaize.com/docs/supervaizer-controller/job-configurator), [Analytique des jobs et des missions](https://docs.runwaize.com/docs/supervaizer-controller/job-analytics)

## Démarrage rapide {#quick-start}

### 1. Installer {#1-install}

```bash
pip install supervaizer
```

Pour le développement local depuis ce dépôt :

```bash
just install-dev   # uv sync --extra dev
```

### 2. Exécuter l'agent Hello World v2 intégré {#2-run-the-built-in-v2-hello-world-agent}

Le moyen le plus rapide de voir le contrôleur v2 est le mode local :

```bash
supervaizer start --local
```

Le mode local exécute les agents de votre `supervaizer_control.py` ainsi que l'agent Hello World intégré (désactivez-le avec `SUPERVAIZER_DISABLE_HELLO_WORLD=true`) ; sans fichier de contrôle, il démarre Hello World seul. Hello World déclare :

- une Agent Card v2
- les surfaces A2UI `job.start` et `case.step.awaiting`
- les actions `job.start`, `job.start.preview`, `job.sync` et `step.awaiting.submit`
- une action de ressource générée, `resource.hello_messages.list`
- une étape minimale de validation humaine quand la revue humaine est activée

Le mode local se lie à `127.0.0.1`, ignore l'enregistrement dans Studio et utilise la clé d'API `local-dev`. Il contourne aussi l'autorisation d'espace de travail de Studio pour les actions et surfaces `/a2a`, de sorte que `X-API-Key` seule suffit :

```bash
curl -s http://127.0.0.1:8000/a2a \
  -H "X-API-Key: local-dev" -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "supervaizer/action.invoke",
       "params": {"request_id": "r1", "actor": {"user_id": "me"},
                  "workspace": {"id": "local"}, "mission_id": "m1",
                  "agent_slug": "hello-world-ai-agent", "surface": "job.start",
                  "action": "job.start", "input": {"count": 1}, "job_id": "job-1"}}'
```

Les gestionnaires reçoivent un `workspace_authorization` non vérifié dont le `grant_id` est `local-mode`, et le serveur journalise un avertissement au démarrage. Le contournement ne s'applique que tant que le serveur n'a pas de compte Studio, que l'autorisation d'espace de travail n'est pas activée, et que l'émetteur, l'audience, la clé publique et l'URL JWKS sont tous vides. `SUPERVAIZER_WORKSPACE_AUTH_LEEWAY_SECONDS` ne compte pas, et `SUPERVAIZER_WORKSPACE_AUTH_REQUIRED=false` laisse le contournement actif. Sinon, chaque appel exige un vrai jeton Studio. Le code JSON-RPC `-32030` porte alors `error.data.code` avec la valeur `workspace_authorization_missing` quand le vérificateur est activé et que l'en-tête est absent, ou `workspace_authorization_not_configured` quand aucun vérificateur n'est activé. N'exposez jamais un port en mode local : quiconque l'atteint peut exécuter vos agents avec la clé connue de tous. `--host 0.0.0.0`, `--host ::` et un hôte vide se lient à `127.0.0.1` ; tout autre `--host` est conservé.

Ouvrez ces endpoints :

| URL | Rôle | Accès |
| --- | --- | --- |
| `http://127.0.0.1:8000/docs` | Documentation Swagger de FastAPI | public |
| `http://127.0.0.1:8000/.well-known/agents.json` | Découverte A2A | public |
| `http://127.0.0.1:8000/.well-known/health` | Santé du contrôleur | public |
| `POST http://127.0.0.1:8000/a2a` | Endpoint JSON-RPC A2A du contrôleur | `X-API-Key` (droit d'écriture) ; jeton d'espace de travail hors mode local |
| `GET http://127.0.0.1:8000/a2a/events` | Flux SSE des effets v2 | `X-API-Key` (droit de lecture) |
| `http://127.0.0.1:8000/manage` | Interface d'administration et banc d'essai des agents | IP Tailscale, ou boucle locale en mode local |

### 3. Examiner l'exemple Hello World {#3-inspect-the-hello-world-example}

L'agent intégré est l'implémentation de référence v2 :

- Implémentation intégrée locale : [src/supervaizer/examples/hello_world_agent.py](https://github.com/supervaize/supervaizer/blob/main/src/supervaizer/examples/hello_world_agent.py)
- Enregistrement du serveur local : [src/supervaizer/examples/local_server.py](https://github.com/supervaize/supervaizer/blob/main/src/supervaizer/examples/local_server.py)
- Dépôt public : [supervaize/supervaize_hello_world](https://github.com/supervaize/supervaize_hello_world). Il montre la structure d'un projet autonome mais utilise encore le style `AgentMethodField` v1 ; prenez plutôt l'agent v2 intégré comme modèle pour les nouveaux agents.

Exécutez l'exemple autonome :

```bash
git clone https://github.com/supervaize/supervaize_hello_world.git
cd supervaize_hello_world
uv venv
source .venv/bin/activate
uv pip install -e .
supervaizer start
```

### 4. Ajouter un contrôleur v2 à votre agent {#4-add-a-v2-controller-to-your-agent}

Lancez `supervaizer scaffold` pour créer `supervaizer_control.py`, ou écrivez le fichier vous-même. C'est un agent v2 complet : un enregistrement, une surface et une action. Le fichier généré construit aussi un `Account` Studio à partir de l'environnement ; le mode local l'ignore.

```python
from typing import Any

from supervaizer import (
    Agent,
    Server,
    V2ActionRequest,
    V2SurfaceRequest,
    build_v2_agent_registration,
)

agent = Agent(
    name="My Agent",
    version="0.1.0",
    description="My Supervaizer v2 agent.",
    supervaizer_v2_registration=build_v2_agent_registration(
        agent_slug="my-agent",  # doit être égal à Agent.slug, le nom transformé en slug
        display_name="My Agent",
        a2ui_catalog_version="my-agent-ui.1",  # à incrémenter quand vos surfaces changent
        surfaces=["job.start"],
        actions=["job.start"],
    ),
)

server = Server(agents=[agent])


@server.v2_surface("job.start", agent_slug=agent.slug)
def job_start_form(request: V2SurfaceRequest) -> dict[str, Any]:
    return {
        "surface": request.surface,
        "document": {
            "type": "Form",
            "title": "Start job",
            "fields": [
                {"id": "goal", "label": "Goal", "type": "string", "required": True}
            ],
            "submit": {"action": "job.start", "label": "Start"},
        },
    }


@server.v2_action("job.start", agent_slug=agent.slug)
def start_job(request: V2ActionRequest) -> dict[str, Any]:
    job_id = request.job_id or "local-job"
    return {
        "status": "ok",
        "effects": [{"type": "job.started", "job_id": job_id, "status": "completed"}],
        "job_state": {
            "job": {
                "id": job_id,
                "mission_id": request.mission_id,
                "agent_slug": request.agent_slug,
                "status": "completed",
                "source": {"type": "fresh_start"},
            },
            "cases": [
                {
                    "id": "case-1",
                    "title": request.input["goal"],
                    "status": "completed",
                    "steps": [
                        {"id": "step-1", "activity": "operation", "status": "completed"}
                    ],
                }
            ],
        },
    }
```

Démarrez-le en mode local. La CLI charge `supervaizer_control.py`, trouve le `Server` et le lance :

```bash
supervaizer start --local
```

Chargez la surface :

```bash
curl -s http://127.0.0.1:8000/a2a \
  -H "X-API-Key: local-dev" -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "supervaizer/surface.load",
       "params": {"request_id": "r1", "actor": {"user_id": "me"},
                  "workspace": {"id": "local"}, "mission_id": "m1",
                  "agent_slug": "my-agent", "surface": "job.start"}}'
```

| Élément | Rôle |
| --- | --- |
| `build_v2_agent_registration` | Déclare les `surfaces` que Studio peut afficher et les `actions` que Studio peut appeler. |
| `@server.v2_surface` | Renvoie le document A2UI d'une surface déclarée. |
| `@server.v2_action` | Exécute une action déclarée. Renvoie des `effects` et un instantané `job_state` facultatif. |

Règles qui évitent les premières erreurs habituelles :

- `agent_slug` dans l'enregistrement doit être égal à `Agent.slug` (le `name` transformé en slug). Une différence fait échouer la création de l'`Agent`.
- Enregistrez un gestionnaire pour chaque action déclarée et chaque surface que vous servez. Un gestionnaire d'action manquant répond par l'erreur JSON-RPC `-32010` ; un gestionnaire de surface manquant répond `-32011`.
- Passez `agent_slug` à chaque décorateur de gestionnaire. Le mode local ajoute l'agent Hello World intégré : le serveur contient donc deux agents et ne peut pas déduire le slug.
- Un identifiant d'action seul vaut par défaut `mutating=True, scope="job"`. Déclarez une action en lecture seule avec `V2ActionDefinition(id=..., mutating=False, scope=...)`.

Ajoutez ces éléments quand vous en avez besoin :

- Convergence des statuts : déclarez `job_policy={"sync": {"action": "job.sync"}}` et enregistrez un gestionnaire `job.sync`.
- Revue humaine : renvoyez une étape avec `status="awaiting"` et un objet `awaiting`. Déclarez la surface `case.step.awaiting` et l'action `step.awaiting.submit`.
- Objets métier : déclarez `resources=[...]`. Le SDK dérive les actions `resource.<id>.<operation>` ; vous enregistrez leurs gestionnaires.

L'[agent Hello World](https://github.com/supervaize/supervaizer/blob/main/src/supervaizer/examples/hello_world_agent.py) intégré montre les trois. Les [concepts de Supervaizer v2](2026_05_SUPERVAIZER_v2.md) contiennent le modèle complet.

### 5. Se connecter à Studio {#5-connect-to-studio}

Une exploitation pilotée par Studio nécessite un `supervisor_account` sur le `Server`, la clé d'API propre au contrôleur, et le matériel de confiance de l'autorisation d'espace de travail. Le modèle généré (`supervaizer scaffold`) lit ces variables :

```bash
export SUPERVAIZE_API_KEY=...            # agent -> Studio calls
export SUPERVAIZE_WORKSPACE_ID=...
export SUPERVAIZE_API_URL=https://app.supervaize.com
export SUPERVAIZER_API_KEY=...           # Studio -> controller calls (X-API-Key); generated if unset
export SUPERVAIZER_PUBLIC_URL=https://your-controller.example.com

# Workspace authorization: required when A2A is enabled and the controller registers with Studio
export SUPERVAIZER_WORKSPACE_AUTH_REQUIRED=true
export SUPERVAIZER_WORKSPACE_AUTH_ISSUER=https://studio.supervaize.com
export SUPERVAIZER_WORKSPACE_AUTH_JWKS_URL=https://app.supervaize.com/w/your-workspace-slug/api/v1/workspace-agent-grants/jwks/  # or SUPERVAIZER_WORKSPACE_AUTH_PUBLIC_KEY=<PEM>
```

La voie courte : `supervaizer login` ouvre une page d'approbation dans votre navigateur, où vous vous connectez ou vous vous inscrivez, puis écrit les variables Studio dans `.env`. Démarrez avec `supervaizer start --env-file .env`. Le journal de démarrage affiche la page Studio de chaque agent. Consultez [docs/2025_08_CLI.md](2025_08_CLI.md#login).

La voie manuelle : copiez les valeurs d'espace de travail générées depuis la section **Developer → Environment variables** de Studio. `SUPERVAIZE_WORKSPACE_ID` doit être le slug de l'espace de travail affiché à cet endroit ; l'utilisateur de la clé d'API doit appartenir à cet espace de travail et conserver l'accès Developer. Une différence peut faire renvoyer HTTP 403 à `SERVER_REGISTER`. L'émetteur doit correspondre à l'émetteur des jetons de Studio. L'URL JWKS est publique et fournit la clé de signature. L'autorisation d'espace de travail est distincte de `SUPERVAIZE_API_KEY` et de `SUPERVAIZER_API_KEY`.

Dans votre propre fichier de contrôle, construisez le compte explicitement ; `Server` ne lit pas lui-même les variables `SUPERVAIZE_*` :

```python
import os

from supervaizer import Account, Server

account = Account(
    workspace_id=os.environ["SUPERVAIZE_WORKSPACE_ID"],
    api_key=os.environ["SUPERVAIZE_API_KEY"],
    api_url=os.environ.get("SUPERVAIZE_API_URL", "https://app.supervaize.com"),
)
server = Server(agents=[agent], supervisor_account=account)
```

Pour facturer le travail de l'agent aux espaces de travail, déclarez `Agent(billing_catalog=[...])` et envoyez les enregistrements avec `account.report_consumption(...)` ; consultez [docs/2026_10_BILLABLE_CONSUMPTION.md](2026_10_BILLABLE_CONSUMPTION.md).

Sans les trois variables `SUPERVAIZER_WORKSPACE_AUTH_*`, un contrôleur enregistré dans Studio refuse de se lancer (`Studio-registered Supervaizer v2 A2A requires workspace authorization`). Le mode local n'en a pas besoin. Consultez [docs/2026_05_WORKSPACE_AGENT_GRANTS.md](2026_05_WORKSPACE_AGENT_GRANTS.md).

Démarrez ensuite le contrôleur :

```bash
supervaizer start
```

L'enregistrement dans Studio reste l'amorçage de la confiance. Il gère l'identité du serveur, l'échange de clés publiques et le traitement des charges utiles chiffrées. L'Agent Card A2A annonce le contrat opérationnel v2 une fois que Studio connaît le contrôleur.

## Concepts v2 {#v2-concepts}

| Concept | Signification |
| --- | --- |
| Job | Travail engagé que Studio suit pour un agent. |
| Case | Une unité de travail à l'intérieur d'un Job, regroupée par `lane` (`work` par défaut). |
| Step | Une activité observable à l'intérieur d'une Case : `activity`, `status`, `awaiting` facultatif et `outputs`. |
| Surface | Un point d'entrée d'interface nommé. Son gestionnaire renvoie un document A2UI. |
| Action | Une commande typée invoquée via JSON-RPC A2A. Son gestionnaire renvoie des `effects` et un `job_state` facultatif. |
| Resource, Dataset | Objets métier appartenant à l'agent et données interrogeables que Studio affiche de façon générique. |
| Artifact | Une sortie appartenant à l'agent, référencée depuis les `outputs` d'une Step. |

L'échec est un statut, pas un type d'étape. La revue humaine est `status="awaiting"` plus un objet `awaiting`. Le comportement dynamique de l'interface est de la logique locale A2UI ou un appel d'action typé, jamais un callback.

Le modèle complet, les identifiants standard de surfaces et d'actions, et la répartition des protocoles se trouvent dans [docs/2026_05_SUPERVAIZER_v2.md](2026_05_SUPERVAIZER_v2.md) et [docs/2026_05_PROTOCOLS.md](2026_05_PROTOCOLS.md).

## CLI {#cli}

Commandes courantes :

```bash
supervaizer start
supervaizer start --local
supervaizer start --host 0.0.0.0 --port 8000
```

Consultez [docs/2025_08_CLI.md](2025_08_CLI.md) pour la référence complète de la CLI et les variables d'environnement.

## Déploiement {#deployment}

Installez les extras de déploiement :

```bash
pip install "supervaizer[deploy]"
```

Prévisualisez, testez dans Docker, puis déployez :

```bash
supervaizer deploy plan --platform cloud-run --name my-agent --project-id my-gcp-project
supervaizer deploy local --name my-agent --generate-api-key
supervaizer deploy up --platform cloud-run --name my-agent --project-id my-gcp-project --region us-central1
```

`deploy up` construit l'image, la pousse vers le registre de la plateforme et, quand `--generate-api-key` ou `--generate-rsa` est défini, stocke `SUPERVAIZER_API_KEY` et `SUPERVAIZER_PRIVATE_KEY` comme secrets de la plateforme. Cibles : Google Cloud Run, AWS App Runner et DigitalOcean App Platform.

Les services Cloud Run démarrent en privé, et le compte de service d'exécution a besoin d'accéder à ces secrets. App Runner n'a ni rôle ECR ni rôle d'instance : considérez donc cette plateforme comme expérimentale. `deploy up` affiche les échecs et se termine quand même avec le code 0. Les options, les registres et la liste complète des limites figurent dans la [référence de la CLI](2025_08_CLI.md#deploy).

Voir :

- [RFC de déploiement cloud](https://github.com/supervaize/supervaizer/blob/main/docs/rfc/2025_10_001-cloud-deployment-cli.md)
- [Guide des tests Docker en local](2025_10_LOCAL_TESTING.md)

## Interface d'administration {#admin-interface}

L'interface d'administration et le banc d'essai des agents sont montés sur `/manage` (`admin_interface=True`, la valeur par défaut). L'accès est limité aux adresses Tailscale (`100.64.0.0/10`), plus la boucle locale en mode local ; aucune clé d'API n'est utilisée. Le banc d'essai ne démarre que des jobs v1 ; un agent uniquement v2 se pilote via `POST /a2a`. Consultez [docs/2025_08_ADMIN_README.md](2025_08_ADMIN_README.md).

## Développement {#development}

Exécutez les tests et les contrôles :

```bash
just test        # pytest, no coverage
just precommit   # ruff check, ruff format, mypy, hooks
```

## Contribuer {#contributing}

Supervaizer est une infrastructure SDK publique. Gardez les contrats publics typés, génériques et exempts de logique métier propre à un agent. Si un champ du protocole change, mettez à jour ensemble la documentation du producteur et celle du consommateur.

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails de contribution.

## Licence {#license}

Ce projet est distribué sous la [Mozilla Public License 2.0](supervaizer-controller/ref/LICENSE.md).


*Uploaded on 2026-11-06 15:07:19*
