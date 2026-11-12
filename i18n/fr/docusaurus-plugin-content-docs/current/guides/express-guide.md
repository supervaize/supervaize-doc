---
title: Guide express — créer un agent et le brancher à Supervaize
sidebar_label: Guide express
sidebar_position: 2
description: De zéro à un agent hébergé et piloté depuis Supervaize Studio, en huit étapes.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Créer un agent et le brancher à Supervaize

De zéro à un agent hébergé et piloté depuis Supervaize Studio, en huit étapes : une vingtaine de minutes jusqu'au premier job, puis une demi-heure pour l'héberger. Il suffit de copier les commandes dans le Terminal.

:::tip[Vous ne voulez pas utiliser le Terminal ?]
Si votre agent est un workflow n8n, vous pouvez le brancher à Studio sans aucune commande : voir [Intégration n8n](/docs/integrations/n8n-integration).
:::

## Avant de commencer

- **Python 3.12 ou plus récent** sur votre ordinateur (vérifiez avec `python3 --version` sur Mac et Linux, `py --version` sur Windows).
- **Un compte Supervaize Studio** et un espace de travail.
- **cloudflared**, pour que Studio puisse joindre l'agent qui tourne sur votre ordinateur (installation à l'étape 5).

Les commandes sont données pour Mac, Linux et Windows : choisissez votre système dans les onglets.

:::info[Le principe]
Votre agent tourne chez vous (ou sur un serveur). Supervaizer l'emballe et le présente à Studio : Studio affiche son formulaire, lance des jobs, suit leurs étapes et leurs coûts, et fait valider par un humain quand il le faut.
:::

## 1. Installer Supervaizer

*2 minutes.* Dans le Terminal, créez un dossier pour votre agent et installez le kit :

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
mkdir mon-agent && cd mon-agent
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
mkdir mon-agent && cd mon-agent
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
mkdir mon-agent; cd mon-agent
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install supervaizer
```

</TabItem>
</Tabs>

La ligne de votre Terminal commence maintenant par `(.venv)` : c'est bon signe. Si vous fermez le Terminal, revenez dans le dossier et relancez la commande d'activation (la ligne avec `activate`).

## 2. Créer l'agent

*5 minutes.*

```bash
supervaizer scaffold
```

Cette commande crée `supervaizer_control.py` : c'est **le seul fichier** qui relie votre agent à Studio. Ouvrez-le et changez trois choses :

| Quoi | Où dans le fichier | Exemple |
|---|---|---|
| Le nom de l'agent | `AGENT_NAME` et `agent_slug` (le nom en minuscules, avec des tirets) | `"Agent Factures"` → `"agent-factures"` |
| Le formulaire affiché dans Studio | la liste `fields` de `job_start_form` | un champ « Lien du fichier » de type `string` |
| Ce que fait l'agent | la fonction `start_job` : appelez-y votre code avec `request.input` | `resultat = mon_agent(request.input["lien"])` |

La fonction `start_job` renvoie l'état du job : des **cases** (un par élément traité) et leurs **étapes**, avec un statut et un coût. C'est ce que Studio affiche.

:::tip[Pour une présentation soignée dans Studio]
Donnez à `Agent` une `introduction` (accroche, résumé, exemples d'objectifs) et une `full_description` en markdown : Studio les montre avant même le premier job.
:::

:::caution[Si le travail dure plus de quelques secondes]
Renvoyez les cases en `pending`, faites le travail en arrière-plan, et déclarez aussi les actions `job.sync` et `job.stop` : Studio ne vient pas chercher les nouvelles tout seul, il les reçoit à la prochaine action ou quand on clique sur **Update**.
:::

## 3. Tester en local, sans Studio

*2 minutes.*

```bash
supervaizer start --local
```

Ouvrez **http://127.0.0.1:8000/manage/** dans votre navigateur : l'interface d'administration affiche votre formulaire et vous laisse lancer un job. Corrigez votre fichier jusqu'à ce que le job se termine bien, puis arrêtez avec **Ctrl+C**.

## 4. Se connecter à Studio et configurer les variables

*3 minutes.* Supervaize a besoin de variables de configuration pour savoir à quel espace Studio l'agent appartient et pour vérifier que c'est bien Studio qui l'appelle. Inutile de les copier à la main : une commande les écrit pour vous.

```bash
supervaizer login
```

Une page de Studio s'ouvre : connectez-vous, vérifiez que le code affiché est le même que dans le Terminal, et approuvez. La commande écrit alors les variables dans le fichier `.env` de votre dossier :

| Variable | À quoi elle sert |
|---|---|
| `SUPERVAIZE_API_KEY` | La clé qui permet à l'agent de parler à Studio. |
| `SUPERVAIZE_WORKSPACE_ID` | L'identifiant de votre espace Studio. |
| `SUPERVAIZE_API_URL` | L'adresse de Studio (`https://app.supervaize.com`). |
| `SUPERVAIZER_WORKSPACE_AUTH_REQUIRED`, `…_ISSUER`, `…_JWKS_URL` | Ce qui permet à l'agent de vérifier que les appels viennent bien de votre espace. |

