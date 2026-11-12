# Tests Docker en local {#local-docker-testing}


> **Créé le :** 2025-10-07
> **Mis à jour le :** 2026-10-04

> `supervaizer deploy local` exécute l'image que livre `deploy up`, avec le même environnement de conteneur. Pour le développement au quotidien, utilisez `supervaizer start --local` (voir [2025_08_CLI.md](2025_08_CLI.md)). Nécessite Docker Compose v2 (`docker compose`).

Ce document décrit comment tester localement les déploiements Supervaizer avec Docker avant de déployer sur les plateformes cloud.

## Vue d'ensemble {#overview}

La fonctionnalité de test local vous permet de :

- Construire et tester des images Docker en local
- Exécuter des services avec Docker Compose
- Effectuer des contrôles de santé et des validations
- Tester les endpoints de l'API et la documentation
- Valider la configuration de l'environnement

## Démarrage rapide {#quick-start}

### Test local de base {#basic-local-test}

```bash
# Test with default settings
supervaizer deploy local --name my-agent

# Test with custom port and a generated API key
supervaizer deploy local --name my-agent --port 8080 --generate-api-key
```

## Options de la commande {#command-options}

La commande `supervaizer deploy local` prend en charge les options suivantes :

| Option               | Description                       | Par défaut             |
| -------------------- | --------------------------------- | ---------------------- |
| `--name`             | Nom du service                    | demandé                |
| `--env`              | Environnement (dev/staging/prod)  | dev                    |
| `--port`             | Port local à exposer              | 8000                   |
| `--generate-api-key` | Génère une clé d'API sécurisée    | false                  |
| `--generate-rsa`     | Génère une clé privée RSA         | false                  |
| `--timeout`          | Délai de démarrage du service (secondes) | 300             |
| `--verbose`          | Affiche une sortie détaillée      | false                  |
| `--docker-files-only` | Génère les fichiers sans les exécuter | false              |
| `--controller-file`  | Nom du fichier du contrôleur      | supervaizer_control.py |

## Ce que fait la commande {#what-it-does}

### 1. Contrôles préalables {#1-pre-flight-checks}

- ✅ Vérifie que Docker fonctionne
- ✅ Valide la structure du projet (`pyproject.toml`)

### 2. Génération des fichiers {#2-file-generation}

- ✅ Génère le `Dockerfile` dans `.deployment/`
- ✅ Crée le fichier `.dockerignore`
- ✅ Génère `docker-compose.yml` pour les tests locaux

### 3. Gestion des secrets {#3-secret-management}

- ✅ `SUPERVAIZER_API_KEY` : générée avec `--generate-api-key`, sinon `test-api-key-local`
- ✅ `SUPERVAIZER_PRIVATE_KEY` : générée avec `--generate-rsa`, sinon le serveur en génère une au démarrage

### 4. Variables d'environnement {#4-environment-variables}

Le `docker-compose.yml` généré définit l'environnement du conteneur à l'exécution. Rien n'est placé dans les arguments de build ni dans les couches de l'image.

