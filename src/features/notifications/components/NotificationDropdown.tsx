// ============================================
// NOTIFICATION DROPDOWN - Popup Menu
// ============================================

"use client"

import Link from "next/link"
import { Bell, CheckCheck, RefreshCw, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { NotificationItem } from "./NotificationItem"
import { useNotifications } from "../hooks/useNotifications"
import { NOTIFICATION_SETTINGS } from "../constants"

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh,
    getTimeAgo,
  } = useNotifications()

  // Display count (max 99+)
  const displayCount = unreadCount > NOTIFICATION_SETTINGS.maxUnreadBadge 
    ? "99+" 
    : unreadCount

  // Limited notifications for dropdown
  const displayNotifications = notifications.slice(0, NOTIFICATION_SETTINGS.maxDisplayCount)
  const hasMore = notifications.length > NOTIFICATION_SETTINGS.maxDisplayCount

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          
          {/* Badge with count */}
          {unreadCount > 0 && (
            <span className={cn(
              "absolute flex items-center justify-center rounded-full bg-red-500 text-white font-medium",
              unreadCount > 9 
                ? "-top-0.5 -right-0.5 h-5 min-w-5 px-1 text-[10px]" 
                : "top-1 right-1 h-4 w-4 text-[10px]"
            )}>
              {displayCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-[380px] p-0 bg-background border-border shadow-xl"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={refresh}
              disabled={isLoading}
              title="Refresh"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="p-2 space-y-2">
              {displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDismiss={dismissNotification}
                  timeAgo={getTimeAgo(notification.timestamp)}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 flex items-center justify-between">
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  {hasMore ? `View all ${notifications.length} notifications` : "View all notifications"}
                </Button>
              </Link>
              
              <Link href="/dashboard/settings/notifications">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Notification settings">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="p-3 rounded-full bg-muted mb-3">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="font-medium text-foreground mb-1">All caught up!</h4>
      <p className="text-xs text-muted-foreground">
        No new notifications. We'll notify you when something important happens.
      </p>
    </div>
  )
}
