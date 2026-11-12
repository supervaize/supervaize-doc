---
id: n8n-integration
title: Intégration n8n
displayed_sidebar: integrationsSidebar
---

# Intégration n8n {#n8n-integration}

Supervaize Studio peut utiliser un workflow n8n comme agent.

Cela vous permet de :

- lier un workflow n8n existant par son URL
- l'exécuter depuis Supervaize en tant que job
- transmettre à n8n les entrées du job et les paramètres de l'agent
- suivre l'avancement de l'exécution dans Supervaize
- si besoin, mettre le workflow en pause pour une validation humaine (mode MCP)

## Deux modes d'intégration {#two-integration-modes}

### 1. Zero-touch (par défaut) {#1-zero-touch-default}

Utilisez ce mode quand vous voulez la mise en place la plus rapide, sans modifier votre workflow.

Ce qu'il vous faut :

- un workflow n8n avec un nœud déclencheur **Webhook**
  - par exemple : [`hello_world_zero_touch.json`](/examples/n8n/hello_world_zero_touch.json)
- une **clé d'API n8n**
  - voir [obtenir l'API n8n](#get-n8n-api-) pour savoir comment obtenir votre clé d'API

Ce que fait Supervaize :

- il déclenche votre webhook n8n
- il interroge automatiquement le statut de l'exécution n8n
- il crée des étapes de case à partir des nœuds n8n terminés

Adapté pour :

- les workflows à webhook existants
- une prise en main rapide
- les cas sans étape de validation humaine

### 2. Compte rendu MCP (avancé) {#2-mcp-reporting-advanced}

Utilisez ce mode quand vous voulez un suivi détaillé de l'avancement et la validation humaine.

Ce qu'il vous faut :

- un workflow n8n qui contient des nœuds **MCP Client**
- une **clé d'API n8n** (utilisée pour la liaison, les métadonnées et certaines opérations à l'exécution)
- le **jeton du serveur MCP n8n**, fourni par n8n (Studio appelle n8n avec ce jeton)
- le **jeton MCP Studio**, fourni par Studio (les nœuds MCP Client appellent Studio avec ce jeton)
- des nœuds MCP Client configurés pour appeler le point d'accès MCP de Supervaize `https://<your-studio>/mcp/agent/<workspace>`

Ce que vous y gagnez :

- un compte rendu explicite du démarrage, des étapes et du statut des cases
- des demandes de saisie humaine envoyées de n8n à Supervaize
- la reprise du workflow après la décision de l'utilisateur

## Avant de commencer {#before-you-start}

Préparez ces valeurs :

- `Workflow URL` (par exemple `https://n8n.example.com/workflow/<id>`)
- `n8n API Key` (dans n8n, allez dans `Settings` -> `n8n API`, puis cliquez sur **Create an API Key**)
- `n8n MCP server token` (seulement pour le mode MCP ; dans n8n, allez dans `Settings` -> `Instance-level MCP`)

#### Obtenir `n8n API` : {#get-n8n-api-}

