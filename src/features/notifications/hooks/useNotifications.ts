// ============================================
// NOTIFICATIONS - Custom Hook
// ============================================

"use client"

import { useState, useCallback, useMemo } from "react"
import type { Notification, NotificationGroup } from "../types"
import { MOCK_NOTIFICATIONS, getUnreadCount } from "../__mocks__"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [isLoading, setIsLoading] = useState(false)

  // Unread count
  const unreadCount = useMemo(() => getUnreadCount(notifications), [notifications])

  // Mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Refresh notifications (mock - will be API call later)
  const refresh = useCallback(async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setNotifications(MOCK_NOTIFICATIONS)
    setIsLoading(false)
  }, [])

  // Group notifications by date
  const groupedNotifications = useMemo((): NotificationGroup[] => {
    const now = new Date()
    const today = now.toDateString()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()

    const groups: Record<string, Notification[]> = {}

    notifications.forEach(notification => {
      const dateStr = notification.timestamp.toDateString()
      let groupKey: string

      if (dateStr === today) {
        groupKey = "Today"
      } else if (dateStr === yesterday) {
        groupKey = "Yesterday"
      } else {
        groupKey = notification.timestamp.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(notification)
    })

    // Convert to array and sort
    return Object.entries(groups).map(([date, notifs]) => ({
      date,
      notifications: notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    }))
  }, [notifications])

  // Get time ago string
  const getTimeAgo = useCallback((timestamp: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }, [])

  return {
    notifications,
    unreadCount,
    groupedNotifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    refresh,
    getTimeAgo,
  }
}
