# AI Suggestions Live Refresh Hardening — Wiring Audit

**Date:** 2026-02-07

---

## Dependency Graph (Live Refresh Pipeline)

```
DashboardClient.tsx
  ├─ useAction(requestAISuggestionsLiveRefresh) → request-live-refresh.ts
  │   ├─ @upstash/qstash Client → QStash API
  │   ├─ @upstash/redis Redis → cooldown/daily cap
  │   ├─ creditBanker.deduct() → credit-banker.service.ts → Supabase RPC consume_credits_atomic
  │   └─ prisma.suggestionLiveRefreshJob.create()
  │
  └─ useAction(fetchAISuggestions) → fetch-ai-suggestions.ts
      └─ suggestion-engine.ts (reads rankings, decay, trends, scans)

QStash webhook delivery:
  → /api/webhooks/qstash (route.ts)
    └─ processAISuggestionsLiveRefresh(jobId) → live-refresh-worker.ts
        ├─ prisma.suggestionLiveRefreshJob (claim: queued → processing)
        ├─ prisma.ranking.findMany() → project keywords
        ├─ fetchLiveSerp() → DataForSEO
        ├─ prisma.suggestionLiveRefreshResult.createMany()
        ├─ prisma.ranking.create() (position updates)
        ├─ upsertContentPerformance()
        ├─ upsertTrendWatchlist()
        ├─ prisma.activityLog.createMany()
        └─ On failure: refundCreditsIfNeeded() → Supabase RPC refund_credits_atomic
```

## Import/Export Contracts

| Module | Exports Used | Consumers |
|--------|-------------|-----------|
| `request-live-refresh.ts` | `requestAISuggestionsLiveRefresh` | `DashboardClient.tsx` |
| `fetch-ai-suggestions.ts` | `fetchAISuggestions` | `DashboardClient.tsx` |
| `live-refresh-worker.ts` | `processAISuggestionsLiveRefresh` | `route.ts` (webhook) |
| `credit-banker.service.ts` | `creditBanker` | `request-live-refresh.ts`, worker (currently direct RPC) |
| `suggestion-engine.ts` | `generateSuggestions` | `fetch-ai-suggestions.ts` |
| `command-center-data.ts` | `AgenticSuggestion`, `getDemoAgenticSuggestions` | `DashboardClient.tsx` |

## Env Var Resolution Map

| Var | Current Value | Used By | Issue |
|-----|--------------|---------|-------|
| `APP_URL` | `https://whinily-protectorless-knox.ngrok-free.app` | `request-live-refresh.ts` L40 | Dead ngrok tunnel |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Fallback in `getAppUrl()` | Localhost = loopback |
| `QSTASH_TOKEN` | Set (Citated_Team) | QStash Client | Working |
| `QSTASH_URL` | `https://qstash-us-east-1.upstash.io` | QStash SDK (regional) | Working |
| `QSTASH_CURRENT_SIGNING_KEY` | Set | Webhook signature verify | Working |
| `QSTASH_NEXT_SIGNING_KEY` | Set | Webhook signature verify | Working |

## Middleware Path Analysis

- `proxy.ts` matcher: `/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`
- `/api/webhooks/qstash` DOES match the middleware.
- Middleware calls `supabase.auth.getUser()` — but only redirects for `/dashboard` and `/login` routes.
- `/api/webhooks/qstash` NOT in the suspicious check path (`/api/research/` only).
- **Verdict:** Middleware does NOT interfere with the QStash webhook endpoint. No auth blocking.

## RLS Impact on Worker

- Worker uses `prisma` (service role via `DATABASE_URL` pooler).
- `ai_suggestion_live_refresh_jobs` RLS policies: `select_own` and `insert_own` for authenticated.
- **Worker runs as service_role via DATABASE_URL** — RLS bypassed. No issue.

## Refund RPC Wiring

- `refund_credits_atomic(p_user_id, p_amount, p_idempotency_key)`:
  1. Finds original debit tx by `user_id + idempotency_key + amount < 0`.
  2. Creates refund tx with key `{idempotency_key}:refund`.
  3. Idempotent: won't double-refund.
- Worker's `refundCreditsIfNeeded()` passes `job.idempotency_key`.
- This is CORRECT: the job's idempotency_key IS the same as the tx's idempotency_key (set in `request-live-refresh.ts` L144).

## Scope Lock Verification

Files being modified are ONLY in the live refresh pipeline:
- ✅ `request-live-refresh.ts` — live refresh action
- ✅ `live-refresh-worker.ts` — worker logic
- ✅ `route.ts` (webhooks/qstash) — webhook handler
- ✅ `credit-banker.service.ts` — shared utility (additive method only)
- ✅ `vercel.json` — cron config
- ✅ `.env.local` — env fix
- ✅ NEW `reconcile-jobs/route.ts` — new cron
- ❌ No changes to: suggestion-engine, fetch-ai-suggestions, DashboardClient, command-center-data
