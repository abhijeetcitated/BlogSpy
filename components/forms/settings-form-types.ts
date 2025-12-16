// ============================================
// SETTINGS FORM - Types & Constants
// ============================================

export interface UserSettings {
  profile: {
    name: string
    email: string
    avatar?: string
  }
  preferences: {
    language: string
    timezone: string
    theme: "light" | "dark" | "system"
  }
  notifications: {
    email: boolean
    rankChanges: boolean
    weeklyReport: boolean
    contentDecay: boolean
    newFeatures: boolean
  }
  security: {
    twoFactor: boolean
  }
}

export interface SettingsFormProps {
  initialData?: UserSettings
  onSave: (data: UserSettings) => void | Promise<void>
  isLoading?: boolean
  className?: string
}

export const defaultSettings: UserSettings = {
  profile: {
    name: "",
    email: "",
  },
  preferences: {
    language: "en",
    timezone: "UTC",
    theme: "dark",
  },
  notifications: {
    email: true,
    rankChanges: true,
    weeklyReport: true,
    contentDecay: true,
    newFeatures: false,
  },
  security: {
    twoFactor: false,
  },
}

export const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
]

export const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "hi", label: "Hindi" },
]

export const notificationOptions = [
  { key: "email" as const, label: "Email notifications", description: "Receive updates via email" },
  { key: "rankChanges" as const, label: "Rank changes", description: "Alert when rankings change significantly" },
  { key: "weeklyReport" as const, label: "Weekly report", description: "Get a summary every week" },
  { key: "contentDecay" as const, label: "Content decay alerts", description: "Notify when content is losing traffic" },
  { key: "newFeatures" as const, label: "New features", description: "Learn about new BlogSpy features" },
]
