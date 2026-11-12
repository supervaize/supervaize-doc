# RFC-001 : CLI de déploiement cloud {#rfc-001-cloud-deployment-cli}

Spécification de la CLI de déploiement cloud de Supervaizer.

## Résumé {#summary}

La CLI de déploiement cloud automatise le déploiement des agents Supervaizer sur GCP Cloud Run, AWS App Runner et DigitalOcean App Platform, avec les commandes plan, up, down, status, local et clean. La commande `up` construit l'image, la pousse vers le registre de la plateforme et vérifie la santé du service.

## Documentation {#documentation}

Consultez le [guide de déploiement cloud](../deploy) pour la documentation complète destinée aux utilisateurs et son mode d'emploi.

## Références {#references}

- [Référence de la CLI](../ref/2025_08_CLI.md) – commandes et options de `supervaizer deploy`
- [Tests en local](../ref/2025_10_LOCAL_TESTING.md) – tests avant déploiement avec Docker
