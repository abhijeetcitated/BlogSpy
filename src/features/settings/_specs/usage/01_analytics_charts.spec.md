# 📊 SPEC: USAGE ANALYTICS
> **PARENT**: `usage/README.md`
> **UI**: `UsageTab.tsx`
> **DB**: `usage_events` (ClickHouse/Postgres)

## 1. 🧠 LOGIC & RULES
*   **Visuals**:
    *   30-Day moving average of Credit Burn.
    *   Breakdown by Feature (Keyword Research vs AI Writer).
*   **Limits**:
    *   Show "80% Used" Warning Line.

## 2. 🔌 WIRING
*   `getUsageStats(range)` Action.
*   Aggregates `usage_events` table by `feature_id`.
