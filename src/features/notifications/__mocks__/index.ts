// ============================================
// NOTIFICATIONS - Mock Data
// ============================================

import type { Notification } from "../types"

// Helper to create dates
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000)
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "rank_drop",
    priority: "high",
    title: "3 keywords dropped to page 2",
    message: "\"best seo tools\" dropped from #3 to #12. Immediate action recommended.",
    timestamp: hoursAgo(2),
    read: false,
    actionUrl: "/dashboard/tracking/decay",
    actionLabel: "Fix Now",
    metadata: {
      keyword: "best seo tools",
      oldPosition: 3,
      newPosition: 12,
    },
  },
  {
    id: "notif-2",
    type: "rank_up",
    priority: "medium",
    title: "Ranked #1 for \"ai writing tools\"",
    message: "Great news! Your article moved up 5 positions to the top spot.",
    timestamp: hoursAgo(5),
    read: false,
    actionUrl: "/dashboard/tracking/rank-tracker",
    actionLabel: "View Details",
    metadata: {
      keyword: "ai writing tools",
      oldPosition: 6,
      newPosition: 1,
    },
  },
  {
    id: "notif-3",
    type: "decay_alert",
    priority: "high",
    title: "Content decay detected",
    message: "\"Keyword Research Guide\" is losing traffic. Update recommended.",
    timestamp: hoursAgo(8),
    read: false,
    actionUrl: "/dashboard/tracking/decay",
    actionLabel: "View Article",
    metadata: {
      articleUrl: "/blog/keyword-research-guide",
    },
  },
  {
    id: "notif-4",
    type: "ai_mention",
    priority: "medium",
    title: "Mentioned in ChatGPT",
    message: "Your site was cited for \"best crm software\" query in ChatGPT.",
    timestamp: hoursAgo(12),
    read: false,
    actionUrl: "/dashboard/ai-visibility",
    actionLabel: "View AI Visibility",
    metadata: {
      keyword: "best crm software",
      platform: "chatgpt",
    },
  },
  {
    id: "notif-5",
    type: "opportunity",
    priority: "medium",
    title: "Video hijack opportunity",
    message: "5 keywords have no video results. Create videos to rank easily.",
    timestamp: daysAgo(1),
    read: true,
    actionUrl: "/dashboard/research/video-hijack",
    actionLabel: "View Opportunities",
  },
  {
    id: "notif-6",
    type: "credit_low",
    priority: "low",
    title: "Credits running low",
    message: "You have 50 credits remaining. Consider upgrading your plan.",
    timestamp: daysAgo(1),
    read: true,
    actionUrl: "/pricing",
    actionLabel: "Upgrade",
  },
  {
    id: "notif-7",
    type: "system",
    priority: "low",
    title: "New feature: Social Tracker",
    message: "Track your visibility on Pinterest, Twitter/X, and Instagram.",
    timestamp: daysAgo(2),
    read: true,
    actionUrl: "/dashboard/tracking/social-tracker",
    actionLabel: "Try Now",
  },
]

// Function to generate notifications (for future API integration)
export function generateMockNotifications(): Notification[] {
  return MOCK_NOTIFICATIONS
}

// Get unread count
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter(n => !n.read).length
}
