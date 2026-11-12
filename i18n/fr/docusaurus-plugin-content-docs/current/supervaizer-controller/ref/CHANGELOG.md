# Journal des modifications de Supervaizer {#supervaizer-changelog}

Toutes les modifications notables de ce projet sont consignées dans ce fichier.

> Le format s'appuie sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), et ce projet respecte le [versionnement sémantique](https://semver.org/spec/v2.0.0.html).

## [Non publié] {#unreleased}

### Ajouté {#added}

- **`supervaizer login`** — Connecte un développeur à Studio depuis le terminal avec une autorisation d'appareil : la commande affiche une page d'approbation et un code, le développeur se connecte ou s'inscrit dans le navigateur (Google compris) puis approuve, et la commande écrit les trois variables `SUPERVAIZE_*` et les trois variables `SUPERVAIZER_WORKSPACE_AUTH_*` dans un fichier d'environnement (`.env` par défaut). Elle affiche uniquement les noms de variables, jamais une valeur. `supervaizer start --env-file <file>` charge un tel fichier avant le script de contrôle. Après un enregistrement, le journal de démarrage affiche la page Studio de chaque agent lorsque Studio l'envoie (`studio_url` dans les entrées d'agent de la prise de contact). Nécessite un Studio qui expose les points de terminaison `/api/v1/cli/device/` ; un Studio plus ancien renvoie une erreur explicite.
- **Skill d'intégration dans le SDK** (PR #165) — Le skill d'intégration Supervaizer pour les agents de code passe de `runwaize/runwaize_skills` à `skills/supervaizer-integration/` et est publié avec le SDK. Il interroge le développeur sur la correspondance entre mission, job, case et étape par séries de questions, puis construit l'intégration thème par thème (paramètres, champs, ressources partagées, coût, validation humaine, garde-fous, écran Configure, analytique). Il ne contient que le processus et renvoie vers les guides de docs.runwaize.com, `supervaizer scaffold`, `docs/` et l'exemple Hello World pour le contrat, de sorte qu'il ne peut pas diverger de ces sources. `.claude-plugin/marketplace.json` permet à Claude Code de l'installer avec `/plugin marketplace add supervaize/supervaizer`. Le skill ne fait pas partie du wheel. `docs/2026_05_SUPERVAIZER_v2.md` documente désormais les surfaces `job.configurator` et `job.analytics`, le document `Dashboard` et les clés d'instantané de job que Studio lit. Le skill couvre aussi le côté Studio (compte, accès Developer, clé d'API, enregistrement, autorisation d'espace de travail, enregistrements refusés), l'hébergement et le déploiement, les artefacts, le lancement planifié et le catalogue de facturation. Son script d'aide n'affiche aucune valeur d'environnement, échoue sur une erreur JSON-RPC, transmet les identifiants de job, de case, d'étape et de session de brouillon, n'envoie aucun identifiant de job inventé, conserve un fichier de spécification existant sauf avec `--force`, et ne liste la tâche de coût que si la spécification comporte un coût.
- **Consommation facturable de l'agent** (PR #155) — `Agent(billing_catalog=[...])` et `AgentRegistrationContract.billing_catalog` (`BillingCatalogItem` : `sku` de 1 à 64 caractères respectant `^[a-z0-9_]+$` et unique dans la liste, `unit` de 1 à 32 caractères, `description` de 255 caractères au plus) ne sont envoyés que s'ils sont définis ; un agent sans catalogue s'enregistre donc avec les mêmes clés qu'avant. `Account.report_consumption(records, *, agent_slug, workspace_id=None)` et `report_consumption_sync` envoient un `ConsumptionReport` (`agent_slug`, 1 à 200 enregistrements `BillableConsumption`) à `/w/<workspace>/api/v1/billing/consumption/` avec l'en-tête `workspace` réglé sur le même espace de travail, et renvoient un `ConsumptionReceipt` par enregistrement (`accepted`, `duplicate` ou `rejected` avec un `reason`), dans l'ordre, analysé via `ConsumptionReportResponse`. `quantity` et `agent_cost_usd` sont des valeurs `Decimal` envoyées sous forme de chaînes ; `occurred_at` doit comporter un fuseau horaire. Les erreurs de transport et les `400`/`403` portant sur tout le lot sont relevées de nouveau comme pour `send_event` ; le mode local accepte tous les enregistrements sans HTTP. `HELLO_WORLD_BILLING_CATALOG` dans l'exemple Hello World montre un catalogue à un seul SKU. Voir `docs/2026_10_BILLABLE_CONSUMPTION.md`. Nécessite une version mineure.

### Modifié {#changed}

