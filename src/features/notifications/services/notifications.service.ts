/**
 * ============================================
 * NOTIFICATIONS - SERVICE LAYER
 * ============================================
 * 
 * Business logic and API calls for notifications
 * Separates concerns from UI components
 * 
 * @version 1.0.0
 */

import type { Notification, NotificationType } from "../types"
import { MOCK_NOTIFICATIONS } from "../__mocks__"

// ============================================
// TYPES
// ============================================

export interface NotificationFilters {
  type?: NotificationType
  read?: boolean
  limit?: number
  offset?: number
}

export interface NotificationResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

export interface MarkAsReadResponse {
  success: boolean
  notification?: Notification
  error?: string
}

// ============================================
// SERVICE CLASS
// ============================================

class NotificationsService {
  private baseUrl = "/api/notifications"

  /**
   * Fetch notifications for a user
   * TODO: Replace with real API call
   */
  async getNotifications(
    userId: string,
    filters?: NotificationFilters,
    signal?: AbortSignal
  ): Promise<NotificationResponse> {
    // Simulate API delay
    await this.delay(800, signal)

    let notifications = [...MOCK_NOTIFICATIONS]

    // Apply filters
    if (filters?.type) {
      notifications = notifications.filter(n => n.type === filters.type)
    }

    if (filters?.read !== undefined) {
      notifications = notifications.filter(n => n.read === filters.read)
    }

    // Apply pagination
    const start = filters?.offset || 0
    const end = start + (filters?.limit || 50)
    const paginated = notifications.slice(start, end)

    const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length

    return {
      notifications: paginated,
      total: notifications.length,
      unreadCount,
    }
  }

  /**
   * Mark a notification as read
   * TODO: Replace with real API call
   */
  async markAsRead(
    userId: string,
    notificationId: string,
    signal?: AbortSignal
  ): Promise<MarkAsReadResponse> {
    await this.delay(200, signal)

    // In real implementation, this would update the database
    return {
      success: true,
    }
  }

  /**
   * Mark all notifications as read
   * TODO: Replace with real API call
   */
  async markAllAsRead(
    userId: string,
    signal?: AbortSignal
  ): Promise<{ success: boolean; count: number }> {
    await this.delay(300, signal)

    const count = MOCK_NOTIFICATIONS.filter(n => !n.read).length

    return {
      success: true,
      count,
    }
  }

  /**
   * Dismiss/delete a notification
   * TODO: Replace with real API call
   */
  async dismissNotification(
    userId: string,
    notificationId: string,
    signal?: AbortSignal
  ): Promise<{ success: boolean }> {
    await this.delay(200, signal)

    return {
      success: true,
    }
  }

  /**
   * Clear all notifications
   * TODO: Replace with real API call
   */
  async clearAllNotifications(
    userId: string,
    signal?: AbortSignal
  ): Promise<{ success: boolean }> {
    await this.delay(300, signal)

    return {
      success: true,
    }
  }

  /**
   * Get unread count only (lightweight call)
   * TODO: Replace with real API call
   */
  async getUnreadCount(
    userId: string,
    signal?: AbortSignal
  ): Promise<number> {
    await this.delay(100, signal)

    return MOCK_NOTIFICATIONS.filter(n => !n.read).length
  }

  /**
   * Subscribe to real-time notifications (WebSocket/SSE)
   * TODO: Implement with Supabase Realtime or similar
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ): () => void {
    // Return unsubscribe function
    // In real implementation, this would set up WebSocket/SSE
    console.log(`[NotificationsService] Subscribed to notifications for user: ${userId}`)
    
    return () => {
      console.log(`[NotificationsService] Unsubscribed from notifications`)
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms)
      
      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timeout)
          reject(new DOMException("Aborted", "AbortError"))
        })
      }
    })
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService()

// Export class for testing
export { NotificationsService }
