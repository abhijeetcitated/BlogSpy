# AI Suggestions V1 — Wiring Audit

**Date**: 2026-02-08  
**Scope**: Full 6-layer audit of AI Suggestions V1 production wiring  

---

## Layer 1: Supabase Tables + RLS

| Table | RLS Enabled | Policies | Migration | Status |
|-------|:-----------:|----------|-----------|:------:|
| `userprojects` | ✅ | SELECT/INSERT/UPDATE/DELETE own | `20260206183000` | ✅ |
| `rank_history` | ✅ | CRUD via project ownership join | `20260206183000` | ✅ |
| `content_performance` | ✅ | CRUD via project ownership join | `20260206183000` | ✅ |
| `trend_watchlist` | ✅ | CRUD via project ownership join | `20260206183000` | ✅ |
| `activity_logs` | ✅ | CRUD via user_id + optional project join | `20260206183000` | ✅ |
| `ai_suggestion_live_refresh_jobs` | ✅ | SELECT+INSERT own (user_id = auth.uid()) | `20260207193000` | ✅ |
| `ai_suggestion_live_refresh_results` | ✅ | SELECT via job join (user_id) | `20260207193000` | ✅ |

**All 7 tables have correctly scoped RLS policies. No service_role bypass without explicit admin client.**

---

## Layer 2: Prisma Schema ↔ Query Field Mapping

### Ranking (rank_history)
| Prisma Field | DB Column | Query Usage | Status |
|---|---|---|:---:|
| `project_id` | `project_id` (uuid) | `where: { project_id }` | ✅ |
| `keyword_id` | `keyword_id` (uuid) | `distinct: ["keyword_id"]` | ✅ |
| `position` | `position` (int) | `currentPosition` mapping | ✅ |
| `checked_at` | `checked_at` (timestamptz) | `orderBy`, comparison | ✅ |
| `url` | `url` (text?) | `r.url` | ✅ |
| **NEW** `@@index([project_id])` | idx_rank_history_project_id | Query performance | ✅ ADDED |

### ContentPerformance (content_performance)
| Prisma Field | DB Column | Query Usage | Status |
|---|---|---|:---:|
| `project_id` | `project_id` (uuid) | `where` filter | ✅ |
| `status` | `status` (enum) | `where: { status: DECAYING }` | ✅ |
| `url` | `url` (text) | Mapped to `DecayingContent.url` | ✅ |

### TrendWatchlist (trend_watchlist)
| Prisma Field | DB Column | Query Usage | Status |
|---|---|---|:---:|
| `project_id` | `project_id` (uuid) | `where` filter | ✅ |
| `topic` | `topic` (text) | Mapped to `TrendingTopic.topic` | ✅ |
| `growth_percent` | `growth_percent` (int) | `where: { gte: 100 }`, `orderBy` | ✅ |

### ActivityLog (activity_logs)
| Prisma Field | DB Column | Query Usage | Status |
|---|---|---|:---:|
| `project_id` | `project_id` (uuid) | `where` filter | ✅ |
| `action_type` | `action_type` (text) | `where: { action_type: "ai_scan" }` | ✅ |
| `meta_data` | `meta_data` (jsonb) | Parsed for `keyword` field | ✅ |

### SuggestionLiveRefreshJob
| Prisma Field | DB Column | Index | Status |
|---|---|---|:---:|
| `user_id` | `user_id` (uuid) | `@@index([user_id, requested_at])` | ✅ |
| `project_id` | `project_id` (uuid) | `@@index([project_id, requested_at])` | ✅ |
| `idempotency_key` | `idempotency_key` (text) | `@unique` | ✅ |
| `status` | `status` (text) | Used in optimistic lock | ✅ |
| `credits_charged` | `credits_charged` (int) | Refund flow | ✅ |

### SuggestionLiveRefreshResult
| Prisma Field | DB Column | Index | Status |
|---|---|---|:---:|
| `job_id` | `job_id` (uuid) | `@@index([job_id])` | ✅ |
| `project_id` | `project_id` (uuid) | `@@index([project_id, created_at])` | ✅ |
| `keyword` | `keyword` (text) | Part of `@@unique([job_id, keyword, source])` | ✅ |

---

## Layer 3: Internal Import Wiring

