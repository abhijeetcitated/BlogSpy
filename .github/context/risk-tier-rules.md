# Risk Tier Rules

Last updated: 2026-02-06

## Tier 1 (Low risk)
Examples: pure UI copy change, local toggle behavior, non-shared styling.

Required gates:
1. Delta scan of impacted files only.
2. Basic smoke checks for the affected page.
3. `npm run build`.

## Tier 2 (Medium risk)
Examples: existing feature action/service wiring, shared component edits, table/filter logic that touches server state.

Required gates:
1. `feature-plan.prompt.md`
2. `wiring-audit.prompt.md`
3. Targeted regression checks for impacted journeys.
4. `npm run build`.

## Tier 3 (High risk)
Examples: new external provider, auth/session path changes, schema/migration/policy edits, shared contract changes.

Required gates:
1. Full 7+2 workflow.
2. Security checklist + threat model.
3. DB integrity + rollback plan.
4. External provider reliability plan (timeout/retry/fallback/cost guard).
5. Reviewer final verdict.
6. `npm run build`.

## Escalation rules
- If uncertain, escalate to higher tier.
- Any export/signature break in shared modules auto-escalates to Tier-3.
- Any change in auth/RLS/policies auto-escalates to Tier-3.
