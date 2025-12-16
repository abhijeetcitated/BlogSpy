// ============================================
// NOTIFICATIONS - Feature Barrel Export
// ============================================

// Components
export { NotificationDropdown, NotificationItem } from "./components"

// Hooks
export { useNotifications } from "./hooks/useNotifications"

// Types
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationGroup,
  NotificationState,
} from "./types"

// Constants
export { NOTIFICATION_TYPE_CONFIG, NOTIFICATION_SETTINGS } from "./constants"
