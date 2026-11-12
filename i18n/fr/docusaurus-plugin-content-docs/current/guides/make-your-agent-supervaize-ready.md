---
title: J'ai déjà un agent — le rendre intégrable à Supervaize
sidebar_label: J'ai déjà un agent
sidebar_position: 3
description: Mettez votre agent en forme pour Supervaize, puis branchez-le à Studio en moins d'une heure.
---

# J'ai déjà un agent : le rendre intégrable à Supervaize

Votre agent fonctionne déjà : un script Python, une API, un workflow n8n… Ce guide vous aide à le mettre en forme pour Supervaize, puis à le brancher à Studio. Comptez 30 à 60 minutes.

Il ne remplace pas la documentation : il vous fait gagner du temps en rassemblant ce qu'il faut vérifier, dans l'ordre, avec des liens vers les pages de référence.

## Avant tout : définir vos missions, jobs, cases et étapes

C'est le point le plus important, et **c'est à vous de le décider** : Supervaize ne sait pas ce que fait votre agent. C'est la façon dont vous le définissez qui détermine ce qu'est, pour lui, une mission, un job, un case et une étape.

Lisez d'abord la page [Missions, jobs, cases, étapes](/docs/supervaizer-controller/core-concepts) : elle donne les définitions, les questions à se poser et des exemples. Faites ce choix avant d'écrire la moindre ligne, puis notez-le en une phrase par niveau.

Deux exemples en plus de ceux de la doc :

| Agent | Mission | Job | Case | Étapes |
|---|---|---|---|---|
| Intégration de produits fournisseurs | Catalogue de la collection hiver | Un envoi d'un fournisseur | Un produit | Lire les fichiers, convertir, traduire, faire valider, exporter |
| Réponses au service client | Service client de la marque | Une file de messages à traiter | Un message client | Comprendre la demande, chercher la commande, rédiger, faire valider, envoyer |

:::tip[Comment ça se traduit dans le code]
Les cases sont la liste des éléments que votre agent traite. Les étapes sont les moments où quelque chose peut échouer, coûter, attendre une personne ou produire un résultat. Si votre code ne permet pas de les distinguer, c'est par là qu'il faut commencer (étape 2).
:::

## Les exigences de Supervaize

Un agent est prêt quand il coche ces huit cases. La plupart des agents n'ont besoin que d'un petit emballage, pas d'une réécriture.

| # | Exigence | Référence |
|---|---|---|
| 1 | **Un point d'entrée unique** qui reçoit les entrées du formulaire et renvoie l'état du job. | [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup) |
| 2 | **Un formulaire de lancement simple**, avec les types de champs prévus par Supervaizer. Studio vérifie les valeurs, mais votre agent doit les revérifier. | [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup) |
| 3 | **Un découpage en cases et en étapes** conforme à vos définitions, avec un statut. | [Missions, jobs, cases, étapes](/docs/supervaizer-controller/core-concepts) |
| 4 | **Un coût par étape.** | [Déclaration des coûts](/docs/supervaizer-controller/cost-reporting) |
| 5 | **Aucun secret dans le code ni dans le formulaire** : les clés sont des paramètres, renseignés une fois par un administrateur de l'espace. | [Paramètres et secrets](/docs/supervaizer-controller/parameters) |
| 6 | **Un lancement idempotent**, et le travail long en arrière-plan avec `job.sync` et `job.stop`. | [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup) |
| 7 | **Une validation humaine** avant les actions irréversibles. | [Validation humaine](/docs/supervaizer-controller/human-in-the-loop) |
| 8 | **Une adresse publique joignable par Studio**, puis un hébergement stable. | [Démarrage rapide](/docs/supervaizer-controller/quickstart), [Déploiement dans le cloud](/docs/supervaizer-controller/deploy) |

:::caution[Les fichiers dans le formulaire de lancement]
Le type de champ `file` existe dans Supervaizer, mais en novembre 2026, le formulaire de lancement de Studio affichait encore « File fields are not supported here ». En attendant, demandez un lien (Drive, Dropbox) et laissez l'agent télécharger le fichier.
:::

## 1. Choisir votre chemin

| Votre agent est… | Le chemin |
|---|---|
| **Un workflow n8n** | Pas de code : liez-le dans Studio en suivant [Intégration n8n](/docs/integrations/n8n-integration). |
| **Du code Python** | Ajoutez un fichier `supervaizer_control.py` qui emballe votre agent (étapes 2 à 7). |
| **Une API dans un autre langage** (Node, Go…), ou un scénario Make, Zapier ou autre qui démarre par un webhook | Même chemin que Python : `supervaizer_control.py` appelle votre adresse web au lieu d'appeler une fonction. |
| **Rien de tout ça, ou vous partez de zéro** | Partez du [modèle de départ](./starter-template), déjà conforme : vous n'avez qu'à y mettre votre logique. |

