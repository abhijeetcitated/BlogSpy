# AI Suggestions Live Refresh Hardening — Regression Report

**Feature slug:** `ai-suggestions-live-refresh-hardening`
**Date:** 2026-02-07
**Author:** Gama Orchestrator (Implementer phase)

---

## 1. Summary of Changes

### Fix 1: Webhook returns 500 on transient failure
**File:** `src/app/api/webhooks/qstash/route.ts`
- Worker failure now returns HTTP 500 so QStash retries automatically.
- Terminal errors (`JOB_NOT_FOUND`, `JOB_ALREADY_TERMINAL`) return HTTP 200 to stop retries.

### Fix 2: `getAppUrl()` fixed + QStash publish logging
**File:** `src/features/dashboard/actions/request-live-refresh.ts`
- `getAppUrl()` now reads **only** `APP_URL`. Dead ngrok tunnel from `APP_URL` was the root cause of all stuck-queued jobs.
- QStash publish now includes `retries: 3` and logs `messageId`, `webhookUrl`, `idempotencyKey` on success.
- Failure path logs detailed error with webhook URL for fast diagnosis.
- Refund on publish failure now uses the job's `idempotencyKey` (not `creditResult.idempotencyKey`).

### Fix 3: Worker refund consistency + terminal state handling
**File:** `src/features/dashboard/services/live-refresh-worker.ts`
- Import changed from `createAdminClient` to `creditBanker` (single refund path).
- `refundCreditsIfNeeded()` rewritten to use `creditBanker.refund()` with structured logging.
- Terminal state guard: completed jobs return `{ success: true }`, failed jobs return `{ error: "JOB_ALREADY_TERMINAL" }`.
- Race-condition guard preserved via `updateMany` with `status: "queued"` WHERE clause.
- Structured `console.log` / `console.error` at every decision point with `jobId`, `idempotencyKey`.

### Fix 4: `creditBanker.refund()` UUID detection
**File:** `src/lib/services/credit-banker.service.ts`
- `refund()` now detects if input is a UUID (legacy tx ID) vs raw idempotency key string.
- Only performs `bill_transactions` lookup when UUID detected, avoiding wasted DB query.
- Added `idempotencyKey` to error log output.

### Fix 5: Stale job reconciler cron
**File:** `src/app/api/cron/reconcile-jobs/route.ts` (NEW)
- Finds `queued` jobs older than 10 minutes, marks them `failed`, refunds credits.
- Protected by `CRON_SECRET` authorization header.
- Returns JSON with count and per-job result (jobId, refunded, error).
- Structured logging for each reconciled job.

### Fix 6: DB migration for stuck historical jobs
**Applied via:** Supabase migration `remediate_stuck_jobs`
- Marked 5 stuck `queued` jobs as `failed` with `STALE_QUEUED_JOB_RECONCILED` error.
- Marked 9 `QSTASH_PUBLISH_FAILED` jobs that lacked `failed_at` timestamps.
- Issued `refund_credits_atomic` for all 14 unrefunded debit transactions.
- User balance restored to 50 credits (starting balance).

### Fix 7: vercel.json cron entry
**File:** `vercel.json`
- Added `{ "path": "/api/cron/reconcile-jobs", "schedule": "*/15 * * * *" }`.

---

## 2. Build Verification

```
npm run build → exit code 0
Route /api/cron/reconcile-jobs appears in build output
All 71 routes compiled successfully
```

---

## 3. Pass Criteria Checklist

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Every failed/cancelled job refunds credits | PASS | Worker uses `creditBanker.refund()`, reconciler refunds stale jobs, publish-failure path refunds immediately |
| 2 | No new `any` in changed files | PASS | All changes use typed parameters/returns |
| 3 | `APP_URL` conflict resolved | PASS | `getAppUrl()` reads only `APP_URL`; localhost guard blocks QStash publish to loopback |
| 4 | QStash retries transient worker failures | PASS | Webhook returns 500 on transient, 200 on terminal |
| 5 | Stale job sweeper exists | PASS | `/api/cron/reconcile-jobs` runs every 15 min, marks stale queued jobs failed+refunded |
| 6 | Historical stuck jobs remediated | PASS | 14 jobs failed+refunded via migration, balance restored to 50 |
| 7 | Build passes | PASS | `npm run build` exit code 0 |

---

## 4. Impacted Flows & Regression Scope

### Directly impacted:
- **AI Suggestions Live Refresh** — end-to-end: credit deduct → QStash publish → webhook → worker → results → refund on failure
- **Credit system** — refund path via `creditBanker.refund()`
- **QStash webhook handler** — HTTP status codes changed (200→500 for transient errors)

### Indirectly impacted:
- **Email webhook** — shares same `route.ts`, but email handler path unchanged (returns 500 on failure as before)
- **Cron system** — new `/api/cron/reconcile-jobs` route added, no impact on existing `/api/cron/cleanup` or `/api/cron/weekly-report`

### Not impacted:
- Dashboard UI components (no changes)
- Auth/login flows
- Keyword research, rank tracker, trend spotter (separate pipelines)
- Billing/subscription flows
- Settings pages

---

## 5. Files Changed

| File | Action | Lines |
|------|--------|-------|
| `src/app/api/webhooks/qstash/route.ts` | Modified | ~100 |
| `src/features/dashboard/actions/request-live-refresh.ts` | Modified | ~227 |
| `src/features/dashboard/services/live-refresh-worker.ts` | Modified | ~400 |
| `src/lib/services/credit-banker.service.ts` | Modified | ~161 |
| `src/app/api/cron/reconcile-jobs/route.ts` | Created | ~91 |
| `vercel.json` | Modified | ~16 |

---

## 6. Known Limitations

1. **`APP_URL` must be set in Vercel** — Production deploy requires `APP_URL` env var pointing to the production domain. Local dev requires an active ngrok/tunnel URL.
2. **`CRON_SECRET` must be set in Vercel** — The reconciler cron is auth-gated; Vercel auto-injects this for Vercel Cron jobs.
3. **Refund RPC is idempotent** — `refund_credits_atomic` checks for duplicate refunds by idempotency key, so double-refund is safe but will be a no-op.
4. **DataForSEO telemetry** — Not added in this hardening pass (lower priority, separate feature).

---

## 7. Verdict

**READY FOR REVIEWER PHASE**
