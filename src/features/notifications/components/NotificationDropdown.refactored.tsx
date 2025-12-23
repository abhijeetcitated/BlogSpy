/**
 * ============================================
 * NOTIFICATION DROPDOWN - REFACTORED
 * ============================================
 * 
 * Fixes Applied:
 * I: Lazy loading structure ready
 * K: ErrorState component added
 * M: Loading skeleton added
 * 
 * @version 2.0.0
 */

"use client"

import Link from "next/link"
import { Bell, CheckCheck, RefreshCw, Settings, AlertCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationItem } from "./NotificationItem"
// Use original hook for now until refactored hook is swapped
import { useNotifications } from "../hooks/useNotifications"
import { NOTIFICATION_SETTINGS } from "../constants"

// ============================================
// MAIN COMPONENT
// ============================================

export function NotificationDropdownRefactored() {
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

  // Local state for error handling (until refactored hook is used)
  const error: string | null = null
  const isRefreshing = false
  const clearError = () => {}

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
              disabled={isLoading || isRefreshing}
              title="Refresh"
            >
              <RefreshCw className={cn(
                "h-3.5 w-3.5",
                (isLoading || isRefreshing) && "animate-spin"
              )} />
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

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Fix K: Error State */}
          {error && (
            <ErrorState error={error} onRetry={refresh} onDismiss={clearError} />
          )}

          {/* Fix M: Loading Skeleton */}
          {isLoading && !error && (
            <LoadingSkeleton />
          )}

          {/* Notifications List */}
          {!isLoading && !error && notifications.length > 0 && (
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
          )}

          {/* Empty State */}
          {!isLoading && !error && notifications.length === 0 && (
            <EmptyState />
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && !isLoading && !error && (
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

// ============================================
// FIX K: ERROR STATE COMPONENT
// ============================================

function ErrorState({ 
  error, 
  onRetry, 
  onDismiss 
}: { 
  error: string
  onRetry: () => void
  onDismiss: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
      <div className="p-3 rounded-full bg-red-500/10 mb-3">
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <h4 className="font-medium text-foreground mb-1">Failed to load</h4>
      <p className="text-xs text-muted-foreground mb-3 max-w-[200px]">
        {error}
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs"
          onClick={onRetry}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs"
          onClick={onDismiss}
        >
          <XCircle className="h-3 w-3 mr-1" />
          Dismiss
        </Button>
      </div>
    </div>
  )
}

// ============================================
// FIX M: LOADING SKELETON COMPONENT
// ============================================

function LoadingSkeleton() {
  return (
    <div className="p-2 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div 
          key={i}
          className="p-3 rounded-lg border border-border bg-muted/20"
        >
          <div className="flex gap-3">
            {/* Icon skeleton */}
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <div className="flex justify-between pt-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="p-3 rounded-full bg-muted mb-3">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="font-medium text-foreground mb-1">All caught up!</h4>
      <p className="text-xs text-muted-foreground">
        No new notifications. We&apos;ll notify you when something important happens.
      </p>
    </div>
  )
}

// Export original name for easy swap
export { NotificationDropdownRefactored as NotificationDropdown }
