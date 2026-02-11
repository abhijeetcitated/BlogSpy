# Feature Plan

- Feature slug: `competitor-gap-production-v1`
- Risk tier: `T3`
- Owner: Codex
- Date: 2026-02-08

## 1. Feature goal and non-goals

### Goal
- Ship production-grade Competitor Gap analysis for authenticated users using Server Actions, DataForSEO Labs, Supabase persistence, and credit-safe execution.
- Replace mock gap data flow with live+cached backend results for `src/app/dashboard/research/gap-analysis/page.tsx`.
- Keep existing UI shape mostly stable while fixing data-contract parity (`missing`, `weak`, `strong`, `shared`, ranks, volume, KD, CPC, intent).

### Non-goals (v1)
- Full Forum Intel backend implementation (Phase-2).
- Rebuilding entire table design system.
- Cross-feature redesign of shared DataForSEO client.

## 2. Risk tier (`T1`,`T2`,`T3`) and rule citation

- Tier chosen: `T3`.
- Rule citation from `.github/context/risk-tier-rules.md`:
  - Tier-3 includes external provider integrations, schema/migration/RLS edits, and shared contract changes.
- This feature touches all three:
  - External provider calls (`DataForSEO Labs + SERP`).
  - New Supabase tables + RLS policies.
  - Route/action/service wiring changes for an existing feature.

## 3. Impacted files (existing)

- `src/app/dashboard/research/gap-analysis/page.tsx`
- `src/app/competitor-gap/page.tsx`
- `src/features/competitor-gap/competitor-gap-content/CompetitorGapContent.tsx`
- `src/features/competitor-gap/competitor-gap-content/hooks/useCompetitorGap.ts`
- `src/features/competitor-gap/competitor-gap-content/components/StatsBar.tsx`
- `src/features/competitor-gap/competitor-gap-content/components/Header.tsx`
- `src/features/competitor-gap/components/analysis-form.tsx`
- `src/features/competitor-gap/components/gap-analysis-table.tsx`
- `src/features/competitor-gap/components/gap-analysis-table/actions/ActionsDropdown.tsx`
- `src/features/competitor-gap/competitor-gap-content/utils/gap-utils.ts`
- `src/features/competitor-gap/types/index.ts`
- `src/lib/seo/dataforseo.ts`
- `src/constants/api-endpoints.ts`
- `src/lib/safe-action.ts`
- `src/lib/services/credit-banker.service.ts`

## 4. Dependency graph (imports/exports/services/db)

- Route entry:
  - `src/app/dashboard/research/gap-analysis/page.tsx` -> `@features/competitor-gap` -> `CompetitorGapContent`.
- Client feature path:
  - `CompetitorGapContent` -> `useCompetitorGap` -> table/stats/filter components.
- New action path (planned):
  - `useCompetitorGap` -> `src/app/dashboard/research/gap-analysis/actions.ts` (`authAction` + zod).
- Service path (planned):
  - `actions.ts` -> gap service adapter -> `src/lib/seo/dataforseo` client -> DataForSEO endpoints.
- Persistence path (planned):
  - `actions.ts` -> Supabase (`createClient`/`createAdminClient`) -> new `competitor_gap_*` tables.
- Credits path:
  - `actions.ts` -> `creditBanker.deduct/refund` -> `consume_credits_atomic/refund_credits_atomic`.

## 5. Security risks and mitigations

- Risk: tenant data leakage in result tables.
  - Mitigation: `user_id` on all gap tables + RLS + own-user CRUD policies.
- Risk: forged client identifiers / replay.
  - Mitigation: all mutation inputs via zod; user identity from `authAction` context only; idempotency key support.
- Risk: provider abuse and cost spikes.
  - Mitigation: safe-action rate limiting + per-feature upstream throttling, dedupe key locks, TTL cache, optional live verify only.
- Risk: credit inconsistencies on partial failures.
  - Mitigation: deduct -> run -> persist -> refund on failure pattern using `creditBanker`.
- Risk: sensitive provider internals leaking to UI.
  - Mitigation: map provider errors to safe public codes/messages.

## 6. Internal scan scope (baseline or delta) and why

