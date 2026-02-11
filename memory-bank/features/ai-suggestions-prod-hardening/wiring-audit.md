# AI Suggestions Production Hardening Wiring Audit

Feature slug: `ai-suggestions-prod-hardening`
Date: 2026-02-07

## Current wiring baseline
- Free suggestions pipeline:
  - `DashboardClient` -> `fetch-ai-suggestions` -> `suggestion-engine`
- Queue infra:
  - `notification.service.ts` publishes email payloads to `/api/webhooks/qstash`
  - `/api/webhooks/qstash/route.ts` verifies signature and sends email

## New wiring to add
1. Live refresh request path
   - `agentic-suggestions.tsx` (new live refresh trigger)
   -> `DashboardClient.tsx`
   -> `request-live-refresh.ts` (new action)
   -> DB insert (`ai_suggestion_live_refresh_jobs`)
   -> QStash publish payload `type: ai_suggestions_live_refresh`
2. Worker execution path
   - `/api/webhooks/qstash/route.ts`
   -> job loader
   -> external fetch (DataForSEO)
   -> write `ai_suggestion_live_refresh_results`
   -> append activity logs
   -> mark job completed/failed
3. Existing free path unchanged
   - free refresh still only runs `fetch-ai-suggestions.ts`.

## Contract changes
- Add optional callback props for live refresh in AI Suggestions component chain.
- No break to existing `suggestions` payload contract.

## Security checks
- Auth + project ownership in action.
- Redis cooldown/daily cap on paid trigger.
- Idempotency uniqueness on job row.
- QStash signature verify unchanged and mandatory.
- RLS on new tables.

## Regression watchpoints
- Ensure email webhook payload path still works.
- Ensure dashboard suggestion loading remains unaffected.
- Ensure no new unauthenticated data leakage.