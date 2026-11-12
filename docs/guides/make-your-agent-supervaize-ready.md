---
title: I already have an agent — make it Supervaize-ready
sidebar_label: I already have an agent
sidebar_position: 3
description: Shape your agent for Supervaize, then connect it to Studio in under an hour.
---

# I already have an agent: make it Supervaize-ready

Your agent already works: a Python script, an API, an n8n workflow… This guide helps you shape it for Supervaize, then connect it to Studio. Allow 30 to 60 minutes.

It does not replace the documentation: it saves you time by gathering what to check, in order, with links to the reference pages.

## First: define your missions, jobs, cases and steps

This is the most important point, and **it is your decision**: Supervaize does not know what your agent does. How you define your agent determines what a mission, a job, a case and a step mean for it.

Start by reading [Missions, Jobs, Cases, Steps](/docs/supervaizer-controller/core-concepts): it gives the definitions, the questions to ask and examples. Make this choice before writing a single line, then write it down in one sentence per level.

Two examples in addition to those in the docs:

| Agent | Mission | Job | Case | Steps |
|---|---|---|---|---|
| Supplier product onboarding | Winter collection catalog | One supplier delivery | One product | Read the files, convert, translate, get approval, export |
| Customer service replies | Brand customer service | One queue of messages to handle | One customer message | Understand the request, look up the order, draft, get approval, send |

:::tip[How it translates into code]
Cases are the list of items your agent processes. Steps are the moments where something can fail, cost money, wait for a person or produce an output. If your code cannot tell them apart, start there (step 2).
:::

## Supervaize requirements

An agent is ready when it ticks these eight boxes. Most agents only need a thin wrapper, not a rewrite.

| # | Requirement | Reference |
|---|---|---|
| 1 | **A single entry point** that receives the form inputs and returns the job state. | [Build Your Controller](/docs/supervaizer-controller/controller-setup) |
| 2 | **A simple start form** using the field types Supervaizer provides. Studio validates the values, but your agent must validate them again. | [Build Your Controller](/docs/supervaizer-controller/controller-setup) |
| 3 | **Cases and steps** that match your definitions, each with a status. | [Missions, Jobs, Cases, Steps](/docs/supervaizer-controller/core-concepts) |
| 4 | **A cost per step.** | [Cost Reporting](/docs/supervaizer-controller/cost-reporting) |
| 5 | **No secret in the code or in the form**: keys are parameters, set once by a workspace admin. | [Parameters and Secrets](/docs/supervaizer-controller/parameters) |
| 6 | **An idempotent start**, and long work in the background with `job.sync` and `job.stop`. | [Build Your Controller](/docs/supervaizer-controller/controller-setup) |
| 7 | **Human approval** before irreversible actions. | [Human in the Loop](/docs/supervaizer-controller/human-in-the-loop) |
| 8 | **A public address Studio can reach**, then stable hosting. | [Quick Start](/docs/supervaizer-controller/quickstart), [Cloud Deployment](/docs/supervaizer-controller/deploy) |

:::caution[Files in the start form]
The `file` field type exists in Supervaizer, but as of November 2026 the Studio start form still showed "File fields are not supported here". Until then, ask for a link (Drive, Dropbox) and let the agent download the file.
:::

## 1. Choose your path

| Your agent is… | The path |
|---|---|
| **An n8n workflow** | No code: link it in Studio following [n8n Integration](/docs/integrations/n8n-integration). |
| **Python code** | Add a `supervaizer_control.py` file that wraps your agent (steps 2 to 7). |
| **An API in another language** (Node, Go…), or a Make, Zapier or similar scenario that starts with a webhook | Same path as Python: `supervaizer_control.py` calls your web address instead of a function. |
| **None of these, or starting from scratch** | Start from the [starter template](./starter-template), already compliant: you only add your logic. |

## 2. Shape your agent

Before connecting anything, isolate **a single function** in your code that does all the work. It receives the form inputs and returns one result per case:

```python
def run(inputs: dict) -> list[dict]:
    """Single entry point of the agent: called once per job."""
    results = []
    for item in fetch_items(inputs["link"]):
        try:
            output, cost = process(item)              # your current logic
            results.append({"name": item.name, "ok": True,
                            "cost": cost, "result": output})
        except Exception as error:
            results.append({"name": item.name, "ok": False,
                            "cost": 0, "message": str(error)})
    return results
```

This is not the Supervaize format yet: it is the shape that makes the translation easy in the next step. Check four points:

- **Nothing interactive**: no `input()` and no question in the terminal. Everything arrives in `inputs`.
- **Secrets are read when the work runs**, not when the file loads: Supervaizer loads parameters after startup.
- **One failing item does not stop everything**: the error is recorded on that item, and the agent moves on.
- **Rerunning creates no duplicates**: processing the same item twice does not repeat the action.

Test the function on its own, without Supervaize, before moving on.

## 3. Connect it with a coding agent

The easiest way is to let a coding agent do the connection with the official skill: see [Supervaizer Integration](/docs/integrations/skills/supervaizer-integration) to install it. It asks you questions, writes `supervaizer_control.py` and its tests, and starts the agent.

To make it follow this guide from the start, give it this prompt:

```text
Integrate this agent with Supervaize. The entry point is the run() function.
Mission: <your sentence>. Job: <your sentence>. Case: <your sentence>.
Steps: <your list>. One cost per step.
The start form asks for links, not files.
API keys are secret parameters, never form fields.
Add human approval before any irreversible action.
```

:::tip[Prefer to do it by hand?]
Follow [Build Your Controller](/docs/supervaizer-controller/controller-setup), or our [express guide](./express-guide), which shows where to edit the file created by `supervaizer scaffold`.
:::

