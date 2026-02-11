# AI Suggestions V1 — Production Hardening Plan

**Feature Slug**: `ai-suggestions-v1-prod-final`  
**Risk Tier**: Tier-2 (touches DB schema, credit system, external queue)  
**Date**: 2026-02-08  

---

## Executive Summary

Production hardening of AI Suggestions V1 to resolve known HIGH/MEDIUM issues from the wiring audit, verify all infrastructure layers, and produce mandatory artifacts for release gate.

---

## Infrastructure Discovery Summary

### Verified Existing Infrastructure

| Component | File | Status |
|-----------|------|--------|
| Suggestion Engine (7 rules) | `src/features/dashboard/services/suggestion-engine.ts` | WORKING |
| Fetch Action | `src/features/dashboard/actions/fetch-ai-suggestions.ts` | WORKING (has bugs) |
| Live Refresh Action | `src/features/dashboard/actions/request-live-refresh.ts` | WORKING |
| Live Refresh Worker | `src/features/dashboard/services/live-refresh-worker.ts` | WORKING |
| QStash Webhook Route | `src/app/api/webhooks/qstash/route.ts` | WORKING |
| Credit Banker | `src/lib/services/credit-banker.service.ts` | WORKING |
| Dashboard Client | `src/features/dashboard/components/DashboardClient.tsx` | WORKING |
| UI Cards | `src/features/dashboard/components/agentic-suggestions.tsx` | WORKING |

### DB Tables + Migrations

| Table | Migration | Prisma Model | RLS |
|-------|-----------|--------------|-----|
| `userprojects` | — | `UserProject` | ✅ CRUD |
| `rank_history` | — | `Ranking` | ✅ CRUD |
| `content_performance` | — | `ContentPerformance` | ✅ CRUD |
| `trend_watchlist` | — | `TrendWatchlist` | ✅ CRUD |
| `activity_logs` | — | `ActivityLog` | ✅ CRUD |
| `ai_suggestion_live_refresh_jobs` | `20260207193000` | `SuggestionLiveRefreshJob` | ✅ SELECT+INSERT |
| `ai_suggestion_live_refresh_results` | `20260207193000` | `SuggestionLiveRefreshResult` | ✅ SELECT (via job join) |

### External Services

| Service | SDK | Env Vars | Status |
|---------|-----|----------|--------|
| Upstash Redis | `@upstash/redis` | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | ✅ |
| Upstash QStash | `@upstash/qstash` | `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | ✅ |
| DataForSEO | `fetchLiveSerp` | (internal service) | ✅ |

---

## Issues to Fix

### HIGH: `safeRankings()` unbounded query — memory bomb risk
- **File**: `src/features/dashboard/actions/fetch-ai-suggestions.ts`
- **Problem**: `prisma.ranking.findMany()` has NO `take` limit. A project with 10K+ keywords loads all rankings into memory.
- **Fix**: Add `take: 200` to the initial query. This caps memory while covering adequate keyword coverage for the 7 rule types.

### MEDIUM: Missing `@@index([project_id])` on Ranking model
- **File**: `prisma/schema.prisma`
- **Problem**: `rank_history` table has no index on `project_id`. Every suggestion query does a sequential scan.
- **Fix**: Add `@@index([project_id])` to the Ranking model + create migration.

---

## Phases

### Phase 1: DB Migration Verify
- Confirm `20260207193000_ai_suggestions_live_refresh.sql` migration is applied
- Verify both tables exist with correct columns + indexes
- Confirm RLS policies are enabled and match migration SQL

### Phase 2: Fix safeRankings Unbounded Query (HIGH)
- Add `take: 200` limit to `safeRankings()` query
- Use `distinct: ["keyword_id"]` for efficient dedup instead of post-query Map

### Phase 3: Add Ranking @@index (MEDIUM)
- Add `@@index([project_id])` to `Ranking` model in schema.prisma
- Generate SQL migration
- Run `npx prisma generate`

### Phase 4: RLS Isolation Verification
- Verify QStash webhook route uses `verifySignatureAppRouter` — CONFIRMED
- Verify server action has auth + ownership checks — CONFIRMED
- Verify live refresh action uses `authenticatedAction` — CONFIRMED
- Verify worker uses admin client for refunds — CONFIRMED

### Phase 5: Credits + Notifications Verification
- Verify credit deduction flow (deduct → queue → refund on failure)
- Verify cooldown (5min) + daily cap (6) via Redis
- Verify idempotency key prevents duplicate charges

### Phase 6: Build Gate + Artifacts
- Run `npm run build`
- Generate wiring-audit.md
- Generate regression-report.md
- Reviewer verdict

---

## Impacted Files (Change Set)

1. `src/features/dashboard/actions/fetch-ai-suggestions.ts` — add `take: 200` + `distinct`
2. `prisma/schema.prisma` — add `@@index([project_id])` to Ranking
3. New migration SQL for Ranking index

---

## Regression Scope

- Dashboard loads correctly with suggestions
- Suggestions are generated from all 7 rule types
- Live refresh action works (credits, cooldown, QStash enqueue)
- No N+1 introduced by limit change
- Build passes (70+ pages)
