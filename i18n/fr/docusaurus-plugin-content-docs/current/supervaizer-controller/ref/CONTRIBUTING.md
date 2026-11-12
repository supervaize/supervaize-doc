# Contribuer à Supervaizer {#contributing-to-supervaizer}

Merci d'envisager de contribuer à Supervaizer. Ce document décrit le processus de développement et les consignes à suivre.

## Environnement de développement {#development-environment}

Ce projet utilise [just](https://github.com/casey/just) comme lanceur de commandes et [uv](https://docs.astral.sh/uv/) pour les environnements Python. Listez toutes les recettes avec :

```bash
just
```

### Installation {#setup}

1. Clonez le dépôt et créez votre branche à partir de `develop`.
2. Installez uv (`pip install uv` ou `brew install uv`).
3. Installez les dépendances de développement : `just install-dev`
4. Installez les hooks Git : `just install-hooks`

`uv run <cmd>` exécute une commande dans l'environnement du projet ; aucune activation manuelle d'un environnement virtuel n'est nécessaire.

### Exécuter les tests {#running-tests}

```bash
just test              # full suite, no coverage
just test-cov          # with coverage report
just test-failed       # rerun last failures
```

### Vérification de types et lint {#type-checking-and-linting}

```bash
just precommit         # ruff check + ruff format + mypy + hooks, all files
just mypy              # mypy only (same invocation as CI)
uv run mypy src/supervaizer tests   # include tests
```

## Processus de pull request {#pull-request-process}

1. Faites un fork du dépôt et créez une branche à partir de `develop` (`git switch -c feature/amazing-feature develop`).
2. Effectuez vos modifications et ajoutez ou mettez à jour des tests ciblés.
3. Exécutez `just test` et `just precommit`.
4. Mettez à jour la documentation (la section **Unreleased** de `docs/CHANGELOG.md`, et `just generate-docs` si des modèles publics ont changé).
5. Faites un commit avec un message Conventional Commit signé (sign-off) : `git commit -s -m "✨ feat: add amazing feature"`. Le hook `commit-msg` impose le format [gitmoji conventional](https://github.com/ljnsn/cz-conventional-gitmoji) et ajoute le gitmoji quand il manque.
6. Poussez et ouvrez une pull request vers `develop`. `main` ne reçoit que des PR de release.

## Style de code {#code-style}

- Ruff pour le formatage et le lint (longueur de ligne de 88 colonnes par défaut, formatage `preview` activé).
- Mypy pour la vérification de types. Les fonctions nouvelles ou modifiées, y compris les tests, exigent des annotations de type et des types de retour explicites.
- Imports au niveau du module par défaut ; documentez tout import local inévitable.
- Supervaizer est un SDK publié : gardez les charges utiles publiques rétrocompatibles, sauf si le changement est explicitement cassant et coordonné avec Studio.

Après `just install-hooks`, chaque `git commit` exécute les contrôles de `.pre-commit-config.yaml` (Ruff, mypy, en-tête de licence) sur les fichiers indexés, et le hook `commit-msg` vérifie le message. La commande `but commit` de GitButler n'exécute pas les hooks Git.

Exécutez `just precommit` avant de pousser ; la CI applique les mêmes contrôles à chaque pull request.

## Licence et conditions de contribution {#licensing-and-contribution-terms}

En soumettant une contribution (code, documentation ou autre contenu) à ce projet, vous acceptez de la placer sous licence selon les termes de la Mozilla Public License 2.0 (MPL-2.0).

Vous conservez le droit d'auteur sur votre contribution, mais vous accordez aux mainteneurs du projet et à tous les utilisateurs le droit de l'utiliser, de la modifier et de la distribuer dans le cadre du projet sous licence MPL-2.0.

Ce projet utilise le Developer Certificate of Origin (DCO). En soumettant une contribution, vous certifiez que :

> I certify that the contribution was created in whole or in part by me and I have the right to submit it under the MPL-2.0 license.

Exprimez cette certification en signant chaque commit avec `git commit -s`. Les contributions sans cette signature peuvent être rejetées.


*Uploaded on 2026-11-06 15:07:19*