## 2. Mettre votre agent en forme

Avant de brancher quoi que ce soit, isolez dans votre code **une seule fonction** qui fait tout le travail. Elle reçoit les entrées du formulaire et renvoie un résultat par case :

```python
def lancer(entrees: dict) -> list[dict]:
    """Point d'entrée unique de l'agent : appelé une fois par job."""
    resultats = []
    for element in recuperer_elements(entrees["lien"]):
        try:
            sortie, cout = traiter(element)          # votre logique actuelle
            resultats.append({"nom": element.nom, "ok": True,
                              "cout": cout, "resultat": sortie})
        except Exception as erreur:
            resultats.append({"nom": element.nom, "ok": False,
                              "cout": 0, "message": str(erreur)})
    return resultats
```

Ce n'est pas encore le format de Supervaize : c'est la forme qui rend la traduction simple, à l'étape suivante. Vérifiez quatre points :

- **Rien d'interactif** : pas de `input()` ni de question dans le Terminal. Tout arrive dans `entrees`.
- **Les secrets sont lus au moment du travail**, pas au chargement du fichier : Supervaizer charge les paramètres après le démarrage.
- **Une erreur sur un élément n'arrête pas tout** : elle est notée sur cet élément, et l'agent passe au suivant.
- **Relancer ne crée pas de doublon** : traiter deux fois le même élément ne refait pas l'action.

Testez la fonction seule, sans Supervaize, avant de passer à la suite.

## 3. Faire le branchement avec un assistant de code

Le plus simple est de confier le branchement à un assistant de code avec la skill officielle : voir [Supervaizer Integration](/docs/integrations/skills/supervaizer-integration) pour l'installer. Elle vous pose des questions, écrit `supervaizer_control.py` et ses tests, et lance l'agent.

Pour qu'elle respecte d'emblée ce guide, donnez-lui ce prompt :

```text
Intègre cet agent à Supervaize. Le point d'entrée est la fonction lancer().
Mission : <votre phrase>. Job : <votre phrase>. Case : <votre phrase>.
Étapes : <votre liste>. Un coût par étape.
Le formulaire de lancement demande des liens, pas de fichiers.
Les clés API sont des paramètres secrets, jamais des champs du formulaire.
Ajoute une validation humaine avant toute action irréversible.
```

:::tip[Vous préférez le faire à la main ?]
Suivez [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup), ou notre [guide express](./express-guide), qui montre où modifier le fichier créé par `supervaizer scaffold`.
:::

## 4. Vérifier en local

Lancez l'agent avec `supervaizer start --local` et ouvrez l'interface d'administration (voir [Démarrage rapide](/docs/supervaizer-controller/quickstart)). Avant d'aller plus loin, vérifiez que :

- le formulaire affiche les bons champs, avec des libellés compréhensibles ;
- chaque élément traité apparaît comme un case, avec les étapes que vous avez définies ;
- les coûts s'affichent ;
- une erreur sur un élément s'affiche proprement sans bloquer les autres ;
- relancer le même job ne change rien ;
- un job long peut être suivi, puis arrêté.

## 5. Configurer les variables

Votre agent a maintenant deux sortes de réglages, à ne pas mélanger.

**Les variables de connexion à Supervaize.** Elles disent à l'agent à quel espace Studio il appartient et lui permettent de vérifier que les appels viennent bien de Studio. Lancez `supervaizer login` dans le dossier de l'agent (si vous avez utilisé la skill à l'étape 3, elle l'a déjà fait) : la commande les écrit dans `.env` (le détail est à l'étape 4 du [guide express](./express-guide)). Ajoutez-y vous-même `SUPERVAIZER_SERVER_ID`, un identifiant fixe généré avec `python -c "import uuid; print(uuid.uuid4())"`, pour retrouver le même agent après chaque redémarrage.

**Les réglages propres à votre agent** : sa clé de fournisseur d'IA, l'accès à votre base de données, etc. Ne les laissez pas dans un `.env` que vous seul connaissez : déclarez-les comme paramètres (voir [Paramètres et secrets](/docs/supervaizer-controller/parameters)). Un administrateur de l'espace les renseigne une fois dans Studio, et chaque client peut avoir les siens.

:::tip[Sans toucher à votre code]
Si votre code lit déjà ses clés avec `os.environ["NOM"]`, déclarez le paramètre avec `is_environment=True` : Supervaizer le place dans l'environnement, et votre code continue de fonctionner tel quel. Pensez à le lire au moment du travail, pas au chargement du fichier.
:::

## 6. Brancher à Studio

Pour tester, donnez à l'agent une adresse publique avec un tunnel, puis démarrez-le avec `supervaizer start --env-file .env --public-url <adresse du tunnel>` : voir les étapes 5 et 6 du [guide express](./express-guide). Sur la page de l'agent dans Studio, un administrateur de l'espace accepte l'accès dans **Workspace Access** et renseigne les paramètres. Lancez ensuite un premier job.

## 7. Héberger l'agent

Le tunnel suffit pour tester, mais il s'arrête quand votre ordinateur s'éteint. Pour de vrais utilisateurs, hébergez l'agent sur votre propre compte (Supervaize ne l'héberge pas). L'étape 8 du [guide express](./express-guide) montre la méthode la plus simple, avec Render, et [Choisir un hébergeur](./choose-a-host) présente les autres options. Pour un agent existant, vérifiez en plus que :

