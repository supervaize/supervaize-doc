---
title: I don't have an agent yet — build my first agent step by step
sidebar_label: My first agent
sidebar_position: 1
description: Build your first agent with Claude Code, without writing the code yourself, and run it from Supervaize Studio.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# I don't have an agent yet: build my first agent step by step

Never built an agent? This guide takes you from zero to an agent that works for you and that you run from Supervaize Studio. You don't write the code yourself: you describe the agent, and **Claude Code** writes it, tests it and connects it. Allow about an hour.

## What is an agent?

An agent is an AI assistant that **uses tools to complete a task**: reading a website, looking something up in a spreadsheet, writing an email, filling in a file… It decides what to do with those tools to get the task done.

A few examples:

- read the latest news from a website and summarize it for you;
- draft replies to your customers' messages;
- sort your invoices and fill in a spreadsheet.

**Supervaize** lets you start that agent in one click, see what it does step by step, know what it costs and, when needed, approve before it acts.

## Mission, job, case, step: you decide

In Supervaize, an agent's work is organized into missions, jobs, cases and steps: the [Missions, Jobs, Cases, Steps](/docs/supervaizer-controller/core-concepts) page defines them. What they represent depends on **your** agent, and it is up to you to decide before building it. For the agent in this guide:

- **Mission**: follow the news of an industry.
- **Job**: one read of the website, for example every Monday.
- **Case**: one article read.
- **Steps**: read the article, summarize it.

You will give these four sentences to Claude Code in step 4.

:::info[What you will build]
A **news-watch agent**: each time it runs, it reads the latest articles from a website, summarizes each one, then waits for your approval. Once you have built it, you can build any agent on the same model: just describe another task.
:::

## What you need

- **Python 3.12 or later** (check with `python3 --version` on Mac and Linux, `py --version` on Windows).
- **A Claude subscription** (or an Anthropic Console account) to use Claude Code.
- **A Supervaize Studio account** and a workspace.
- **An API key from an AI provider** (Anthropic, OpenAI, OpenRouter…), so your agent can summarize. This guide costs a few cents.
- **The RSS feed address** of a website you follow (often `https://the-site.com/feed` or `/rss`).

Commands are given for Mac, Linux and Windows: pick your system in the tabs.

## 1. Install Claude Code

Open Terminal (on Windows: PowerShell) and run:

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
irm https://claude.ai/install.ps1 | iex
```

</TabItem>
</Tabs>

Then open a **new** terminal window and check with `claude --version`. Other ways to install it are in the [Claude Code documentation](https://code.claude.com/docs/en/setup).

## 2. Start from the starter template

The [starter template](./starter-template) is an agent that already meets every Supervaize requirement: Claude Code only has to add your agent's logic.

1. Download [the template](/files/supervaize-agent-template.zip) and unzip it wherever you like.
2. In the terminal, go to its folder and set up Python:

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
cd supervaize-agent-template
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer pytest
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
cd supervaize-agent-template
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer pytest
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
cd supervaize-agent-template
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install supervaizer pytest
```

</TabItem>
</Tabs>

## 3. Start Claude Code and install the Supervaizer skill

Still in the template folder, start Claude Code:

```bash
claude
```

The first time, sign in with your Claude account. Then install the skill that teaches Claude Code how to connect an agent to Supervaize (see [Supervaizer Integration](/docs/integrations/skills/supervaizer-integration)):

```text
/plugin marketplace add supervaize/supervaizer
/plugin install supervaizer-integration@supervaizer
```

## 4. Describe your agent

Paste this message into Claude Code, replacing what is in angle brackets:

```text
This folder contains a Supervaize agent template. Turn it into a news-watch agent:
- Agent name: News agent <your industry>.
- Start form: the address of an RSS feed and the number of articles (5 by default).
- Mission: follow the news of an industry. Job: one read of the feed.
  Case: one article. Steps: read the article, summarize it in two sentences, with the cost of each step.
- The summary uses <your AI provider>. The key is a secret parameter AI_API_KEY,
  never in the code or in the form.
- Keep the human review at the end of the job.
Change agent.py and the form in controller.py, update the tests,
run them, and explain what you changed.
```

Claude Code may ask you a few questions, edits the files, then runs the tests. Read its summary: this is the moment to ask for changes, in plain language ("add the site name to the summary", "cap it at 10 articles"…).

:::tip[Another task?]
For another agent, keep the same message structure: what the agent receives in the form, its mission, its job, its cases, its steps, the keys it needs, and what a human must approve.
:::

## 5. Test locally

In a **second** terminal open in the same folder (with the Python environment activated, as in step 2), run:

```bash
supervaizer start --local
```

Open **http://127.0.0.1:8000/manage/** in your browser: you see your form and can start a job. If something is wrong, describe it to Claude Code ("the summary is empty for this feed"), then try again.

## 6. Connect the agent to Studio

Ask Claude Code:

```text
Now connect the agent to Supervaize Studio so I can test it.
```

With the skill, Claude Code runs `supervaizer login` (a Studio page opens: sign in and approve), then starts the agent with a public address. If you prefer to run these commands yourself, follow steps 4 to 6 of the [express guide](./express-guide).

## 7. Run your first job

1. In Studio, open **Agents**: your agent is listed. The first time, a workspace admin accepts it on the **Workspace Access** card.
2. Fill in the **AI_API_KEY** parameter with your AI provider key (you need to be a workspace admin, which you are if you created the workspace). Until this parameter is set, the agent stays in **Pending Setup**.
3. Open **Missions**, create a mission, choose your agent, then **Start Job**. Enter the feed address and start.
4. Click **Update** to follow along: each article becomes a case, with its steps and their cost. At the end, approve the job.

:::tip[Well done]
You have built and connected your first agent. It starts in one click, and every run is tracked in Supervaize.
:::

## If something goes wrong

| What happens | The fix |
|---|---|
| `claude` is not found after installing | Open a new terminal window. Otherwise, see the [Claude Code documentation](https://code.claude.com/docs/en/setup). |
| The tests fail | Ask Claude Code: "the tests fail, find out why and fix it". |
| The summary is empty | The feed may not include the article text: ask Claude Code to use the title and description. |
| The agent does not appear in Studio, or is offline | See [FAQ and troubleshooting](./faq). |

## What's next

- **Put the agent online** so it runs without your computer: see [Choose a host](./choose-a-host).
- **Change the task**: describe another task to Claude Code, keeping the structure of step 4.
- **Already have an n8n workflow?** It connects to Studio without code: see [I already have an agent](./make-your-agent-supervaize-ready).

*Written for Supervaizer 1.11.1, with Studio labels as of November 2026.*
