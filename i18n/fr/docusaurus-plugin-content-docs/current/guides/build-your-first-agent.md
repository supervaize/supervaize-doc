---
title: Je n'ai pas d'agent — créer mon premier agent pas à pas
sidebar_label: Mon premier agent
sidebar_position: 1
description: Créez votre premier agent avec Claude Code, sans écrire le code vous-même, et pilotez-le depuis Supervaize Studio.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Je n'ai pas d'agent : créer mon premier agent pas à pas

Vous n'avez jamais créé d'agent ? Ce guide vous emmène de zéro à un agent qui travaille pour vous et que vous pilotez depuis Supervaize Studio. Vous n'écrivez pas le code vous-même : vous décrivez l'agent, et **Claude Code** l'écrit, le teste et le branche. Comptez environ une heure.

## C'est quoi, un agent ?

Un agent, c'est un assistant IA qui **utilise des outils pour accomplir une tâche** : lire un site, chercher dans un tableau, écrire un e-mail, remplir un fichier… Il décide quoi faire avec ces outils pour aller au bout de la tâche.

Quelques exemples :

- lire les dernières actualités d'un site et vous en faire un résumé ;
- préparer une réponse aux messages de vos clients ;
- trier vos factures et remplir un tableau.

**Supervaize** vous permet de lancer cet agent en un clic, de voir ce qu'il fait étape par étape, de savoir combien il coûte et, si besoin, de valider avant qu'il agisse.

## Mission, job, case, étape : c'est vous qui décidez

Dans Supervaize, le travail d'un agent s'organise en missions, jobs, cases et étapes : la page [Missions, jobs, cases, étapes](/docs/supervaizer-controller/core-concepts) les définit. Ce qu'ils représentent dépend de **votre** agent, et c'est à vous de le décider avant de le construire. Pour l'agent de ce guide :

- **Mission** : suivre l'actualité d'un secteur.
- **Job** : une lecture du site, par exemple chaque lundi.
- **Case** : un article lu.
- **Étapes** : lire l'article, le résumer.

Vous donnerez ces quatre phrases à Claude Code à l'étape 4.

:::info[Ce que vous allez construire]
Un **agent de veille** : à chaque lancement, il lit les derniers articles d'un site et vous rend un résumé de chacun, puis attend votre validation. Une fois que vous l'aurez fait, vous saurez construire n'importe quel agent sur le même modèle : il suffira de décrire une autre tâche.
:::

## Ce qu'il vous faut

- **Python 3.12 ou plus récent** (vérifiez avec `python3 --version` sur Mac et Linux, `py --version` sur Windows).
- **Un abonnement Claude** (ou un compte Anthropic Console) pour utiliser Claude Code.
- **Un compte Supervaize Studio** et un espace de travail.
- **Une clé API d'un fournisseur d'IA** (Anthropic, OpenAI, OpenRouter…), pour que votre agent puisse résumer. Comptez quelques centimes pour ce guide.
- **L'adresse du flux RSS** d'un site que vous suivez (souvent `https://le-site.com/feed` ou `/rss`).

Les commandes sont données pour Mac, Linux et Windows : choisissez votre système dans les onglets.

## 1. Installer Claude Code

Ouvrez le Terminal (sur Windows : PowerShell) et lancez :

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
irm https://claude.ai/install.ps1 | iex
```

</TabItem>
</Tabs>

Ouvrez ensuite une **nouvelle** fenêtre de Terminal et vérifiez avec `claude --version`. Les autres façons de l'installer sont dans la [documentation de Claude Code](https://code.claude.com/docs/en/setup).

## 2. Partir du modèle de départ

Le [modèle de départ](./starter-template) est un agent qui respecte déjà toutes les exigences de Supervaize : Claude Code n'aura qu'à y mettre la logique de votre agent.

1. Récupérez le modèle depuis [son dépôt GitHub](https://github.com/supervaize/supervaize-agent-template) : lancez `git clone https://github.com/supervaize/supervaize-agent-template.git`, ou choisissez **Code**, puis **Download ZIP**, et décompressez-le où vous voulez (le dossier s'appelle alors `supervaize-agent-template-main`).
2. Dans le Terminal, placez-vous dans son dossier et préparez Python :

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
cd supervaize-agent-template
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer pytest
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
cd supervaize-agent-template
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer pytest
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
cd supervaize-agent-template
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install supervaizer pytest
```

</TabItem>
</Tabs>

## 3. Lancer Claude Code et installer la skill Supervaizer

Toujours dans le dossier du modèle, lancez Claude Code :

```bash
claude
```

À la première ouverture, connectez-vous avec votre compte Claude. Puis installez la skill qui apprend à Claude Code à brancher un agent à Supervaize (voir [Supervaizer Integration](/docs/integrations/skills/supervaizer-integration)) :

```text
/plugin marketplace add supervaize/supervaizer
/plugin install supervaizer-integration@supervaizer
```

## 4. Décrire votre agent

Copiez ce message dans Claude Code, en remplaçant ce qui est entre chevrons :

```text
Ce dossier contient un modèle d'agent Supervaize. Transforme-le en agent de veille :
- Nom de l'agent : Agent veille <votre secteur>.
- Formulaire de lancement : l'adresse d'un flux RSS et le nombre d'articles (5 par défaut).
- Mission : suivre l'actualité d'un secteur. Job : une lecture du flux.
  Case : un article. Étapes : lire l'article, le résumer en deux phrases, avec le coût de chaque étape.
