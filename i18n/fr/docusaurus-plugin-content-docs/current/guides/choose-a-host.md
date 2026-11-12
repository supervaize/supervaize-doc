---
title: Choisir un hébergeur pour votre agent
sidebar_label: Choisir un hébergeur
sidebar_position: 4
description: Les critères pour qu'un agent tienne en production, et les options d'hébergement.
---

# Choisir un hébergeur pour votre agent

**Supervaize n'héberge pas votre agent** : il tourne chez vous, sur le compte de l'hébergeur de votre choix, qui vous facture l'hébergement. Studio le pilote à distance, par son adresse publique. Cette page vous aide à choisir où l'héberger.

## Les critères qui comptent

| Critère | Pourquoi |
|---|---|
| **Toujours allumé** | Un agent mis en veille ne répond plus : Studio l'affiche comme hors ligne. |
| **Le travail continue après la réponse** | Un job long tourne en arrière-plan, après que l'agent a répondu à Studio. Certaines plateformes coupent le processeur entre deux requêtes, et le job se fige. |
| **Une seule instance**, si l'agent garde l'état des jobs en mémoire | Avec plusieurs copies de l'agent, `job.sync` peut tomber sur une copie qui ne connaît pas le job. |
| **Un disque persistant**, si l'agent garde des fichiers | Sur beaucoup de plateformes, les fichiers écrits sont effacés à chaque redéploiement ou redémarrage. |
| **Une adresse HTTPS publique et fixe** | C'est elle que vous donnez dans `SUPERVAIZER_PUBLIC_URL`. |
| **La région** | Si vos clients sont en Europe, une région européenne simplifie le RGPD. |

## Les options

### Pour commencer : Render

Render déploie un dépôt GitHub en quelques clics, et c'est la méthode décrite à l'étape 8 du [guide express](./express-guide) : un **Web Service** Python, la commande de démarrage `SUPERVAIZER_PORT=$PORT python supervaizer_control.py`, vos variables dans **Environment**, plus `SUPERVAIZER_PUBLIC_URL` avec l'adresse en `.onrender.com`.

- Prenez une offre payante : les services web gratuits se mettent en veille après 15 minutes sans trafic et mettent environ une minute à se réveiller, et ils n'ont pas de disque persistant. Les offres payantes ne se mettent pas en veille et acceptent un disque persistant. Voir [Deploy for Free](https://render.com/docs/free).
- Choisissez la région Frankfurt si vos clients sont en Europe.

### Autres plateformes simples

**Railway** fonctionne de la même façon : renseignez les mêmes variables et la même commande de démarrage. Son mode « Serverless » met le service en veille ; laissez-le désactivé pour un agent. Les [volumes](https://docs.railway.com/volumes) servent de disque persistant.

### Les grands clouds

Google Cloud Run, AWS App Runner ou DigitalOcean App Platform conviennent aussi, en déployant l'agent comme une application Python ou Docker. Supervaizer propose une commande `supervaizer deploy` qui automatise ce déploiement ; elle est en cours de finalisation (voir [Déploiement dans le cloud](/docs/supervaizer-controller/deploy)).

:::caution[Google Cloud Run et le travail en arrière-plan]
Par défaut, Cloud Run ne donne du processeur que pendant le traitement d'une requête : le travail lancé après la réponse se fige. Pour un agent qui fait des jobs longs, passez le service en facturation par instance (« instance-based billing ») et gardez au moins une instance allumée :

```bash
gcloud run services update NOM-DU-SERVICE --no-cpu-throttling --min-instances=1
```

Vous payez alors l'instance en continu. Voir la documentation de Google sur les [réglages de facturation de Cloud Run](https://docs.cloud.google.com/run/docs/configuring/cpu-allocation).
:::

Pour AWS App Runner et DigitalOcean, vérifiez dans leur documentation que le service reste allumé et garde du processeur entre deux requêtes.

### Un serveur loué

Un serveur virtuel (VPS) chez un hébergeur européen comme Scaleway, OVH ou Hetzner vous donne la main sur tout, et vos données restent en Europe. En échange, c'est à vous de gérer les mises à jour du système, le certificat HTTPS (avec un serveur web en frontal) et le redémarrage automatique de l'agent (avec Docker ou un service système).

## Astuces

- **Testez la configuration choisie avec un vrai job long** avant de l'ouvrir à des clients : c'est là que les mises en veille et les coupures de processeur se voient.
- **Fixez `SUPERVAIZER_SERVER_ID`** dans les variables de l'hébergeur, pour retrouver le même agent après chaque redéploiement.
- **Pointez le dossier de travail de l'agent vers le disque persistant** (par exemple avec une variable `DATA_DIR`).
- **Branchez une alerte sur `/.well-known/health`** : la plupart des hébergeurs et des outils de surveillance savent le faire.
- **Commencez petit** : un agent qui orchestre des appels à une IA a rarement besoin de beaucoup de mémoire ou de processeur.

*Informations vérifiées en novembre 2026 : les offres des hébergeurs changent, vérifiez leurs conditions actuelles.*
