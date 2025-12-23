// ============================================
// NOTIFICATION ITEM - Individual Notification
// ============================================

"use client"

import Link from "next/link"
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Bot,
  CreditCard,
  Info,
  X,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NOTIFICATION_TYPE_CONFIG } from "../constants"
import type { Notification, NotificationType } from "../types"

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Bot,
  CreditCard,
  Info,
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  timeAgo: string
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  timeAgo,
}: NotificationItemProps) {
  const config = NOTIFICATION_TYPE_CONFIG[notification.type]
  const IconComponent = ICON_MAP[config.icon] || Info

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDismiss(notification.id)
  }

  const content = (
    <div
      className={cn(
        "relative p-3 rounded-lg border transition-all duration-200 group",
        config.bgColor,
        config.borderColor,
        !notification.read && "ring-1 ring-inset ring-white/10",
        notification.actionUrl && "cursor-pointer hover:scale-[1.01]"
      )}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500" />
      )}

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-background/50 transition-all"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>

      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn("p-2 rounded-lg shrink-0", config.bgColor)}>
          <IconComponent className={cn("h-4 w-4", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm font-medium leading-tight",
              notification.read ? "text-muted-foreground" : "text-foreground"
            )}>
              {notification.title}
            </h4>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground/70">
              {timeAgo}
            </span>

            {notification.actionLabel && (
              <span className={cn(
                "text-[10px] font-medium flex items-center gap-0.5",
                config.color
              )}>
                {notification.actionLabel}
                <ChevronRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Wrap in Link if actionUrl exists
  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl}>
        {content}
      </Link>
    )
  }

  return content
}
