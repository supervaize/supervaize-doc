# Consommation facturable {#billable-consumption}

> **Créé le :** 2026-10-30
> **Statut :** implémenté dans Supervaizer (livré dans la 1.10).
> **Équivalent côté Studio :** `studio/Documentation/specifications/workspace_credits_billing.md`, section « Agent billable consumption (Phase 3) »

Un agent peut facturer le travail qu'il effectue pour un espace de travail. Il déclare ses SKU à l'enregistrement et envoie des enregistrements de consommation à Studio. Studio fixe le prix de chaque SKU, impute les enregistrements acceptés sur les crédits de l'espace de travail, et crédite les gains du propriétaire de l'agent. Les deux parties sont facultatives. Un agent qui ne déclare aucun catalogue et ne remonte rien s'enregistre octet pour octet comme avant.

Le SDK reste générique : il transporte des SKU, des unités et des quantités. L'agent possède son vocabulaire (par exemple `interview_minute`), et Studio possède les prix, les autorisations et le registre comptable.

## Catalogue de facturation {#billing-catalog}

`Agent(billing_catalog=[...])` accepte des objets `BillingCatalogItem` ou des dictionnaires. La liste voyage dans la clé `billing_catalog` de la charge utile d'enregistrement de l'agent (`AgentRegistrationContract.billing_catalog`). La clé est omise quand l'argument vaut `None`. Une liste vide est envoyée sous la forme `[]`.

| Champ | Type | Règle |
| --- | --- | --- |
| `sku` | `str` | 1 à 64 caractères, `^[a-z0-9_]+$`, unique dans le catalogue |
| `unit` | `str` | 1 à 32 caractères, par exemple `minute` ou `token` |
| `description` | `str` | 255 caractères au plus, `""` par défaut |

Le catalogue ne contient aucun prix. L'espace de travail propriétaire définit un prix par défaut pour chaque SKU sur la page de l'agent, et peut définir un prix spécifique pour chaque espace de travail invité. Studio écarte un catalogue invalide avec un journal de débogage et ne fait jamais échouer l'enregistrement pour cette raison.

```python
from supervaizer import Agent, BillingCatalogItem

agent = Agent(
    name="Interviewer",
    version="1.0.0",
    supervaizer_v2_registration=registration,
    billing_catalog=[
        BillingCatalogItem(
            sku="interview_minute", unit="minute", description="Voice interview time"
        ),
        {
            "sku": "transcript_token",
            "unit": "token",
            "description": "Transcript tokens processed",
        },
    ],
)
```

L'exemple Hello World intégré définit un catalogue d'un seul SKU, `HELLO_WORLD_BILLING_CATALOG`, dans `src/supervaizer/examples/hello_world_agent.py`.

## Remonter la consommation {#report-consumption}

```python
from datetime import UTC, datetime
from decimal import Decimal

from supervaizer import BillableConsumption

receipts = account.report_consumption_sync(
    [
        BillableConsumption(
            sku="interview_minute",
            quantity=Decimal("12.50"),
            unit="minute",
            job_id=studio_job_id,
            case_id=studio_case_id,
            idempotency_key=f"{session_id}:interview_minute",
            occurred_at=datetime.now(UTC),
            description="Interview session",
        )
    ],
    agent_slug=agent.slug,
)
```

`Account.report_consumption(records, *, agent_slug, workspace_id=None)` est la forme asynchrone ; `report_consumption_sync` prend les mêmes arguments. Les deux utilisent les clients HTTP partagés de `send_event`.

- Requête : `POST {api_url}/w/{workspace_id}/api/v1/billing/consumption/` avec `Authorization: Api-Key <key>` et `workspace: <workspace_id>`. `workspace_id` est l'espace de travail qui exécute les jobs du lot : l'espace de travail invité, ou l'espace de travail propriétaire pour ses propres jobs. Il vaut par défaut l'espace de travail du compte. Le SDK donne à l'en-tête `workspace` la même valeur que celle de l'URL. Un `workspace_id` vide lève `ValueError`.
- Corps : `{"agent_slug": "<slug>", "records": [...]}` avec 1 à 200 enregistrements (`ConsumptionReport`). Le SDK valide le lot avant de l'envoyer, y compris en mode local.
- Réponse : `200 {"results": [...]}`, un `ConsumptionReceipt` par enregistrement, dans l'ordre d'envoi. Les méthodes renvoient cette liste. Une réponse dont le nombre ou l'ordre des valeurs `idempotency_key` diffère lève `ValueError`.

### Champs d'un enregistrement (`BillableConsumption`) {#record-fields-billableconsumption}

Les limites correspondent à celles du sérialiseur de Studio. Le SDK refuse un enregistrement hors limites dès sa construction : un seul enregistrement erroné ne transforme donc pas tout le lot en `400`.

