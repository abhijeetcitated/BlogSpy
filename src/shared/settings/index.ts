// Settings Module - Barrel Export
// Location: src/shared/settings (utility module, not a feature)

export { SettingsContent } from "./settings-content"

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

// Components
export {
  SettingsTabs,
  GeneralTab,
  BillingTab,
  ApiKeysTab,
  NotificationsTab,
} from "./components"
