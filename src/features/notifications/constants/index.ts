// ============================================
// NOTIFICATIONS - Constants & Configuration
// ============================================

import type { NotificationType, NotificationTypeConfig } from "../types"

// Notification type configurations
export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  rank_drop: {
    icon: "TrendingDown",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    label: "Rank Drop",
  },
  rank_up: {
    icon: "TrendingUp",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    label: "Rank Up",
  },
  decay_alert: {
    icon: "AlertTriangle",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    label: "Decay Alert",
  },
  opportunity: {
    icon: "Lightbulb",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    label: "Opportunity",
  },
  ai_mention: {
    icon: "Bot",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    label: "AI Mention",
  },
  credit_low: {
    icon: "CreditCard",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    label: "Credits",
  },
  system: {
    icon: "Info",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    label: "System",
  },
}

// Priority configurations
export const PRIORITY_CONFIG = {
  high: {
    badge: "bg-red-500",
    label: "High Priority",
  },
  medium: {
    badge: "bg-amber-500",
    label: "Medium Priority",
  },
  low: {
    badge: "bg-slate-500",
    label: "Low Priority",
  },
}

// Dropdown settings
export const NOTIFICATION_SETTINGS = {
  maxDisplayCount: 5,        // Max notifications in dropdown
  autoMarkReadDelay: 3000,   // Auto mark as read after 3s
  refreshInterval: 60000,    // Refresh every 60s
  maxUnreadBadge: 99,        // Show "99+" after this
}