| Champ | Type | Règle |
| --- | --- | --- |
| `sku` | `str` | un SKU du catalogue de l'agent, même motif que le catalogue |
| `quantity` | `Decimal` | supérieur à 0, fini, 18 chiffres au plus dont 6 décimales (les zéros de fin comptent, donc `1.5000000` est refusé) ; envoyé sous forme de chaîne décimale comme `"12.50"` |
| `unit` | `str` | 1 à 32 caractères |
| `job_id` | `str` | le job Studio facturé par l'enregistrement, 1 à 64 caractères |
| `case_id` | `str \| None` | la case Studio, le cas échéant, 64 caractères au plus ; envoyé sous la forme `null` quand il n'est pas défini |
| `idempotency_key` | `str` | 1 à 128 caractères |
| `agent_cost_usd` | `Decimal \| None` | indication facultative de ce que l'agent a payé, 0 au minimum, 18 chiffres au plus dont 6 décimales, envoyée sous forme de chaîne ; Studio ne la facture pas |
| `description` | `str \| None` | 255 caractères au plus, texte brut, aucune donnée personnelle |
| `occurred_at` | `datetime` | avec fuseau horaire ; un datetime naïf est rejeté. Envoyé au format ISO 8601 |

### Accusés de réception (`ConsumptionReceipt`) {#receipts-consumptionreceipt}

| `status` | Signification | Ce que fait l'agent |
| --- | --- | --- |
| `accepted` | Studio a stocké et imputé l'enregistrement. | Rien. |
| `duplicate` | Studio a déjà reçu un enregistrement avec le même `(agent, idempotency_key)`, quel que soit son statut. Rien n'est imputé deux fois. | Rien. |
| `rejected` | Studio a stocké l'enregistrement et n'a rien imputé. `reason` en donne la raison. | Le journaliser. Ne pas le renvoyer : un rejet est définitif. |

Raisons : `unknown_job`, `unknown_case`, `wrong_workspace`, `agent_mismatch`, `no_grant`, `unknown_sku`, `no_price`, `invalid_quantity`. `reason` est une chaîne ouverte ; traitez les valeurs inconnues comme n'importe quel autre rejet.

### Erreurs {#errors}

Les erreurs portant sur tout le lot lèvent l'erreur httpx, comme le fait `send_event` :

- `403` : la clé d'API n'a pas le droit d'agir pour cet agent dans cet espace de travail. L'utilisateur de la clé doit appartenir à l'espace de travail propriétaire de l'agent pendant que l'espace de travail cible détient une autorisation acceptée pour l'agent, ou appartenir à l'espace de travail cible quand l'agent lui appartient. C'est définitif : ne renvoyez pas le lot.
- `400` : Studio n'a pas pu analyser le corps. Le SDK journalise le corps de la réponse expurgé, qui nomme l'enregistrement ou le champ. C'est définitif : ne renvoyez pas le lot.
- `404` avec `{"detail": "...", "code": "workspace_credits_off"}` : l'espace de travail cible a désactivé les crédits d'espace de travail. Studio répond ainsi pour tout le lot tant que ce réglage est désactivé. Le SDK lève son erreur httpx habituelle. Conservez les enregistrements et renvoyez-les plus tard avec les mêmes clés.
- Erreurs de connexion et délais dépassés : le lot a pu atteindre Studio ou non. Renvoyez les mêmes enregistrements avec les mêmes clés.

En mode local (`SUPERVAIZER_LOCAL_MODE=true`), aucune requête n'est envoyée et chaque enregistrement revient `accepted`.

## Quand remonter {#when-to-report}

- Remontez une fois le travail définitif, par exemple après le rapprochement d'une session. Ne remontez pas d'estimations que vous corrigez ensuite : Studio n'a ni mise à jour ni suppression d'un enregistrement.
- Remontez dans l'espace de travail qui a exécuté le job. Un lot contient les enregistrements d'un seul espace de travail.
- Regroupez les enregistrements quand c'est pratique, jusqu'à 200 par appel. Un enregistrement par appel reste valide.

## Clés d'idempotence {#idempotency-keys}

- Utilisez une clé par unité de travail et par SKU, par exemple `f"{session_id}:{sku}"`. Dérivez-la d'identifiants stables, jamais de l'heure ni d'une valeur aléatoire.
- Réutilisez la même clé pour chaque renvoi de cet enregistrement. Un renvoi après une réponse perdue répond `duplicate` et n'impute rien deux fois.
- Ne réutilisez jamais une clé pour un travail différent. Studio répond `duplicate` pour le second enregistrement et ne l'impute pas.
- Conservez un enregistrement dont le transport a échoué (dans une boîte d'envoi, par exemple) et renvoyez-le avec la même clé.

## Compatibilité {#compatibility}

- Tous les champs sont facultatifs pour les agents. Un agent sans `billing_catalog` envoie exactement les clés d'enregistrement qu'il envoyait avant. Les charges utiles de référence se trouvent dans `tests/fixtures/supervaizer_v2/registration_baseline.json` ; `tests/test_registration_compat.py` les compare.
- `V2ActionRequest` et les routes A2A sont inchangés.
- Vérification : `tests/test_billing_contracts.py`, `tests/test_report_consumption.py`, `tests/test_registration_compat.py`.


*Uploaded on 2026-11-06 15:07:19*
