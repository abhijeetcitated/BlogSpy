# 📲 SPEC: MULTI-CHANNEL NOTIFICATIONS
> **PARENT**: `notifications/README.md`
> **UI**: `NotificationsTab.tsx`

## 1. 🧠 LOGIC & RULES
*   **Slack**:
    *   **Input**: Webhook URL (e.g. `hooks.slack.com/...`).
    *   **Validation**: Regex check for valid Slack URL.
    *   **Test**: "Send Test Alert" button triggers a dummy payload.
*   **Push Notifications (Beta)**:
    *   Uses Service Workers (PWA Standard).
    *   **Permission**: Browser Prompt (`Notification.requestPermission()`).
    *   **Status**: Toggle automatically OFF if permission denied.

## 2. 🔌 WIRING
*   `saveSlackWebhook(url)` Action.
*   `subscribePush(subscription)` Action (VAPID Keys).
