---
title: Modèle de départ et script de vérification
sidebar_label: Modèle de départ
sidebar_position: 5
description: Un agent déjà conforme aux exigences de Supervaize, à compléter avec votre logique, et un script qui vérifie qu'il est prêt.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Modèle de départ et script de vérification

Le modèle est un agent qui fonctionne et respecte déjà les huit exigences du guide [J'ai déjà un agent](./make-your-agent-supervaize-ready). Vous y mettez votre logique dans un seul fichier ; le reste est fait.

**[Récupérer le modèle sur GitHub](https://github.com/supervaize/supervaize-agent-template)** : choisissez **Use this template** pour créer votre propre copie, ou clonez-le (code en anglais, README en français et en anglais).

## Ce qu'il contient

| Fichier | Rôle |
|---|---|
| `agent.py` | **Votre logique** : `list_items()` transforme le formulaire en éléments à traiter, `process_item()` traite un élément et renvoie son résultat et son coût. |
| `controller.py` | Le contrôleur générique : formulaire, lancement idempotent, travail en arrière-plan, `job.sync`, `job.stop`, validation humaine, isolation entre espaces Studio. Il ne dépend pas du SDK. |
| `supervaizer_control.py` | Le branchement au SDK : nom, présentation dans Studio, paramètres, enregistrement. |
| `verify_agent.py` | Le script de vérification (voir plus bas). |
| `tests/` | 10 tests qui appellent le contrôleur comme le ferait Studio. |
| `.env.example`, `requirements.txt`, `pyproject.toml`, `.gitignore` | La configuration, prête pour un hébergeur comme Render (voir l'étape 8 du [guide express](./express-guide)). |

Le modèle organise le travail ainsi : un **job** par lancement, un case **Run** qui suit le lancement et se termine par la validation humaine, et un case par **élément** traité, avec son étape et son coût. Si ce découpage ne correspond pas à votre agent, adaptez-le (voir [Missions, jobs, cases, étapes](/docs/supervaizer-controller/core-concepts)).

## Démarrer

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer pytest
python -m pytest -q
supervaizer start --local
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer pytest
python -m pytest -q
supervaizer start --local
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install supervaizer pytest
python -m pytest -q
supervaizer start --local
```

</TabItem>
</Tabs>

Puis personnalisez trois endroits :

1. `supervaizer_control.py` : `AGENT_NAME`, `AGENT_SLUG` (le nom en minuscules, avec des tirets), `CATALOG` (à augmenter à chaque changement de formulaire), la présentation et les paramètres.
2. `controller.py`, fonctions `start_fields()` et `read_inputs()` : votre formulaire de lancement et sa vérification côté serveur.
3. `agent.py` : votre logique.

Branchez ensuite l'agent en suivant [J'ai déjà un agent](./make-your-agent-supervaize-ready), à partir de l'étape 5.

## Le script de vérification

`verify_agent.py` contrôle, depuis le dossier de l'agent, ce qui fait échouer la plupart des branchements, et dit en clair ce qui manque. Il n'affiche jamais la valeur d'un secret. Il fonctionne aussi avec un agent qui n'a pas été créé à partir du modèle : copiez simplement le fichier dans son dossier.

```bash
python verify_agent.py
python verify_agent.py --url https://votre-agent.exemple.com
```

| Ce qu'il vérifie | Exemple de message |
|---|---|
| La version de Python et la présence de Supervaizer | `Python 3.11 found, 3.12 or later required` |
| Les fichiers `supervaizer_control.py`, `pyproject.toml` et `.gitignore` | `.env is not ignored by git` |
| Les variables écrites par `supervaizer login` | `SUPERVAIZE_API_KEY missing: run supervaizer login` |
| Les adresses (format, espaces cachés) | `must be a full https:// address without spaces` |
| `SUPERVAIZER_SERVER_ID` | `not set: a new agent identity at every restart` |
| L'adresse de vérification de l'espace (JWKS) | `HTTP 404, no keys` |
| L'adresse publique de l'agent | `unreachable: is the agent or the tunnel running?` |

Le script renvoie 0 quand tout ce qui est indispensable est en ordre : vous pouvez l'ajouter à votre chaîne de déploiement.

*Écrit pour Supervaizer 1.11.1 (novembre 2026).*