| From | Imports | To | Resolves |
|------|---------|-----|:--------:|
| `DashboardClient.tsx` | `fetchAISuggestions` | `fetch-ai-suggestions.ts` | ✅ |
| `DashboardClient.tsx` | `requestAISuggestionsLiveRefresh` | `request-live-refresh.ts` | ✅ |
| `DashboardClient.tsx` | `CommandCenter` | `@/features/dashboard` | ✅ |
| `DashboardClient.tsx` | `AgenticSuggestion` type | `command-center-data.ts` | ✅ |
| `fetch-ai-suggestions.ts` | `generateSuggestions` | `suggestion-engine.ts` | ✅ |
| `fetch-ai-suggestions.ts` | `RankingWithKeyword` etc types | `suggestion-engine.ts` | ✅ |
| `fetch-ai-suggestions.ts` | `AgenticSuggestion` type | `command-center-data.ts` | ✅ |
| `request-live-refresh.ts` | `Client` | `@upstash/qstash` | ✅ |
| `request-live-refresh.ts` | `Redis` | `@upstash/redis` | ✅ |
| `request-live-refresh.ts` | `creditBanker` | `credit-banker.service.ts` | ✅ |
| `qstash/route.ts` | `verifySignatureAppRouter` | `@upstash/qstash/nextjs` | ✅ |
| `qstash/route.ts` | `processAISuggestionsLiveRefresh` | `live-refresh-worker.ts` | ✅ |
| `qstash/route.ts` | `emailSender` | `@/lib/alerts` | ✅ |
| `live-refresh-worker.ts` | `prisma` | `@/lib/prisma` | ✅ |
| `live-refresh-worker.ts` | `createAdminClient` | `@/lib/supabase/server` | ✅ |
| `live-refresh-worker.ts` | `fetchLiveSerp` | `keyword-research/services/live-serp` | ✅ |

---

## Layer 4: Prop Chain (UI → Action → Engine)

```
DashboardClient.tsx
  ├─ useAction(fetchAISuggestions) → executeAISuggestions({ projectId })
  │   └─ fetch-ai-suggestions.ts → auth → ownership → 4 parallel queries → generateSuggestions()
  │       └─ suggestion-engine.ts → 7 rules → AgenticSuggestion[]
  ├─ useAction(requestAISuggestionsLiveRefresh) → executeLiveRefresh({ projectId })
  │   └─ request-live-refresh.ts → auth → ownership → cooldown → cap → credits → QStash
  │       └─ webhook → live-refresh-worker.ts → DataForSEO → results → refund on failure
  └─ <CommandCenter
       suggestions={suggestions}               ✅
       onRefreshSuggestions={handler}            ✅
       onLiveRefreshSuggestions={handler}        ✅
       suggestionsLoading={suggestionsLoading}   ✅
       liveRefreshPending={liveRefreshPending}   ✅
       suggestionsError={suggestionsError}       ✅
     />
```

---

## Layer 5: Auth + Security

| Check | Implementation | Status |
|-------|---------------|:------:|
| Server action auth | `getServerUser()` → throws UNAUTHORIZED | ✅ |
| Project ownership | `prisma.userProject.findFirst({ userid })` | ✅ |
| QStash signature verification | `verifySignatureAppRouter(handler)` | ✅ |
| Missing signing keys guard | Returns 503 if keys not configured | ✅ |
| Service role isolation | Admin client only in worker refund | ✅ |
| Credit idempotency | UUID-based idempotency key, unique constraint | ✅ |
| Cooldown abuse prevention | Redis TTL key per user+project | ✅ |
| Daily rate limit | Redis counter with 24h TTL | ✅ |

---

## Fixes Applied in This Hardening

| Issue | Severity | Fix | Status |
|-------|----------|-----|:------:|
| `safeRankings()` unbounded query | HIGH | Added `take: 200` + `distinct: ["keyword_id"]` | ✅ |
| Missing `@@index([project_id])` on Ranking | MEDIUM | Added to schema + migration SQL | ✅ |

---

## Known Accepted Risks (V1)

| Risk | Severity | Rationale |
|------|----------|-----------|
| N+1 in safeRankings (7-day comparison) | LOW | Bounded by `take: 200`, acceptable for V1. Batch in V2. |
| No cross-type deduplication | LOW | Same keyword can trigger multiple card types. Design decision — shows different action paths. |
| No initial loading skeleton for suggestions | LOW | `suggestionsLoading` flag exists but no skeleton component yet. |

---

**VERDICT: ALL WIRING VERIFIED ✅**
