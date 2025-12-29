// Settings Types

export type SettingsTab = "general" | "billing" | "api" | "usage" | "notifications" | "integrations" | "alerts"

export interface NotificationSettings {
  // Reports
  weeklyReport: boolean
  monthlyReport: boolean
  // Rank Alerts
  rankAlerts: boolean
  top3Alerts: boolean
  // Decay Alerts
  decayAlerts: boolean
  trafficDropAlert: boolean
  // Competitor Alerts
  competitorAlerts: boolean
  newCompetitorAlert: boolean
  // Other
  productUpdates: boolean
  marketingEmails: boolean
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
