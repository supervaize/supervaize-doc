---
id: intro
title: Intégrations tierces
displayed_sidebar: integrationsSidebar
---

# Intégrations avec des applications tierces {#integrations-with-third-party-applications}

Cette section explique comment connecter Supervaize à des outils et à des agents externes.

## Vue d'ensemble {#overview}

| Domaine | Ce que cela fait | Commencez ici |
|------|----------------|------------|
| **[Intégration n8n](/docs/integrations/n8n-integration)** | Utilisez un workflow n8n comme agent dans Supervaize Studio. Exécutez des workflows en tant que jobs, transmettez des entrées, suivez l'avancement et, si besoin, utilisez la validation humaine. | [Intégration n8n](/docs/integrations/n8n-integration) |
| **[Skills](/docs/integrations/skills)** | Des skills d'agent pour l'écosystème Runwaize. Donnez à votre agent de code (Claude Code, Cursor, Codex, etc.) les instructions pour dialoguer avec Supervaize par REST, par MCP ou par le Supervaizer Controller. | [Skills](/docs/integrations/skills) |

## Quelle intégration choisir {#when-to-use-which}

- **Vous avez un workflow n8n** et vous voulez l'exécuter comme agent Supervaize (par exemple depuis des missions ou des jobs) → [Intégration n8n](/docs/integrations/n8n-integration).
- **Vous avez le code d'un agent** et vous voulez l'instrumenter avec le Supervaizer Controller → [Supervaizer Integration](/docs/integrations/skills/supervaizer-integration).
- **Votre espace de travail est en service** et vous voulez gérer les agents, les missions et la validation humaine depuis un chatbot ou un IDE → [Supervaize Access](/docs/integrations/skills/supervaize-access).
