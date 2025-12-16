// ============================================
// Alert Center - Sub-components
// ============================================

import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MessageSquare,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DecayAlert } from "../types"
import { ALERT_SEVERITY_COLORS } from "../constants"

// ============================================
// Channel Button
// ============================================

interface ChannelButtonProps {
  isActive: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  styles: { active: string; inactive: string }
}

export function ChannelButton({ isActive, onClick, icon: Icon, label, styles }: ChannelButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-colors border",
        isActive ? styles.active : styles.inactive
      )}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>{label}</span>
    </button>
  )
}

// ============================================
// Preference Button
// ============================================

interface PrefButtonProps {
  isActive: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  styles: { active: string; inactive: string }
}

export function PrefButton({ isActive, onClick, icon: Icon, label, styles }: PrefButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-colors border",
        isActive ? styles.active : styles.inactive
      )}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>{label}</span>
    </button>
  )
}

// ============================================
// Alert Item
// ============================================

interface AlertItemProps {
  alert: DecayAlert
  onDismiss: () => void
  onMarkActioned: () => void
  onViewArticle?: () => void
}

export function AlertItem({ alert, onDismiss, onMarkActioned, onViewArticle }: AlertItemProps) {
  return (
    <div
      className={cn(
        "p-3 sm:p-4 hover:bg-muted/30 transition-colors",
        !alert.actionTaken && "bg-muted/10"
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <span
              className={cn(
                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0",
                ALERT_SEVERITY_COLORS[alert.severity]
              )}
            />
            <span
              className={cn(
                "text-xs sm:text-sm font-medium truncate",
                alert.actionTaken ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {alert.title}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 line-clamp-2">{alert.message}</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {alert.timestamp}
            </span>
            {alert.channel === "email" && <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {alert.channel === "slack" && <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {alert.channel === "whatsapp" && (
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            )}
            {alert.channel === "push" && <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {!alert.actionTaken && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2"
              onClick={onMarkActioned}
            >
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              <span className="hidden xs:inline">Done</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-muted-foreground hover:text-red-400"
            onClick={onDismiss}
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Button>
        </div>
      </div>
      {onViewArticle && (
        <Button
          variant="outline"
          size="sm"
          className="h-6 sm:h-7 text-[10px] sm:text-xs mt-1.5 sm:mt-2"
          onClick={onViewArticle}
        >
          <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
          View Article
        </Button>
      )}
    </div>
  )
}

// ============================================
// Empty Alerts State
// ============================================

export function AlertsEmptyState() {
  return (
    <div className="p-4 sm:p-6 text-center">
      <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mx-auto mb-1.5 sm:mb-2" />
      <p className="text-xs sm:text-sm text-muted-foreground">
        All caught up! No new alerts.
      </p>
    </div>
  )
}