Ajoutez ensuite vous-même deux lignes dans `.env` :

| Variable | Valeur |
|---|---|
| `SUPERVAIZER_SERVER_ID` | Un identifiant fixe, pour retrouver le même agent après chaque redémarrage. Générez-le avec `python -c "import uuid; print(uuid.uuid4())"`. |
| Les paramètres de votre agent | Par exemple la clé de votre fournisseur d'IA, si votre code la lit dans l'environnement. En production, ils se déclarent comme paramètres (voir [Paramètres et secrets](/docs/supervaizer-controller/parameters)). |

L'adresse publique de l'agent (`SUPERVAIZER_PUBLIC_URL`) est donnée au démarrage, à l'étape 6.

:::tip[Sans la commande login]
Vous pouvez aussi copier ces variables depuis Studio (**Developer → Environment variables**) : voir [Démarrage rapide](/docs/supervaizer-controller/quickstart). En cas d'erreur, voir [Dépannage](/docs/supervaizer-controller/troubleshooting).
:::

:::caution[Ce fichier est secret]
Ne partagez jamais `.env`, ne l'envoyez pas par message et ne le mettez pas sur GitHub.
:::

## 5. Rendre l'agent joignable par Studio

*2 minutes.* Installez cloudflared si ce n'est pas déjà fait :

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
brew install cloudflared
```

</TabItem>
<TabItem value="linux" label="Linux">

Téléchargez le paquet de votre distribution sur la [page des versions de cloudflared](https://github.com/cloudflare/cloudflared/releases), puis installez-le.

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install --id Cloudflare.cloudflared
```

</TabItem>
</Tabs>

Ouvrez ensuite un **deuxième onglet** du Terminal et lancez le tunnel :

```bash
cloudflared tunnel --url http://localhost:8000
```

Copiez l'adresse qui s'affiche, en `https://….trycloudflare.com`. Laissez cet onglet ouvert : si vous le fermez, Studio ne joint plus l'agent. L'adresse change à chaque relance du tunnel.

## 6. Démarrer l'agent

*1 minute.* Revenez au premier onglet et remplacez l'adresse par celle du tunnel. C'est elle qui donne à Studio l'adresse publique de l'agent :

```bash
supervaizer start --env-file .env --public-url https://votre-adresse.trycloudflare.com
```

:::info[Ce que vous devez voir]
`Studio registration handshake verified`, puis `Uvicorn running on http://0.0.0.0:8000`. Votre agent est enregistré.
:::

## 7. Dans Studio : premier job

*3 minutes.*

1. Ouvrez **Agents** : votre agent apparaît. S'il est en pause, cliquez sur **Resume**.
2. La première fois, un administrateur de l'espace accepte l'agent : sur la carte **Workspace Access**, il saisit l'identifiant d'espace de l'agent et accepte l'accès.
3. Ouvrez **Missions**, créez une mission, choisissez votre agent, puis cliquez sur **Start Job**.
4. Remplissez votre formulaire et lancez. Le job, ses cases et ses étapes s'affichent ; cliquez sur **Update** pour rafraîchir.

:::tip[Bravo]
Votre agent est supervisé : chaque job est tracé, avec son coût, et vous pouvez ajouter une validation humaine à n'importe quelle étape.
:::

## 8. Héberger l'agent

*20 à 30 minutes.* Jusqu'ici, l'agent tourne sur votre ordinateur : il s'arrête quand vous fermez le Terminal ou que l'ordinateur se met en veille, et l'adresse du tunnel change à chaque relance. Pour de vrais utilisateurs, hébergez-le sur un serveur. **Supervaize n'héberge pas votre agent** : il tourne sur votre propre compte, chez l'hébergeur de votre choix, qui vous facture l'hébergement. Voici la méthode la plus simple, avec Render :

