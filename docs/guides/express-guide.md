---
title: Express guide — create an agent and connect it to Supervaize
sidebar_label: Express guide
sidebar_position: 2
description: From zero to an agent hosted and run from Supervaize Studio, in eight steps.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create an agent and connect it to Supervaize

From zero to an agent hosted and run from Supervaize Studio, in eight steps: about twenty minutes to your first job, then half an hour to host it. Just copy the commands into the terminal.

:::tip[Don't want to use the terminal?]
If your agent is an n8n workflow, you can connect it to Studio without any command: see [n8n Integration](/docs/integrations/n8n-integration).
:::

## Before you start

- **Python 3.12 or later** on your computer (check with `python3 --version` on Mac and Linux, `py --version` on Windows).
- **A Supervaize Studio account** and a workspace.
- **cloudflared**, so Studio can reach the agent running on your computer (installed in step 5).

Commands are given for Mac, Linux and Windows: pick your system in the tabs.

:::info[How it works]
Your agent runs on your machine (or on a server). Supervaizer wraps it and presents it to Studio: Studio shows its form, starts jobs, follows their steps and costs, and asks a human to approve when needed.
:::

## 1. Install Supervaizer

*2 minutes.* In the terminal, create a folder for your agent and install the kit:

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
mkdir my-agent && cd my-agent
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
mkdir my-agent && cd my-agent
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
mkdir my-agent; cd my-agent
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install supervaizer
```

</TabItem>
</Tabs>

Your terminal prompt now starts with `(.venv)`: that's a good sign. If you close the terminal, go back to the folder and run the activation command again (the line with `activate`).

## 2. Create the agent

*5 minutes.*

```bash
supervaizer scaffold
```

This command creates `supervaizer_control.py`: it is **the only file** that connects your agent to Studio. Open it and change three things:

| What | Where in the file | Example |
|---|---|---|
| The agent's name | `AGENT_NAME` and `agent_slug` (the name in lowercase, with dashes) | `"Invoice Agent"` → `"invoice-agent"` |
| The form shown in Studio | the `fields` list of `job_start_form` | a "File link" field of type `string` |
| What the agent does | the `start_job` function: call your code there with `request.input` | `result = my_agent(request.input["link"])` |

The `start_job` function returns the job state: **cases** (one per processed item) and their **steps**, with a status and a cost. This is what Studio displays.

:::tip[For a polished presentation in Studio]
Give `Agent` an `introduction` (tagline, summary, example goals) and a markdown `full_description`: Studio shows them even before the first job.
:::

:::caution[If the work takes more than a few seconds]
Return the cases as `pending`, do the work in the background, and also declare the `job.sync` and `job.stop` actions: Studio does not poll your agent; it receives progress with the next action or when someone clicks **Update**.
:::

## 3. Test locally, without Studio

*2 minutes.*

```bash
supervaizer start --local
```

Open **http://127.0.0.1:8000/manage/** in your browser: the admin interface shows your form and lets you start a job. Fix your file until the job completes, then stop with **Ctrl+C**.

## 4. Sign in to Studio and set the configuration variables

*3 minutes.* Supervaize needs configuration variables to know which Studio workspace the agent belongs to and to check that calls really come from Studio. No need to copy them by hand: one command writes them for you.

```bash
supervaizer login
```

A Studio page opens: sign in, check that the code shown matches the one in your terminal, and approve. The command then writes the variables to the `.env` file in your folder:

| Variable | What it is for |
|---|---|
| `SUPERVAIZE_API_KEY` | The key that lets the agent talk to Studio. |
| `SUPERVAIZE_WORKSPACE_ID` | Your Studio workspace ID. |
| `SUPERVAIZE_API_URL` | The Studio address (`https://app.supervaize.com`). |
| `SUPERVAIZER_WORKSPACE_AUTH_REQUIRED`, `…_ISSUER`, `…_JWKS_URL` | What lets the agent check that calls really come from your workspace. |

Then add two lines to `.env` yourself:

| Variable | Value |
|---|---|
| `SUPERVAIZER_SERVER_ID` | A fixed ID, so you get the same agent back after each restart. Generate it with `python -c "import uuid; print(uuid.uuid4())"`. |
| Your agent's own settings | For example your AI provider key, if your code reads it from the environment. In production, declare them as parameters (see [Parameters and Secrets](/docs/supervaizer-controller/parameters)). |

The agent's public address (`SUPERVAIZER_PUBLIC_URL`) is given at startup, in step 6.

:::tip[Without the login command]
You can also copy these variables from Studio (**Developer → Environment variables**): see [Quick Start](/docs/supervaizer-controller/quickstart). If something fails, see [Troubleshooting](/docs/supervaizer-controller/troubleshooting).
:::

:::caution[This file is secret]
Never share `.env`, never send it in a message and never push it to GitHub.
:::

## 5. Make the agent reachable by Studio

*2 minutes.* Install cloudflared if you haven't already:

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
brew install cloudflared
```

</TabItem>
<TabItem value="linux" label="Linux">

Download the package for your distribution from the [cloudflared releases page](https://github.com/cloudflare/cloudflared/releases), then install it.

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
winget install --id Cloudflare.cloudflared
```

</TabItem>
</Tabs>

Then open a **second terminal tab** and start the tunnel:

```bash
cloudflared tunnel --url http://localhost:8000
```

Copy the address it shows, ending in `https://….trycloudflare.com`. Keep this tab open: if you close it, Studio can no longer reach the agent. The address changes every time the tunnel restarts.

## 6. Start the agent

*1 minute.* Go back to the first tab and replace the address with your tunnel's. This is what gives Studio the agent's public address:

```bash
supervaizer start --env-file .env --public-url https://your-address.trycloudflare.com
```

:::info[What you should see]
`Studio registration handshake verified`, then `Uvicorn running on http://0.0.0.0:8000`. Your agent is registered.
:::

## 7. In Studio: first job

*3 minutes.*

1. Open **Agents**: your agent is listed. If it is paused, click **Resume**.
2. The first time, a workspace admin accepts the agent: on the **Workspace Access** card, they enter the agent workspace ID and accept access.
3. Open **Missions**, create a mission, choose your agent, then click **Start Job**.
4. Fill in your form and start. The job, its cases and steps appear; click **Update** to refresh.

:::tip[Well done]
Your agent is supervised: every job is tracked with its cost, and you can add human approval at any step.
:::

## 8. Host the agent

*20 to 30 minutes.* So far, the agent runs on your computer: it stops when you close the terminal or when the computer sleeps, and the tunnel address changes at every restart. For real users, host it on a server. **Supervaize does not host your agent**: it runs on your own account, with the host of your choice, which bills you for hosting. Here is the simplest method, with Render:

1. **Prepare the folder.** Create a `requirements.txt` file listing `supervaizer` and the other packages your agent needs (one per line). Check that `.env` is listed in `.gitignore`.
2. **Put the code on GitHub**, in a **private** repository. The `.env` file never goes there.
3. **Create the service.** On [Render](https://render.com), click **New → Web Service** and choose your repository, then set:

| Setting | Value |
|---|---|
| Language | Python 3 |
| Region | a region close to your users (Frankfurt for Europe) |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `SUPERVAIZER_PORT=$PORT python supervaizer_control.py` |
| Instance Type | a paid plan (Starter): the free plan goes to sleep and the agent shows as offline in Studio |

4. **Add the variables** under **Environment**: all those in your `.env` (step 4), plus `SUPERVAIZER_PUBLIC_URL` with the address Render gives the service, ending in `https://….onrender.com`. If the agent keeps files between jobs, add a disk (**Disks**) and point its working folder to it.
5. **Launch.** When the service is **Live**, stop the agent running on your computer and the tunnel: the hosted agent registers with Studio at its new address.

The [starter template](./starter-template) already includes a ready `requirements.txt` and `.gitignore`. For other hosts and the criteria to check, see [Choose a host](./choose-a-host).

:::info[Coming soon]
Supervaizer also offers a `supervaizer deploy` command for Google Cloud Run, AWS App Runner and DigitalOcean. It is being finalized: see [Cloud Deployment](/docs/supervaizer-controller/deploy).
:::

## Pitfalls to avoid

These pitfalls complement the [Troubleshooting](/docs/supervaizer-controller/troubleshooting) page: they are the ones we ran into while connecting real agents.

| What happens | The cause | The fix |
|---|---|---|
| The agent does not appear in Studio | It was started with `uvicorn` directly: registration with Studio does not happen. | Always start with `supervaizer start` or `python supervaizer_control.py`. |
| A new "ghost" agent at every restart | `SUPERVAIZER_SERVER_ID` is not set: the server gets a new identity at each start. | Add it to `.env` (step 4). |
| "Agent server is offline" | The agent or the tunnel stopped, or the tunnel address changed. | Restart the tunnel, then the agent with the new address (steps 5 and 6). |
| `CERTIFICATE_VERIFY_FAILED` error on a Mac | Python installed from python.org does not have the system certificates. | Run "Install Certificates.command" once (Applications › Python folder), or use `certifi` in your code. |
| The form did not change in Studio | The catalog version did not change. | Bump `a2ui_catalog_version` (`…-ui.1` → `…-ui.2`) whenever the form changes, as [Build Your Controller](/docs/supervaizer-controller/controller-setup) requires. |
| "Unexpected slug" at startup | `agent_slug` does not match the name. | The slug is the name in lowercase, without accents, with dashes. |
| "File fields are not supported here" | The `file` type exists in Supervaizer, but the Studio start form did not display it yet as of November 2026. | Ask for a link (Drive, Dropbox) instead. |

## What's next

- **Add human approval**: a step with the `awaiting` status shows a decision form in Studio. See [Human in the Loop](/docs/supervaizer-controller/human-in-the-loop).
- **Make the agent configurable** from Studio without touching the code, with resources (settings tables). See [Shared Resources](/docs/supervaizer-controller/resources).
- To go further: [Build Your Controller](/docs/supervaizer-controller/controller-setup).

*Written for Supervaizer 1.11.1, with Studio labels as of November 2026. If the file created by `supervaizer scaffold` or a button has another name, look for its equivalent.*
