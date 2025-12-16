// Settings Types

export type SettingsTab = "general" | "billing" | "api" | "notifications" | "integrations" | "alerts"

export interface NotificationSettings {
  weeklyReport: boolean
  rankAlerts: boolean
  decayAlerts: boolean
}

export interface UserProfile {
  fullName: string
  email: string
  bio: string
  avatarUrl?: string
}

export interface PlanInfo {
  name: string
  price: number
  billingCycle: "monthly" | "yearly"
  creditsTotal: number
  creditsUsed: number
  renewsInDays: number
}

export interface ApiKeyInfo {
  key: string
  maskedKey: string
  status: "active" | "revoked"
  createdAt: Date
}
