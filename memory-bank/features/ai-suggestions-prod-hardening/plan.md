# AI Suggestions Production Hardening Plan

Feature slug: `ai-suggestions-prod-hardening`
Date: 2026-02-07
Risk tier: Tier-3

## Goal
Complete production-grade hardening for AI Suggestions by adding paid live-refresh architecture, security gates, idempotency, queue worker processing, and source-of-truth cleanup for notification settings.

## Scope
- Add async paid live-refresh flow:
  - action -> queue -> worker -> DB update -> dashboard recompute
- Add DB tables for live-refresh jobs/results and RLS policies.
- Add Redis-based cooldown + daily cap + idempotency guard for paid refresh.
- Ensure internal refresh remains free and no external calls on dashboard load.
- Unify notification settings action source-of-truth to avoid drift.

## Non-goals
- No OpenRouter integration in AI Suggestions.
- No broad dashboard redesign.
- No unrelated feature refactors.

## Required external constraints (verified)
- Upstash QStash: signature verification, retries, dedup-safe queue design.
- Supabase: server trust via `getUser()`, RLS enforced user scope.
- DataForSEO: external calls only for live refresh, not default dashboard open.

## Implementation steps
1. Schema + migration
   - Add `ai_suggestion_live_refresh_jobs`
   - Add `ai_suggestion_live_refresh_results`
   - Add indexes and RLS.
2. Live refresh backend action
   - Auth + ownership + zod validation
   - cooldown + daily cap
   - credit deduction with idempotency
   - queue job to QStash
3. Worker processing in QStash webhook
   - process job
   - fetch external SERP/trend signals
   - persist results and logs
   - complete/fail job with robust error handling
4. UI wiring
   - add paid “Live Refresh” trigger in AI Suggestions
   - keep existing free refresh behavior
5. Notification settings source-of-truth
   - keep one canonical action path
   - make duplicate action file forward to canonical implementation
6. Verification
   - run build gate
   - update regression report

## Acceptance criteria
- Dashboard open/manual/auto refresh do not call DataForSEO.
- Live refresh is queued async and paid.
- Credits are protected with idempotency + cooldown + cap.
- Webhook signature verification remains active.
- Notification settings logic has one source-of-truth.
- `npm run build` passes.