- `requirements.txt` (ou `pyproject.toml`) liste **toutes** les dépendances de l'agent, plus `supervaizer` ;
- les variables de connexion de votre `.env` sont recopiées dans les réglages de l'hébergeur, `SUPERVAIZER_SERVER_ID` compris, plus `SUPERVAIZER_PUBLIC_URL` avec l'adresse de l'hébergeur ;
- les réglages propres à l'agent sont des paramètres, renseignés dans Studio, pas des lignes de `.env` ;
- l'agent a un disque persistant s'il garde des fichiers entre deux jobs.

:::caution[Ce que nous avons constaté]
Démarrez toujours avec `python supervaizer_control.py` (ou `supervaizer start`), qui enregistre l'agent auprès de Studio. Lancé avec `uvicorn` seul, l'agent répond mais n'apparaît pas dans Studio.
:::

## 8. Après la mise en ligne

L'agent tourne : voici ce qui reste à prévoir pour qu'il tienne dans la durée.

| Sujet | Ce qu'il faut savoir ou faire | Référence |
|---|---|---|
| **L'agent dans Studio** | Tant que ses paramètres ne sont pas renseignés, Studio l'affiche en **Pending Setup**. S'il est en pause, un clic sur **Resume** le relance. Studio ne rafraîchit pas tout seul : la progression arrive à la prochaine action ou avec **Update**. | [Paramètres et secrets](/docs/supervaizer-controller/parameters), [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup) |
| **Plusieurs jobs, plusieurs clients** | Un même agent peut recevoir des jobs de plusieurs espaces Studio, en même temps. Rangez l'état de chaque job sous son identifiant, et ne montrez à un espace que ses propres jobs. | [Modèle de départ](./starter-template) |
| **Mettre à jour l'agent** | Augmentez sa version, augmentez `a2ui_catalog_version` si un formulaire change, gardez le même `SUPERVAIZER_SERVER_ID`, relancez les tests, puis redéployez. Après un changement de paramètre dans Studio, redémarrez l'agent. | [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup) |
| **Tests automatiques** | Avant chaque mise en ligne, testez les actions comme le ferait Studio, y compris le lancement répété (idempotence). | [Construire votre contrôleur](/docs/supervaizer-controller/controller-setup) |
| **Sécurité et données** | Aucun secret dans les journaux, les titres d'étapes ou les messages d'erreur. Sachez où sont stockés les fichiers de vos clients et combien de temps (RGPD). Si un pare-feu filtre le trafic, suivez les règles réseau de la doc. | [Paramètres et secrets](/docs/supervaizer-controller/parameters), [Sécurité réseau](/docs/supervaizer-controller/network-security) |
| **Surveillance** | Branchez une alerte sur l'adresse de santé `/.well-known/health` de l'agent : vous saurez qu'il est tombé avant vos utilisateurs. | [Déploiement dans le cloud](/docs/supervaizer-controller/deploy) |
| **Aller plus loin** | Règles de contrôle, configuration des jobs, statistiques, lancements programmés. | [Garde-fous](/docs/supervaizer-controller/rule-checkpoints), [Configurateur de job](/docs/supervaizer-controller/job-configurator), [Analyses des jobs et des missions](/docs/supervaizer-controller/job-analytics) |

:::tip[Vérifier avant de brancher]
Le [modèle de départ](./starter-template) contient `verify_agent.py`, un script qui contrôle les variables, les adresses et la santé de l'agent, et dit en clair ce qui manque, sans jamais afficher de secret.
:::

## Check-list « prêt pour Supervaize »

- [ ] Mission, job, case et étapes définis en une phrase chacun
- [ ] Un seul point d'entrée, testé seul
- [ ] Un formulaire simple, avec des liens plutôt que des fichiers
- [ ] Un coût par étape
- [ ] Aucun secret dans le code ni dans le formulaire : les réglages de l'agent sont des paramètres
- [ ] Variables de connexion écrites par `supervaizer login`, plus `SUPERVAIZER_SERVER_ID`
- [ ] Un lancement idempotent, et le travail long suivi avec `job.sync` et `job.stop`
- [ ] Une validation humaine avant les actions irréversibles
- [ ] Testé en local, puis dans Studio
- [ ] Hébergé avec une adresse stable

*Écrit pour Supervaizer 1.11.1, avec les libellés de Studio de novembre 2026.*
