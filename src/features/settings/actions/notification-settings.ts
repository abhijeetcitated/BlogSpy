"use server"

import "server-only"

// Backward-compatible wrapper:
// `update-notifications.ts` is the canonical implementation.
export {
  getNotificationSettings,
  updateNotificationSetting,
} from "@/features/settings/actions/update-notifications"