- Le résumé utilise <votre fournisseur d'IA>. La clé est un paramètre secret AI_API_KEY,
  jamais dans le code ni dans le formulaire.
- Garde la validation humaine à la fin du job.
Modifie agent.py et le formulaire dans controller.py, mets à jour les tests,
lance-les, et explique-moi ce que tu as changé.
```

Claude Code vous pose éventuellement quelques questions, modifie les fichiers, puis lance les tests. Lisez son résumé : c'est le moment de demander un changement, en langage courant (« ajoute le titre du site dans le résumé », « limite à 10 articles »…).

:::tip[Une autre tâche ?]
Pour un autre agent, gardez la même structure de message : ce que l'agent reçoit dans le formulaire, sa mission, son job, ses cases, ses étapes, les clés dont il a besoin, et ce qui doit être validé par un humain.
:::

## 5. Tester en local

Dans un **deuxième** Terminal ouvert dans le même dossier (avec l'environnement Python activé, comme à l'étape 2), lancez :

```bash
supervaizer start --local
```

Ouvrez **http://127.0.0.1:8000/manage/** dans votre navigateur : vous voyez votre formulaire et vous pouvez lancer un job. Si quelque chose ne va pas, décrivez-le à Claude Code (« le résumé est vide pour ce flux »), puis relancez.

## 6. Brancher l'agent à Studio

Demandez-le à Claude Code :

```text
Branche maintenant l'agent à Supervaize Studio pour que je puisse le tester.
```

Avec la skill, Claude Code lance `supervaizer login` (une page Studio s'ouvre : connectez-vous et approuvez), puis démarre l'agent avec une adresse publique. Si vous préférez faire ces commandes vous-même, suivez les étapes 4 à 6 du [guide express](./express-guide).

## 7. Lancer votre premier job

1. Dans Studio, ouvrez **Agents** : votre agent apparaît. La première fois, un administrateur de l'espace l'accepte sur la carte **Workspace Access**.
2. Renseignez le paramètre **AI_API_KEY** avec votre clé de fournisseur d'IA (il faut être administrateur de l'espace : c'est le cas si vous l'avez créé). Tant que ce paramètre manque, l'agent reste en **Pending Setup**.
3. Ouvrez **Missions**, créez une mission, choisissez votre agent, puis **Start Job**. Indiquez l'adresse du flux et lancez.
4. Cliquez sur **Update** pour suivre : chaque article devient un case, avec ses étapes et leur coût. À la fin, validez le job.

:::tip[Bravo]
Vous avez créé et branché votre premier agent. Il se lance en un clic, et chaque exécution est tracée dans Supervaize.
:::

## Si ça ne marche pas

| Ce qui se passe | La solution |
|---|---|
| `claude` est introuvable après l'installation | Ouvrez une nouvelle fenêtre de Terminal. Sinon, voir la [documentation de Claude Code](https://code.claude.com/docs/en/setup). |
| Les tests échouent | Demandez à Claude Code : « les tests échouent, trouve pourquoi et corrige ». |
| Le résumé est vide | Le flux ne contient peut-être pas le texte des articles : demandez à Claude Code d'utiliser le titre et la description. |
| L'agent n'apparaît pas dans Studio, ou il est hors ligne | Voir [FAQ et dépannage](./faq). |

## Et ensuite

- **Mettez l'agent en ligne** pour qu'il tourne sans votre ordinateur : voir [Choisir un hébergeur](./choose-a-host).
- **Changez de mission** : décrivez une autre tâche à Claude Code en gardant la structure de l'étape 4.
- **Vous avez déjà un workflow n8n ?** Il se branche à Studio sans code : voir [J'ai déjà un agent](./make-your-agent-supervaize-ready).

*Écrit pour Supervaizer 1.11.1, avec les libellés de Studio de novembre 2026.*
