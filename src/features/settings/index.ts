// Settings Module - Public API
// Location: src/features/settings

export { SettingsContent } from "./components/settings-content"

// Types
export type {
  SettingsTab,
  NotificationSettings,
  UserProfile,
  PlanInfo,
  ApiKeyInfo,
} from "./types"

// Constants
export {
  SETTINGS_TABS,
  DEFAULT_NOTIFICATIONS,
  MOCK_PLAN,
  MOCK_API_KEY,
  MASKED_API_KEY,
  NOTIFICATION_OPTIONS,
} from "./constants"

// Utils
export {
  getCreditsPercentage,
  getCreditsRemaining,
  formatBillingCycle,
  copyToClipboard,
} from "./utils/settings-utils"

// Validation
export { ProfileSchema } from "./validation"
export type { ProfileInput } from "./validation"

// Components
export {
  SettingsTabs,
  GeneralTab,
  BillingTab,
  ApiKeysTab,
  NotificationsTab,
} from "./components"
