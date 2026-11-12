---
title: FAQ and troubleshooting
sidebar_label: FAQ and troubleshooting
sidebar_position: 6
description: Answers to the questions people ask when connecting an agent, and a step-by-step troubleshooting path.
---

# FAQ and troubleshooting

## Frequently asked questions

**Does Supervaize host my agent?**
No. Your agent runs with the host of your choice, on your account; Studio drives it remotely through its public address. See [Choose a host](./choose-a-host).

**What do I pay for?**
Three separate things: your Supervaize workspace, the agent's hosting (to the host) and the calls to your AI provider (to that provider). The cost the agent reports at each step shows up in Studio: see [Cost Reporting](/docs/supervaizer-controller/cost-reporting).

**What data does Studio receive?**
The values entered in the start form, and what the agent sends back: the job state, the cases, the steps and their information. The files and data the agent processes stay where it runs, unless you put them in the job state. Never put a secret in the state, titles or messages: see [Parameters and Secrets](/docs/supervaizer-controller/parameters).

**Do I need to code?**
You don't need to write the code: with Claude Code, you describe the agent and it writes, tests and connects it (see [My first agent](./build-your-first-agent)). You only run a few terminal commands. The Supervaizer controller is in Python, but an existing agent can be written in any language if it has a web address the controller calls. An n8n workflow connects without code (see [I already have an agent](./make-your-agent-supervaize-ready)).

**My agent is built with Make, Zapier or another no-code tool. What do I do?**
If it starts with a webhook, a small Python controller calls it: start from the [starter template](./starter-template) and replace `process_item()` with a call to your webhook.

**Does it work on Windows?**
Yes. The guides give commands for Mac, Linux and Windows (PowerShell).

**Can one agent serve several customers?**
Yes: each customer has their own Studio workspace, and an admin of each workspace fills in their own parameters. Your agent must store jobs by ID and only show a workspace its own jobs; the starter template already does.

**Why doesn't Studio show progress in real time?**
Studio does not poll the agent: progress arrives with the next action, or when someone clicks **Update**. See [Build Your Controller](/docs/supervaizer-controller/controller-setup).

## Step-by-step troubleshooting

Start by running `python verify_agent.py` in the agent's folder (see [Starter template](./starter-template)): it spots most of the problems below. Detailed error messages are in [Troubleshooting](/docs/supervaizer-controller/troubleshooting).

### The agent does not appear in Studio

1. **How did you start it?** With `uvicorn` alone, it does not register: start with `supervaizer start` or `python supervaizer_control.py`.
2. **Does the startup log show a registration error?** A 403 error often comes from the workspace, the key or the subscription: see Troubleshooting, "Error sending event SERVER_REGISTER (403)". Running `supervaizer login` again fixes most cases.
3. **Are you looking at the right Studio workspace?** The agent appears in the workspace chosen during `supervaizer login`.
4. **A new agent appears at every restart?** Set `SUPERVAIZER_SERVER_ID`.

### Studio shows the agent as offline

1. **Is the agent still running?** Check the terminal or the host's logs.
2. **Does the public address answer?** `python verify_agent.py --url <address>` tests it.
3. **With a tunnel:** the address changes at every tunnel restart. Restart the agent with the new address.
4. **With a host:** does the plan put the service to sleep? See [Choose a host](./choose-a-host).

### The job stays "in progress"

1. **Did you click Update?** Studio does not refresh on its own.
2. **Does the agent declare `job.sync`?** Without it, Studio cannot ask for the state.
3. **Is the agent on Google Cloud Run?** By default, background work freezes after the response: see [Choose a host](./choose-a-host).
4. **Did the work crash?** Look for the error in the agent's logs; an error on one item should show on its case, without blocking the others.

### The form does not change in Studio

Bump `a2ui_catalog_version` at every form change, then restart the agent.

### "File fields are not supported here"

The `file` field type exists in Supervaizer, but the Studio start form did not display it yet as of November 2026. Ask for a link (Drive, Dropbox) instead.

### `CERTIFICATE_VERIFY_FAILED` error

On a Mac, with Python installed from python.org, run "Install Certificates.command" once (Applications › Python folder). Elsewhere, check the system certificates or a possible corporate proxy.
