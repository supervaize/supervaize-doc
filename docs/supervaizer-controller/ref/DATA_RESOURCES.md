# Data Resources

Data Resources allow agents to expose their own domain data (contacts, records, prompts, etc.) to the Studio platform via generic CRUD endpoints. Studio renders any declared resource as a generic table with no per-agent customization required.

## Overview

Declare `DataResource` objects on your agent and pass them in `Agent(data_resources=[...])`. The SDK auto-generates FastAPI routes. Studio discovers them at registration time and renders generic CRUD views.

```python
from supervaizer import Agent, DataResource, DataResourceField, Editable, FieldType

contacts_resource = DataResource(
    name="contacts",
    display_name="Contacts",
    description="Tenant contact pool",
    fields=[
        DataResourceField(name="id", editable=Editable.NEVER, visible_on=["list", "detail"]),
        DataResourceField(name="first_name", required=True),
        DataResourceField(name="email", field_type=FieldType.EMAIL),
    ],
    on_list=lambda: contacts_repo.list_all(),
    on_get=lambda item_id: contacts_repo.get(item_id),
    on_create=lambda data: contacts_repo.create(data),
    on_update=lambda item_id, data: contacts_repo.update(item_id, data),
    on_delete=lambda item_id: contacts_repo.delete(item_id),
    on_import=lambda records: contacts_repo.bulk_import(records),
    importable=True,
)

agent = Agent(
    name="My Agent",
    # ... other params ...
    data_resources=[contacts_resource],
)
```

## DataResource Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | `str` | required | URL-safe identifier (e.g. `"contacts"`) |
| `display_name` | `str` | derived from `name` | Human-readable label shown in Studio |
| `description` | `str` | `""` | Short description shown in Studio |
| `fields` | `list[DataResourceField]` | `[]` | Field schema for Studio rendering |
| `read_only` | `bool` | `False` | If True, only list/get routes are generated |
| `importable` | `bool` | `False` | If True, a bulk import route is generated |
| `on_list` | `Callable[[], list[dict]]` | required | Returns all records |
| `on_get` | `Callable[[str], dict \| None]` | optional | Returns one record by ID |
| `on_create` | `Callable[[dict], dict]` | required if not `read_only` | Creates a record; must return dict with `id` |
| `on_update` | `Callable[[str, dict], dict]` | optional | Updates a record by ID |
| `on_delete` | `Callable[[str], bool]` | optional | Deletes a record; returns True on success |
| `on_import` | `Callable[[list[dict]], dict]` | required if `importable` | Bulk insert; required if `importable=True` |

## DataResourceField Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | `str` | required | Column name (e.g. `"first_name"`) |
| `field_type` | `FieldType` | `FieldType.STRING` | One of: `string`, `integer`, `boolean`, `date`, `datetime`, `text`, `email`, `url` |
| `label` | `str \| None` | derived (`name.title()`) | Human-readable label |
| `required` | `bool` | `False` | Required on create form |
| `editable` | `Editable` | `Editable.ALWAYS` | Controls when Studio may edit this field |
| `visible_on` | `list[str]` | `["list","detail","create","edit"]` | Views that render this field |
| `description` | `str \| None` | `None` | Help text shown in Studio form |
| `related_resource` | `str \| None` | `None` | Name of another DataResource this FK-references |

## Editable Values

| Value | Meaning |
|-------|---------|
| `Editable.ALWAYS` | Field appears on both create and edit forms |
| `Editable.CREATE_ONLY` | Set on create; shown read-only on edit |
| `Editable.NEVER` | Agent-controlled; never shown in a form input (e.g. auto-generated IDs) |

## Generated Routes

For each declared operation, the SDK registers a route under the agent's path:

```
GET    /supervaizer/agents/{slug}/data/{resource}/           list
GET    /supervaizer/agents/{slug}/data/{resource}/{id}       get
POST   /supervaizer/agents/{slug}/data/{resource}/           create
PUT    /supervaizer/agents/{slug}/data/{resource}/{id}       update
DELETE /supervaizer/agents/{slug}/data/{resource}/{id}       delete
POST   /supervaizer/agents/{slug}/data/{resource}/import/    bulk import
```

All routes require the server API key (`X-API-Key` header).

## Job and Case Metadata

Agents can also attach arbitrary domain metadata to Jobs and Cases, which Studio renders in a dedicated panel on the detail view.

```python
from supervaizer import Job, JobContext, Case

# In your job_start handler:
job = Job.new(
    job_context=JobContext(workspace_id=workspace_id, job_id=job_id),
    agent_name="my-agent",
    metadata={
        "campaign_id": "c-001",
        "scenario": "hr_screening",
        "phase": "interviews",
    },
)

# In your case processing:
case = Case.start(
    job_id=job_id,
    account=account,
    name=contact_name,
    description="...",
    metadata={
        "contact_email": "alice@example.com",
        "language": "en",
    },
)
```

The `metadata` dict is sent to Studio via the existing event system and stored on the Job/Case record. It is rendered as a read-only key/value panel — not editable from Studio.