![Configuration de la clé d'API n8n](/img/n8n_api_setup.png)

#### Configurer `Instance-level MCP` : {#setup-instance-level-mcp-}

Pour le jeton MCP dans n8n :

- vérifiez que **Instance-level MCP** est sur **Enabled**
- ouvrez **Connection details** et copiez le jeton d'accès
- si la page affiche `No workflows enabled`, cliquez sur **Enable workflows** pour les workflows que les clients MCP doivent pouvoir découvrir et exécuter

![Configuration de Instance-level MCP dans n8n](/img/n8n_instance_level_mcp.png)

Exigences du workflow selon le mode :

- Zero-touch : il doit contenir un nœud déclencheur `Webhook`.
- Mode MCP : il doit contenir des nœuds MCP Client qui appellent des outils Supervaize comme `report_case_start`, `report_case_step`, `request_human_input`, `get_case_status` et `report_case_status`.

## Enregistrer une instance n8n {#save-an-n8n-instance}

Enregistrez chaque instance n8n une seule fois. Les workflows du même hôte réutilisent ses identifiants.

La page n8n se trouve dans le menu des réglages de l'espace de travail, sous **Tools**. Elle s'affiche quand vous avez un accès Developer et que la fonctionnalité n8n est activée pour l'espace de travail.

1. Ouvrez **Settings**, puis **Tools**. La page s'intitule **n8n Integrations**.
2. Dans **n8n instances**, cliquez sur **Add n8n instance**.
3. Saisissez le champ **n8n base URL**.
4. Saisissez le champ **n8n API key**. Vous pouvez l'ajouter plus tard.
5. Pour le mode MCP, saisissez le champ **n8n MCP server token (Studio → n8n)**.
6. Cliquez sur **Save**.

Pour modifier une instance, cliquez sur **Edit** sur sa ligne. Les secrets enregistrés sont masqués.

### Jeton MCP Studio (mode MCP) {#studio-mcp-token-mcp-mode}

Les nœuds MCP Client de votre workflow ont besoin d'un jeton fourni par Studio. Ce jeton n'est pas le jeton du serveur MCP n8n.

1. Cliquez sur **Edit** sur l'instance.
2. Dans **Studio MCP token (n8n → Studio)**, cliquez sur **Generate Studio MCP token**.
3. Copiez l'URL du serveur et le jeton. Studio les affiche une seule fois.
4. Dans chaque nœud MCP Client de n8n, renseignez l'URL du serveur et l'identifiant Bearer avec ces valeurs.

Le jeton est lié à cet espace de travail et à cette instance. **Regenerate Studio MCP token** révoque le jeton précédent. Ne collez pas le jeton Studio dans le champ du jeton du serveur MCP n8n.

## Lier un workflow par son URL (recommandé) {#link-a-workflow-by-url-recommended}

Dans Supervaize Studio :

1. Ouvrez **Settings**, puis **Tools**.
2. Cliquez sur **Link workflow**. La boîte de dialogue **Link n8n workflow** s'ouvre.
3. Dans **n8n instance**, sélectionnez une instance enregistrée. Ou sélectionnez l'option de nouvelle instance.
4. Collez la valeur de **Workflow URL**. Avec une instance enregistrée, l'URL doit être sur le même hôte.
5. Pour un nouvel hôte, saisissez le champ **n8n API key (first time)**.
6. Laissez **Enable MCP reporting** désactivé pour le mode zero-touch, ou activez-le pour le mode MCP.
7. Si le compte rendu MCP est activé, saisissez le champ **n8n MCP server token (Studio → n8n)**. Laissez-le vide pour utiliser le jeton enregistré sur l'instance.
8. (Facultatif) Si le webhook utilise une authentification dans n8n, sélectionnez **Webhook uses authentication in n8n**. Sélectionnez ensuite **Header Auth** ou **Basic Auth**.
9. (Facultatif) Ajoutez des paramètres dans **Workflow parameters (optional)** avec **Add parameter**. Chaque paramètre a un nom, une description, et les options **Secret** et **Required**.
10. Cliquez sur **Link workflow**.

Ce qui se passe automatiquement :

- Supervaize récupère les métadonnées de votre workflow dans n8n
- il détecte le chemin du webhook (pour le mode zero-touch)
- il détecte automatiquement les paramètres à partir des identifiants et des nœuds de code
- il crée un agent lié à ce workflow n8n

## Importer un workflow depuis un fichier JSON (alternative) {#import-a-workflow-from-json-alternative}

Vous pouvez aussi cliquer sur **Import JSON** et importer le JSON d'un workflow exporté depuis n8n.

Utilisez cette méthode quand :

- vous avez déjà exporté un fichier de workflow
- vous voulez importer sans passer par l'URL du workflow

Dans la boîte de dialogue **Import workflow JSON**, vous fournissez :

- le champ **n8n instance**, ou un nouveau champ **n8n host URL**
- le champ **n8n API key (optional)**
- le champ **Workflow file**, ou le champ **Workflow JSON** collé sous forme de texte
- le champ **Workflow name** (obligatoire)

Cliquez sur **Import** pour créer l'agent.

## Comment votre workflow n8n reçoit les données {#how-your-n8n-workflow-receives-data}

Quand un job démarre, Supervaize envoie à n8n une charge utile JSON (entrée webhook ou MCP) qui contient :

- `job_id`
- `job_context`
- `job_fields`
- `agent_parameters`

Structure type :

```json
{
  "job_id": "...",
  "job_context": { "workspace_id": "...", "started_by": "..." },
  "job_fields": { "Some input": "value" },
  "agent_parameters": { "API_KEY": "...", "LOOKUP_COUNT": "3" }
}
```

Dans les nœuds Code de n8n, lisez-la depuis le corps du webhook (modèle courant) :

```javascript
const body = $input.first().json.body || $input.first().json;
const agentParams = body.agent_parameters || {};
const jobFields = body.job_fields || {};
```

## Paramètres : ce que les utilisateurs configurent dans Supervaize {#parameters-what-users-configure-in-supervaize}

Supervaize peut créer des paramètres d'agent à partir :

- des identifiants n8n utilisés dans le workflow
- des références dans le code, comme `agent_parameters.API_KEY`
- des paramètres que vous définissez à la main pendant la liaison

Comportement :

- les noms qui contiennent `KEY`, `SECRET`, `TOKEN` ou `PASSWORD` sont traités comme des secrets
- certains indicateurs obligatoire/facultatif sont déduits des modèles de code
- les utilisateurs renseignent ces valeurs dans la configuration de l'agent avant de lancer des jobs

## Exécuter le workflow depuis Supervaize {#running-the-workflow-from-supervaize}

Après la liaison :

1. Ouvrez l'agent créé.
2. Renseignez les paramètres obligatoires de l'agent.
3. Démarrez un job depuis Supervaize.
4. Suivez l'avancement du job et des cases dans Supervaize.

En mode zero-touch :

- Supervaize interroge n8n (environ toutes les 10 secondes, pendant 20 minutes au maximum par exécution)
- chaque nœud n8n terminé apparaît comme une étape de case
- une étape de synthèse finale est ajoutée à la fin de l'exécution

En mode MCP :

- l'avancement dépend de ce que vos nœuds MCP Client rapportent
- les étapes de validation humaine peuvent mettre le workflow en pause jusqu'à ce qu'un utilisateur réponde dans Supervaize

## Validation humaine (mode MCP) {#human-in-the-loop-mcp-mode}

Le mode MCP prend en charge les boucles d'approbation et de décision :

1. n8n appelle `request_human_input`
2. Supervaize affiche la question ou le formulaire dans le case
3. Un utilisateur répond dans Supervaize
4. n8n appelle `get_case_status` (ou reprend par le flux MCP prévu)
5. Le workflow continue en fonction de la réponse

Utilisez le mode MCP quand votre workflow a besoin :

- d'approbations
- d'une confirmation par un opérateur
- d'une correction ou d'une sélection manuelle

## Exemples de workflows (fichiers joints) {#example-workflows-attached-files}

Les trois fichiers d'exemple correspondent aux modes d'utilisation pris en charge.

Téléchargez les exemples :

- [`hello_world_zero_touch.json`](/examples/n8n/hello_world_zero_touch.json)
- [`zero_touch_exp_1.json`](/examples/n8n/zero_touch_exp_1.json)
- [`HITL_exp.json`](/examples/n8n/HITL_exp.json)

### `hello_world_zero_touch.json` (premier test) {#hello_world_zero_touchjson-first-test}

Ce que c'est :

- Un exemple zero-touch minimal
- Flux : `Webhook` -> `Code` -> `Respond to Webhook`
- Adapté à un premier test de connectivité

Comment l'utiliser :

1. Importez-le dans n8n (`Import from File` ou collez le JSON).
2. Activez le workflow dans n8n.
3. Dans Supervaize, liez-le avec **Link workflow** (laissez le compte rendu MCP désactivé).
4. Démarrez un job de test.
5. Vérifiez que Supervaize crée un case et affiche les étapes des nœuds webhook, code et réponse.

### `zero_touch_exp_1.json` (paramètres + validation) {#zero_touch_exp_1json-parameters--validation}

Ce que c'est :

- Un exemple zero-touch concret avec validation des paramètres
- Il lit `agent_parameters` et `job_fields`
- Il montre le contrôle d'un paramètre obligatoire pour `API_KEY`

Comment l'utiliser :

1. Importez et activez le workflow dans n8n.
2. Liez-le dans Supervaize avec **Link workflow** (compte rendu MCP désactivé).
3. Ouvrez l'agent créé et vérifiez que les paramètres ont été détectés (par exemple `API_KEY`, `LOOKUP_COUNT`, `NOTIFICATION_EMAIL`).
4. Renseignez `API_KEY` (obligatoire). Si besoin, renseignez `LOOKUP_COUNT` et `NOTIFICATION_EMAIL`.
5. Démarrez un job et examinez les étapes du case et la réponse finale dans Supervaize.

Remarques :

- Si `API_KEY` est absent, le workflow lève volontairement une erreur. C'est utile pour tester la validation des paramètres et le compte rendu des échecs.

### `HITL_exp.json` (MCP + validation humaine) {#hitl_expjson-mcp--human-in-the-loop}

Ce que c'est :

- Un exemple MCP avec validation humaine
- Il contient plusieurs nœuds `MCP Client` et un nœud `Wait`
- Il montre un modèle avancé pour les étapes de décision humaine

Comment l'utiliser :

1. Importez et activez le workflow dans n8n.
2. Configurez les nœuds MCP Client dans n8n pour appeler le point d'accès MCP et les outils de Supervaize.
3. Dans Supervaize, liez le workflow par son URL et activez **Enable MCP reporting**.
4. Saisissez votre **jeton du serveur MCP n8n** pendant la liaison. Ajoutez un jeton MCP Studio à chaque nœud MCP Client.
5. Démarrez un job et surveillez les étapes rapportées par MCP dans le case.
6. Quand une demande de saisie humaine apparaît, répondez dans Supervaize.
7. Vérifiez que le workflow reprend et se termine dans n8n et dans Supervaize.

Important :

- Cet exemple nécessite la configuration des nœuds MCP dans n8n. Il ne fournit pas de validation humaine en mode zero-touch.

Parcours de prise en main recommandé :

1. Commencez par `hello_world_zero_touch.json`
2. Passez à `zero_touch_exp_1.json`
3. Utilisez `HITL_exp.json` quand vous avez besoin d'approbations ou de validation humaine

## Dépannage {#troubleshooting}

### « Invalid n8n authentication credentials » {#invalid-n8n-authentication-credentials}

Vérifiez que :

- la clé d'API est valide
- l'URL du workflow pointe vers la bonne instance n8n
- le workflow est accessible avec cette clé

### « Workflow not found or not accessible » {#workflow-not-found-or-not-accessible}

Vérifiez que :

- l'URL est l'URL directe du workflow (pas une page de liste)
- l'identifiant du workflow existe
- votre clé d'API n8n a la permission de le lire

### Le job zero-touch ne démarre pas {#zero-touch-job-does-not-start}

Vérifiez que :

- le workflow contient un nœud déclencheur `Webhook`
- le chemin du webhook est configuré sur ce nœud
- le serveur n8n est joignable depuis Supervaize
- `n8n_api_key` est configuré sur l'agent

### Aucune étape de validation humaine n'apparaît dans Supervaize {#no-hitl-step-appears-in-supervaize}

Vérifiez que :

- le mode MCP a été activé lors de la liaison
- le jeton du serveur MCP n8n est renseigné sur le formulaire de liaison ou sur l'instance
- le jeton MCP Studio est renseigné dans chaque nœud MCP Client
- le workflow contient des nœuds MCP Client
- les nœuds MCP Client appellent les outils MCP de Supervaize (`request_human_input`, etc.)

## Bonnes pratiques {#best-practices}

- Utilisez d'abord le mode zero-touch, sauf si vous avez précisément besoin de la validation humaine.
- Gardez des noms de paramètres stables (`API_KEY`, `PHONE_NUMBER`, etc.) pour que la configuration existante de l'agent reste réutilisable.
- Marquez les secrets comme paramètres secrets dans le formulaire de liaison.
- Ajoutez un workflow de test simple à base de webhook avant de lier un workflow de production.
