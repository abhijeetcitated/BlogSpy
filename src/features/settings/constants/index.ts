// Settings Constants

import { User, CreditCard, Key, Bell, Link2, AlertCircle, Activity } from "lucide-react"
import { FEATURE_FLAGS } from "@/config/feature-flags"
import type { SettingsTab, NotificationSettings, PlanInfo } from "../types"

export const SETTINGS_TABS: { 
  value: SettingsTab
  label: string
  icon: typeof User
  color: string
  activeColor: string
  activeBg: string
  enabled?: boolean
}[] = [
  { value: "general", label: "General", icon: User, color: "text-blue-400", activeColor: "text-blue-400", activeBg: "bg-blue-500/10", enabled: true },
  { value: "billing", label: "Billing & Credits", icon: CreditCard, color: "text-emerald-400", activeColor: "text-emerald-400", activeBg: "bg-emerald-500/10", enabled: true },
  { value: "api", label: "API Keys", icon: Key, color: "text-amber-400", activeColor: "text-amber-400", activeBg: "bg-amber-500/10", enabled: FEATURE_FLAGS.API_KEYS },
  { value: "usage", label: "Usage", icon: Activity, color: "text-purple-400", activeColor: "text-purple-400", activeBg: "bg-purple-500/10", enabled: true },
  { value: "notifications", label: "Notifications", icon: Bell, color: "text-cyan-400", activeColor: "text-cyan-400", activeBg: "bg-cyan-500/10", enabled: true },
  { value: "integrations", label: "Integrations", icon: Link2, color: "text-pink-400", activeColor: "text-pink-400", activeBg: "bg-pink-500/10", enabled: true },
  { value: "alerts", label: "Decay Alerts", icon: AlertCircle, color: "text-red-400", activeColor: "text-red-400", activeBg: "bg-red-500/10", enabled: true },
]

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  weeklyreport: true,
  rankalerts: true,
  decayalerts: true,
  competitoralerts: false,
  productupdates: false,
  unsubscribeall: false,
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

export const NOTIFICATION_OPTIONS = {
  reports: [
    {
      id: "weeklyreport",
      label: "Weekly Report",
      description: "Receive a concise performance digest every Monday",
    },
  ],
  rankalerts: [
    {
      id: "rankalerts",
      label: "Rank Drop Alerts",
      description: "Get notified when your tracked keywords drop significantly",
    },
  ],
  decayalerts: [
    {
      id: "decayalerts",
      label: "Content Decay Alerts",
      description: "Be alerted when your content starts losing traffic or rankings",
    },
  ],
  competitoralerts: [
    {
      id: "competitoralerts",
      label: "Competitor Movement Alerts",
      description: "Know when competitors outrank you for tracked keywords",
    },
  ],
  other: [
    {
      id: "productupdates",
      label: "Product Updates",
      description: "Get notified about new features and improvements",
    },
  ],
} as const
