# 📉 SPEC: DECAY ALERTS
> **PARENT**: `decay-alerts/README.md`
> **UI**: `DecayAlertsTab.tsx` (Visible in Screenshot 5)
> **DB**: `user_preferences.decay_settings` (JSONB)

## 1. 🧠 LOGIC & RULES
*   **Definition**: Alerts when content traffic/ranking drops.
*   **Toggles**:
    1.  **Critical Only**: If ON, ignore minor fluctuations. Only alert if drop > 30%.
    2.  **Daily Digest**: Summary email instead of instant spam.
*   **Time Selector**: "Delivery Time" (09:00 AM).
    *   *Logic*: Uses User's Timezone (from General Tab).

## 2. 🔌 WIRING
*   `updateDecaySettings()` Action:
    *   Saves JSON: `{ critical_only: boolean, digest_enabled: boolean, digest_time: "09:00" }`.
*   **Backend Job**:
    *   Cron runs hourly. Checks `current_user_time === digest_time`.
    *   If match -> Compiles report -> Sends Email.