- **Refactorisations du code Python de production** (PR #163) : le cycle de vie de l'agent, le démarrage de la CLI, les contrats, l'authentification, les routes REST, le déploiement et les jobs d'exemple utilisent des fonctions plus petites. Des fonctions utilitaires partagées remplacent des décisions répétées. Des tests de caractérisation préservent les charges utiles, les erreurs, les journaux et l'ordre d'exécution existants. Toutes les fonctions Python de production évaluées ont un CRAP inférieur à 10. Le générateur de documentation reste exempté.
- **`just ship-reconcile` n'accepte plus d'arguments** (PR #156) — La recette ne faisait que transmettre ses propres valeurs par défaut ; l'argument de dépôt du script et son analyseur `--timeout-seconds`/`--poll-seconds` disparaissent. Remplacez les valeurs avec des variables d'environnement : `TIMEOUT_SECONDS` (1800 par défaut), `POLL_SECONDS` (15 par défaut), par exemple `TIMEOUT_SECONDS=7200 just ship-reconcile`. Le script refuse tout argument (code de sortie 2), de sorte qu'une commande obsolète ne peut pas s'exécuter sur un dépôt qu'elle ne nomme pas ; le dépôt est fixé à `supervaize/supervaizer`. Outillage uniquement, aucun changement dans le paquet.
- **Fabriques de routes d'administration et de workbench scindées** (PR #163) — `create_admin_routes` (CRAP 1046) et `create_workbench_routes` (CRAP 1104) contenaient chaque gestionnaire sous forme de fermeture imbriquée. Les gestionnaires sont désormais des méthodes de `AdminHandlers` et des fonctions de module du workbench, enregistrées à partir de tables de routes ; le schéma OpenAPI est inchangé. Des fonctions utilitaires partagées remplacent le code copié de filtrage/tri/pagination, de mise à jour de statut, de validation d'étape et de conversion d'erreur en 500. `set_server_start_time`, `SERVER_START_TIME` et le modèle `EntityFilter` n'étaient pas utilisés et sont supprimés. Module interne uniquement, aucun changement d'API publique.

### Corrigé {#fixed}

- **Le moniteur de job du workbench renvoyait une erreur 500** (PR #163) — `workbench_monitor.html` utilisait `x is not none if x is defined else false`, que Jinja 3.1 interprète comme un argument de test ; `GET /manage/agents/<slug>/workbench/jobs/<job_id>` levait donc `TemplateSyntaxError` pour tous les jobs existants. La condition est désormais `x is defined and x is not none` ; un test compile tous les modèles d'administration.

### Tests

`uv run just test-cov -p no:sugar -q`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 1559   |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 127s   |

| Métrique                       | Avant (`5ad84c6`)                      | Après (`97ea54f`)                      |
| ------------------------------ | -------------------------------------- | -------------------------------------- |
| Tests                          | 1,003                                  | 1,559                                  |
| Couverture `src` + `tools`     | 74.4% (9,415 instructions, 2,413 manquées) | 85.4% (9,475 instructions, 1,380 manquées) |
| Couverture `src` uniquement    | 82.0% (1,541 manquées)                   | 94.1% (508 manquées)                     |
| Couverture `tools` uniquement  | 0% (872 instructions)                    | 0% (872 instructions)                    |

## [1.9.0] - 2026-10-29

### Ajouté {#added-1}

- **Description complète de l'agent** (PR #151) — `Agent(full_description=...)` et `AgentRegistrationContract.full_description` (`V2AgentFullDescription` : `format` vaut `markdown` (par défaut) ou `html`, `content` compte de 1 à 100,000 caractères et n'est pas composé uniquement d'espaces) ne sont envoyés que s'ils sont définis ; un agent sans description complète s'enregistre donc avec les mêmes clés qu'avant. Le SDK type et borne le contenu ; Studio le nettoie avant de l'afficher sur la page de détail de l'agent. Nécessite une version mineure.

- **Contrat de configuration guidée** (gel du 2026-10-28) (PR #149) — Ajouts typés et facultatifs pour la configuration de job guidée par le chat. Un agent v2 non modifié s'enregistre octet pour octet comme avant ; `tests/test_registration_compat.py` contient les charges utiles de référence. `Agent(introduction=...)` et `AgentRegistrationContract.introduction` (`V2AgentIntroduction` : `tagline`, `summary`, `example_goals`, `avatar_url`) ne sont envoyés que s'ils sont définis. `V2SetupFieldDefinition` avec `V2FieldOption`, `V2FieldDependsOn` (clé de transmission `in`), `V2FieldValidation` et des champs `list` avec `item_fields` ; `V2AwaitingFieldDefinition` et `V2ResourceFieldDefinition` reçoivent les mêmes clés facultatives. Des validateurs rejettent les `options` en simple chaîne, les règles qui ne conviennent pas au type du champ, `min_rows` sans `multiline`, et les éléments `list` imbriqués. `V2JobSetupPolicy.plan` et `V2ActionResult.setup_plan` acceptent un `V2SetupPlan` (`confirmation_required`, `steps[]` de `V2SetupStep`, `cost_estimate`) ou un dict transmis tel quel ; les `help_actions` d'une étape doivent être déclarées dans `capabilities.actions` avec `kind="help"`. `V2ActionDefinition.kind` (`command` ou `help` ; les actions d'aide doivent avoir `mutating=False`), `target_field` et `dry_run` ; `V2ActionResult.draft` (`V2FieldDraft`, `V2Suggestion`) et `V2ActionResult.dry_run` (`V2DryRunOutcome`). `V2CostEstimate` est une plage `estimated` ou `unknown`. Les règles d'idempotence de la confirmation sont documentées dans `docs/2026_05_SUPERVAIZER_v2.md`, avec l'utilitaire de conformité `assert_confirm_idempotent(handler, request)` dans `supervaizer.testing`. Nécessite une version mineure.

### Modifié {#changed-1}

- **Champs de fichier A2UI et artefacts stockés par Studio** (PR #139) — `docs/2026_05_SUPERVAIZER_v2.md` documente les champs d'attente `type: "file"` (`accept`, `max_bytes`, `storage`), la forme des réponses de validation humaine pour `storage: "studio"` et `storage: "inline"`, la limite de taille du corps de requête en ligne, et les références d'artefact qui pointent vers des octets conservés par Studio (`"storage": "studio"` + `file_id`). Pour l'instant, les champs de fichier ne sont possibles que dans les étapes d'attente d'un case.
- **`just ship-reconcile` ouvre une PR de fusion retour** (PR #137) — Le script poussait `develop` directement, ce qui ne passait que grâce à un contournement administrateur de la règle de PR sur `develop`. Il fusionne désormais `origin/main` dans une branche `chore/sync-main-<tag>` issue de `origin/develop`, pousse cette branche et ouvre une PR vers `develop` ; fusionnez-la avec un commit de fusion. L'option `--mode` (et l'argument `mode` de la recette) est supprimée : `rebase` exigeait une poussée non fast-forward vers `develop`, que le ruleset bloque. `.claude/ship.md` consigne le flux de publication pour les agents.
- **Dépendances** — `uv.lock` : `opentelemetry-api` 1.45.1 (PR #150), `virtualenv` 21.14.13 (PR #146), `uv` 0.13.4 (PR #144), `certifi` 2026.10.19 (PR #145), `filelock` 4.2.1 (PR #147). GitHub Actions : `astral-sh/setup-uv` 10.3.0 (PR #142), `trufflesecurity/trufflehog` 3.99.3 (PR #138, #148), workflows réutilisables `google/osv-scanner-action` 2.7.0 (PR #140, #143). Aucun changement d'exécution.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 930    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 44s    |

## [1.8.0] - 2026-10-11

### Ajouté {#added-2}

- **Capacité de lancement planifié** (PR #132) — Les agents v2 y adhèrent avec `capabilities.scheduled_start: true` ; la valeur par défaut et un `False` explicite omettent le champ. L'enregistrement rejette l'adhésion sauf si les actions finales déclarent `job.start`. Studio gère l'horloge et invoque l'action existante avec une `idempotency_key` d'occurrence stable. Voir `docs/2026_10_SCHEDULED_START.md`.
- **Carte des fonctionnalités du produit** (PR #131) — `docs/product/feature-map.md` indexe les parcours utilisateur avec les routes, la source et les preuves pytest. `AGENTS.md` et le README y renvoient. Mettez la carte à jour lorsqu'un parcours, une route ou une règle d'accès change.
- **Contexte de mission sur les requêtes v2 et les appels DataResource** (PR #130) — Le nouveau `V2MissionContext` (`id`, `name`, `metadata`) transmet à l'agent le `Mission.metadata` de Studio, sans l'interpréter. `V2SurfaceRequest`, `V2ActionRequest`, `DataResourceContext` et `DataResourceContextContract` reçoivent un champ facultatif `mission` ; un validateur de modèle exige un `mission.id` non vide égal à `mission_id`, et `metadata` n'accepte qu'un objet JSON. Nouvel en-tête `X-Supervaize-Mission-Metadata` (JSON UTF-8 en base64url, 4096 octets au maximum) sur les appels proxy DataResource : `build_data_resource_context_headers(..., mission_metadata=...)` l'écrit, `encode_mission_metadata_header` / `decode_mission_metadata_header` sont exportés, et les routes de données définissent `context.mission` ou renvoient une erreur HTTP 400 en cas d'en-tête invalide ou d'en-tête sans `X-Supervaize-Mission-Id` non vide. Facultatif et additif : les requêtes sans `mission` se comportent comme avant. Nécessite une version mineure.

### Modifié {#changed-2}

- **Règles de lint par défaut de Ruff 0.16** (PR #133) — `pyproject.toml` abandonne le verrouillage `select = ["E4", "E7", "E9", "F"]` de la PR #123 et applique les règles par défaut de Ruff 0.16. Les constats sans effet sont corrigés : ordre des imports, annotations entre guillemets, `subprocess.run(check=False)` explicite, valeurs par défaut de `os.getenv` en chaîne, et réécritures similaires. Les règles dont la correction changerait le comportement d'exécution sont ignorées avec une justification dans `pyproject.toml` (BLE001, S110, DTZ005, TRY004, RUF012, UP040/UP046/UP047, ainsi que des exceptions par fichier) ; B008 accepte les valeurs par défaut FastAPI `Body`, `Depends` et `Query`. Aucun changement d'exécution. Une exception B023 temporaire dans `routes.py` signalait un bogue connu dans les routes de méthodes personnalisées v1 ; la PR #134 le corrige et supprime l'exception.
- **Dépendances** — `jaraco-context` 6.1.2 dans `uv.lock` (extra `dev`, via hatch et keyring ; corrige PYSEC-2026-1469 / GHSA-58pv-8j8x-9vj2) (PR #135) ; `astral-sh/setup-uv` 10.2.0 (PR #128) ; `softprops/action-gh-release` 3.0.3 (PR #126) ; `trufflesecurity/trufflehog` 3.97.9 (PR #129) ; workflows réutilisables `google/osv-scanner-action` 2.6.0 (PR #125, #127).

### Corrigé {#fixed-1}

- **Les routes de méthodes personnalisées v1 exécutaient la dernière méthode enregistrée** (PR #134) — `POST /api/supervaizer/agents/{slug}/custom/{method}` appelle désormais `service_job_custom` avec son propre nom de méthode, et le message de la réponse nomme cette méthode. Auparavant, chaque route personnalisée exécutait la dernière méthode de `agent.methods.custom`. Les chemins de route, les noms d'opération et la sortie OpenAPI ne changent pas. L'exception `B023` de la PR #133 est supprimée.
- **Section de déploiement du README** — `deploy up` construit l'image, la pousse vers le registre de la plateforme et stocke les `SUPERVAIZER_API_KEY` et `SUPERVAIZER_PRIVATE_KEY` générées comme secrets de la plateforme. L'ancienne mention « expérimental, ne pousse pas » décrivait une commande plus ancienne.
- **Le workbench est réservé à la v1** — `POST /manage/agents/{slug}/workbench/start` renvoie une erreur HTTP 400 pour un agent sans `methods` v1 et ne crée aucun job. Les agents v2 uniquement s'exécutent via `POST /a2a`.
- **Les routes de ressources de données n'étaient pas documentées** — Le CRUD se trouve à `/api/agents/{slug}/data/{name}/`, exige `X-API-Key` ainsi qu'un jeton d'espace de travail, et n'est pas couvert par le contournement `/a2a` du mode local.
- **Documentation de l'hôte en mode local et de l'autorisation d'espace de travail** — Les hôtes génériques (`0.0.0.0`, `::`, vide) se lient à `127.0.0.1` ; un `--host` explicite est conservé. Le contournement `/a2a` ignore la tolérance et `SUPERVAIZER_WORKSPACE_AUTH_REQUIRED=false`. `POST /a2a` est monté par défaut ; seul `/api` attend un compte Studio ou le mode local. Le code JSON-RPC `-32030` utilise `error.data.code` avec la valeur `workspace_authorization_missing` ou `workspace_authorization_not_configured`.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 851    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 48s    |

## [1.7.0] - 2026-10-04

### Ajouté {#added-3}

- **Le mode local peut invoquer les actions et surfaces v2** (PR #117) — Avec `SUPERVAIZER_LOCAL_MODE=true`, sans `supervisor_account` et sans paramètre de confiance `SUPERVAIZER_WORKSPACE_AUTH_*`, `supervaizer/action.invoke` et `supervaizer/surface.load` sur `POST /a2a` ne répondent plus `-32030 workspace_authorization_not_configured`. Les gestionnaires reçoivent un contexte d'espace de travail non vérifié avec `grant_id="local-mode"` (`LOCAL_MODE_WORKSPACE_GRANT_ID`) et uniquement les portées dont l'appel a besoin, et le démarrage journalise un avertissement de contournement. Tout paramètre de confiance (même sans `SUPERVAIZER_WORKSPACE_AUTH_REQUIRED=true`) ou un compte Studio rattaché maintient la vérification en échec fermé, et les routes de ressources de données ne sont jamais contournées.
- **Portes de point de contrôle des règles** (PR #113) — Les contrôleurs V2 peuvent déclarer explicitement la prise en charge des points de contrôle de règles `before` et `after`, y compris les chemins de secrets métier déclarés. `RuleCheckpointGate` et `Case.run_guarded_step()` demandent l'autorisation de Studio autour d'un effet coopératif, conservent le résultat pour une reprise sûre, et reçoivent les pauses approuvées via l'action déclarée `rule.checkpoint.resume`.
- **Libellé et description facultatifs sur les surfaces et les actions** (PR #103) — Contrat d'enregistrement v2 additif : `V2SurfaceDefinition(id, label, description)`, `V2AgentCapabilities.surface_definitions`, et `label` / `description` facultatifs sur `V2ActionDefinition`. Le texte d'affichage est épuré des espaces et limité à 300 caractères ; un texte vide équivaut à une absence. Les agents existants qui omettent ces champs conservent des fiches identiques à l'octet près (`capabilities.surfaces` reste une liste d'identifiants).

### Modifié {#changed-3}

- **Prise en main v2 plus courte** (PR #121) — `build_v2_agent_registration` n'a besoin que de `agent_slug`, `display_name` et `a2ui_catalog_version`. `agent_id` prend par défaut la valeur du slug, `controller_url` vaut `/a2a`, et `agent_card_url` vaut `/.well-known/agents/<slug>_agent.json` (la route de fiche sans version) ; les valeurs explicites gardent leur comportement. `supervaizer scaffold` génère un contrôleur Supervaizer v2 minimal (un enregistrement, une surface `job.start`, une action `job.start`) à la place du modèle v1 `AgentMethod`. `docs/api/openapi.json` est régénéré à partir de lui ; les routes de job v1 de l'ancien exemple quittent donc la référence publiée, mais le SDK les sert toujours pour les agents v1. Le démarrage rapide du README est un seul agent v2 court.
- **Les méthodes v1 sont facultatives pour les agents v2** (PR #114) — `Server(agents=[agent])` ne lève plus `Agent <name> has no methods defined` lorsque le routeur `/api` est monté (compte Studio ou `SUPERVAIZER_LOCAL_MODE=true`) et que l'agent ne déclare que `supervaizer_v2_registration`. Ces agents conservent les routes au niveau de l'agent (informations, instructions, validation des paramètres, `/parameters`) mais n'ont aucune route de job v1 (`/jobs`, `/stop`, `/status`) ; Studio exécute leurs jobs via `/a2a`. La charge utile d'enregistrement est inchangée (`methods: {}`). Un agent sans `methods` ni enregistrement v2 lève toujours l'erreur. L'exemple v2 du README abandonne sa méthode `job_start` factice.
- **Audit de la documentation** (PR #104) — README, AGENTS.md, CONTRIBUTING.md, SECURITY.md et `docs/` vérifiés par rapport au code 1.6.0. Corrigés : chemin de l'interface d'administration et modèle d'accès (`/manage`, protégé par Tailscale, `ADMIN_ALLOWED_IPS` supprimé), exemple v2 du README (`mission_id`, `V2ActionDefinition` explicite), connexion à Studio (câblage de `Account` et exigence de lancement `SUPERVAIZER_WORKSPACE_AUTH_*`), référence de la CLI (options réelles de `deploy`, `--reload`/`--debug` non fonctionnels), persistance (le singleton ignore `db_path` ; pas de `CachingMiddleware`), autorisation d'espace de travail (`WorkspaceAuthorizationClaims`, identifiants d'amorçage exacts, variables d'environnement), CONTRIBUTING (chemin mypy, 88 colonnes, commits gitmoji, PR vers `develop`), et SECURITY (versions prises en charge, rulesets de branches réels). `docs/2025_08_ADMIN_README.md` et `docs/2025_08_REST_API.md` réécrits ; `docs/2025_10_LOCAL_TESTING.md` marqué comme obsolète ; statuts des RFC mis à jour ; `GEMINI.md` et `.cursorrules` renvoient désormais à `AGENTS.md`.
- **Les identifiants de déploiement restent hors de l'image** (PR #111) — Le Dockerfile généré n'intègre plus `SUPERVAIZE_API_KEY` et les autres variables d'hôte sous forme d'`ARG`/`ENV` ; `up` les transmet à l'exécution et stocke `SUPERVAIZE_API_KEY` dans le gestionnaire de secrets de la plateforme. `docker-compose.yml` et la spécification d'application DigitalOcean sont écrits avec le mode `600`, et `deploy local` publie son port uniquement sur `127.0.0.1`.
- **`deploy up --image` accepte `name[:tag]`** (PR #111) — `up` ajoute le registre de la plateforme et rejette une valeur qui contient `/`.
- **DigitalOcean utilise le registre de conteneurs du compte** (PR #111) — `up` ne crée plus de registre `{name}-{env}` et `down` n'en supprime plus ; DigitalOcean n'autorise qu'un registre par compte.
- **Les pilotes de déploiement déclarent leur registre** (PR #111) — `BaseDriver` reçoit `prepare_registry()` et un `registry_auth()` surchargeable. `prepare_registry()` n'est pas abstraite : les sous-classes de pilote tierces existantes s'instancient donc toujours ; `deploy up` lève `NotImplementedError` pour un pilote qui ne l'implémente pas.
- **La fiche d'agent pointe vers de vraies routes** (PR #115) — `api_endpoints[].url` et ses exemples utilisent désormais `/api/supervaizer/agents/{slug}`, et `human_url` pointe vers la page d'instructions de l'agent, qui exige `X-API-Key` comme toute route `/api/*`. `authentication` déclare l'en-tête `X-API-Key` au lieu de `none`. Changement de comportement pour les consommateurs de la fiche : `authentication.type` vaut désormais `apiKey` ; `version_info.latest` (toujours égal à `current`), l'URL morte `/changelog/{slug}` et `logo_url` (aucune route ne le servait) sont supprimés ; `version_info.changelog_url` n'apparaît que si l'agent définit `release_notes_url`. Studio ne lit que l'extension `supervaizer.v2` de la fiche ; il n'est donc pas concerné.
- **Dépendances** — anyio 4.14.2 (PR #102) ; httpcore2 2.10.0 (PR #100) ; httpx2 2.12.0 (PR #101) ; urllib3 2.8.0 (PR #105) ; virtualenv 21.7.13 (PR #106) ; `actions/checkout` 7.0.1 (PR #97) ; `astral-sh/setup-uv` 10.0.1 (PR #96) ; `trufflesecurity/trufflehog` 3.97.1 (PR #98) ; workflows réutilisables `google/osv-scanner-action` 2.5.1 (PR #95, #99). Versions minimales relevées (PR #122) : extra `deploy` boto3 1.43.108, docker 7.2.0, google-cloud-artifact-registry 1.23.0, google-cloud-run 0.16.2, google-cloud-secret-manager 2.31.0 ; extra `dev` hatch 1.18.1, mypy 2.4.0, pre-commit 4.6.2, pytest-mock 3.16.0, ruff 0.16.10.

### Déprécié {#deprecated}

- **`supervaizer start --debug` et `--reload`** (PR #111) — Les deux options fonctionnent encore mais sont masquées dans `--help` et affichent un avertissement de dépréciation. `--debug` définit toujours `SUPERVAIZER_DEBUG` et active le mode débogage FastAPI dans le repli `--local` sans script ; `Server` lui-même ne lit jamais la variable. `--reload` définit toujours `SUPERVAIZER_RELOAD`, mais le repli ne la transmet plus à uvicorn, où elle provoquait un plantage (`You must pass the application as an import string`). Pour le mode débogage, définissez `debug=True` sur le `Server` dans un script de contrôle. Redémarrez après chaque changement de code.

### Supprimé {#removed}

- **Documents obsolètes et bloc TODO** (PR #104) — `docs/2025_04_API_REFERENCE.md` (exemples v1 qui ne s'exécutent plus), `docs/2025_08_PROTOCOLS.md` (sous-ensemble de `2026_05_PROTOCOLS.md`), les plans de `docs/superpowers/` (fonctionnalités livrées ou retirées) et le bloc `TODO` du CHANGELOG. `docs/2025_08_PARAMETER_VALIDATION_IMPLEMENTATION.md` réduit à `docs/2025_08_PARAMETER_VALIDATION.md`.
- **Liste d'autorisation d'administration inutilisée et `Server.verify_api_key`** (PR #112) — Supprime `admin/ip_allowlist.py` (`ADMIN_ALLOWED_IPS`, inutilisé depuis la 0.15.0), `Server.verify_api_key` / `Server.api_key_header` (les contrôles de clé d'API se trouvent sur le routeur) et `tools/test_admin.py`.
- **Scripts de test rapide à la racine** (PR #111) — `test_local.py` (il exécutait `python -m supervaizer`, qui n'a pas de `__main__` ; utilisez `supervaizer deploy local`) et `test_dockerfile_generation.py` (en-tête de licence uniquement).
- **Options de déploiement sans effet** (PR #111) — `deploy up --yes`, `deploy up --no-rollback` et `--verbose` sur `deploy plan`, `up`, `down` et `status` ne faisaient rien. Elles échouent désormais comme options inconnues. `deploy down --yes` et `--verbose` sur `deploy local` et `clean` restent disponibles.

### Corrigé {#fixed-2}

- **Les pages `/manage` n'exposent plus la clé d'API** (PR #116) — Chaque page d'administration plaçait la `SUPERVAIZER_API_KEY` à portée d'écriture dans un attribut `data-admin-key` du `<body>`, et la page du workbench l'intégrait aussi dans son script. Toute personne pouvant ouvrir `/manage` pouvait lire la clé et appeler avec elle les routes `/api/*` à portée d'écriture. Depuis la 0.15.0, `require_tailscale` protège `/manage` et ses points de terminaison n'ont pas besoin de clé ; les modèles et `workbench-form.js` ne la reçoivent ni ne l'envoient donc plus. La page `/manage/job-start-test` et `job-start-form.js` sont supprimés : la page ne chargeait jamais le script, et le script visait un chemin d'agent qui n'existe pas.
- **Les réponses et le stockage des jobs ne contiennent plus de paramètres déchiffrés** (PR #118) — `POST /api/supervaizer/agents/{slug}/jobs` renvoyait la liste `agent_parameters` déchiffrée, valeurs secrètes comprises, et `Job.to_dict` l'écrivait dans le magasin de jobs. `AbstractJob.agent_parameters` est désormais exclu de la sérialisation et de `repr` ; la méthode de l'agent reçoit toujours les valeurs à l'exécution. `service_job_custom` transmet sa liste déchiffrée à cette seule exécution (nouvel argument `agent_parameters` de `Agent.job_start`), car un job rechargé depuis le stockage ne la possède plus, et les journaux de débogage de `job_start` et `_execute` ne l'affichent plus. Les enregistrements de job sauvegardés avant cette version conservent leurs paramètres, car le magasin fusionne les mises à jour : après la mise à niveau, supprimez `agent_parameters` des enregistrements `Job` dans `$DATA_STORAGE_PATH/entities.json` (`./data/entities.json` par défaut). Changement de comportement : `Job.to_dict`, la réponse de démarrage du job et le schéma OpenAPI `Job` n'incluent plus `agent_parameters`.
- **Configuration de paramètres d'enregistrement vide valide** (PR #109) — Les agents sans définition de paramètres envoient désormais une liste vide au lieu de `null`.
- **Diagnostics d'erreur HTTP plus sûrs** (PR #107, #108) — La sortie curl de diagnostic masque les en-têtes d'autorisation et de clé d'API, les détails d'événements sérialisés censurent les clés d'API et les champs de jeton, et les erreurs HTTP journalisent le statut distant et l'identifiant de requête.
- **`just dev` démarre le contrôleur** (PR #111) — La recette exécutait `uvicorn controller:app --reload`, mais il n'existe aucun module `controller`. `just dev` est désormais un alias de `just local` (`uv run supervaizer start --local`).
- **Indication d'actualisation correcte** (PR #111) — Lorsque `supervaize_instructions.html` existe déjà, la CLI indique désormais `supervaizer scaffold refresh-instructions` au lieu de `supervaizer refresh-instructions`, qui n'existe pas.
- **Les hooks Git exécutent les contrôles pre-commit** (PR #111) — `just install-hooks` installait les hooks de `.pre-commit-config.yaml` dans `.git/hooks`, puis réglait `core.hooksPath=.githooks`, si bien que Git les ignorait, et `.githooks/pre-commit` n'appelait qu'un script `pre-commit-user` qui n'existait pas. `.githooks/pre-commit` exécute désormais l'étape pre-commit (Ruff, mypy, en-tête de licence) sur les fichiers indexés et refuse toujours un `git commit` simple sur `gitbutler/workspace` ; le nouveau `.githooks/commit-msg` exécute les contrôles gitmoji et commitizen. `.githooks/post-commit` lit `src/supervaizer/__version__.py`, de sorte qu'un commit de changement de version reçoit l'étiquette `vX.Y.Z` au lieu de `v`. `just install-hooks` ne fait plus que régler `core.hooksPath`. Le `.githooks/post-checkout` géré par GitButler, qui se supprimait de l'arborescence à chaque changement de branche hors de `gitbutler/workspace`, est supprimé. `just ship` passe `--no-verify` à sa fusion de publication, car le hook commit-msg rejette le titre `[MINOR]`. `but commit` de GitButler n'exécute pas les hooks Git.
- **Le hook post-commit n'étiquette que les versions de publication** (PR #119) — Un `git commit` simple de `just version-dev on` créait une étiquette locale `vX.Y.Z.dev0`, et `just version-dev off` échouait avec `tag 'vX.Y.Z' already exists` tout en affichant `Created tag`. Le hook appelle désormais `just tag-version`, qui n'étiquette que les versions `X.Y.Z`, ignore une étiquette existante et n'affiche `Created tag` que si `git tag` réussit.
- **`deploy up` pousse l'image qu'il déploie** (PR #111) — `up` pousse désormais l'image construite vers le registre de la plateforme (Artifact Registry, ECR ou le registre du compte DigitalOcean, avec des identifiants de courte durée) et déploie cette référence. Auparavant, Cloud Run et App Runner pointaient vers une image jamais poussée, et DigitalOcean utilisait une source GitHub fictive. Cloud Run déploie désormais avec `allow_missing` et attend la fin de l'opération ; App Runner reçoit une table de chaînes dans `RuntimeEnvironmentVariables` et les ARN de secrets dans `RuntimeEnvironmentSecrets` ; les variables `SECRET` de DigitalOcean portent leur valeur.
- **Les conteneurs déployés reçoivent les variables que le serveur lit** (PR #111) — Les secrets générés arrivent sous les noms `SUPERVAIZER_API_KEY` et `SUPERVAIZER_PRIVATE_KEY` (auparavant `{name}-{env}-api-key`, `{name}-{env}-rsa-key` et `SV_RSA_PRIVATE_KEY`), et le niveau de journalisation sous `SUPERVAIZER_LOG_LEVEL` (auparavant `SV_LOG_LEVEL`). `SUPERVAIZER_SERVER_ID` et les variables `SUPERVAIZER_WORKSPACE_AUTH_*` sont transmis, de sorte qu'un contrôleur v2 enregistré dans Studio démarre dans le conteneur. `--port` définit désormais aussi `SUPERVAIZER_PORT`, en plus du port du conteneur.
- **Contrôle de santé et Compose de `deploy local`** (PR #111) — Le contrôle de santé interroge `/.well-known/health` (la route `/agents/health` n'existe plus), les commandes utilisent Docker Compose v2 (`docker compose`), le `SUPERVAIZE_API_KEY` de l'hôte n'est plus remplacé par la clé de test du contrôleur, et les valeurs multilignes comme les clés PEM sont placées entre guillemets dans `docker-compose.yml`.
- **Le lancement s'arrête quand la recherche de l'agent dans Studio échoue** (PR #120) — `Agent.update_agent_from_server` journalisait un `GET /agents/{id}` ou `/agents/by-slug/{slug}` en échec puis renvoyait `None`, si bien que `Server.launch` continuait sans le statut ni les paramètres Studio de l'agent. Il lève désormais `RuntimeError` en nommant le slug, `server_agent_id`, l'URL et le statut HTTP. Une erreur 404 de Studio masquait ainsi un `Agent ID mismatch`. Changement de comportement : un contrôleur enregistré dans Studio ne démarre plus tant que Studio ne peut pas renvoyer son agent. Le mode local (sans compte Studio) renvoie toujours `None`.
- **La validation des paramètres accepte la charge utile de démarrage du job** (PR #115) — `POST /api/supervaizer/agents/{slug}/validate-agent-parameters` transformait la liste déchiffrée d'objets `{name, value}` envoyée par Studio en clés `param_0`, `param_1`, ..., qui échouaient ensuite comme inconnues. Le démarrage d'un job (`Job.new`) n'accepte que cette liste ; un agent avec des paramètres obligatoires n'avait donc aucune charge utile qui passe les deux. La route lit désormais la liste par `name` : une même charge utile chiffrée passe les deux. La forme dict `{NAME: value}` reste acceptée pour la validation uniquement ; le démarrage d'un job exige toujours la liste. Un élément de liste sans `name` de type chaîne et sans `value`, ou une charge utile d'un autre type, échoue désormais avec une erreur claire au lieu d'être validé comme vide.
- **Liens du modèle de page d'accueil du déploiement** (PR #115) — `deploy/templates/index.html` pointait vers `/admin` et `/console` ; il pointe désormais vers `/manage` et `/manage/console`.
- **Reprise des points de contrôle de règles** (PR #113) — Une livraison de reprise anticipée réveille les attentes actives, les propositions reprises conservent l'identité de l'étape, et les réponses perdues ne relancent que l'évaluation. L'exécution d'origine et la reprise simultanées ne peuvent pas faire avancer une étape deux fois.
- **L'ensemble de règles Ruff est explicite** (PR #123) — Ruff 0.16 a élargi son ensemble de règles par défaut, et le contrôle `pre-commit` échouait avec 266 constats. `[tool.ruff.lint] select = ["E4", "E7", "E9", "F"]` conserve les règles qui s'exécutaient auparavant. Ruff 0.16 formate aussi les blocs de code Python dans le Markdown ; trois fichiers de documentation sont donc reformatés.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 808    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 43s    |

## [1.6.0] - 2026-08-30

### Ajouté {#added-4}

- **Portée et mutabilité déclarées des actions (#92)** — `V2AgentCapabilities.actions` est désormais `list[V2ActionDefinition]` au lieu d'une `list[str]` opaque. Chaque action déclare `id`, `mutating` (l'invoquer change-t-il l'état côté agent ?) et `scope` (`workspace` / `mission` / `job`), afin qu'un consommateur puisse autoriser et regrouper les actions sans analyser l'identifiant. `id` est fourni par l'appelant au moment de l'invocation ; en tirer une décision d'autorisation remet donc cette décision entre les mains de l'appelant.

  Les simples chaînes restent acceptées partout où une liste d'actions est attendue — dans `build_v2_agent_registration(actions=...)` et lors de la validation d'une charge utile d'enregistrement — et sont converties en `mutating=True, scope="job"`, la lecture en échec fermé qui correspond au comportement actuel. Seule la forme sérialisée change : `capabilities.actions` émet désormais des objets. Les consommateurs doivent accepter les deux, car les agents figés sur d'anciennes versions de Supervaizer continuent d'envoyer des chaînes simples. Aucune version de protocole ne distingue les deux formes : `versions.a2ui_version` et `versions.a2a_version` couvrent le catalogue de surfaces et le protocole A2A, pas la charge utile d'enregistrement.

  Le constructeur déduit les métadonnées de la définition dont provient chaque action : les actions de ressource prennent `V2ResourceDefinition.scope`, les requêtes de jeu de données sont `mutating=False`, `V2JobSetupPolicy.preview_action` est `mutating=False`, et les actions de liaison d'espace de travail sont de portée `workspace`. Les identifiants d'opération de ressource sont libres ; les opérations restent donc `mutating=True` sauf déclaration contraire de l'agent.

  La priorité des métadonnées est explicite > déduite > nue : une `V2ActionDefinition` explicite dans `actions=` remplace les métadonnées déduites — c'est ainsi que se déclare un `resource.invoice.reconcile` de portée job sur une ressource de portée espace de travail — tandis qu'une simple chaîne d'identifiant ne déclare rien et s'en remet à la définition dont elle provient. La priorité porte sur les métadonnées, pas sur la position : un identifiant déclaré des deux façons dans `actions=` garde les métadonnées explicites quelle que soit la forme qui vient en premier, et la première mention fixe quand même l'ordre.

- **`V2DatasetDefinition.scope`** — Reprend `V2ResourceDefinition.scope` (`workspace` / `mission` / `job`, `workspace` par défaut) afin que les actions de requête de jeu de données portent une portée déclarée plutôt que supposée.

- **`V2AwaitingState.reopenable`** — Déclare si une étape d'attente déjà traitée peut être rouverte et renvoyée avec des valeurs modifiées. `False` par défaut ; auparavant, les consommateurs le déduisaient d'une sous-chaîne de `surface`.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 698    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 67s    |

## [1.5.0] - 2026-08-28

### Ajouté {#added-5}

- **Contrat générique de configuration de job** — Le nouveau `V2JobSetupPolicy` sur `V2JobPolicy.setup` permet à un agent de déclarer les actions que Studio peut utiliser pour prévisualiser, démarrer et soumettre la configuration d'un job (`preview_action`, `start_action`, `submit_action`, valant par défaut `job.start.preview`, `job.start` et `step.awaiting.submit`), les contextes auxquels ces actions s'appliquent (`action_scopes`) et une charge utile `plan` opaque. Les actions déclarées sont intégrées à la liste des actions de capacité de l'enregistrement. `V2ActionResult.setup_plan` renvoie à Studio le plan de l'agent. `V2JobSetupPolicy` est exporté au niveau du paquet. Additif uniquement ; les agents qui omettent `setup` ne sont pas concernés.

  `action_scopes` vaut par défaut une liste vide : un agent qui adhère avec `setup: {}` ne déclare aucune portée au lieu de prétendre couvrir tout `workspace`, `job`, `case` et `step`. Cela correspond à `V2JobSyncPolicy.supported_statuses` et évite d'annoncer une prise en charge de contexte que l'agent n'a jamais configurée. Les trois identifiants d'action sont validés comme non vides : un identifiant vide est donc rejeté à l'enregistrement, au lieu d'être silencieusement retiré de `capabilities.actions` tout en apparaissant dans `job_policy.setup` sérialisé. La même validation a été appliquée à `V2JobSyncPolicy.action`, qui présentait la même lacune.

### Modifié {#changed-4}

- **Référence du modèle et OpenAPI régénérées** — `docs/model_reference/` et `docs/api/openapi.json` ont été reconstruits à partir des modèles actuels, intégrant le contrat de configuration de job ainsi que la dérive accumulée depuis `0.20.1`. `V2JobSetupPolicy` est désormais déclaré avant `V2JobPolicy` afin que la référence publique affiche le vrai type au lieu d'un `ForwardRef`.

### Corrigé {#fixed-3}

- **Publication PyPI (Metadata 2.5)** — Épingle `pypa/gh-action-pypi-publish` sur la v1.14.2 afin que les wheels hatchling ≥1.32 soient acceptés. Ignore l'incrément de version sauf si le commit déclencheur contient `[MAJOR]`/`[MINOR]`/`[PATCH]`.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 691    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 65s    |

## [1.4.0] - 2026-07-07

### Ajouté {#added-6}

- **Synthèse de la revue de sécurité et de performance** — Ajout de `docs/2026_07_SECURITY_REVIEW.md`, une synthèse de haut niveau, sans action à mener, d'une revue de sécurité et de performance/scalabilité portant sur tout le code source (posture, contrôles vérifiés comme sains, nombre de constats par gravité et thèmes de correction). Conformément à `SECURITY.md`, les constats détaillés (emplacements, scénarios d'attaque, précisions de correction) passent par le canal privé de signalement des vulnérabilités et sont volontairement omis du dépôt public.

### Corrigé {#fixed-4}

- **Contrôles de clé d'API renforcés** — Les clés d'API sont comparées en temps constant.
- **Mode de test local plus sûr** — `supervaizer start --local` se lie par défaut à la boucle locale (`127.0.0.1`) au lieu de toutes les interfaces ; passez un `--host` explicite pour le changer.
- **En-têtes de réponse de sécurité de base** — Les réponses définissent désormais `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` et `Strict-Transport-Security` (compatible avec le streaming/SSE).
- **Moins de données sensibles dans les journaux** — Les valeurs des paramètres d'agent ne sont plus écrites dans les journaux pendant la validation des paramètres.
- **Renforcement de l'exécution des étapes planifiées** — Le planificateur n'exécute que les méthodes déclarées par l'agent propriétaire du job de l'étape.

### Tests

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 683    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 83s    |

## [1.3.1] - 2026-07-02

### Modifié {#changed-5}

- **`pyproject.toml` (depuis la v1.3.0)** — Bornes inférieures d'exécution : FastAPI `>=0.139.0`, sse-starlette `>=3.4.5`, Typer `>=0.26.8`, Uvicorn `>=0.49.0`. **Extra `deploy` :** boto3 `>=1.43.39`, google-cloud-run `>=0.16.1`, google-cloud-secret-manager `>=2.23.0`. **Extra `dev` :** hatch `>=1.17.0`, pytest `>=9.1.1`, pytest-asyncio `>=1.4.0`, ruff `>=0.15.20`. Fichier de verrouillage actualisé via `uv lock`.

### Corrigé {#fixed-5}

- **Test de portée des événements A2A** — `tests/test_a2a.py` parcourt désormais les enveloppes de routeurs inclus de FastAPI pour trouver `/a2a/events`, ce qui préserve l'assertion de portée en lecture sous FastAPI `0.139.0`.

### Tests

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 683    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 56s    |

## [1.3.0] - 2026-07-02

### Ajouté {#added-7}

- **Contrat `context.assign`** — Nouveau contrat de transmission typé pour affecter à un job une sélection de contexte Studio figée : `V2ContextAssignment` (éléments, `mission_id`, `job_id`, `assigned_at`), `V2ContextAssignmentItem` (`ref`, `version`, `scope`, `title`) et l'identifiant d'action `V2_ACTION_CONTEXT_ASSIGN` dans `supervaizer.contracts`, exportés au niveau du paquet. Additif uniquement ; le routage utilise le mécanisme générique existant `Server.v2_action`.

### Tests

- `tests/test_common.py` — sortie de journal JSON structurée pour les enregistrements de refus d'accès à l'API
- `just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 677    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 65s    |

## [1.2.0] - 2026-05-27

### Modifié {#changed-6}

- **Nettoyage du lifespan FastAPI** — L'arrêt du contrôleur annule désormais la boucle d'arrière-plan des étapes planifiées et attend brièvement qu'elle s'arrête.
- **Refactorisation du module serveur** — La configuration de démarrage du serveur, la persistance des informations d'exécution du serveur, les prises de contact d'enregistrement auprès de Studio et la gestion de la boucle des étapes planifiées sont extraites de `server.py` vers des modules ciblés, tout en préservant le comportement public de `Server`.
- **Méthodes d'agent Supervaizer v2** — Les agents du SDK peuvent désormais déclarer des actions standard facultatives comme `agent.refresh`, ainsi que des actions d'agent personnalisées, via la même structure `AgentMethods` que celle des méthodes de job, et l'exécution A2A enregistre automatiquement ces gestionnaires.

### Tests

- `tests/test_server.py` — annulation de la tâche du planificateur et attente bornée à l'arrêt du lifespan FastAPI.
- `tests/test_server_refactor_modules.py` — couverture de parité pour les utilitaires extraits de configuration du serveur, d'informations du serveur, d'enregistrement, de prise de contact et d'étapes planifiées.
- `tests/test_a2a.py` — routage des méthodes d'agent standard et personnalisées via le contrôleur A2A v2.
- `tests/test_agent.py` — enregistrement des méthodes v2 au niveau de l'agent et validation du contrat.
- `tests/test_contracts.py` — sérialisation du contrat typé des méthodes d'agent.

### Tests

- `tests/test_common.py` — sortie de journal JSON structurée pour les enregistrements de refus d'accès à l'API
- `just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 672    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 86s    |

## [1.1.1] - 2026-05-20

### Modifié {#changed-7}

- **Sortie structurée pour Cloud Logging** — `SUPERVAIZER_LOG_FORMAT=json` fait désormais passer les journaux stderr du contrôleur en JSON délimité par des sauts de ligne, avec un `severity` compatible Cloud Logging et des champs liés comme `path`, `reason` et `key_preview` tronqué pour les refus d'accès ; la journalisation texte locale reste le comportement par défaut.

### Tests

- `tests/test_common.py` — sortie de journal JSON structurée pour les enregistrements de refus d'accès à l'API
- `just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 658    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 92s    |

## [1.1.0] - 2026-05-19

### Ajouté {#added-8}

- **Autorisation d'agent par espace de travail** — Jetons d'autorisation d'espace de travail Ed25519 signés par Studio dans `X-Supervaize-Workspace-Authorization` ; le SDK vérifie les jetons adossés à JWKS et expose `V2VerifiedWorkspaceContext` aux gestionnaires. Les slugs d'espace de travail et de locataire restent de simples indications de routage.
- **Protocole de liaison d'espace de travail** — Les agents peuvent déclarer des métadonnées `workspace_binding` facultatives avec les `workspace_binding.options` et `workspace_binding.create` d'amorçage, ainsi que la surface `workspace_binding.create`, afin que Studio puisse lier un enregistrement côté agent avant qu'une autorisation d'agent d'espace de travail n'existe.
- **Documentation de l'autorisation d'espace de travail** — `docs/2026_05_WORKSPACE_AGENT_GRANTS.md`, ainsi que les règles d'autorisation d'espace de travail et d'amorçage de la liaison dans `docs/2026_05_PROTOCOLS.md` et `docs/2026_05_SUPERVAIZER_v2.md`.

### Modifié {#changed-8}

- **A2A Studio en échec fermé** — Les actions et surfaces JSON-RPC v2 de portée espace de travail rejettent les requêtes sans jeton d'autorisation d'espace de travail valide lorsque l'autorisation d'espace de travail est activée.
- **Ressources de données de portée espace de travail** — Les routes de ressources de données exigent un contexte d'espace de travail vérifié, issu du jeton d'autorisation, au lieu de se fier aux seuls slugs fournis par l'appelant.
- **Transmission de l'audience du serveur Studio** — Les prises de contact `server.register` peuvent désormais fournir l'audience du serveur conservée par Studio pour les jetons d'autorisation d'espace de travail, et Supervaizer adopte cette audience avant de servir les appels v2 protégés, de sorte que les autorisations d'espace de travail survivent aux redémarrages du processus de l'agent.
- **Enregistrement de la version du contrôleur** — `server.register` envoie désormais directement la version du paquet du contrôleur Supervaizer sous `controller_version`, de sorte que Studio ne dépend plus de l'extraction depuis OpenAPI pour actualiser la version sur la page de détail du serveur.

### Corrigé {#fixed-6}

- **Validation de l'autorisation d'espace de travail** — Les jetons et paramètres d'autorisation d'espace de travail mal formés ou incomplets échouent désormais avec des erreurs `workspace_authorization_*` explicites au lieu d'échecs de gestionnaire ambigus.

### Tests

- `tests/test_a2a.py` — chemins d'acceptation et de rejet de l'autorisation d'espace de travail, vérification JWKS, exceptions d'amorçage de la liaison, et application de l'autorisation aux actions et surfaces protégées.
- `tests/test_agent.py` — l'enregistrement v2 transporte la liaison d'espace de travail et les paramètres d'autorisation.
- `tests/test_contracts.py` — modèles de contrat de liaison d'espace de travail et d'autorisation.
- `tests/test_routes.py` — les routes de ressources de données exigent un contexte d'espace de travail vérifié.
- `tests/test_server.py` — transmission de l'audience lors de la prise de contact d'enregistrement, validation du démarrage de l'autorisation d'espace de travail et enregistrement de `controller_version`.

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 657    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 76s    |

## [1.0.1] - 2026-05-17

### Supervaizer v2 2️⃣

- **Métadonnées de case Supervaizer v2** — `V2CaseSnapshot` porte désormais des `metadata` publiques facultatives, afin que les agents puissent exposer un contexte métier au niveau du case, comme des liens d'entretien avec un contact, sans ajouter de champs propres à un agent au protocole.
- **Validation de la prise de contact d'enregistrement Studio** — Après `server.register`, le démarrage valide `supervaizer_handshake.controller_api_key_match` et échoue lorsque Studio a conservé une clé d'API de contrôleur différente de celle que ce processus utilise (`SUPERVAIZER_API_KEY` configurée ou clé générée automatiquement).
- **Stabilité de la clé d'API du contrôleur au rechargement** — Les clés de contrôleur générées automatiquement sont écrites dans `SUPERVAIZER_API_KEY` avant l'enregistrement, afin que le rechargement d'Uvicorn conserve la même clé ; le démarrage journalise une courte empreinte SHA-256 au lieu d'afficher le secret en entier.

### Tests

- `tests/test_contracts.py` — `V2CaseSnapshot` accepte des `metadata` publiques.
- `tests/test_server.py` — chemins d'acceptation et de rejet de la prise de contact d'enregistrement et export de la clé d'API générée pour le rechargement.

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 645    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 77s    |

## [1.0.0] - 2026-05-17

### Supervaizer v2 2️⃣

- **Documentation Supervaizer v2** — Ajout de `docs/2026_05_SUPERVAIZER_v2.md` et mise à jour du README et de la documentation des protocoles pour expliquer la superposition A2A/A2UI de la v2, le modèle d'enregistrement, les ressources, les jeux de données, les surfaces, les actions, la validation humaine, les artefacts et la sémantique de convergence de `job.sync`.
- **README Supervaizer v2** — Le README du dépôt est retravaillé en guide d'accueil centré sur la v2, avec des liens vers la documentation des protocoles et l'exemple Hello World, et sans l'ancien parcours de démarrage rapide v1 par scaffold et champs de job.
- **Primitives du contrat Supervaizer v2** — Ajout de modèles typés du SDK pour le contrat d'enregistrement et d'action v2, notamment les versions A2UI/A2A épinglées, les ressources, les jeux de données, les couloirs de case, les déclarations d'artefacts, les instantanés de job, les métadonnées de synchronisation et les métadonnées de sûreté du rejeu.
- **Exécution des actions JSON-RPC A2A** — Ajout du répartiteur `supervaizer/action.invoke` sur `/a2a`, des charges utiles d'extension de la fiche d'agent v2 et des utilitaires publics du SDK pour enregistrer des actions v2 typées via `Server.register_v2_action()` et `@server.v2_action(...)`.
- **Flux d'événements SSE A2A** — Ajout de `/a2a/events` et d'un bus d'événements v2 en processus, afin que les effets d'action renvoyés par `supervaizer/action.invoke` puissent aussi être observés via les Server-Sent Events.
- **Transparence du transport Supervaizer v2** — `V2A2ATransport.push_notifications` vaut désormais `false` par défaut ; le MVP n'annonce que la prise en charge de JSON-RPC et de SSE tant que les notifications push A2A ne sont pas implémentées.
- **Exécution des surfaces JSON-RPC A2A** — Ajout de `supervaizer/surface.load`, des modèles typés `V2SurfaceRequest`/`V2SurfaceResult` et d'utilitaires publics du SDK pour enregistrer des gestionnaires de surface A2UI via `Server.register_v2_surface()` et `@server.v2_surface(...)`.
- **Garde d'identité d'agent Supervaizer v2** — `Agent` rejette désormais les charges utiles d'enregistrement v2 dont le `agent.slug` déclaré diffère du slug du SDK à l'exécution, ce qui empêche les gestionnaires d'actions A2A de s'enregistrer sous un slug alors que Studio en invoque un autre.
- **État de synchronisation de job Supervaizer v2** — `V2JobSyncResult` porte désormais un instantané `job_state` facultatif, afin que les agents puissent renvoyer un état convergent de Job/Case/étape/Artefact via `job.sync`.
- **Métadonnées de cible de source de job Supervaizer v2** — `V2JobSource` comprend désormais un `target_type` facultatif, afin que les sources externes puissent déclarer l'objet métier que Studio doit utiliser pour la déduplication et le rattrapage.
- **Champs de formulaire de ressource Supervaizer v2** — `V2ResourceDefinition` porte désormais des métadonnées `fields` typées, afin que Studio puisse afficher des formulaires simples de création/modification de ressources détenues par l'agent sans logique de champs dynamiques par rappel.
- **Documents ResourceImport Supervaizer v2** — Ajout d'un contrat typé de document A2UI `ResourceImport`, afin que les agents puissent déclarer des formats d'import, des champs contextuels, des colonnes de ligne et des actions de soumission sans ajouter de champs de protocole propres à un agent.
- **Sources d'options de ressource Supervaizer v2** — Les champs de ressource peuvent désormais déclarer des métadonnées `options_source` typées adossées à une ressource, afin que Studio puisse afficher des sélecteurs de relation sans choix dynamiques par rappel.
- **Ressources de portée espace de travail Supervaizer v2** — Les déclarations de ressources annoncent désormais les métadonnées `scope` et `requires_context`, et les informations d'enregistrement DataResource historiques portent la même exigence de contexte d'espace de travail pour le contrôle d'accès côté Studio.
- **Métadonnées d'affichage des jeux de données Supervaizer v2** — `V2DatasetDefinition` porte désormais des colonnes d'affichage typées, afin que Studio puisse afficher des surfaces de jeu de données génériques à partir du contrat d'enregistrement.
- **Widgets de tableau de bord Supervaizer v2** — Ajout de contrats génériques d'enregistrement de tableaux de bord et de widgets, notamment des références de données de jeu de données, d'action ou en ligne et des spécifications de widgets Vega-Lite sous `visualization: { type: "vega-lite", spec: ... }`, sans routes REST AnalyticsResource.
- **Documentation de la revue de validation humaine montée Supervaizer v2** — Documentation de `DocumentReview` comme charge utile de document A2UI générique pour les surfaces d'étape d'attente montées, sans ajouter de champs de protocole propres à un agent.
- **Constructeur d'enregistrement Supervaizer v2** — Ajout de `build_v2_agent_registration()` pour déduire des charges utiles d'enregistrement v2 validées à partir des primitives publiques du SDK, y compris les surfaces et actions de ressource/jeu de données générées.
- **Ergonomie du SDK public Supervaizer v2** — Export des autres modèles utilitaires d'enregistrement v2 depuis `supervaizer` et neutralisation des exemples propres à un agent dans la documentation publique v2 et les descriptions de contrat.
- **Choix dynamiques hérités supprimés** — Suppression des métadonnées de champ v1 `dynamic_choices`, de `dynamic_choices_callback`, de la route `/start/dynamic_choices` et des exports de contrat associés ; les options dynamiques relèvent désormais des métadonnées `options_source` des ressources v2 ou d'actions A2A typées.
- **Interrogation de job héritée supprimée** — Suppression de `job_poll` du contrat public des méthodes v1 et de la route/du bouton d'interrogation du workbench local ; la convergence de statut v2 est représentée par l'action typée `job.sync`.
- **Champs de formulaire d'attente Supervaizer v2** — L'état d'attente d'une étape peut désormais déclarer des champs de formulaire typés, afin que Studio puisse soumettre des actions de validation humaine via `step.awaiting.submit`.
- **Contrat Hello World v2 local** — L'agent Hello World local intégré déclare désormais un enregistrement Supervaizer v2 minimal via le constructeur du SDK et enregistre `job.start`, `job.sync`, `case.step.awaiting` et un gestionnaire de ressource généré, pour les tests de fumée locaux de Studio et du SDK.
- **Corrections de justesse du contrôleur** — `Jobs.get_job(..., agent_name=...)` est limité à l'agent demandé, `EventType.AGENT_SEND_ANOMALY` reçoit une valeur distincte, et les routes de méthodes personnalisées analysent désormais correctement les corps de requête JSON ordinaires.
- **Durcissement de l'exécution Supervaizer v2** — Ajout de champs communs typés aux effets d'action v2 (compteurs d'import de ressources, lignes, erreurs, lacunes, synthèses et instantanés de case) ; validation de `job_state` sur les résultats d'action ; authentification du contrôleur JSON-RPC A2A et du flux d'événements SSE tout en gardant publiques la découverte et la santé A2A ; assainissement des erreurs des gestionnaires A2A ; et restriction de l'exécution des méthodes héritées aux chemins de méthode déclarés et non bloqués.
- **Contrats de rejeu et de contexte Supervaizer v2** — Les résultats d'action valident et sérialisent désormais les métadonnées de sûreté du rejeu, et la génération des en-têtes de contexte DataResource inclut le slug d'agent annoncé par le modèle de contrat.

### Tests

- `uv run pytest tests/test_a2a.py tests/test_contracts.py -q`

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 601    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 69s    |

## [0.20.1] - 2026-05-13

### Sécurité {#security}

- **`uv.lock`** — Versions transitives actualisées pour traiter les avis Dependabot / GHSA ouverts sur le graphe de la branche par défaut : **urllib3** (redirections et chaînes de décompression), **requests** (réutilisation temporaire de `extract_zipped_paths`), **protobuf** (profondeur de récursion JSON), **pyasn1** (déni de service du décodeur / récursion), **pygments** (ReDoS dans l'analyseur lexical GUID) et **uv** (traitement des ZIP / tar / RECORD ; dépendance de développement via hatch).

## [0.20.0] - 2026-05-13

### Sécurité {#security-1}

- **Analyse des secrets + protection des poussées** — activées sur le dépôt ; les identifiants poussés par erreur sont désormais bloqués à la source.
- **Alertes Dependabot + mises à jour de sécurité automatiques** — activées ; les mises à jour de dépendances corrigeant des CVE connues sont désormais proposées automatiquement.
- **Signalement privé des vulnérabilités** — activé ; les chercheurs peuvent signaler des problèmes en privé via les GitHub Security Advisories plutôt que par des tickets publics.
- **Ruleset de branche sur `main`** — remplace la protection de branche classique ; exige que tous les contrôles CI (`pre-commit`, `build 3.10–3.13`) réussissent avant la fusion, y compris pour les administrateurs. La protection classique n'exigeait aucun contrôle et ne s'appliquait pas aux administrateurs.
- **Ruleset d'étiquettes** — les étiquettes de publication `v*` sont désormais immuables ; elles ne peuvent ni être déplacées ni être supprimées.
- **Protection de l'environnement `pypi`** — approbation obligatoire d'un relecteur ajoutée ; une poussée sur `main` ne publie plus sur PyPI sans validation humaine.
- **GitHub Actions épinglées par SHA** — toutes les actions tierces sont épinglées sur des SHA de commit (`trufflehog`, `setup-uv`, `gh-action-pypi-publish`, `action-gh-release`). Auparavant, `trufflesecurity/trufflehog@main` était une référence de branche flottante — un risque critique pour la chaîne d'approvisionnement.
- **`uv sync --frozen`** — imposé dans la CI ; le fichier de verrouillage ne peut plus changer silencieusement pendant une construction.
- **OSV-Scanner** (`google/osv-scanner-action`) — ajouté comme analyse quotidienne planifiée et sur chaque PR visant `main` ou `develop`, par rapport à l'index des paquets malveillants d'OSV.dev.
- **Configuration de Dependabot** (`.github/dependabot.yml`) — mises à jour hebdomadaires pour les écosystèmes `pip` et `github-actions` avec une fenêtre de délai de 5 jours pour atténuer les attaques de vers sur la chaîne d'approvisionnement ; toutes les PR sont dirigées vers `develop`.
- **`SECURITY.md`** — ajouté ; documente le processus de divulgation responsable (avis privés GitHub) et la posture du dépôt en matière de chaîne d'approvisionnement.
- **Règles de sécurité d'`AGENTS.md`** — règles obligatoires ajoutées pour les agents de code : aucune poussée directe sur `main`, aucune modification manuelle du fichier de verrouillage, aucune modification de workflow sans approbation, aucun `hatch publish` en local.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 570    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 69s    |

## [0.19.0] - 2026-05-11

### Ajouté {#added-9}

- **Métadonnées de délai d'expiration des méthodes d'agent** — `AgentMethod` et le contrat d'enregistrement exposent désormais les métadonnées `is_async` et `timeout` pour Studio. `timeout` vaut 600 secondes par défaut et peut être `null` pour les jobs de contrôleur qui doivent s'exécuter jusqu'à ce que Studio les arrête manuellement.

### Modifié {#changed-9}

- **`pyproject.toml` (depuis la v0.18.0)** — Bornes inférieures d'exécution : FastAPI, orjson, packaging, Pydantic, python-slugify, Rich, sse-starlette, TinyDB, Typer, Uvicorn. **Extra `deploy` :** boto3 et bibliothèques Google Cloud (Artifact Registry, Cloud Run, Secret Manager). **Extra `dev` :** ajout de `boto3`, `docker` et `black` pour que `uv sync --extra dev` corresponde aux tests lourds de déploiement/docker et à Black dans la CI ; ajout de `yamllint` ; mise à jour de mypy, pre-commit, pytest, respx, ruff. **`[tool.black]` :** configuration Black explicite (longueur de ligne 88, cibles Python 3.12–3.13, exclusions pour les caches/venv/dist).

### Tests

- `uv run pytest tests/test_agent.py tests/test_contracts.py`

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 570    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 69s    |

## [0.18.0] - 2026-05-04

## [0.17.3] - 2026-05-04

### Ajouté {#added-10}

- **`POST /api/supervaizer/registration/refresh`** — Ajoute un point de terminaison de contrôleur authentifié qui permet à Studio de demander un nouvel enregistrement asynchrone. La route exige un accès par clé d'API à portée d'écriture, réutilise le flux d'enregistrement existant du compte superviseur et est annoncée dans le contrat du contrôleur sous le nom `Controller.POST_CONTROLLER_REGISTRATION_REFRESH`.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 564    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 69s    |

## [0.17.2] - 2026-05-03

### Ajouté {#added-11}

- **`POST /api/supervaizer/agents/{agent_slug}/status`** — Le contrat du contrôleur ajoute `Controller.POST_AGENT_STATUS` ; le gestionnaire HTTP renvoie le résultat de `job_status` de l'agent sous forme de `JobResponse` (identifiant de job, statut, message, charge utile). OpenAPI liste explicitement les réponses 200 (`JobResponse`) et d'erreur (`ErrorResponse` pour 400/404/500). Renvoie **404** lorsque `job_status` ne produit aucun résultat.

### Modifié {#changed-10}

- **`routes.py` — hooks d'agent synchrones hors de la boucle d'événements** — `job_stop`, `job_status` et le `dynamic_choices_callback` du flux de démarrage s'exécutent dans `asyncio.to_thread`, afin que le code d'agent synchrone bloquant ne fige pas le serveur asynchrone.
- **`routes.py` / OpenAPI** — La charge utile de succès de `POST /status` de l'agent est un `JobResponse` avec un HTTP 200 explicite (à la place de la fusion de forme `AgentResponse` précédente).
- **`case.py` — journalisation** — Les journaux courants des méthodes de case passent d'INFO à DEBUG pour réduire le bruit en fonctionnement normal.
- **`agent.py` — docstrings** — `Agent._execute`, `job_stop` et `job_status` documentent le comportement des hooks synchrones et le fait que le contrôleur les invoque depuis un thread de travail.
- **`AGENTS.md` / hygiène du dépôt** — Suppression du fichier généré `AGENTS.compiled.md` ; le guide d'agent de Supervaizer dans le dépôt est regroupé dans `AGENTS.md`.
- **`publish-pypi.yml` — automatisation de la publication après PyPI** — Après la publication sur PyPI, la CI exécute désormais le même flux de publication GitHub que `just gh-release` (`tools/gh-release-latest-tag.sh`) pour créer ou mettre à jour la dernière publication et la marquer comme telle à partir de l'étiquette la plus récente de `origin/main`.
- **`publish-pypi.yml` — réconciliation des branches dans la CI** — Ajout d'une étape automatique de fusion retour `main -> develop` après la publication, afin que l'historique des branches de longue durée reste synchronisé sans suivi manuel.

### Corrigé {#fixed-7}

- **Avertissements de dépréciation de Node 20 dans GitHub Actions** — Passage des actions de workflow à de nouvelles versions majeures dans les pipelines CI, de publication et de livraison : `actions/checkout@v5`, `actions/setup-python@v6` et `astral-sh/setup-uv@v7`, pour éviter les avertissements de dépréciation de l'environnement Node 20 et s'aligner sur la transition vers Node 24.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 560    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 69s    |

## [0.17.1] - 2026-04-26

### Corrigé {#fixed-8}

- **`server.py` — migration du lifespan de démarrage** — Remplacement de `@app.on_event("startup")`, devenu obsolète, par un lifespan `asynccontextmanager` transmis à `FastAPI(lifespan=...)`. Supprime le `DeprecationWarning` de FastAPI 0.100+.
- **`account_service.py` — robustesse d'atexit** — `close_httpx_client_sync` protège désormais l'appel à `aclose()` par `getattr(_httpx_client, "aclose", None)`, afin d'éviter un `AttributeError` lorsque le client de niveau module est un `httpx.Client` synchrone dans des environnements installés plus anciens.

### Tests

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 559    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 74s    |

## [0.17.0] - 2026-04-26

### Modifié {#changed-11}

- **Client HTTP asynchrone pour les événements de contrôle** — `account_service.send_event`, les utilitaires d'événements de `Account` et les méthodes de signalement d'événements de case utilisent désormais `httpx.AsyncClient` et doivent être attendus (`await`) dans les agents asynchrones. Des adaptateurs `_sync` explicites subsistent pour la CLI, le démarrage et les méthodes de contrôleur synchrones. Voir [RFC-002](https://github.com/supervaize/supervaizer/blob/main/docs/rfc/2026_04_002-async-http-client.md) pour le détail.

### Tests

`just test`

| Statut        | Nombre |
| ------------- | ------ |
| ✅ Réussis    | 559    |
| 🤔 Ignorés    | 0      |
| 🔴 Échoués    | 0      |
| ⏱️ en         |        |
| ⏱️ avec couv. | 102s   |

### Couverture {#coverage}

| Nom                                               | Instr. | Manq. | Couv. |
| ------------------------------------------------- | ----- | ---- | ----- |
| src/supervaizer/**init**.py                       | 23    | 3    | 87%   |
| src/supervaizer/**version**.py                    | 3     | 0    | 100%  |
| src/supervaizer/access/**init**.py                | 4     | 0    | 100%  |
| src/supervaizer/access/api_auth.py                | 38    | 1    | 97%   |
| src/supervaizer/access/client_ip.py               | 37    | 7    | 81%   |
| src/supervaizer/access/tailscale.py               | 23    | 2    | 91%   |
| src/supervaizer/account.py                        | 122   | 15   | 88%   |
| src/supervaizer/account_service.py                | 80    | 2    | 98%   |
| src/supervaizer/admin/routes.py                   | 549   | 190  | 65%   |
| src/supervaizer/admin/workbench_routes.py         | 380   | 256  | 33%   |
| src/supervaizer/agent.py                          | 354   | 80   | 77%   |
| src/supervaizer/case.py                           | 267   | 64   | 76%   |
| src/supervaizer/cli.py                            | 210   | 75   | 64%   |
| src/supervaizer/common.py                         | 142   | 4    | 97%   |
| src/supervaizer/contracts.py                      | 168   | 3    | 98%   |
| src/supervaizer/data_resource.py                  | 70    | 0    | 100%  |
| src/supervaizer/data_routes.py                    | 98    | 21   | 79%   |
| src/supervaizer/deploy/**init**.py                | 2     | 0    | 100%  |
| src/supervaizer/deploy/cli.py                     | 104   | 46   | 56%   |
| src/supervaizer/deploy/commands/**init**.py       | 2     | 0    | 100%  |
| src/supervaizer/deploy/commands/clean.py          | 158   | 17   | 89%   |
| src/supervaizer/deploy/commands/down.py           | 61    | 12   | 80%   |
| src/supervaizer/deploy/commands/local.py          | 214   | 15   | 93%   |
| src/supervaizer/deploy/commands/plan.py           | 75    | 7    | 91%   |
| src/supervaizer/deploy/commands/status.py         | 100   | 41   | 59%   |
| src/supervaizer/deploy/commands/up.py             | 113   | 8    | 93%   |
| src/supervaizer/deploy/docker.py                  | 186   | 23   | 88%   |
| src/supervaizer/deploy/driver_factory.py          | 20    | 0    | 100%  |
| src/supervaizer/deploy/drivers/**init**.py        | 13    | 4    | 69%   |
| src/supervaizer/deploy/drivers/aws_app_runner.py  | 221   | 157  | 29%   |
| src/supervaizer/deploy/drivers/base.py            | 82    | 8    | 90%   |
| src/supervaizer/deploy/drivers/cloud_run.py       | 205   | 125  | 39%   |
| src/supervaizer/deploy/drivers/do_app_platform.py | 164   | 125  | 24%   |
| src/supervaizer/deploy/health.py                  | 161   | 12   | 93%   |
| src/supervaizer/deploy/state.py                   | 115   | 9    | 92%   |
| src/supervaizer/deploy/utils.py                   | 24    | 0    | 100%  |
| src/supervaizer/event.py                          | 40    | 1    | 98%   |
| src/supervaizer/examples/local_server.py          | 17    | 3    | 82%   |
| src/supervaizer/instructions.py                   | 56    | 1    | 98%   |
| src/supervaizer/job.py                            | 166   | 28   | 83%   |
| src/supervaizer/job_service.py                    | 34    | 0    | 100%  |
| src/supervaizer/lifecycle.py                      | 153   | 3    | 98%   |
| src/supervaizer/parameter.py                      | 79    | 7    | 91%   |
| src/supervaizer/protocol/**init**.py              | 2     | 0    | 100%  |
| src/supervaizer/protocol/a2a/**init**.py          | 3     | 0    | 100%  |
| src/supervaizer/protocol/a2a/model.py             | 37    | 5    | 86%   |
| src/supervaizer/protocol/a2a/routes.py            | 35    | 3    | 91%   |
| src/supervaizer/routers/**init**.py               | 4     | 0    | 100%  |
| src/supervaizer/routers/api.py                    | 18    | 1    | 94%   |
| src/supervaizer/routers/private.py                | 10    | 0    | 100%  |
| src/supervaizer/routers/public.py                 | 22    | 5    | 77%   |
| src/supervaizer/routes.py                         | 333   | 60   | 82%   |
| src/supervaizer/server.py                         | 282   | 84   | 70%   |
| src/supervaizer/server_utils.py                   | 25    | 0    | 100%  |
| src/supervaizer/storage.py                        | 160   | 12   | 92%   |
| src/supervaizer/telemetry.py                      | 40    | 0    | 100%  |
| src/supervaizer/utils/**init**.py                 | 2     | 0    | 100%  |
| src/supervaizer/utils/version_check.py            | 27    | 6    | 78%   |
| ------------------------------------------------- | ----- | ---- | ----- |
| TOTAL                                             | 6133  | 1551 | 75%   |

## [0.16.0] - 2026-04-25

### Ajouté {#added-12}

- **Métadonnées du contrat de contrôleur pour Studio** — `server.register` annonce désormais `controller_contract_version`, le chemin de base `/api` et des modèles de points de terminaison canoniques, afin que Studio puisse router sans chemins Supervaizer codés en dur. Le même contrat est disponible à `GET /api/supervaizer/contract`.
- **Contexte de requête DataResource** — Les rappels DataResource peuvent adopter un argument nommé `context` contenant les identifiants d'espace de travail, de mission, d'agent et de requête, tandis que les rappels historiques continuent de fonctionner sans changement.
- **Utilitaires de mise à jour de CaseNodes** — `CaseNodes.node_index()` et `CaseNodes.make_update()` déduisent les index d'étape de l'ensemble de nœuds déclaré, au lieu d'obliger les consommateurs à tenir une table d'index distincte.

### Modifié {#changed-12}

- **Les champs DataResource peuvent être marqués comme sensibles** — `DataResourceField.sensitive` est inclus dans les charges utiles d'enregistrement pour le masquage côté Studio.

### Tests

- Nouveau : `tests/test_contracts.py` pour les modèles de points de terminaison du contrat, l'export du schéma, la sûreté des imports, le comportement du résolveur et les en-têtes de contexte DataResource.
- Nouveau : couverture de `tests/test_case.py` pour `CaseNodes.node_index()` et `CaseNodes.make_update()`.
- Mis à jour : `tests/test_routes.py` pour vérifier que les rappels DataResource reçoivent un `DataResourceContext` issu des en-têtes `X-Supervaize-*` transmis.
- Mis à jour : `tests/test_server.py` pour vérifier que les informations d'enregistrement et `/api/supervaizer/contract` exposent des métadonnées de contrat `/api` identiques.
- Supprimé : aucun.

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 514    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 01:03  |

## [0.15.1] - 2026-04-20

### Corrigé {#fixed-9}

- **Compatibilité de `TemplateResponse` avec Starlette 0.50** — `routers/public.py` et `routes.py` utilisent désormais la nouvelle API `TemplateResponse(request, name, context)`. L'ancienne forme à deux arguments `TemplateResponse(name, context)` a été supprimée dans Starlette 0.50.0, ce qui provoquait un plantage `TypeError: unhashable type: 'dict'` à chaque requête `GET /`.

## [0.15.0] - 2026-04-20

### Ajouté {#added-13}

- **Module `supervaizer.access`** — Nouveau paquet avec trois sous-modules ciblés pour un contrôle d'accès centralisé :
  - `client_ip.py` — `_extract_client_ip(scope)` extrait l'adresse IP réelle du client à partir du scope ASGI, en respectant `TRUSTED_PROXIES` (variable d'environnement, CIDR séparés par des virgules) pour analyser `X-Forwarded-For` en toute sécurité ; renvoie `""` en cas d'erreur d'analyse (échec fermé).
  - `tailscale.py` — la dépendance FastAPI `require_tailscale` impose que les requêtes proviennent de la plage CGNAT Tailscale `100.64.0.0/10` ; lève une erreur HTTP 403 ou `WebSocketException(1008)` en cas de refus ; journalise via `log_access_denied_tailscale`.
  - `api_auth.py` — les dépendances FastAPI `require_api_key` / `require_scope` pour l'authentification machine à machine avec un modèle de portées hiérarchique (`write` implique `read`). Le registre `API_KEYS` est vide par défaut ; la variable d'environnement `SUPERVAIZER_API_KEY` est préchargée comme entrée de portée `write` à l'import.

- **Module `supervaizer.routers`** — Trois fabriques de routeurs qui remplacent les appels `Security(...)` dispersés route par route :
  - `public_router` — surface sans authentification pour la page d'accueil (`/`) et la découverte A2A (`/.well-known/*`).
  - `private_router` (préfixe `/manage`) — interface d'administration et WebSocket du workbench, protégés par `require_tailscale` au niveau du routeur.
  - `api_router` (préfixe `/api`) — surface machine à machine (`/api/supervaizer/…`, `/api/agents/{slug}/…`), protégée par `require_api_key` ; les points de terminaison qui modifient des données appliquent en plus `require_scope("write")`.

- **Utilitaires `log_access_denied_tailscale` et `log_access_denied_api`** dans `supervaizer.common` — entrées de journal `WARNING` structurées pour chaque requête refusée, avec l'IP, le chemin, la raison et un aperçu tronqué de la clé (jamais la valeur brute de la clé).

### Modifié {#changed-13}

- **Interface d'administration déplacée de `/admin` vers `/manage`** — Toutes les routes d'administration, le workbench et les liens des modèles HTML sont mis à jour. `private_router` (préfixe `/manage`) protège la surface par un accès réservé à Tailscale au lieu de l'ancienne combinaison `AdminIPAllowlistMiddleware` + clé d'API.

- **Routes d'API déplacées de `/supervaizer/…` vers `/api/supervaizer/…`** — Tous les points de terminaison machine à machine se trouvent désormais sous le préfixe `/api` fourni par `api_router`. Les clients doivent mettre à jour leurs chemins de base en conséquence.

- **`AdminIPAllowlistMiddleware` supprimé** — Remplacé par `require_tailscale` au niveau du routeur. Le module `admin/ip_allowlist.py` est supprimé.

- **`Security(server.verify_api_key)` par route supprimé** de `routes.py` et `data_routes.py` — L'authentification est désormais appliquée une seule fois au niveau de `api_router`.

- **Authentification d'administration simplifiée, réservée à Tailscale** — `verify_admin_access`, la gestion du paramètre de requête `?key=` et la génération/validation du jeton de console sont supprimés de `admin/routes.py` et `admin/workbench_routes.py`.

### Sécurité {#security-2}

- **Clés d'API par défaut codées en dur supprimées** — `API_KEYS` est désormais vide au démarrage ; aucun identifiant n'est livré avec le paquet. Seule `SUPERVAIZER_API_KEY` (variable d'environnement fournie par l'opérateur) alimente le registre.

### Tests

- Nouveau : `tests/test_access_client_ip.py`, `tests/test_access_tailscale.py`, `tests/test_access_api_auth.py` couvrant la nouvelle couche d'accès.
- Mis à jour : `test_routes.py`, `test_routes_case_update.py`, `test_data_resource.py` — chemins préfixés par `/api`.
- Mis à jour : `test_admin_routes.py`, `test_workbench_routes.py` — préfixe `/admin` → `/manage` ; la barrière Tailscale est contournée via `dependency_overrides`.
- Supprimé : `test_admin_ip_allowlist.py` — la couverture est passée aux nouveaux tests d'accès.

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 505    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 01:07  |

## [0.14.2] - 2026-04-16

### Ajouté {#added-14}

- **Montage automatique des routes de ressources de données au démarrage** — `Server` monte désormais les routeurs CRUD générés pour tout agent qui déclare `data_resources`, de sorte que les points de terminaison sont disponibles dès le démarrage du serveur, sans câblage manuel supplémentaire.

### Corrigé {#fixed-10}

- **`DataResource.registration_info` inclut désormais un `display_label` calculé pour chaque champ** — Les charges utiles des champs de ressource envoyées à Studio exposent désormais les libellés résolus (`display_label`) au lieu des seuls exports bruts du modèle, ce qui garantit des noms de champs corrects dans l'interface.

- **`JobStartConfirmationEvent` est émis une fois les métadonnées d'exécution de `job_start` disponibles** — L'événement de confirmation est désormais envoyé après le remplissage de `job.metadata` à partir de la charge utile de réponse de `job_start`, afin que Studio reçoive des métadonnées complètes dans l'événement de confirmation de démarrage.

### Résultats des tests unitaires {#unit-tests-results}

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 500    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | ~70s   |

## [0.14.1] - 2026-04-15

## [0.14.0] - 2026-04-14

### Ajouté {#added-15}

- **Classe `DataResource`** — Déclare des points de terminaison CRUD détenus par l'agent et exposés à Studio, avec `name`, `entity_type`, `description`, `operations` (liste d'opérations CRUD), et les indicateurs `importable` (prise en charge de l'import en masse) et `deletable`.

- **Classe `DataResourceField`** — Décrit le schéma d'un champ avec les attributs `name`, `type`, `description`, `editable` et `visible`, pour un affichage validé dans les formulaires Studio.

- **Énumération `FieldType`** — Types de champ validés : `STRING`, `INTEGER`, `BOOLEAN`, `DATE`, `DATETIME`, `TEXT`, `EMAIL`, `URL`, pour un traitement cohérent des données entre les agents et Studio.

- **Énumération `Editable`** — Contrôle le comportement des formulaires Studio pour chaque champ : `ALWAYS` (modifiable dans tous les formulaires), `CREATE_ONLY` (modifiable uniquement à la création), `NEVER` (affichage en lecture seule).

- **`metadata: dict` sur `AbstractJob` et `CaseAbstractModel`** — Des métadonnées arbitraires transitent par `registration_info` jusqu'à Studio, ce qui permet aux agents d'attacher aux jobs et aux cases un contexte et des données de suivi personnalisés.

- **`data_resources: list[DataResource]` sur `Agent`** — Inclus dans `registration_info` pour que Studio découvre et affiche les interfaces CRUD des données gérées par l'agent.

- **Routes CRUD FastAPI générées automatiquement** — Pour chaque opération `DataResource` déclarée, Supervaizer monte automatiquement des routes (GET, POST, PATCH, DELETE) à `/agents/{slug}/data/{resource}/...`.

- **Route d'import en masse** — Lorsque `importable=True` sur une `DataResource`, une route `POST /data/{resource}/import/` accepte du CSV ou du JSON pour une création par lot, ce qui permet à Studio de charger des données en masse.

### Résultats des tests unitaires {#unit-tests-results-1}

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 492    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | ~70s   |

## [0.13.3] 2026-04-14

### Ajouté {#added-16}

- **`CaseNodeUpdate.upsert` et `Case.patch_step`** — Chemin facultatif de mise à jour d'étape pour Studio : lorsque `upsert` vaut true, l'étape de case existante au même index est mise à jour au lieu d'être ajoutée. `Case.patch_step(index, update)` définit `index` et `upsert` sur la mise à jour, envoie `send_update_case` et remplace l'entrée correspondante dans `Case.updates`. Sérialisé dans `CaseNodeUpdate.registration_info` pour la charge utile du contrôleur.

- **Réponse humaine avec `casestep_index`** — `POST /jobs/{job_id}/cases/{case_id}/update` : si `request.answer` inclut `casestep_index`, le contrôleur appelle `case.patch_step(int(casestep_index), update)` et exécute `PersistentEntityLifecycle.handle_event(..., INPUT_RECEIVED)` au lieu de `receive_human_input`. Omettez `casestep_index` pour retrouver le comportement précédent d'ajout / de réception de saisie humaine.

- **Tests** — `tests/test_routes_case_update.py` couvre le 404 d'un job, les paramètres `human_answer` de type workbench (y compris `casestep_index` retiré de `fields`), un seul agent propriétaire face à plusieurs agents, et l'ignorance lorsque `job.agent_name` ne figure pas sur le serveur.

### Modifié {#changed-14}

- **Contexte de requête des choix dynamiques** — `POST .../start/dynamic_choices` transmet désormais `workspace_slug` à `dynamic_choices_callback`, en plus de `workspace_id` et `mission_id` (Supervaize Studio l'envoie dans le corps JSON).

- **`POST /jobs/{job_id}/cases/{case_id}/update` (human_answer)** — Résout le job d'abord avec `Jobs().get_job` en mémoire, puis avec la version persistée (`include_persisted=True`) s'il manque. Renvoie **404** lorsque le job n'existe pas. N'envoie `human_answer` qu'au propriétaire du job via `server.get_agent_by_name(job.agent_name)` et `agent._execute(...)`, avec la même forme de paramètres que la route de validation humaine du workbench (`fields`, `context`, `payload`, `job_id`, `case_id`, `message` facultatif). Retire `casestep_index` de `fields` pour le hook. Exécute le hook dans un pool de threads pour ne pas bloquer la boucle d'événements.

### Résultats des tests unitaires {#unit-tests-results-2}

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 473    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | ~70s   |

## [0.13.1]

### Ajouté {#added-17}

- **`ADMIN_ALLOWED_IPS` pour l'interface d'administration** — Lorsqu'elle est définie, seules les adresses IP de client correspondantes peuvent accéder à `/admin` (HTML, API, fichiers statiques, WebSocket). Adresses IP séparées par des virgules et notation CIDR facultative ; vide ou non définie, elle autorise tout le monde. Utilise la première adresse de `X-Forwarded-For` lorsqu'elle est présente.
- **Choix dynamiques pour `AgentMethodField`** — Les champs peuvent désormais utiliser `dynamic_choices` au lieu de `choices` statiques pour résoudre les options à l'exécution via un rappel. Ajoutez un appelable `dynamic_choices_callback` (signature : `(method_name: str, context: dict) -> dict[str, list[tuple[str, str]]]`) au constructeur de `Agent` et une clé `dynamic_choices` à votre `AgentMethodField`. Supervaize Studio récupère les choix auprès du nouveau point de terminaison `POST /supervaizer/agents/{slug}/start/dynamic_choices` (avec `workspace_id`, `workspace_slug` et `mission_id` dans le corps de la requête) lors de l'affichage du formulaire de lancement du job. `choices` statiques et `dynamic_choices` s'excluent mutuellement sur un champ. Voir le [guide des choix dynamiques](https://docs.runwaize.com/docs/supervaizer-controller/dynamic-choices).

### Résultats des tests unitaires {#unit-tests-results-3}

`just test`

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 464    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 65s    |

## [0.12.0]

### Ajouté {#added-18}

- **Routes personnalisées** — Les agents peuvent monter leur propre `APIRouter` FastAPI via le nouveau champ `custom_routes` de `Agent`. Supervaizer les monte sous le routeur d'API à `/api/agents/{slug}/...` (les chemins définis sur le routeur imbriqué s'ajoutent après ce préfixe) sans inspecter ni gérer les routes. Permet aux agents d'exposer des points de terminaison d'outils, des webhooks ou n'importe quelle API HTTP à côté du workbench.

- **Étapes planifiées** — `CaseNodeUpdate` gagne les champs `scheduled_at`, `scheduled_method`, `scheduled_params` et `scheduled_status`. Les étapes avec `scheduled_at` sont différées jusqu'à l'heure prévue. Un exécuteur d'arrière-plan interroge toutes les 60 secondes et appelle automatiquement la méthode de l'agent. Le workbench affiche un compte à rebours et les commandes « Execute now » et « Cancel » sur les étapes planifiées en attente. Permet une orchestration temporelle (planification d'appels, nouvelles tentatives avec temporisation croissante, actions de suivi).
  - Modèle : `CaseNodeUpdate.scheduled_at / scheduled_method / scheduled_params / scheduled_status`
  - Propriété : `CaseNodeUpdate.is_scheduled` renvoie `True` lorsque `scheduled_at` est défini
  - Exécuteur : `_run_scheduled_step_loop` — tâche asyncio d'arrière-plan, interrogation toutes les 60 s
  - Routes : `POST .../execute`, `POST .../cancel`, `PATCH .../schedule` pour la gestion des étapes
  - Interface : badges de statut (pending/executing/completed/failed/cancelled), boutons execute now / cancel
  - `Case.cancel_scheduled_steps()` — annule toutes les étapes en attente à l'arrêt du job
  - `Cases.get_due_scheduled_steps()` — renvoie les étapes dont `scheduled_at <= now()` et dont le statut est `pending`

- **Export de `AgentResponse`** — `AgentResponse` est désormais exporté depuis `supervaizer.__init__` pour servir de modèle de réponse typé dans les routes personnalisées et les points de terminaison d'agent.

### Corrigé {#fixed-11}

- **OpenAPI / JSON Schema (Pydantic 2.12+)** — La construction du schéma FastAPI complet (`GET /openapi.json`, Swagger UI) pouvait lever `PydanticInvalidForJsonSchema: … CallableSchema`. Trois causes racines corrigées :
  - `AgentMethodAbstract.model_config["example_dict"]` utilisait `"type": str` (type natif Python) — remplacé par la chaîne `"str"`
  - les schémas imbriqués de `AgentResponse` n'étaient pas reconstruits après les modèles dont ils dépendent — ajout de `AgentResponse.model_rebuild()` après `Case.model_rebuild()` dans `supervaizer/__init__.py`
  - `CaseNode.factory` était typé `Callable`, qui ne peut pas figurer dans un JSON Schema — remplacé par `Any` (comportement inchangé)

## [0.11.0]

- **Mécanisme d'interrogation de job (Job Poll)** — Nouvelle méthode facultative `job_poll` dans `AgentMethods` pour l'interrogation manuelle de services externes. Lorsqu'elle est définie, le workbench affiche un bouton « Check for updates » sur les jobs actifs. Un clic appelle le gestionnaire d'interrogation de l'agent, qui vérifie les services externes (boîtes de réception, API d'état d'appel, etc.) et met les cases à jour en conséquence. Permet le développement local sans webhooks : la production utilise de vrais webhooks en temps réel, le mode local utilise le bouton d'interrogation.
  - `AgentMethods` : nouveau champ `job_poll: AgentMethod | None`
  - Route : `POST /workbench/jobs/{job_id}/poll` déclenche le gestionnaire d'interrogation de l'agent
  - Interface : bouton « Check for updates » avec état de chargement, affiché conditionnellement via la variable de modèle `has_poll`
  - JS : `pollJob()` dans `workbench-form.js` avec le motif de désactivation pendant la requête

- **Protection contre le double clic en validation humaine** — Tous les boutons de validation humaine sont désactivés pendant l'envoi via `_postAnswer()`. Les boutons reçoivent `opacity-50 cursor-not-allowed` pendant la requête et sont réactivés en cas d'erreur. Les `submitMessage`/`confirmDialog` de la validation humaine par dialogue sont désormais asynchrones et attendent correctement l'envoi du formulaire avant de réinitialiser l'état.

- **Affichage des réponses dans le moniteur** — Les charges utiles d'étape avec une clé `reply` s'affichent sous forme de citation bleue sous la ligne de l'étape. Les charges utiles d'étape avec `approved_content` s'affichent sous forme de carte de confirmation verte.

- **Affichage de la durée dans le moniteur** — Le format `step_duration` gère désormais les valeurs numériques et les chaînes, ce qui évite un `TypeError` de Jinja2 lorsque la durée provient d'une saisie de formulaire de validation humaine.

- **Signal terminal WebSocket** — L'état terminal d'un job envoie un signal WS `terminal` qui garde la connexion inactive, ce qui évite les boucles de reconnexion.

- **Utilitaire `is_local_mode()`** — Centralisé dans `supervaizer.common`, il remplace les vérifications en ligne de `os.environ.get("SUPERVAIZER_LOCAL_MODE")` dans `account_service.py` et `server.py`.

- **`deque` pour le tampon de journaux** — `_workbench_log_buffer` passe de `list` à `collections.deque(maxlen=500)`, ce qui supprime la logique de troncature manuelle.

- **Validation humaine par dialogue** — Nouveau type de validation humaine pour la relecture interactive de contenu via une interface de chat. Lorsque la charge utile d'un `CaseNodeUpdate` contient `supervaizer_dialog`, le workbench affiche une interface de conversation au lieu d'un formulaire figé. Prend en charge l'affinage itératif par des boucles de retour d'information pilotées par un LLM. Champs : `content` (chaîne JSON ou texte brut), `content_type` (email/text/code), `objective`, `instructions`, `messages` (historique de conversation), `confirm_label`.
  - Modèle : `dialog_renderer.html` avec les macros `render_hitl_dialog` et `render_dialog_confirmed`
  - JS : `submitDialogMessage(caseId, message)` et `confirmDialog(caseId)` dans `workbench-form.js`
  - Route : `workbench_routes.py` détecte `supervaizer_dialog` dans les charges utiles de case AWAITING

- **Corrections des URL en mode local** — `supervaizer start --local --port N` affiche désormais correctement des URL localhost partout : sortie de la CLI, journaux de l'interface d'administration, stockage et uvicorn. Corrigé en résolvant les valeurs par défaut de `Server.__init__` à partir des variables d'environnement au moment de l'appel (et non de la définition de la classe) et en veillant à ce que les valeurs fournies par la CLI l'emportent sur celles du fichier `.env`.

- **Ignorance des événements en mode local** — `account_service.send_event()` renvoie un `ApiSuccess` sans effet lorsque `SUPERVAIZER_LOCAL_MODE=true`, ce qui évite les erreurs HTTP contre l'API SaaS pendant le développement local.

- **Préremplissage des paramètres d'agent depuis l'environnement** — En mode local, le workbench charge automatiquement les valeurs de `.env` dans les champs de paramètres d'agent, avec des pastilles vertes `.env`. Les champs secrets affichent un texte de substitution masqué ; les champs non secrets affichent la valeur. Le backend se rabat sur les valeurs d'environnement pour les champs vides lors de l'envoi du job.

- **Protection de l'interrogation HTMX** — Le modèle du moniteur supprime l'interrogation `hx-trigger` lorsqu'un dialogue ou un formulaire de validation humaine est actif, ce qui évite d'écraser le DOM pendant que les utilisateurs interagissent avec les formulaires.

### v0.10.27

- **Workbench d'agent** — Interface de test complète pour les agents, directement depuis le panneau d'administration. Disposition en quatre zones : paramètres de l'agent, contrôle des jobs, moniteur d'exécution et journal de console en direct. Prend en charge le démarrage et l'arrêt des jobs, le suivi en temps réel des cases et des étapes par interrogation HTMX, ainsi que l'affichage et l'envoi des formulaires de validation humaine (HITL). Le panneau d'historique des jobs liste toutes les exécutions passées avec des badges de statut.
  - Backend : `workbench_routes.py` avec 8 points de terminaison FastAPI (page, démarrage, arrêt, statut, moniteur, console, réponse de validation humaine, historique des jobs)
  - Frontend : `workbench.html`, `workbench_monitor.html`, `workbench_console.html`, `workbench_jobs_list.html`, `workbench-form.js`
  - Macros partagées de rendu de champs : `field_renderer.html`

- **Mode de test local (`--local`)** — Exécutez le serveur supervaizer sans identifiants Supervaize Studio pour le développement local et les tests du workbench. Comprend un agent Hello World intégré avec un nombre de cases configurable, des étapes de validation humaine facultatives et la prise en charge de `JobInstructions.check()` pour un arrêt propre. Clé d'API par défaut `local-dev`, bandeau ambre dans l'interface d'administration.
  - CLI : `supervaizer start --local` / `just local`
  - Agent : `examples/hello_world_agent.py` avec `_LocalAccount` (simulacre de Studio sans effet)
  - Fabrique de serveur : `examples/local_server.py`

### Modifié {#changed-15}

- **Navigation d'administration** — L'accès au workbench passe du menu déroulant de navigation à des cartes par agent, avec un bouton vert « Workbench » direct. Suppression du bouton « New Agent » dans la liste des agents.
- **Authentification d'administration** — Résolution de la clé d'API refactorisée pour prendre en charge l'instance de serveur local (`_get_admin_api_key`, `_is_local_mode`), avec une chaîne de repli : état du serveur → variable d'environnement → valeur par défaut.

### Corrigé {#fixed-12}

- **`CaseNode.factory` est désormais facultatif** — Le champ `CaseNode.factory` passe de obligatoire à `Optional[Callable] = None`. Auparavant, `factory` était `exclude=True` (correctement omis de la sérialisation), mais restait exigé par la validation Pydantic. Cela faisait échouer `AgentResponse(**agent.registration_info)` avec des erreurs `Field required` sur la route `GET /supervaizer/agents`, car le dict aller-retour ne contenait jamais `factory`. Les agents dotés de workflows à base de CaseNode ne pouvaient pas s'enregistrer. ([#6](https://github.com/supervaize/supervaizer/issues/6))

### Modifié {#changed-16}

- **CI** – Workflow du paquet Python : l'installation des dépendances utilise désormais `uv sync --extra dev --extra deploy` (ajoute les extras de déploiement à la CI).

### Résultats des tests unitaires {#unit-tests-results-4}

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 433    |
| 🤔 Ignorés | 0      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 50s    |

## [0.10.19]

### Ajouté {#added-19}

- **Serveur : `index.html` local facultatif** – Si un `index.html` local existe, le serveur le sert comme réponse de la page d'accueil.

### Modifié {#changed-17}

- **Dépendances** – `boto3`/`botocore` passés à 1.42.41 (fichier de verrouillage). `ruff` passé à 0.15.0 et configuration pre-commit mise à jour.
- **Index d'administration** – Simplification des informations affichées dans le modèle d'index d'administration.
- **CI** – Workflow de publication PyPI : ajout de paramètres de concurrence pour annuler les exécutions en cours.

## [0.10.18]

### Ajouté {#added-20}

- **SUPERVAIZER_PRIVATE_KEY** – `_get_or_create_private_key` lit la clé depuis l'environnement, ou la génère et la définit. Le tableau de bord d'administration affiche un avertissement réservé au développement (à ne pas exposer en production).

### Modifié {#changed-18}

- **Refactorisation** – Nettoyage du formatage du code et des espaces en fin de ligne (routes d'administration, serveur, exemples, tests, modèles).

## [0.10.17]

### Ajouté {#added-21}

- **SUPERVAIZER_PRIVATE_KEY** lue depuis l'environnement si elle est définie ; sinon, création de la clé et définition de la variable d'environnement.

- **Administration : serveur et données en direct sans persistance** – Sans stockage persistant (par exemple Vercel, serverless), le tableau de bord d'administration et la page des agents n'échouent plus. L'état du serveur, sa configuration et les agents utilisent l'instance de serveur en direct (`app.state.server`) lorsque le stockage ne contient aucun ServerInfo. Les statistiques du tableau de bord, la liste des jobs, la liste des cases et l'activité récente utilisent les registres Jobs/Cases en direct lorsque le stockage est en mémoire et vide.

### Modifié {#changed-19}

- **Enregistrement auprès du superviseur (sans clé d'API côté frontend)** – Le bouton « Register with supervisor » appelle désormais le backend sans aucune clé d'API. Le backend envoie l'événement SERVER_REGISTER à SUPERVAIZE_API_URL ; aucune authentification n'est requise du frontend pour cette action.
- **Repli du serveur et des agents dans l'administration** – Les informations du serveur et les agents sont lus d'abord depuis le stockage, puis depuis le serveur en direct lorsque le stockage ne contient aucun ServerInfo (par exemple persistance désactivée). `get_server_status` et `get_server_configuration` acceptent un `request` facultatif pour le repli en direct.

### Corrigé {#fixed-13}

- **Administration : clé d'API « None » dans les URL** – Lorsque `SUPERVAIZER_API_KEY` n'est pas définie, le modèle n'affiche plus la chaîne littérale `"None"` (par exemple dans `data-admin-key`). SessionStorage ne stocke plus `"None"` issu de `?key=None`, et le frontend traite la chaîne `"None"` comme une absence de clé là où c'est pertinent.

### Résultats des tests unitaires {#unit-tests-results-5}

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 419    |
| 🤔 Ignorés | 6      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 53.16s |

## [0.10.11]

### Ajouté {#added-22}

- **Persistance des données facultative (désactivée par défaut)** – Les données ne sont plus persistées dans un fichier par défaut, de sorte que le serveur fonctionne correctement sur Vercel et sur les autres plateformes serverless où le système de fichiers est éphémère.

### Modifié {#changed-20}

- **Contrôleur injoignable** – Lorsque le serveur du contrôleur Supervaize n'est pas disponible (connexion refusée ou délai dépassé), l'envoi d'événement échoue désormais proprement avec un message d'erreur court et clair, au lieu d'afficher toute la charge utile et la trace d'appels. Journaux : `Supervaize controller is not available at {url}. Connection refused or timed out. Is the controller server running?` ainsi que le type d'événement et l'exception.
  - Définissez `SUPERVAIZER_PERSISTENCE=true` (ou `1`/`yes`) pour activer la persistance dans un fichier.
  - CLI : `supervaizer start --persist` active la persistance pour cette exécution.
  - Un `StorageManager(db_path=...)` explicite dans le code utilise toujours le stockage fichier (par exemple dans les tests).
  - Voir [2025_08_PERSISTENCE.md](2025_08_PERSISTENCE.md) pour la configuration.

### Résultats des tests unitaires {#unit-tests-results-6}

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 419    |
| 🤔 Ignorés | 6      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 55.28s |

## [0.10.4]

- Assouplissement de certaines exigences de dépendances

## [0.10.2]

### Modifié {#changed-21}

- **🐍 Prise en charge de Python 3.13** - Ajout de la compatibilité avec Python 3.13
  - Classificateurs du paquet mis à jour pour inclure Python 3.13
  - Le processus de construction utilise désormais Python 3.13 pour générer les wheels
  - La matrice de tests de la CI inclut Python 3.13
  - Les wheels construits avec Python 3.13 sont compatibles avec Python 3.12 et 3.13

## [0.10.0]

### Ajouté {#added-23}

- **🚀 CLI de déploiement cloud** - Système de déploiement automatisé complet pour les agents Supervaizer
  - Implémentation complète de la [RFC-001 : CLI de déploiement cloud](https://github.com/supervaize/supervaizer/blob/main/docs/rfc/2025_10_001-cloud-deployment-cli.md)
  - Prise en charge de trois grandes plateformes cloud :
    - **Google Cloud Run** avec Artifact Registry et Secret Manager
    - **AWS App Runner** avec ECR et Secrets Manager
    - **DigitalOcean App Platform**
  - Nouvelles commandes de déploiement :
    - `supervaizer deploy plan` - Prévisualise les actions de déploiement avant de les appliquer
    - `supervaizer deploy up` - Déploie sur la plateforme cloud avec construction, envoi et vérification automatisés
    - `supervaizer deploy down` - Démantèle le déploiement et nettoie les ressources
    - `supervaizer deploy status` - Vérifie l'état et la santé du déploiement
    - `supervaizer deploy local` - Test Docker local avec docker-compose
    - `supervaizer deploy clean` - Nettoie les artefacts et l'état du déploiement
  - **Flux Docker automatisé** : construction → envoi → déploiement → vérification
  - **Gestion des secrets** : traitement sécurisé des clés d'API et des clés RSA via les magasins de secrets du fournisseur cloud
  - **Vérification de santé** : contrôles de santé automatiques sur le point de terminaison `/.well-known/health`
  - **Déploiements idempotents** : opérations de création/mise à jour sûres, avec retour arrière en cas d'échec
  - **Tests locaux** : environnement Docker Compose complet pour tester avant le déploiement
  - Voir la [documentation des tests locaux](2025_10_LOCAL_TESTING.md) pour le détail

- **Modèle d'instructions pour l'agent** - Nouvelle page HTML servie par FastAPI pour les instructions d'intégration à Supervaize
  - Accessible à `/admin/supervaize-instructions`
  - Fournit un guide de configuration pas à pas pour les agents

- **Utilitaire de vérification de version** - Vérification automatique de la dernière version de Supervaizer
  - Aide les utilisateurs à rester à jour des dernières fonctionnalités et corrections
  - Situé dans `supervaizer.utils.version_check`

- **Interface d'administration améliorée**
  - Nouvelle page de liste des agents en grille
  - Vues de détail d'agent améliorées
  - Navigation et cohérence de l'interface améliorées

### Modifié {#changed-22}

- **🔄 Unification des protocoles** - Suppression du protocole ACP au profit du protocole A2A unifié
  - Suppression du répertoire `src/supervaizer/protocol/acp/` et de tout le code propre à ACP
  - Suppression du paramètre `acp_endpoints` de la classe Server
  - Suppression de l'enregistrement des routes ACP et des fichiers de test
  - Mise à jour de toute la documentation pour refléter une prise en charge exclusive d'A2A
  - Le protocole A2A a évolué pour intégrer des fonctionnalités de plusieurs standards de communication entre agents, dont l'ancien ACP
  - Tous les liens vers le protocole A2A sont mis à jour vers [https://a2a-protocol.org/](https://a2a-protocol.org/)
  - **Changement incompatible** : le paramètre `acp_endpoints` n'est plus accepté à l'initialisation de Server

- **📦 Optimisation des dépendances** - SDK cloud déplacés vers des dépendances facultatives
  - Taille du paquet de base nettement réduite
  - Les dépendances de déploiement cloud sont désormais facultatives : `pip install supervaizer[deploy]`
  - Le groupe facultatif `deploy` comprend : boto3, docker, google-cloud-artifact-registry, google-cloud-run, google-cloud-secret-manager, psutil
  - Suppression de la dépendance inutilisée `pymongo`
  - Versions des dépendances mises à jour pour une meilleure compatibilité

- **Gestion des erreurs améliorée** - Réponses d'erreur de l'API enrichies d'un meilleur contexte

- **Mises à jour de la documentation**
  - Ajout d'une documentation complète sur le déploiement
  - Mise à jour de la documentation de référence des modèles
  - README amélioré avec des exemples de déploiement
  - Mise à jour de 2025_08_PROTOCOLS.md pour se concentrer sur le protocole A2A unifié
  - Ajout d'une section Évolution des protocoles expliquant la fusion d'ACP

### Corrigé {#fixed-14}

- Correction d'erreurs dans la documentation de l'API
- Meilleures annotations de type pour `agent_parameters` et `case_ids` dans job.py
- Journalisation de santé optimisée dans les routes A2A

### Résultats des tests unitaires {#unit-tests-results-7}

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 415    |
| 🤔 Ignorés | 6      |
| 🔴 Échoués | 0      |
| ⏱️ en      | 50.56s |

### Notes de migration {#migration-notes}

- **Suppression du protocole ACP** : si votre code utilise le paramètre `acp_endpoints=True`, retirez-le de l'initialisation de Server. Le protocole A2A assure désormais une communication unifiée entre agents.
- Si vous avez besoin des fonctionnalités de déploiement, installez avec : `pip install supervaizer[deploy]`
- Pour le développement, installez avec : `pip install supervaizer[dev,deploy]`
- Aucun autre changement incompatible dans les API ou fonctionnalités existantes

## [0.9.8]

### Ajouté {#added-24}

- **Système de validation des paramètres** : ajout d'une validation complète des paramètres pour la création de job, avec des messages d'erreur clairs
  - Nouvelle méthode `validate_parameters()` dans la classe `ParametersSetup` pour valider les paramètres d'agent
  - Nouvelle méthode `validate_method_fields()` dans la classe `AgentMethod` pour valider les champs de job
  - Deux points de terminaison de validation distincts pour des besoins différents :
    - `/validate-agent-parameters` - Valide les paramètres de configuration de l'agent (secrets, clés d'API, etc.)
    - `/validate-method-fields` - Valide les champs de saisie du job par rapport aux définitions de méthode
  - Prise en charge de la validation des champs de job comme des paramètres d'agent chiffrés
  - Messages d'erreur clairs avec des détails précis sur les types de paramètres invalides et les paramètres obligatoires manquants

### Corrigé {#fixed-15}

- L'exécution de `supervaizer start` ne conservait pas l'espace de noms _main_, de sorte que le serveur FastAPI ne démarrait jamais. L'exécution est remplacée par un sous-processus.
- Type de agent.choice. #TODO: test and decide which to keep (list[str] or list [tuple[str,str]])
- Lorsque supervisor_account est fourni, les points de terminaison A2A sont activés automatiquement, car Supervaize doit pouvoir déclencher les contrôles de santé. -outil `export_openapi.py` pour générer openapi.json (pour la documentation docusaurus) - automatisation à faire dans docusaurus.

### Modifié {#changed-23}

- **Système de validation des paramètres** : refactorisé pour fournir des points de terminaison de validation distincts selon les préoccupations
  - **Paramètres d'agent** : désormais validés séparément via le point de terminaison `/validate-agent-parameters`
  - **Champs de méthode** : désormais validés séparément via le point de terminaison `/validate-method-fields`
  - **Architecture claire** : suppression du point de terminaison hérité pour une conception d'API plus ciblée
  - **Déduplication du code** : suppression du code de validation redondant dans les points de terminaison de démarrage de job
  - **Séparation plus nette** : la validation de la configuration de l'agent et celle de la saisie du job sont désormais des opérations distinctes

- pytest ne s'exécute plus avec la couverture par défaut (changement dans pyproject.toml)

### Résultats des tests unitaires {#unit-tests-results-8}

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 308    |
| 🤔 Ignorés | 6      |

## [0.9.6]

- Publication publique sur PyPI
- Correction des workflows GitHub
- Amélioration de README.md

## [0.9.5]

### Corrigé {#fixed-16}

- Configuration : `py.typed` manquant dans pyproject
- Clarification de public_url (registration_host remplacé par public_url)
- « supervaizer install » renommé en « supervaizer scaffold »

### Ajouté {#added-25}

- `gen_model_docs.py` : outil de génération de documentation - voir l'avertissement

### Résultats des tests unitaires {#unit-tests-results-9}

| Statut     | Nombre |
| ---------- | ------ |
| ✅ Réussis | 277    |
| 🤔 Ignorés | 6      |

## [0.9.4]

### Ajouté {#added-26}

- CICD : publication, déploiement
- `gen_model_docs.py` : pour générer la documentation des modèles.

### Modifié {#changed-24}

- Déplacement de « example » vers `src/supervaizer`
- Amélioration et déplacement d'une partie de la documentation vers `docs`
- Ajout de l'action GitHub `python-package.yml`, déclenchée à chaque poussée / PR de la branche « develop »

## [0.9.3]

### Ajouté {#added-27}

- Persistance des données avec tinyDB
- Interface d'administration avec fastAdmin
- Contenu dynamique sur :
  - La page Serveur
  - Agent
  - Jobs
  - Cases
- Ajout des données persistées à la vérification du statut d'un job.

### Modifié {#changed-25}

- Parameter.to_dict : surcharge pour éviter de stocker les secrets.
- Suppression de Case Nodes
- Amélioration de la couverture de tests : accounts, admin/routes,

### Résultats des tests unitaires {#unit-tests-results-10}

| Statut     | Nombre |
| ---------- | ------ |
| 🤔 Ignorés | 6      |
| ⚠️ Échoués | 0      |
| ✅ Réussis | 281    |

Couverture de tests : [![Test Coverage](https://img.shields.io/badge/Coverage-81%25-brightgreen.svg)](https://github.com/supervaize/supervaizer)

> | Légende des emoji |                        |               |
> | ----------------- | ---------------------- | ------------- |
> | 🌅 Modèle         | 🏹 Service             | 👔 Modèles    |
> | 🐛 Bogue          | 🛣️ Infrastructure/CICD | 🔌 API        |
> | 💼 Administration | 📖 Documentation       | 📰 Événements |
> | 🧪 Tests          | 🧑‍🎨 Interface/Style     | 🎼 Contrôleur |


*Mis en ligne le 2026-11-06 15:07:19*
