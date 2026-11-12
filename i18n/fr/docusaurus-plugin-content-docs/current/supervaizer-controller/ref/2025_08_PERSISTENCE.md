# Persistance {#persistence}

> **Créé le :** 2025-08-06
> **Mis à jour le :** 2026-09-25

Supervaizer conserve les jobs, les cases et les informations du serveur dans TinyDB via `supervaizer.storage`. Le stockage est **en mémoire par défaut** ; la persistance dans un fichier est facultative.

## Activation {#enabling}

| Paramètre | Effet | Par défaut |
| --- | --- | --- |
| `SUPERVAIZER_PERSISTENCE=true` ou `supervaizer start --persist` | Écrit dans `DATA_STORAGE_PATH/entities.json` au lieu de la mémoire | désactivé |
| `DATA_STORAGE_PATH` | Répertoire du fichier JSON | `./data` |

Les deux variables sont lues à l'import de `supervaizer.storage` : définissez-les donc avant d'importer `supervaizer`. La CLI applique `--persist` avant de charger le script de contrôle. Sur les plateformes serverless dont le disque est éphémère, laissez la persistance désactivée.

## Gestionnaire de stockage {#storage-manager}

`StorageManager` est un `@singleton` : la première instanciation l'emporte, et `supervaizer.storage` crée le `storage_manager` de niveau module à l'import. Passer `StorageManager(db_path=...)` plus tard, dans un processus normal, n'a donc **aucun effet** ; configurez le stockage avec les variables d'environnement ci-dessus. Les tests obtiennent une nouvelle instance en réinitialisant le singleton (voir la fixture de `tests/conftest.py`).

Le gestionnaire stocke des dictionnaires simples, par nom de table :

```python
from supervaizer.storage import storage_manager

storage_manager.save_object("Job", job.model_dump())
storage_manager.get_objects("Job")
storage_manager.get_object_by_id("Case", case_id)  # None when missing
storage_manager.get_cases_for_job(job_id)
storage_manager.delete_object("Job", job_id)  # False when missing
storage_manager.reset_storage()
storage_manager.close()
```

`save_object` lève `ValueError` quand l'objet n'a pas d'`id`. TinyDB réécrit tout le fichier à chaque sauvegarde (`sort_keys=True, indent=2`) ; il n'y a pas de middleware de cache.

### Tables {#tables}

| Table | Écrite par |
| --- | --- |
| `Job` | `Job.__init__`, `add_response`, `add_case_id`, `remove_case_id` |
| `Case` | `Case.__init__` et chaque mise à jour de case |
| `ServerInfo` | `Server` au lancement, quand l'interface d'administration est activée |

`Case.job_id` et `Job.case_ids` relient les deux tables ; `storage_manager.get_cases_for_job` suit ce lien.

## Accès typé {#typed-access}

`EntityRepository[T]` enveloppe une table pour une classe d'entité, avec `get_by_id`, `save`, `get_all` et `delete`. Utilisez les fabriques `create_job_repository()` et `create_case_repository()`.

`PersistentEntityLifecycle` (`transition`, `handle_event`) applique les changements de statut et sauvegarde l'entité. `Job` et `Case` l'utilisent déjà en interne : le code applicatif n'a donc pas besoin de persister les entités à la main.

`Case.start(...)` est `async` ; appelez `await Case.start(...)` ou `Case.start_sync(...)`. Les deux envoient l'événement de démarrage à Studio via le compte.

## Rechargement au démarrage {#startup-reload}

`Server.launch()` appelle `load_running_entities_on_startup()`, qui :

1. réinitialise les registres en mémoire `Jobs()` et `Cases()` ;
2. charge les jobs et les cases dont le statut est `IN_PROGRESS`, `CANCELLING` ou `AWAITING` ;
3. les reconstruit avec `model_construct`, qui ignore la validation : `status` reste une chaîne simple et `job_context` reste un dictionnaire sur les entités rechargées.

`Jobs().get_job(job_id, include_persisted=True)` lit un job depuis le stockage et le reconstruit avec `Job(**data)`, ce qui relance `__init__` (le job est sauvegardé à nouveau et `created_at` est réinitialisé). `Jobs().reset()` et `Cases().reset()` vident les registres.

## Notes de sécurité {#security-notes}

- Les `agent_parameters` déchiffrés ne sont jamais écrits dans `entities.json` : `Job.to_dict` les exclut, donc un job rechargé depuis le stockage n'en a aucun. Un appel de méthode personnalisée transmet ses propres `encrypted_agent_parameters` déchiffrés à cette exécution uniquement.
- Les enregistrements de job sauvegardés avant ce changement peuvent encore contenir les `agent_parameters` en clair, car `upsert` fusionne dans l'enregistrement stocké et ne supprime pas la clé. Supprimez `agent_parameters` de ces enregistrements `Job` après la mise à niveau.
- La clé privée RSA et l'identifiant du serveur ne sont jamais écrits sur disque. Définissez `SUPERVAIZER_PRIVATE_KEY` et `SUPERVAIZER_SERVER_ID` pour les conserver d'un redémarrage à l'autre.

## Limites {#limitations}

- Les verrous sont locaux au processus ; ne partagez pas un même `entities.json` entre plusieurs processus.
- Chaque sauvegarde réécrit tout le fichier, ce qui devient moins performant avec un historique volumineux.
- Aucune migration : le JSON est un export des modèles actuels.


*Uploaded on 2026-11-06 15:07:19*
