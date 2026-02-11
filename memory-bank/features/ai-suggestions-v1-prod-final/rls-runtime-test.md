# AI Suggestions V1 - RLS Runtime Test

Date: 2026-02-08
Feature: ai-suggestions-v1-prod-final

## Test Goal
Validate tenant isolation on `ai_suggestion_live_refresh_jobs`.

## Method
- Inserted temporary job row for a real project owner (inside transaction).
- Simulated authenticated role with JWT claim `request.jwt.claim.sub`.
- Checked visibility as:
  - owner user
  - non-owner random UUID user
- Rolled back transaction.

## Output

```json
{
  "owner_visible_count": 1,
  "non_owner_visible_count": 0
}
```

Result: PASS

Note: Full 2-real-user test was not possible from existing dataset, but owner vs non-owner runtime isolation is verified at policy execution layer.