- Baseline scan completed for governance/context/maps and relevant feature wiring.
- Delta scope for this feature:
  - `src/features/competitor-gap/**`
  - `src/app/dashboard/research/gap-analysis/**`
  - `src/lib/seo/**`
  - `src/constants/api-endpoints.ts`
  - `supabase/migrations/**` (new migration only)
- Expansion rule: only direct dependents/importers if public contracts change.

## 7. External research findings (mandatory for Tier-3)

- 2026-02-08: DataForSEO Domain Intersection live endpoint confirmed.
  - https://docs.dataforseo.com/v3/dataforseo_labs/google/domain_intersection/live/
- 2026-02-08: DataForSEO Ranked Keywords live endpoint confirmed.
  - https://docs.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live/
- 2026-02-08: DataForSEO SERP Google Organic live advanced endpoint confirmed.
  - https://docs.dataforseo.com/v3/serp/google/organic/live/advanced/
- 2026-02-08: DataForSEO Labs locations/languages and status endpoints confirmed.
  - https://docs.dataforseo.com/v3/dataforseo_labs/locations_and_languages/
  - https://docs.dataforseo.com/v3/dataforseo_labs/status/
- 2026-02-08: DataForSEO general 2000 req/min and Labs simultaneous 30 cap confirmed.
  - https://dataforseo.com/help-center/rate-limits-and-request-limits
  - https://docs.dataforseo.com/v3/dataforseo_labs-overview/
- 2026-02-08: Provider error codes mapping confirmed (40202, 40203, 40209, 40210).
  - https://docs.dataforseo.com/v3/appendix-errors/
- 2026-02-08: Supabase RLS guidance for policy-driven isolation.
  - https://supabase.com/docs/guides/database/postgres/row-level-security

### Assumptions
- Existing DataForSEO credentials and Supabase service role keys are configured in target environments.
- Forum Intel will remain limited/disabled in v1 live rollout.

## 8. Implementation sequence (smallest safe steps)

1. Add feature artifacts (plan/wiring/regression docs).
2. Add API endpoint constants for gap-specific calls.
3. Add gap provider adapter with typed response mapping and provider error-code mapping.
4. Add gap services for dedupe/cache/upstream throttling and result shaping.
5. Add server actions (`runGapAnalysis`, `getGapRun`, `verifyGapKeywords`) protected by `authAction` + zod.
6. Add Supabase migration for `competitor_gap_runs`, `competitor_gap_results`, `competitor_gap_jobs` with RLS and indexes.
7. Refactor `useCompetitorGap` + `CompetitorGapContent` to call live action instead of mocks.
8. Fix UI parity (`shared` tab/card visibility and summary consistency).
9. Phase-2 gate: keep forum action disabled or explicit placeholder to avoid dead/misleading production calls.
10. Add observability fields (request id, retries, queue wait, cost estimate) in persisted run metadata.
11. Update regression report with executed checks and verdict.
12. Run `npm run build` hard gate and resolve failures.

## 9. Regression scope and test plan

- Unit-ish validations in changed files:
  - Domain normalization and zod schema behavior.
  - Gap classification/rank mapping from provider payload.
  - Error mapping to UI-safe messages.
- Integration path checks:
  - Action auth enforcement (`PLG_LOGIN_REQUIRED` path).
  - Credits: deduct success, refund on provider failure.
  - Cache hit path returns without additional provider spend.
  - RLS: own-user read/write only in gap tables.
- Manual journeys:
  - Analyze with 1 competitor.
  - Analyze with 2 competitors.
  - Switch filter tabs and verify counts/rows match.
  - Verify action for top N keywords.
  - Forum button behavior (explicit disabled/phase-2 state).
- Build gate:
  - `npm run build` must pass.

## 10. Rollback strategy

- Application rollback:
  - Revert feature wiring to mock path by rolling back action usage in `useCompetitorGap`.
- Data rollback:
  - Down migration prepared to drop `competitor_gap_*` tables/policies/indexes.
- Runtime guardrail:
  - Feature flag/fallback mode can force cached-only results if provider instability spikes.
- Cost incident response:
  - Temporarily disable live verify path and keep core `domain_intersection` only.
