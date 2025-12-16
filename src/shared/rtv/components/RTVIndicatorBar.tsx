"use client"

import { cn } from "@/lib/utils"
import {
  type RTVOpportunityLevel,
  getRTVColor,
  formatVolume,
} from "@/types/rtv.types"

// ============================================
// RTV INDICATOR BAR
// ============================================
// Visual bar showing RTV vs raw volume

interface RTVIndicatorBarProps {
  rtv: number
  rawVolume: number
  opportunityLevel: RTVOpportunityLevel
  showLabels?: boolean
  className?: string
}

export function RTVIndicatorBar({
  rtv,
  rawVolume,
  opportunityLevel,
  showLabels = true,
  className,
}: RTVIndicatorBarProps) {
  const percentage = Math.round((rtv / rawVolume) * 100)

  return (
    <div className={cn("space-y-1", className)}>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            opportunityLevel === "excellent" || opportunityLevel === "good" 
              ? "bg-emerald-500" 
              : opportunityLevel === "moderate" 
              ? "bg-amber-500" 
              : "bg-red-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span className={getRTVColor(opportunityLevel)}>{percentage}% RTV</span>
          <span>{formatVolume(rawVolume)}</span>
        </div>
      )}
    </div>
  )
}
