---
title: Questions fréquentes et dépannage
sidebar_label: FAQ et dépannage
sidebar_position: 6
description: Les réponses aux questions qu'on se pose en branchant un agent, et un parcours de dépannage pas à pas.
---

# Questions fréquentes et dépannage

## Questions fréquentes

**Supervaize héberge-t-il mon agent ?**
Non. Votre agent tourne chez l'hébergeur de votre choix, sur votre compte ; Studio le pilote à distance par son adresse publique. Voir [Choisir un hébergeur](./choose-a-host).

**Qu'est-ce que je paie ?**
Trois choses distinctes : votre espace Supervaize, l'hébergement de l'agent (chez l'hébergeur) et les appels à votre fournisseur d'IA (chez lui). Le coût que l'agent déclare à chaque étape apparaît dans Studio : voir [Déclaration des coûts](/docs/supervaizer-controller/cost-reporting).

**Quelles données Studio reçoit-il ?**
Les valeurs saisies dans le formulaire de lancement, et ce que l'agent lui renvoie : l'état du job, les cases, les étapes et leurs informations. Les fichiers et les données que l'agent traite restent là où il tourne, sauf si vous les mettez dans l'état du job. Ne mettez jamais de secret dans l'état, les titres ou les messages : voir [Paramètres et secrets](/docs/supervaizer-controller/parameters).

**Faut-il savoir coder ?**
Pas besoin d'écrire le code : avec Claude Code, vous décrivez l'agent et il l'écrit, le teste et le branche (voir [Mon premier agent](./build-your-first-agent)). Il faut seulement lancer quelques commandes dans le Terminal. Le contrôleur Supervaizer est en Python, mais un agent existant peut être écrit dans n'importe quel langage s'il a une adresse web que le contrôleur appelle. Un workflow n8n se branche sans code (voir [J'ai déjà un agent](./make-your-agent-supervaize-ready)).

**Mon agent est fait avec Make, Zapier ou un autre outil sans code. Comment faire ?**
S'il démarre par un webhook, un petit contrôleur Python l'appelle : partez du [modèle de départ](./starter-template) et remplacez `process_item()` par un appel à votre webhook.

**Est-ce que ça marche sur Windows ?**
Oui. Les guides donnent les commandes pour Mac, Linux et Windows (PowerShell).

**Un agent peut-il servir plusieurs clients ?**
Oui : chaque client a son espace Studio, et un administrateur de chaque espace renseigne ses propres paramètres. Votre agent doit ranger les jobs par identifiant et ne montrer à un espace que ses propres jobs ; le modèle de départ le fait déjà.

**Pourquoi Studio n'affiche-t-il pas l'avancement en temps réel ?**
Studio n'interroge pas l'agent tout seul : la progression arrive avec la prochaine action, ou quand quelqu'un clique sur **Update**. Voir [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup).

## Dépannage pas à pas

Commencez par lancer `python verify_agent.py` dans le dossier de l'agent (voir [Modèle de départ](./starter-template)) : il repère la plupart des problèmes ci-dessous. Les messages d'erreur détaillés sont dans [Dépannage](/docs/supervaizer-controller/troubleshooting).

### L'agent n'apparaît pas dans Studio

1. **Comment l'avez-vous démarré ?** Avec `uvicorn` seul, il ne s'enregistre pas : démarrez avec `supervaizer start` ou `python supervaizer_control.py`.
2. **Le journal de démarrage montre-t-il une erreur d'enregistrement ?** Une erreur 403 vient souvent de l'espace, de la clé ou de l'abonnement : voir Troubleshooting, « Error sending event SERVER_REGISTER (403) ». Relancer `supervaizer login` règle la plupart des cas.
3. **Regardez-vous le bon espace Studio ?** L'agent apparaît dans l'espace choisi lors de `supervaizer login`.
4. **Un nouvel agent apparaît à chaque redémarrage ?** Fixez `SUPERVAIZER_SERVER_ID`.

### Studio affiche l'agent hors ligne

1. **L'agent tourne-t-il encore ?** Regardez le Terminal ou les journaux de l'hébergeur.
2. **L'adresse publique répond-elle ?** `python verify_agent.py --url <adresse>` le teste.
3. **Avec un tunnel :** l'adresse change à chaque relance du tunnel. Relancez l'agent avec la nouvelle adresse.
4. **Chez un hébergeur :** l'offre met-elle le service en veille ? Voir [Choisir un hébergeur](./choose-a-host).

### Le job reste « en cours »

1. **Avez-vous cliqué sur Update ?** Studio ne rafraîchit pas tout seul.
2. **L'agent déclare-t-il `job.sync` ?** Sans lui, Studio ne peut pas demander l'état.
3. **L'agent est-il sur Google Cloud Run ?** Par défaut, le travail en arrière-plan se fige après la réponse : voir [Choisir un hébergeur](./choose-a-host).
4. **Le travail a-t-il planté ?** Cherchez l'erreur dans les journaux de l'agent ; une erreur sur un élément doit apparaître sur son case, sans bloquer les autres.

### Le formulaire ne change pas dans Studio

Augmentez `a2ui_catalog_version` à chaque changement de formulaire, puis redémarrez l'agent.

### « File fields are not supported here »

Le type de champ `file` existe dans Supervaizer, mais le formulaire de lancement de Studio ne l'affichait pas encore en novembre 2026. Demandez un lien (Drive, Dropbox) à la place.

### Erreur `CERTIFICATE_VERIFY_FAILED`

Sur Mac, avec un Python installé depuis python.org, lancez une fois « Install Certificates.command » (dossier Applications › Python). Ailleurs, vérifiez les certificats du système ou un éventuel proxy d'entreprise.
