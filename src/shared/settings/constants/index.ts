// Settings Constants

import { User, CreditCard, Key, Bell, Link2, AlertCircle, Activity } from "lucide-react"
import type { SettingsTab, NotificationSettings, PlanInfo } from "../types"

export const SETTINGS_TABS: { 
  value: SettingsTab
  label: string
  icon: typeof User
  color: string
  activeColor: string
  activeBg: string
}[] = [
  { value: "general", label: "General", icon: User, color: "text-blue-400", activeColor: "text-blue-400", activeBg: "bg-blue-500/10" },
  { value: "billing", label: "Billing & Credits", icon: CreditCard, color: "text-emerald-400", activeColor: "text-emerald-400", activeBg: "bg-emerald-500/10" },
  { value: "api", label: "API Keys", icon: Key, color: "text-amber-400", activeColor: "text-amber-400", activeBg: "bg-amber-500/10" },
  { value: "usage", label: "Usage", icon: Activity, color: "text-purple-400", activeColor: "text-purple-400", activeBg: "bg-purple-500/10" },
  { value: "notifications", label: "Notifications", icon: Bell, color: "text-cyan-400", activeColor: "text-cyan-400", activeBg: "bg-cyan-500/10" },
  { value: "integrations", label: "Integrations", icon: Link2, color: "text-pink-400", activeColor: "text-pink-400", activeBg: "bg-pink-500/10" },
  { value: "alerts", label: "Decay Alerts", icon: AlertCircle, color: "text-red-400", activeColor: "text-red-400", activeBg: "bg-red-500/10" },
]

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  // Reports
  weeklyReport: true,
  monthlyReport: false,
  // Rank Alerts
  rankAlerts: true,
  top3Alerts: true,
  // Decay Alerts
  decayAlerts: false,
  trafficDropAlert: false,
  // Competitor Alerts
  competitorAlerts: false,
  newCompetitorAlert: false,
  // Other
  productUpdates: true,
  marketingEmails: false,
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
      id: "weeklyReport",
      label: "Weekly SEO Report",
      description: "Receive a comprehensive SEO performance summary every Monday",
    },
    {
      id: "monthlyReport",
      label: "Monthly Performance Digest",
      description: "Get a detailed monthly overview of all your SEO metrics",
    },
  ],
  rankAlerts: [
    {
      id: "rankAlerts",
      label: "Rank Change Alerts",
      description: "Get notified when your keywords move into or out of Top 10",
    },
    {
      id: "top3Alerts",
      label: "Top 3 Position Alerts",
      description: "Instant notification when keywords enter or exit Top 3 positions",
    },
  ],
  decayAlerts: [
    {
      id: "decayAlerts",
      label: "Content Decay Alerts",
      description: "Be alerted when your content starts losing traffic or rankings",
    },
    {
      id: "trafficDropAlert",
      label: "Traffic Drop Alerts",
      description: "Get notified when page traffic drops by more than 20%",
    },
  ],
  competitorAlerts: [
    {
      id: "competitorAlerts",
      label: "Competitor Movement Alerts",
      description: "Know when competitors outrank you for tracked keywords",
    },
    {
      id: "newCompetitorAlert",
      label: "New Competitor Detection",
      description: "Alert when a new competitor enters your keyword space",
    },
  ],
  other: [
    {
      id: "productUpdates",
      label: "Product Updates",
      description: "Get notified about new features and improvements",
    },
    {
      id: "marketingEmails",
      label: "Marketing & Tips",
      description: "Receive SEO tips, best practices, and promotional offers",
    },
  ],
} as const
