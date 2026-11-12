# Démarrage planifié {#scheduled-start}


> **Créé le :** 2026-10-11
> **Statut :** implémenté dans Supervaizer.
> **Équivalent côté Studio :** `studio/Documentation/specifications/job_scheduling.md`

Studio peut démarrer un job selon un calendrier. Le calendrier, l'horloge et la politique d'échec vivent dans Studio. Supervaizer se contente de déclarer qu'un agent accepte d'être démarré ainsi, puis reçoit un `job.start` normal.

## Capacité {#capability}

Sur l'enregistrement d'un agent v2, `capabilities.scheduled_start` est un booléen facultatif.

| Valeur sur le réseau | Signification |
| --- | --- |
| Clé omise | L'agent n'autorise pas le démarrage planifié. C'est la valeur par défaut : les enregistrements existants restent inchangés. |
| `false` | Identique à l'omission. Studio ne planifiera pas l'agent. |
| `true` | Studio peut proposer un calendrier pour cet agent et appeler `job.start` quand une exécution est due. |

Placez-la dans `capabilities`, à côté de `rule_checkpoints`. Ce n'est ni une action ni une surface. L'agent ne gère pas l'horloge : il n'y a donc aucune action `job.schedule` à déclarer.

`build_v2_agent_registration` gagne un paramètre facultatif `scheduled_start: bool = False`. `False` omet la clé. Seul `True` sérialise `"scheduled_start": true`.

Quand `scheduled_start` vaut `true`, les capacités finales doivent déclarer `job.start`. Le SDK rejette l'enregistrement dans le cas contraire.

Les enregistrements v1 n'ont pas ce champ. Studio ne planifiera pas un agent v1.

Chaque enregistrement suivant porte la valeur courante. Supprimer la clé, ou envoyer `false`, est la façon dont un agent retire la capacité. Studio met alors les calendriers existants en pause. Il ne les supprime pas, et ne déclenche plus rien tant qu'un enregistrement n'a pas renvoyé `true` et qu'un responsable de mission n'a pas repris les calendriers.

## À quoi ressemble une exécution planifiée {#what-a-firing-looks-like}

Studio appelle le `job.start` existant de l'agent avec la même entrée que celle qu'une personne aurait soumise. Aucun identifiant de calendrier, expression cron, fuseau horaire ou politique d'erreur n'est ajouté à l'entrée de l'action. Les agents qui rejettent les clés inconnues doivent continuer à fonctionner.

Studio définit `idempotency_key` avec une valeur stable pour cette occurrence. Une nouvelle tentative de la même exécution doit renvoyer le job d'origine, et non démarrer un second job. Un agent qui définit `scheduled_start: true` doit respecter `idempotency_key` sur `job.start`. Les agents qui le font déjà n'ont besoin d'aucun nouveau gestionnaire.

Un démarrage manuel peut toujours arriver pendant qu'un job planifié s'exécute. Studio empêche un calendrier de se chevaucher lui-même. Il ne verrouille pas l'agent contre les autres démarrages.

## Ce que l'agent ne fait pas {#what-the-agent-does-not-do}

- Analyser du cron ou stocker un calendrier.
- Décider si un échec arrête les exécutions futures. Ce choix revient à Studio, par le responsable de mission.
- Traiter un démarrage planifié comme une action différente de Start now.

## Quand ce sera implémenté {#when-this-is-implemented}

- Test aller-retour : l'enregistrement par défaut omet `capabilities.scheduled_start`.
- Test aller-retour : `scheduled_start=True` sérialise `true`.
- Test aller-retour : `scheduled_start=False` omet toujours la clé.
- N'ajoutez le champ à la documentation du protocole v2 qu'une fois que le sérialiseur l'émet.


*Uploaded on 2026-11-06 15:07:19*
