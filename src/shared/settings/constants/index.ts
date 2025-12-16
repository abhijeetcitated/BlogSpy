// Settings Constants

import { User, CreditCard, Key, Bell, Link2, AlertCircle } from "lucide-react"
import type { SettingsTab, NotificationSettings, PlanInfo } from "../types"

export const SETTINGS_TABS: { value: SettingsTab; label: string; icon: typeof User }[] = [
  { value: "general", label: "General", icon: User },
  { value: "billing", label: "Billing & Credits", icon: CreditCard },
  { value: "api", label: "API Keys", icon: Key },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "integrations", label: "Integrations", icon: Link2 },
  { value: "alerts", label: "Decay Alerts", icon: AlertCircle },
]

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  weeklyReport: true,
  rankAlerts: true,
  decayAlerts: false,
}

export const MOCK_PLAN: PlanInfo = {
  name: "Pro Plan",
  price: 29,
  billingCycle: "monthly",
  creditsTotal: 1000,
  creditsUsed: 750,
  renewsInDays: 12,
}

export const MOCK_API_KEY = "sk_live_abc123xyz789def456ghi"
export const MASKED_API_KEY = "sk_live_••••••••••••••••••••••••"

export const NOTIFICATION_OPTIONS = [
  {
    id: "weeklyReport",
    label: "Weekly SEO Report",
    description: "Receive a comprehensive SEO performance summary every Monday",
  },
  {
    id: "rankAlerts",
    label: "Rank Change Alerts",
    description: "Get notified when your keywords move into or out of Top 10",
  },
  {
    id: "decayAlerts",
    label: "Content Decay Alerts",
    description: "Be alerted when your content starts losing traffic or rankings",
  },
] as const
