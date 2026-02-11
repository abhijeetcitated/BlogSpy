# AI Suggestions V1 - DB Verify

Date: 2026-02-08
Feature: ai-suggestions-v1-prod-final

## Migration State (Remote)
- `20260207193000_ai_suggestions_live_refresh` -> applied
- `20260208100000_rank_history_project_id_index` -> applied
- `20260208123000_fix_auth_sync_trigger_columns` -> applied
- `20260208124000_sync_notification_settings_tables` -> applied
- `20260208124500_backfill_notificationsettings_from_legacy` -> applied

Source: `supabase migration list --linked`

## Schema + Policy Verify

Verified via direct SQL metadata query:

```json
{
  "tables": [
    { "tablename": "ai_suggestion_live_refresh_jobs", "rowsecurity": true },
    { "tablename": "ai_suggestion_live_refresh_results", "rowsecurity": true },
    { "tablename": "rank_history", "rowsecurity": true }
  ],
  "policies": [
    { "tablename": "ai_suggestion_live_refresh_jobs", "policyname": "insert_own_ai_suggestion_live_refresh_jobs", "cmd": "INSERT" },
    { "tablename": "ai_suggestion_live_refresh_jobs", "policyname": "select_own_ai_suggestion_live_refresh_jobs", "cmd": "SELECT" },
    { "tablename": "ai_suggestion_live_refresh_results", "policyname": "select_own_ai_suggestion_live_refresh_results", "cmd": "SELECT" }
  ],
  "idx_rank_history_project_id": true
}
```

Result: PASS

## Auth Trigger Health

Verified on linked remote DB:
- `core_profiles` now contains `auth_provider` column.
- `handle_auth_user_sync` no longer references removed columns (`avatar_url`, `updated_at`).
- Admin create/delete user test succeeded (no `Database error creating new user`).

Result: PASS
