# AI Suggestions V1 - Live Refresh E2E Status

Date: 2026-02-08
Feature: ai-suggestions-v1-prod-final

## Runtime Data Readiness Check

```json
{
  "userprojects": 15,
  "rank_history": 0,
  "jobs": 0,
  "results": 0,
  "content_performance": 0,
  "trend_watchlist": 0
}
```

## Interpretation
- Pipeline code is wired, but current environment has no ranking seed data.
- Without `rank_history` rows, worker has no keywords to refresh.

## What is already wired in code
1. UI trigger: `DashboardClient.tsx` -> `requestAISuggestionsLiveRefresh`
2. Job enqueue: `request-live-refresh.ts` -> `ai_suggestion_live_refresh_jobs`
3. Queue consumer: `api/webhooks/qstash/route.ts` (signed)
4. Worker: `live-refresh-worker.ts` -> DataForSEO -> `ai_suggestion_live_refresh_results`
5. Recompute source tables update in worker:
   - `rank_history` refresh insert
   - `content_performance` upsert
   - `trend_watchlist` best-effort upsert

## E2E verdict
- Code wiring: PASS
- Live runtime execution in this dataset: BLOCKED (missing rank seed + no UI-trigger proof captured yet)

## Unblock steps
1. Add at least 1 keyword and 1 rank row for any project.
2. Click Live Refresh from Dashboard.
3. Verify transitions: `queued -> processing -> completed/failed`.
4. Verify `ai_suggestion_live_refresh_results` rows and suggestions recompute.
5. Verify credits behavior:
   - success -> no refund
   - queue/worker failure -> refund with same idempotency key
