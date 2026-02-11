# AI Suggestions Live Refresh Hardening — Plan

**Feature slug:** `ai-suggestions-live-refresh-hardening`
**Date:** 2026-02-07
**Risk tier:** Tier-2 (billing + external service integration)

---

## 1. Root Cause Analysis (Severity order)

### CRITICAL — APP_URL conflict causes webhook delivery failure
- **File:** `src/features/dashboard/actions/request-live-refresh.ts` L38-45
- **Finding:** `getAppUrl()` tries `APP_URL` first, then `NEXT_PUBLIC_APP_URL`.
- **`.env.local` state:**
  - `APP_URL=https://whinily-protectorless-knox.ngrok-free.app` (ngrok tunnel — likely dead)
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- **Impact:** QStash publishes to the ngrok URL which is likely down → webhook receives 502/404 → retries exhaust → message goes to DLQ → job stays `queued` forever.
- **Evidence:** 4 jobs stuck at `status=queued`, `started_at=NULL`, `completed_at=NULL`. All have `credits_charged=3` with no refund.

### HIGH — No refund for QSTASH_PUBLISH_FAILED jobs (old idempotency mismatch)
- **File:** `request-live-refresh.ts` L200-207
- **Finding:** Older failed jobs (pre-fix) used `creditResult.idempotencyKey` for refund, but the earlier code used `crypto.randomUUID()` as the deduct key, not the `idempotencyKey` passed to `creditBanker.deduct()`. The `refund_credits_atomic` RPC matches on `idempotency_key` from `bill_transactions`. If the key doesn't match, refund silently fails (returns `{success: false}`).
- **Evidence:** 12 usage debits of -3 credits, 0 refund transactions. 6 `QSTASH_PUBLISH_FAILED` jobs have credits debited but no refund.

### HIGH — No stale job reconciler
- **Finding:** No cron/sweeper exists for jobs stuck in `queued` status. Once QStash DLQ exhausts retries, the job stays `queued` and the user's credits are permanently lost.
- **Files affected:** `vercel.json` (only has `cleanup` and `weekly-report` crons).

### MEDIUM — Worker refund uses Supabase RPC directly, bypassing `creditBanker.refund()`
- **File:** `live-refresh-worker.ts` L124-131
- **Finding:** `refundCreditsIfNeeded()` calls `admin.rpc("refund_credits_atomic")` directly. The `creditBanker.refund()` function has additional logic (looks up original tx's idempotency_key). But the worker's direct call passes `job.idempotency_key`, which is the _job's_ idempotency key, not the _transaction's_ id. This is actually correct since `refund_credits_atomic` matches on `idempotency_key` column — but inconsistent and fragile.

### MEDIUM — Webhook returns 200 on worker failure
- **File:** `src/app/api/webhooks/qstash/route.ts` L67-72
- **Finding:** When `processAISuggestionsLiveRefresh` fails, the handler returns `status: 200`. This tells QStash "message delivered successfully" — so no retry. If the failure is transient (e.g., DB timeout), the message is permanently lost.

### LOW — Error messages lack diagnostic detail
- **Finding:** `QSTASH_PUBLISH_FAILED` doesn't include the actual QStash response/status. Worker errors are generic.

### LOW — No structured observability/correlation
- **Finding:** No correlation ID in logs. No structured event log for each stage (publish, receive, claim, complete/fail).

---

## 2. Implementation Plan

### Fix 1: Standardize `getAppUrl()` to use `APP_URL` only, validate it
- Remove `NEXT_PUBLIC_APP_URL` fallback from QStash webhook URL resolution.
- `APP_URL` is the **only** source for webhook destination (server-only).
- Add startup-time validation: if `APP_URL` is localhost or missing, log warning.
- Add runtime `isLoopbackWebhook()` check BEFORE credit deduction (already exists, just ensure ordering).

### Fix 2: Fix `.env.local` — set `APP_URL` to working ngrok/production URL
- Keep `APP_URL` as the public-facing URL for webhooks.
- For local dev with ngrok: `APP_URL` must be the active ngrok tunnel.
- For production (Vercel): `APP_URL` must be the production domain.

### Fix 3: Webhook route — return 500 on transient failure for QStash retry
- If worker returns `{success: false}`, return HTTP 500 so QStash retries.
- Only return 200 for terminal failures that should NOT be retried (job not found, already completed).

### Fix 4: Worker refund — use `creditBanker.refund()` consistently
- Replace direct `admin.rpc("refund_credits_atomic")` with `creditBanker.refund()`.
- Pass the job's `idempotency_key` as `transactionId` — but `creditBanker.refund()` looks up the real tx by id, so we need to pass the right key. Since the refund RPC uses the idempotency_key directly, we should keep the worker's approach but wrap it properly.
- Decision: Simplify — have `creditBanker.refundByIdempotencyKey()` method that directly passes the key.

### Fix 5: Stale job reconciler cron
- New route: `src/app/api/cron/reconcile-jobs/route.ts`
- Finds all `queued` jobs older than 10 minutes.
- Marks them `failed` with `error_message: "STALE_QUEUED_JOB_RECONCILED"`.
- Refunds credits for each.
- Add to `vercel.json` crons: every 15 minutes.

### Fix 6: Refund the 4 currently stuck queued jobs + 6 unrefunded failed jobs
- One-time DB migration to fail + refund all stuck jobs.

### Fix 7: Structured error messages with reason codes
- `QSTASH_PUBLISH_FAILED:{status}:{body}` format.
- Worker errors: `WORKER_CLAIM_FAILED`, `PROJECT_NOT_FOUND`, `SERP_FETCH_ERROR:{keyword}:{detail}`.

### Fix 8: UI — handle live refresh status feedback
- After `executeLiveRefresh` succeeds, poll for job status or re-fetch suggestions after delay.

---

## 3. Files Changed (Scope Lock)

| File | Change |
|------|--------|
| `src/features/dashboard/actions/request-live-refresh.ts` | Fix `getAppUrl()`, enhance error messages |
| `src/features/dashboard/services/live-refresh-worker.ts` | Use consistent refund path, better errors |
| `src/app/api/webhooks/qstash/route.ts` | Return 500 on transient failure |
| `src/app/api/cron/reconcile-jobs/route.ts` | NEW: stale job reconciler |
| `src/lib/services/credit-banker.service.ts` | Add `refundByIdempotencyKey()` method |
| `.env.local` | Fix `APP_URL` to active ngrok URL |
| `vercel.json` | Add reconcile-jobs cron |
| `supabase/migrations/` | One-time fix for stuck jobs |

---

## 4. Research Sources

- QStash Publish: https://upstash.com/docs/qstash/api/publish
- QStash Webhooks: https://upstash.com/docs/qstash/features/callbacks
- QStash Retry: https://upstash.com/docs/qstash/features/retry
- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Supabase RPC: https://supabase.com/docs/reference/javascript/rpc
- DataForSEO SERP API: https://docs.dataforseo.com/v3/serp/live/regular/

---

## 5. Pass Criteria

1. New live refresh run reaches `completed` within 120s.
2. Latest completed job has `results rows > 0`.
3. One usage debit exists for success path; no duplicate for same idempotency key.
4. Forced failure scenario creates refund entry (usage + refund pair).
5. No queued job older than 10 minutes after reconciler runs.
6. `npm run build` passes.
7. No changes outside scope.
