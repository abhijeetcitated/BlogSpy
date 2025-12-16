// ============================================
// NOTIFICATIONS - Type Definitions
// ============================================

export type NotificationType = 
  | "rank_drop"      // Keyword ranking dropped
  | "rank_up"        // Keyword ranking improved
  | "decay_alert"    // Content decay detected
  | "opportunity"    // New opportunity found
  | "ai_mention"     // Mentioned in AI (ChatGPT, etc.)
  | "credit_low"     // Credits running low
  | "system"         // System updates

export type NotificationPriority = "high" | "medium" | "low"

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: {
    keyword?: string
    oldPosition?: number
    newPosition?: number
    platform?: string
    articleUrl?: string
  }
}

export interface NotificationGroup {
  date: string // "Today", "Yesterday", "Dec 10"
  notifications: Notification[]
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  hasMore: boolean
}

// Notification config for each type
export interface NotificationTypeConfig {
  icon: string
  color: string
  bgColor: string
  borderColor: string
  label: string
}
