# Supervaizer — Revue de sécurité et de performance (synthèse) {#supervaizer--security--performance-review-summary}

> **Date :** 2026-07-07
> **Périmètre :** revue complète (hors diff) de tout l'arbre source du SDK `supervaizer` (~20 000 lignes de code).
> **Type :** revue de sécurité et revue de performance et de scalabilité.
>
> **⚠️ Note de divulgation :** conformément à [`SECURITY.md`](https://github.com/supervaize/supervaizer/blob/main/SECURITY.md), les constats détaillés
> de vulnérabilités (scénarios d'attaque, emplacements exacts dans le code et détails de correction) ne sont **pas**
> publiés ici. Cette page n'est qu'une synthèse de haut niveau, non exploitable. Les constats
> complets sont traités par le canal privé de signalement de vulnérabilités du projet (GitHub Security
> Advisories), afin que des failles non corrigées ne soient pas rendues exploitables par un document public.

---

## Méthodologie {#methodology}

Un audit multi-agents : des chercheurs de failles par composant ont passé en revue tout le code source ; chaque
candidat à fort impact a été revérifié indépendamment par un vérificateur adverse (chargé de le réfuter
et de confirmer son atteignabilité réelle), ce qui a recalibré plusieurs niveaux de gravité ; un critique de
complétude a ensuite cherché les classes de failles oubliées ; enfin, une passe distincte a couvert la performance
asynchrone et la scalabilité. Il s'agit d'une revue statique : aucun exploit n'a été exécuté.

## Posture globale {#overall-posture}

Les **primitives d'autorisation de base sont saines.** Points vérifiés pendant la revue :

- L'autorisation d'espace de travail signée utilise EdDSA avec l'algorithme figé (pas de `alg:none` ni de confusion
  d'algorithme), une liaison complète des claims (émetteur/audience/expiration/sujet/espace de travail), et des
  clés issues uniquement du matériel de confiance configuré.
- Les actions de protocole privilégiées échouent en mode **fermé** quand l'autorisation n'est pas configurée.
- Aucune injection SQL/NoSQL/de commande, aucune injection de template côté serveur et aucune désérialisation
  non sûre (`pickle`/`yaml.load`/`eval`) n'ont été trouvées.
- Aucune mauvaise configuration CORS : aucune n'est configurée, c'est donc la valeur par défaut sûre (même origine) qui s'applique.
- L'échappement automatique de Jinja est activé.

Le risque important se concentre sur la **gestion des identifiants et le modèle de confiance de la surface
d'administration**, pas sur le cœur de validation des requêtes. Thèmes (sans détail ici) :

- Des valeurs par défaut de développement et de démarrage rapide qui ne sont pas sûres si elles sont exposées sur un réseau non fiable.
- Une surface d'administration dont la frontière de confiance peut être affaiblie dans certaines
  configurations de reverse proxy.
- Des identifiants plus exposés qu'ils ne devraient l'être au repos et en transit.
- Une construction de chiffrement symétrique qui devrait migrer vers un schéma authentifié (AEAD).
- Des outils de déploiement qui manipulent les secrets avec moins de précautions que l'exécution.

## Chaîne d'approvisionnement : mesures déjà en place {#supply-chain-posture-already-in-place}

Le dépôt applique déjà de solides bases de sécurité de la chaîne d'approvisionnement, documentées dans
[`SECURITY.md`](https://github.com/supervaize/supervaizer/blob/main/SECURITY.md) : un `uv.lock` versionné avec `uv sync --frozen` imposé en
CI, les mises à jour de sécurité Dependabot, OSV-Scanner sur chaque PR, l'analyse des secrets avec protection
au push, des Actions tierces épinglées par SHA, et la publication de confiance OIDC. Les versions minimales épinglées des dépendances
ont été examinées et sont récentes (aucune version épinglée connue pour être vulnérable). **Aucune action sur la chaîne d'approvisionnement n'est
recommandée au-delà de l'existant.**

## Synthèse des constats (décomptes uniquement) {#findings-summary-counts-only}

| Domaine | Critique | Élevée | Moyenne | Faible |
|--------|----------|------|--------|-----|
| Sécurité (après vérification) | 0 | 6 | 16 | 18 |
| Performance / scalabilité | — | 9 | 10 | 2 |

Aucun constat n'a survécu à la vérification au niveau **Critique**.

### Thèmes de performance {#performance-themes}

Les constats de performance se regroupent en deux domaines : la **croissance mémoire non bornée** (des registres
de longue durée qui n'évincent pas le travail terminé) et le **blocage de la boucle d'événements** (des E/S synchrones
et des opérations de persistance sur fichier entier exécutées sur la boucle asynchrone). Aucun n'est un bogue de justesse
aujourd'hui ; chacun se dégrade sous une charge soutenue ou une croissance des données. Les mesures à plus fort
effet de levier sont la mise en cache ou le déport de la couche de persistance, l'éviction des entités terminées, et
l'utilisation des chemins de code asynchrones déjà présents pour la vérification au moment de la requête.

## Démarche de correction {#remediation-approach}

Des consignes de correction détaillées et priorisées (P0–P3) accompagnent le rapport privé. En
résumé : traiter d'abord la gestion des identifiants et la confiance dans l'administration, migrer le chiffrement
symétrique vers une construction AEAD, puis renforcer les en-têtes de réponse, les limites de requêtes et
l'autorisation au niveau des objets, et enfin appliquer les mesures de performance. L'architecture
de base ne demande aucune refonte.

---

*Pour les constats complets et le détail des corrections, les mainteneurs doivent se référer à l'avis de
sécurité privé. Signalez tout écart par rapport à la posture de sécurité documentée via le canal privé
décrit dans [`SECURITY.md`](https://github.com/supervaize/supervaizer/blob/main/SECURITY.md).*


*Uploaded on 2026-11-06 15:07:19*
