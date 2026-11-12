# Contrat de configuration guidée — squelette de spécification du SDK {#guided-setup-contract--sdk-spec-skeleton}

Statut : figé. Les noms et les types des champs sont fixés par le gel de contrat approuvé
dans le dépôt racine RUNWAIZE,
`docs/2026-10-28-guided-setup-contract-freeze.md` (2026-10-28). Les modèles
se trouvent dans `src/supervaizer/contracts.py` et sont documentés dans
`2026_05_SUPERVAIZER_v2.md` (Introduction, Setup plan and field schema, Help
actions and dry runs, Idempotency).

Travail côté Supervaizer pour le parcours de campagne en libre-service par chat (voir
`studio/Documentation/specifications/self_service_campaign_chat_flow.md`).
Le SDK ne définit que des contrats génériques ; aucun vocabulaire propre à un agent.

## Objectif {#objective}

Un agent peut déclarer tout ce dont Studio a besoin pour afficher une configuration guidée par chat,
reprenable et transparente sur les coûts, sans accords informels entre un
agent et Studio.

## Périmètre {#scope}

- **Bloc de présentation de l'agent.** Étendre l'enregistrement de l'agent avec un slogan,
  un court texte « ce que je fais », des exemples d'objectifs et un avatar facultatif. Aujourd'hui, seuls
  `name` et `description` existent (`src/supervaizer/agent.py`). Studio l'affiche
  dans la liste des agents et en ouverture du chat.
- **Schéma de configuration typé.** Formaliser ce qui est aujourd'hui informel entre
  agent_interviewer et Studio : `depends_on` (champs conditionnels),
  choix `{value, label}`, `min_rows`, ainsi que des règles de validation de champ au-delà de
  `required`. Aujourd'hui, `AgentMethodField` s'arrête au type, aux choix, à la valeur par défaut et au widget.
- **Plan de configuration typé.** Remplacer le `plan: dict` non typé de la politique de configuration v2
  (`V2JobSetupPolicy.plan`, ligne 663 de `src/supervaizer/contracts.py` avant
  le gel) et le `V2ActionResult.setup_plan` non typé (ligne 1331 avant le
  gel) par un modèle d'assistant multi-étapes typé, `V2SetupPlan`. Un dictionnaire reste
  accepté et passe sans modification.
- **Actions d'aide.** Un moyen générique pour un agent d'exposer des actions d'aide au moment de la configuration
  (suggérer, valider) qu'un client peut appeler en cours de configuration et dont
  les résultats correspondent à un brouillon d'un champ de configuration.
- **Classification des essais à blanc.** Un moyen déclaré de marquer une action comme un essai,
  défini par son résultat et non par son stockage : un essai à blanc PEUT créer des données de session
  temporaires et PEUT engendrer des coûts de modèle (qu'il déclare), mais NE DOIT envoyer aucune
  communication externe et NE DOIT PAS apparaître dans les résultats de campagne ni dans les analyses.
  Les données temporaires expirent ou peuvent être supprimées.
- **Estimation de coût.** Un champ facultatif d'estimation de coût dans la réponse d'aperçu
  que les clients affichent avant la confirmation. Le champ exprime l'incertitude : une fourchette
  ou un « inconnu » explicite, jamais un faux nombre exact.
- **Idempotence.** Documenter la clé d'idempotence de confirmation comme faisant partie du contrat
  v2, y compris les règles de nouvelle tentative du client après un résultat incertain. Ajouter un
  test de conformité que les agents doivent réussir : rejouer une confirmation avec la même
  clé d'opération et les mêmes identités donne le même résultat et ne crée rien de nouveau.
- **Action d'écriture en mémoire (phase 2).** Une action générique permettant à un agent de stocker une
  préférence propre à l'utilisateur dans la plateforme, la visibilité pour l'utilisateur étant garantie
  par le client.

## Discipline de contrat {#contract-discipline}

Mettre à jour le producteur et le consommateur dans le même chantier, avec des tests des deux côtés,
et mettre à jour la documentation du protocole v2 (`2026_05_SUPERVAIZER_v2.md`).

## Compatibilité {#compatibility}

Chaque nouveau champ et chaque nouvelle action de cette spécification est facultatif. Un agent qui n'en déclare
aucun conserve son comportement actuel ; les clients reviennent à l'affichage
actuel. Vérifiez-le avec un test d'enregistrement sur un agent v2 non modifié.

## Questions ouvertes {#open-questions}

- Où vit, dans le schéma, un contenu long de type scénario : dans un type de champ ou
  dans une référence d'artefact ?

## Critères de réussite {#success-criteria}

1. Studio affiche les champs conditionnels et la validation à partir du seul schéma,
   sans aucun code propre à un agent.
2. Un second agent obtient gratuitement la liste des agents, la configuration guidée et l'essai à blanc
   en remplissant le contrat.


*Uploaded on 2026-11-06 15:07:19*
