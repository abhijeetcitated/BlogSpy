# AI Suggestions V1 - Credits Validation

Date: 2026-02-08
Feature: ai-suggestions-v1-prod-final

## Critical Fix Applied
Found and fixed runtime mismatch:
- DB function signature: `refund_credits_atomic(p_user_id uuid, p_amount integer, p_idempotency_key text)`
- Code was sending an extra `p_description` argument.

Files fixed:
- `src/lib/services/credit-banker.service.ts`
- `src/features/dashboard/services/live-refresh-worker.ts`

## SQL Transaction Test (rollback-safe)
Executed consume + duplicate consume + refund + duplicate refund for same idempotency key.

```json
{
  "consume_first": [{ "success": true, "balance": 7 }],
  "balance_after_consume": { "credits_total": 10, "credits_used": 3 },
  "consume_duplicate_same_key": [{ "success": true, "balance": 7 }],
  "balance_after_duplicate": { "credits_total": 10, "credits_used": 3 },
  "refund_first": [{ "success": true, "balance": 10 }],
  "balance_after_refund": { "credits_total": 10, "credits_used": 0 },
  "refund_duplicate_same_key": [{ "success": true, "balance": 10 }],
  "balance_after_refund_duplicate": { "credits_total": 10, "credits_used": 0 }
}
```

Result: PASS

Interpretation:
- Deduct is idempotent.
- Refund is idempotent.
- No double charge on same idempotency key.
