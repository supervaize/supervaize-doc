---
displayed_sidebar: supervaizerControllerSidebar
---

# Supervaizer Quick Start

Here are the steps:

1. Create an AI Agent : we will use an existing open source project
2. Setup Supervaizer and map the example controller file
3. Setup your Supervaize credentials
4. **Start**

## Create / Get an AI Agent

:::info
Supervaizer controller supports `python` based agents for the moment.
:::

Finding an open source agent : [EmailAiAgent](https://github.com/parthshr370/Email-AI-Agent?tab=readme-ov-file)

([https://medium.com/@parthshr370/building-your-first-agent-with-deepseek-ai-email-agent-e6f17d3c290e](https://medium.com/@parthshr370/building-your-first-agent-with-deepseek-ai-email-agent-e6f17d3c290e))

```sh
# clone repository
git clone https://github.com/alain-sv/Email-AI-Agent.git
cd Email-AI-Agent

# Note: we are using uv as a matter of preference & performance
# Install with pip is of course possible
# pip install -r requirements.txt
############################################
# Install UV - see https://docs.astral.sh/
# Mac
# curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows
# powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# or using Pipx
# pipx install uv
############################################
# Create virtual environment and install dependencies
uv init
uv add --requirements requirements.txt

```

## Setup the supervaizer and map the controller file

### Install

```bash
uv add supervaizer
# pip install supervaizer
```

We then need to generate the model integration file:

```bash
supervaizer create_example
```

Customise the resulting `supervaizer_control_example.py` file

- Define agent parameters
- Define agent methods
- For each agent method, define agent fields

### Define agent parameters

[ParameterModel Documentation](https://doc.supervaize.com/docs/Supervaizer%20Controller/model_reference#parameterparametermodel)
**name (str):** name of the parameter, as used in the agent code

**description (str)** : The description of the parameter, used in the Supervaize UI

is_environment (bool) :Whether the parameter is set as an environment variable

is_secret (bool): "Whether the parameter is a secret - hidden from the user in the Supervaize UI

is_required(bool): Whether the parameter is required, used in the Supervaize UI