- `SUPERVAIZER_ENVIRONMENT`, `SUPERVAIZER_HOST=0.0.0.0`, `SUPERVAIZER_PORT` (issu de `--port`), `SUPERVAIZER_LOG_LEVEL` (valeur de l'hôte, sinon `INFO`)
- Les secrets du contrôleur de l'étape 3
- Les valeurs de l'hôte, quand elles sont définies, de `SUPERVAIZE_API_KEY`, `SUPERVAIZE_WORKSPACE_ID`, `SUPERVAIZE_API_URL`, `SUPERVAIZER_PUBLIC_URL`, `SUPERVAIZER_SERVER_ID` et de chaque variable `SUPERVAIZER_WORKSPACE_AUTH_*`. Un contrôleur v2 enregistré dans Studio a besoin des variables d'autorisation d'espace de travail pour démarrer.

Les valeurs sont copiées à la génération du fichier : relancez la commande après les avoir modifiées. Le fichier contient des identifiants ; il est donc écrit avec le mode `600`, et le port n'est publié que sur `127.0.0.1`.

### 5. Opérations Docker {#5-docker-operations}

- ✅ Construit l'image Docker avec un tag local
- ✅ Démarre les services avec Docker Compose
- ✅ Attend que le service soit prêt

### 6. Validation de la santé {#6-health-validation}

- ✅ Teste le endpoint `/.well-known/health`
- ✅ Vérifie la disponibilité de la documentation de l'API
- ✅ Mesure les temps de réponse

### 7. Informations sur le service {#7-service-information}

- ✅ Affiche l'URL et le port du service
- ✅ Montre les liens vers la documentation de l'API
- ✅ Rapporte les résultats des contrôles de santé
- ✅ Fournit les instructions de nettoyage

## Fichiers générés {#generated-files}

La commande locale crée les fichiers suivants dans `.deployment/` :

```
.deployment/
├── Dockerfile              # Docker image definition
├── .dockerignore          # Docker ignore rules
├── docker-compose.yml     # Local testing configuration
└── logs/                  # Deployment logs (if any)
```

## Exemple de sortie {#example-output}

```
🐳 Local Docker Testing
═══════════════════════════════════════════════════════════

Testing service: my-agent-dev
Environment: dev
Port: 8000

Step 1: Checking Docker availability...
✓ Docker is available

Step 2: Generating deployment files...
✓ Deployment files generated

Step 3: Setting up secrets...
✓ Test secrets configured

Step 4: Building Docker image...
✓ Image built: my-agent-dev:local-test

Step 5: Starting services...
✓ Services started

Step 6: Waiting for service to be ready...
✓ Service is ready

Step 7: Running health checks...
┌─────────────────────┬────────┬───────────────┬─────────┐
│ Endpoint            │ Status │ Response Time │ Details │
├─────────────────────┼────────┼───────────────┼─────────┤
│ Health Endpoint     │ 200    │ 0.123s        │ ✓ OK    │
│ Api Docs            │ 200    │ 0.089s        │ ✓ OK    │
└─────────────────────┴────────┴───────────────┴─────────┘

Step 8: Service Information
┌─────────────────┬─────────────────────────────┐
│ Property        │ Value                       │
├─────────────────┼─────────────────────────────┤
│ Service Name    │ my-agent-dev                 │
│ URL             │ http://localhost:8000       │
│ Port            │ 8000                         │
│ API Key         │ test-api-...                │
│ Environment     │ dev                          │
└─────────────────┴─────────────────────────────┘

✓ Local testing completed successfully!

Service URL: http://localhost:8000
API Documentation: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc

To stop the test services:
docker compose -f .deployment/docker-compose.yml down

To debug environment variables:
docker compose -f .deployment/docker-compose.yml run --rm <service-name> python debug_env.py

To clean up all deployment files:
supervaizer deploy clean
```

## Dépannage {#troubleshooting}

### Problèmes courants {#common-issues}

#### Problèmes de variables d'environnement {#environment-variable-issues}

```
❌ ValidationError: workspace_id, api_key, api_url are None
```

**Solution** : vérifiez que les variables d'environnement sont correctement définies :

1. **Déboguer les variables d'environnement** :

   ```bash
   docker compose -f .deployment/docker-compose.yml run --rm <service-name> python debug_env.py
   ```

2. **Définir les variables d'environnement requises** :

   ```bash
   export SUPERVAIZE_API_KEY="your-api-key"
   export SUPERVAIZE_WORKSPACE_ID="your-workspace-id"
   export SUPERVAIZE_API_URL="https://app.supervaize.com"
   export SUPERVAIZER_PUBLIC_URL="https://your-app.com"
   ```

3. **Régénérer les fichiers de déploiement** :

   ```bash
   supervaizer deploy local --name my-agent --docker-files-only
   ```

4. **Vérifier le docker-compose.yml généré** :
   ```bash
   cat .deployment/docker-compose.yml
   ```

#### Docker indisponible {#docker-not-available}

```
❌ Error: Docker is not available or not running
```

**Solution** : installez Docker et assurez-vous qu'il fonctionne :

```bash
# macOS with Homebrew
brew install docker

# Start Docker Desktop
open -a Docker
```

#### Port déjà utilisé {#port-already-in-use}

```
❌ Error: Port 8000 is already in use
```

**Solution** : utilisez un autre port :

```bash
supervaizer deploy local --port 8080
```

#### Délai de démarrage du service dépassé {#service-startup-timeout}

```
❌ Error: Service failed to start within timeout
```

**Solution** :

1. Consultez les journaux du service :
   ```bash
   docker compose -f .deployment/docker-compose.yml logs
   ```
2. Augmentez le délai :
   ```bash
   supervaizer deploy local --timeout 600
   ```

#### supervaizer_control.py manquant {#missing-supervaizer_controlpy}

```
❌ Error: supervaizer_control.py not found
```

**Solution** : assurez-vous de lancer la commande depuis un répertoire de projet Supervaizer contenant un fichier de contrôle valide.

### Mode débogage {#debug-mode}

Utilisez l'option `--verbose` pour une sortie détaillée :

```bash
supervaizer deploy local --verbose
```

Cela affiche :

- Les journaux de build Docker
- La sortie de Docker Compose
- Les messages d'erreur détaillés

## Nettoyage {#cleanup}

### Arrêter les services {#stop-services}

```bash
docker compose -f .deployment/docker-compose.yml down
```

### Supprimer les images {#remove-images}

```bash
docker rmi my-agent-dev:local-test
```

### Tout nettoyer {#clean-everything}

```bash
docker compose -f .deployment/docker-compose.yml down --volumes --rmi all
```

## Intégration avec la CI/CD {#integration-with-cicd}

Les tests locaux peuvent être intégrés aux pipelines de CI/CD :

```yaml
# GitHub Actions example
- name: Test Local Deployment
  run: |
    supervaizer deploy local --generate-api-key --timeout 300
    docker compose -f .deployment/docker-compose.yml down
```

## Bonnes pratiques {#best-practices}

1. **Testez toujours en local** avant de déployer sur les plateformes cloud
2. **Utilisez des secrets générés** pour les tests (`--generate-api-key --generate-rsa`)
3. **Vérifiez les endpoints de santé** pour vous assurer que le service fonctionne correctement
4. **Nettoyez les ressources** après les tests pour éviter les conflits de ports
5. **Utilisez le mode verbeux** pour déboguer les problèmes
6. **Testez avec d'autres ports** si le port par défaut est utilisé

## Étapes suivantes {#next-steps}

Après un test local réussi :

1. Déployez sur la plateforme cloud : `supervaizer deploy up --platform cloud-run`
2. Vérifiez l'état du déploiement : `supervaizer deploy status --platform cloud-run`
3. Surveillez la santé et les journaux du service
4. Nettoyez une fois terminé : `supervaizer deploy down --platform cloud-run`


*Uploaded on 2026-11-06 15:07:19*
