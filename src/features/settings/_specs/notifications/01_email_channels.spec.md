# 🔔 SPEC: NOTIFICATION CHANNELS
> **PARENT**: `notifications/README.md`
> **UI**: `NotificationsTab.tsx`
> **DB**: `notification_settings` column (JSONB)

## 1. 🧠 LOGIC & RULES
*   **Channels**:
    *   **Marketing**: Product Updates (Unsubscribe supported).
    *   **Transactional**: Security Alerts (CANNOT Unsubscribe).
    *   **Reports**: Weekly SEO Digest (Toggleable).
*   **Global Kill Switch**: "Unsubscribe from All" toggles everything off except Transactional.

## 2. 🔌 WIRING
*   `updateNotificationSettings()` Action:
    *   Updates `core_profiles.notification_settings` JSONB.
    *   Syncs with Email Provider (Resend/SendGrid) Audience list.