1. **Préparez le dossier.** Créez un fichier `requirements.txt` qui liste `supervaizer` et les autres paquets dont votre agent a besoin (un par ligne). Vérifiez que `.env` figure dans `.gitignore`.
2. **Mettez le code sur GitHub**, dans un dépôt **privé**. Le fichier `.env` n'y va jamais.
3. **Créez le service.** Sur [Render](https://render.com), cliquez sur **New → Web Service** et choisissez votre dépôt, puis réglez :

| Réglage | Valeur |
|---|---|
| Language | Python 3 |
| Region | une région proche de vos utilisateurs (Frankfurt pour l'Europe) |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `SUPERVAIZER_PORT=$PORT python supervaizer_control.py` |
| Instance Type | une offre payante (Starter) : l'offre gratuite se met en veille et l'agent apparaît hors ligne dans Studio |

4. **Ajoutez les variables** dans **Environment** : toutes celles de votre `.env` (étape 4), plus `SUPERVAIZER_PUBLIC_URL` avec l'adresse que Render donne au service, en `https://….onrender.com`. Si l'agent garde des fichiers entre deux jobs, ajoutez un disque (**Disks**) et pointez-y son dossier de travail.
5. **Lancez.** Quand le service est **Live**, arrêtez l'agent qui tourne sur votre ordinateur et le tunnel : l'agent hébergé s'enregistre auprès de Studio avec sa nouvelle adresse.

Le [modèle de départ](./starter-template) contient déjà un `requirements.txt` et un `.gitignore` prêts. Pour d'autres hébergeurs et les critères à vérifier, voir [Choisir un hébergeur](./choose-a-host).

:::info[Bientôt]
Supervaizer propose aussi une commande `supervaizer deploy` pour Google Cloud Run, AWS App Runner et DigitalOcean. Elle est en cours de finalisation : voir [Déploiement dans le cloud](/docs/supervaizer-controller/deploy).
:::

## Pièges à éviter

Ces pièges complètent la page [Dépannage](/docs/supervaizer-controller/troubleshooting) : ce sont ceux que nous avons rencontrés en branchant de vrais agents.

| Ce qui se passe | La cause | La solution |
|---|---|---|
| L'agent n'apparaît pas dans Studio | Il a été lancé avec `uvicorn` directement : l'enregistrement auprès de Studio ne se fait pas. | Toujours démarrer avec `supervaizer start` ou `python supervaizer_control.py`. |
| Un nouvel agent « fantôme » à chaque relance | `SUPERVAIZER_SERVER_ID` n'est pas défini : le serveur change d'identité à chaque démarrage. | Ajoutez-le dans `.env` (étape 4). |
| « Agent server is offline » | L'agent ou le tunnel est arrêté, ou l'adresse du tunnel a changé. | Relancez le tunnel puis l'agent avec la nouvelle adresse (étapes 5 et 6). |
| Erreur `CERTIFICATE_VERIFY_FAILED` sur Mac | Le Python installé depuis python.org n'a pas les certificats du système. | Lancez une fois « Install Certificates.command » (dossier Applications › Python), ou utilisez `certifi` dans votre code. |
| Le formulaire n'a pas changé dans Studio | La version du catalogue n'a pas changé. | Augmentez `a2ui_catalog_version` (`…-ui.1` → `…-ui.2`) à chaque changement de formulaire, comme le demande [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup). |
| « slug inattendu » au démarrage | `agent_slug` ne correspond pas au nom. | Le slug est le nom en minuscules, sans accent, avec des tirets. |
| « File fields are not supported here » | Le type `file` existe dans Supervaizer, mais le formulaire de lancement de Studio ne l'affichait pas encore en novembre 2026. | Demandez un lien (Drive, Dropbox) à la place. |

## Et ensuite

- **Ajouter une validation humaine** : une étape au statut `awaiting` fait apparaître un formulaire de décision dans Studio. Voir [Validation humaine](/docs/supervaizer-controller/human-in-the-loop).
- **Rendre l'agent configurable** depuis Studio, sans toucher au code, avec des ressources (tableaux de réglages). Voir [Ressources partagées](/docs/supervaizer-controller/resources).
- Pour aller plus loin : [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup).

*Écrit pour Supervaizer 1.11.1, avec les libellés de Studio de novembre 2026. Si le fichier créé par `supervaizer scaffold` ou un bouton porte un autre nom, cherchez son équivalent.*
