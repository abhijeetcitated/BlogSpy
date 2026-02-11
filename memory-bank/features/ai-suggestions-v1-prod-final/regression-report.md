# AI Suggestions V1 - Regression Report (Updated)

Date: 2026-02-08
Feature: ai-suggestions-v1-prod-final

## Code Changes in this pass

1. `src/features/dashboard/services/live-refresh-worker.ts`
- Added ranking refresh cadence write-back from live SERP (`rank_history` insert).
- Added `content_performance` upsert (`DECAYING` / `STABLE`) from live comparison.
- Added `trend_watchlist` best-effort upsert using `fetchTrendAnalysis` growth.
- Added domain-position helper and growth calculator helpers.

2. `src/lib/services/credit-banker.service.ts`
- Fixed `refund_credits_atomic` RPC payload to match DB signature.
- Added structured error log on refund failure.

3. `src/features/settings/actions/update-notifications.ts`
- Default `productupdates` switched to `false` (digest/critical-first policy).
- Added legacy table sync bridge (`notificationsettings` -> `notification_settings`) after write.

4. `src/features/settings/constants/index.ts`
- UI default notification constant aligned (`productupdates: false`).

5. `src/features/dashboard/services/suggestion-engine.ts`
- Added CTA safety fallback with feature flags for disabled Phase-2 pages.
- Suggestions now route to safe fallback pages instead of locked targets.

6. Remote migrations applied
- `20260208100000_rank_history_project_id_index.sql`
- `20260208123000_fix_auth_sync_trigger_columns.sql`
- `20260208124000_sync_notification_settings_tables.sql`
- `20260208124500_backfill_notificationsettings_from_legacy.sql`

## Runtime Verification

1. Auth user creation path
- Before: `Database error creating new user` due broken auth sync trigger.
- After migration: admin create/delete user test PASS.

2. Notification table consistency
- Verified: `notificationsettings_count == notification_settings_count`
- Verified: `mismatched_rows == 0`

3. Build gate
- `npm run build` PASS (post-fix)

## Verification Artifacts

- `db-verify.md` -> remote migration + RLS + index verify
- `rls-runtime-test.md` -> owner vs non-owner runtime isolation pass
- `credits-validation.md` -> deduct/refund idempotency pass (rollback-safe SQL)
- `e2e-live-refresh.md` -> wiring pass, runtime still needs real queued-run proof from UI

## Residual Risks / Open Items

1. Full UI-level live E2E (`Live Refresh` click -> QStash webhook -> completed status) still needs execution proof in running env.
2. Current dataset is sparse (`rank_history/content_performance/trend_watchlist` low), so suggestion quality remains low until real feature usage writes data.
3. Two-real-user staging isolation run is still recommended before release.

## Verdict

PASS with final operational validation pending:
- Code + migrations + auth trigger + build are stable.
- Remaining blocker is operational proof of live chain under real runtime traffic.
