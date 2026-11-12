---
title: Starter template and readiness check
sidebar_label: Starter template
sidebar_position: 5
description: An agent that already meets the Supervaize requirements, ready for your logic, and a script that checks it is ready.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Starter template and readiness check

The template is a working agent that already meets the eight requirements of the [I already have an agent](./make-your-agent-supervaize-ready) guide. You put your logic in a single file; the rest is done.

**[Download the template](/files/supervaize-agent-template.zip)** (code in English, comments and README in English and French).

## What it contains

| File | Role |
|---|---|
| `agent.py` | **Your logic**: `list_items()` turns the form into items to process, `process_item()` processes one item and returns its output and cost. |
| `controller.py` | The generic controller: form, idempotent start, background work, `job.sync`, `job.stop`, human review, isolation between Studio workspaces. It does not depend on the SDK. |
| `supervaizer_control.py` | The SDK wiring: name, presentation in Studio, parameters, registration. |
| `verify_agent.py` | The readiness check (see below). |
| `tests/` | 10 tests that call the controller the way Studio does. |
| `.env.example`, `requirements.txt`, `pyproject.toml`, `.gitignore` | Configuration, ready for a host such as Render (see step 8 of the [express guide](./express-guide)). |

The template organizes the work like this: one **job** per run, a **Run** case that follows the run and ends with human review, and one case per processed **item**, with its step and cost. If this mapping does not fit your agent, adapt it (see [Missions, Jobs, Cases, Steps](/docs/supervaizer-controller/core-concepts)).

## Get started

<Tabs groupId="os">
<TabItem value="mac" label="Mac">

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer pytest
python -m pytest -q
supervaizer start --local
```

</TabItem>
<TabItem value="linux" label="Linux">

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install supervaizer pytest
python -m pytest -q
supervaizer start --local
```

</TabItem>
<TabItem value="windows" label="Windows (PowerShell)">

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install supervaizer pytest
python -m pytest -q
supervaizer start --local
```

</TabItem>
</Tabs>

Then customize three places:

1. `supervaizer_control.py`: `AGENT_NAME`, `AGENT_SLUG` (the name in lowercase, with dashes), `CATALOG` (bump at every form change), the presentation and the parameters.
2. `controller.py`, functions `start_fields()` and `read_inputs()`: your start form and its server-side validation.
3. `agent.py`: your logic.

Then connect the agent following [I already have an agent](./make-your-agent-supervaize-ready), from step 5.

## The readiness check

From the agent's folder, `verify_agent.py` checks what makes most connections fail, and tells you plainly what is missing. It never prints a secret value. It also works with an agent not built from the template: just copy the file into its folder.

```bash
python verify_agent.py
python verify_agent.py --url https://your-agent.example.com
```

| What it checks | Example message |
|---|---|
| Python version and Supervaizer install | `Python 3.11 found, 3.12 or later required` |
| `supervaizer_control.py`, `pyproject.toml` and `.gitignore` | `.env is not ignored by git` |
| Variables written by `supervaizer login` | `SUPERVAIZE_API_KEY missing: run supervaizer login` |
| Addresses (format, hidden spaces) | `must be a full https:// address without spaces` |
| `SUPERVAIZER_SERVER_ID` | `not set: a new agent identity at every restart` |
| The workspace verification address (JWKS) | `HTTP 404, no keys` |
| The agent's public address | `unreachable: is the agent or the tunnel running?` |

The script returns 0 when everything required is in order: you can add it to your deployment pipeline.

*Written for Supervaizer 1.11.1 (November 2026).*
