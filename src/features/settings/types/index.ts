// Settings Types

export type SettingsTab = "general" | "billing" | "api" | "usage" | "notifications" | "integrations" | "alerts"

export interface NotificationSettings {
  weeklyreport: boolean
  rankalerts: boolean
  decayalerts: boolean
  competitoralerts: boolean
  productupdates: boolean
  unsubscribeall: boolean
}

export interface UserProfile {
  fullName: string
  email: string
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
