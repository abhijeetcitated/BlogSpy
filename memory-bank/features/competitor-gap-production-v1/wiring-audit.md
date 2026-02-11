# Wiring Audit

- Feature slug: `competitor-gap-production-v1`
- Date: 2026-02-08

## 1. Import/export contract changes

- Planned new contracts:
  - `src/app/dashboard/research/gap-analysis/actions.ts` exports:
    - `runGapAnalysis`
    - `getGapRun`
    - `verifyGapKeywords`
  - Gap adapter exports from `src/lib/seo` layer for domain intersection / verify.
- Existing exports to preserve:
  - `src/features/competitor-gap/index.ts` public exports remain stable.
  - No deletion of existing component exports in v1.

## 2. Action-to-service-to-db path integrity

Target chain:
- `CompetitorGapContent/useCompetitorGap` -> `runGapAnalysis` action.
- Action -> gap service -> DataForSEO adapter.
- Action -> Supabase `competitor_gap_runs` + `competitor_gap_results` + `competitor_gap_jobs`.
- Action -> `creditBanker` for atomic deduction/refund.

Required integrity checks:
- Every action response has typed success/error envelope.
- Every persisted row has `user_id` from server context, never from client input.
- Run/results rows linked by `run_id` foreign key.

## 3. Route/page/action consumer updates

- Consumers to update:
  - `src/features/competitor-gap/competitor-gap-content/hooks/useCompetitorGap.ts`
  - `src/features/competitor-gap/competitor-gap-content/CompetitorGapContent.tsx`
  - `src/features/competitor-gap/components/analysis-form.tsx`
- Routes expected to remain unchanged but newly wired through feature components:
  - `src/app/dashboard/research/gap-analysis/page.tsx`
  - `src/app/competitor-gap/page.tsx`

## 4. Auth and tenant-context propagation

- `authAction` is mandatory on all write/read actions for protected data.
- Tenant/user context source:
  - `ctx.userId` from `authAction` only.
- RLS requirements:
  - `USING (auth.uid() = user_id)` and `WITH CHECK (auth.uid() = user_id)` on new tables.

## 5. External integration call path updates

- Primary provider calls:
  - `POST /v3/dataforseo_labs/google/domain_intersection/live`
- Optional provider calls:
  - `POST /v3/dataforseo_labs/google/ranked_keywords/live`
  - `POST /v3/serp/google/organic/live/advanced`
- Setup/periodic calls (not per analyze):
  - `GET /v3/dataforseo_labs/locations_and_languages`
  - `GET /v3/dataforseo_labs/status`

## 6. Tier rule compliance (`.github/context/risk-tier-rules.md`)

- Classified as Tier-3 due to:
  - external provider usage;
  - schema + RLS changes;
  - route/action wiring changes.
- Required gates included:
  - plan + wiring audit + regression report;
  - security + rollback notes;
  - build gate.

## 7. Validation against generated maps

- `memory-bank/maps/route-action-map.json` baseline:
  - gap routes currently have empty `actionImports`.
- `memory-bank/maps/import-graph.json` baseline:
  - competitor-gap feature currently client-only mock flow.
- `memory-bank/maps/db-table-map.json` baseline:
  - no existing competitor gap DB table touchpoints.

## Breaking change risks

1. `SortField`/table props mismatch if backend rows miss expected fields.
2. Existing forum-intel placeholder actions showing production-only labels.
3. Shared DataForSEO client error interceptor throwing generalized errors if not remapped in adapter.

## Missing consumer updates (must-do)

1. Hook must replace timeout/toast-only analyze logic with server action call.
2. Stats bar must include `shared` parity with computed stats.
3. Action dropdown must not expose dead `Check Forum` production action in v1.
4. Route-action map should be regenerated post-implementation (`npm run maps:generate`).

## Required follow-up edits

1. Add migration with strict RLS and high-cardinality indexes.
2. Add action idempotency handling and cache key dedupe.
3. Add provider error code mapping to user-safe messages.
4. Add regression and build verdict updates after implementation.

## Go / No-Go verdict

- Pre-implementation verdict: `GO_WITH_GATES`.
- Conditions:
  - complete action/service/db wiring;
  - pass build gate;
  - update regression report with executed checks.