## 4. Check locally

Start the agent with `supervaizer start --local` and open the admin interface (see [Quick Start](/docs/supervaizer-controller/quickstart)). Before going further, check that:

- the form shows the right fields, with clear labels;
- each processed item appears as a case, with the steps you defined;
- costs are displayed;
- an error on one item shows cleanly without blocking the others;
- rerunning the same job changes nothing;
- a long job can be followed, then stopped.

## 5. Set the configuration variables

Your agent now has two kinds of settings; keep them apart.

**Supervaize connection variables.** They tell the agent which Studio workspace it belongs to and let it check that calls really come from Studio. Run `supervaizer login` in the agent's folder (if you used the skill in step 3, it already did): the command writes them to `.env` (details in step 4 of the [express guide](./express-guide)). Add `SUPERVAIZER_SERVER_ID` yourself, a fixed ID generated with `python -c "import uuid; print(uuid.uuid4())"`, so you get the same agent back after each restart.

**Your agent's own settings**: its AI provider key, access to your database, etc. Don't leave them in a `.env` that only you know about: declare them as parameters (see [Parameters and Secrets](/docs/supervaizer-controller/parameters)). A workspace admin fills them in once in Studio, and each customer can have their own.

:::tip[Without changing your code]
If your code already reads its keys with `os.environ["NAME"]`, declare the parameter with `is_environment=True`: Supervaizer puts it in the environment, and your code keeps working as is. Read it when the work runs, not when the file loads.
:::

## 6. Connect to Studio

To test, give the agent a public address with a tunnel, then start it with `supervaizer start --env-file .env --public-url <tunnel address>`: see steps 5 and 6 of the [express guide](./express-guide). On the agent's page in Studio, a workspace admin accepts access under **Workspace Access** and fills in the parameters. Then start a first job.

## 7. Host the agent

A tunnel is fine for testing, but it stops when your computer sleeps. For real users, host the agent on your own account (Supervaize does not host it). Step 8 of the [express guide](./express-guide) shows the simplest method, with Render, and [Choose a host](./choose-a-host) covers the other options. For an existing agent, also check that:

- `requirements.txt` (or `pyproject.toml`) lists **all** of the agent's dependencies, plus `supervaizer`;
- the connection variables from your `.env` are copied to the host's settings, including `SUPERVAIZER_SERVER_ID`, plus `SUPERVAIZER_PUBLIC_URL` with the host's address;
- the agent's own settings are parameters, filled in in Studio, not `.env` lines;
- the agent has a persistent disk if it keeps files between jobs.

:::caution[What we observed]
Always start with `python supervaizer_control.py` (or `supervaizer start`), which registers the agent with Studio. Started with `uvicorn` alone, the agent responds but does not appear in Studio.
:::

## 8. After going live

The agent is running: here is what to plan so it lasts.

| Topic | What to know or do | Reference |
|---|---|---|
| **The agent in Studio** | Until its parameters are filled in, Studio shows it as **Pending Setup**. If it is paused, **Resume** restarts it. Studio does not refresh on its own: progress arrives with the next action or with **Update**. | [Parameters and Secrets](/docs/supervaizer-controller/parameters), [Build Your Controller](/docs/supervaizer-controller/controller-setup) |
| **Several jobs, several customers** | One agent can receive jobs from several Studio workspaces at the same time. Store each job's state under its ID, and only show a workspace its own jobs. | [Starter template](./starter-template) |
| **Updating the agent** | Bump its version, bump `a2ui_catalog_version` if a form changes, keep the same `SUPERVAIZER_SERVER_ID`, rerun the tests, then redeploy. After a parameter changes in Studio, restart the agent. | [Build Your Controller](/docs/supervaizer-controller/controller-setup) |
| **Automated tests** | Before each release, test the actions the way Studio calls them, including a repeated start (idempotency). | [Build Your Controller](/docs/supervaizer-controller/controller-setup) |
| **Security and data** | No secret in logs, step titles or error messages. Know where your customers' files are stored and for how long (GDPR). If a firewall filters traffic, follow the network rules in the docs. | [Parameters and Secrets](/docs/supervaizer-controller/parameters), [Network Security](/docs/supervaizer-controller/network-security) |
| **Monitoring** | Point an alert at the agent's health address `/.well-known/health`: you will know it is down before your users do. | [Cloud Deployment](/docs/supervaizer-controller/deploy) |
| **Going further** | Guardrail controls, job configuration, analytics, scheduled starts. | [Guardrail Controls](/docs/supervaizer-controller/rule-checkpoints), [Job Configurator](/docs/supervaizer-controller/job-configurator), [Job and Mission Analytics](/docs/supervaizer-controller/job-analytics) |

:::tip[Check before connecting]
The [starter template](./starter-template) includes `verify_agent.py`, a script that checks the variables, the addresses and the agent's health, and tells you plainly what is missing, without ever printing a secret.
:::

## "Supervaize-ready" checklist

- [ ] Mission, job, case and steps defined in one sentence each
- [ ] A single entry point, tested on its own
- [ ] A simple form, with links rather than files
- [ ] A cost per step
- [ ] No secret in the code or in the form: the agent's settings are parameters
- [ ] Connection variables written by `supervaizer login`, plus `SUPERVAIZER_SERVER_ID`
- [ ] An idempotent start, and long work tracked with `job.sync` and `job.stop`
- [ ] Human approval before irreversible actions
- [ ] Tested locally, then in Studio
- [ ] Hosted at a stable address

*Written for Supervaizer 1.11.1, with Studio labels as of November 2026.*
