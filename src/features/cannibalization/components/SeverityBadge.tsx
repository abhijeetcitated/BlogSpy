"use client"

import { cn } from "@/lib/utils"
import { AlertOctagon, Flame, AlertCircle, Activity } from "lucide-react"
import type { CannibalizationSeverity } from "../types"

interface SeverityBadgeProps {
  severity: CannibalizationSeverity
  showLabel?: boolean
}

export function SeverityBadge({ severity, showLabel = false }: SeverityBadgeProps) {
  const config = {
    critical: { 
      icon: AlertOctagon, 
      label: "Critical", 
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
      iconColor: "text-red-500 dark:text-red-400",
      borderColor: "border-red-500/30",
      pulseColor: "bg-red-500"
    },
    high: { 
      icon: Flame, 
      label: "High", 
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      iconColor: "text-amber-500 dark:text-amber-400",
      borderColor: "border-amber-500/30",
      pulseColor: "bg-amber-500"
    },
    medium: { 
      icon: AlertCircle, 
      label: "Medium", 
      bgColor: "bg-yellow-500/10 dark:bg-yellow-500/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-500/30",
      pulseColor: "bg-yellow-500"
    },
    low: { 
      icon: Activity, 
      label: "Low", 
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      borderColor: "border-emerald-500/30",
      pulseColor: "bg-emerald-500"
    },
  }
  
  const { icon: Icon, label, bgColor, iconColor, borderColor, pulseColor } = config[severity]
  
  // Large icon mode (for card headers)
  if (!showLabel) {
    return (
      <div className={cn(
        "relative p-1.5 sm:p-2 rounded-lg transition-colors shrink-0",
        bgColor
      )}>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
        {severity === "critical" && (
          <span className={cn(
            "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full animate-pulse",
            pulseColor
          )} />
        )}
      </div>
    )
  }
  
  // Badge mode (inline with label)
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full",
      "text-[10px] sm:text-xs font-medium border transition-colors",
      bgColor, iconColor, borderColor
    )}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
