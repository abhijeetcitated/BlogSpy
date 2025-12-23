"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import type { PublishTimingData, UrgencyLevel } from "../types"
import { publishTimingData } from "../__mocks__"
import { ClockIcon, CalendarIcon, WarningIcon, LightningIcon, RocketIcon } from "./icons"

// Urgency config
const urgencyConfig: Record<UrgencyLevel, { color: string; bgColor: string; icon: typeof LightningIcon }> = {
  critical: { color: "text-red-400", bgColor: "bg-red-500/20", icon: WarningIcon },
  high: { color: "text-amber-400", bgColor: "bg-amber-500/20", icon: LightningIcon },
  medium: { color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: ClockIcon },
  low: { color: "text-green-400", bgColor: "bg-green-500/20", icon: ClockIcon },
}

interface PublishTimingProps {
  searchQuery: string
  data?: PublishTimingData
  className?: string
}

export function PublishTiming({ searchQuery, data = publishTimingData, className }: PublishTimingProps) {
  const urgency = urgencyConfig[data.urgency]
  const UrgencyIcon = urgency.icon

  return (
    <div className={cn("mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/30 border border-border/50 rounded-lg mx-2 sm:mx-6 mb-3 sm:mb-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
        <span className="text-xs sm:text-sm font-semibold text-foreground">Best Time to Publish</span>
      </div>

      {/* Timeline Bar */}
      <div className="relative mb-3 sm:mb-4">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground mb-1">
          <span>NOW</span>
          <span>PEAK</span>
        </div>
        <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-linear-to-r from-amber-500 to-orange-500 rounded-full transition-all"
            style={{ width: `${data.currentPosition}%` }}
          />
        </div>
        {/* Current Position Marker */}
        <div 
          className="absolute top-5 sm:top-6 transform -translate-x-1/2"
          style={{ left: `${data.currentPosition}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-l-[3px] sm:border-l-4 border-r-[3px] sm:border-r-4 border-b-[3px] sm:border-b-4 border-transparent border-b-amber-400" />
            <span className="text-[8px] sm:text-[10px] text-amber-400 font-medium mt-0.5 whitespace-nowrap">YOU ARE HERE</span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8 mb-2 sm:mb-3">
        {/* Publish Window */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Publish Window</p>
            <p className="text-[10px] sm:text-xs font-medium text-foreground truncate">
              {data.windowStart} - {data.windowEnd} ({data.daysRemaining}d)
            </p>
          </div>
        </div>

        {/* Optimal Date */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
            <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Optimal Day</p>
            <p className="text-[10px] sm:text-xs font-medium text-foreground truncate">
              {data.optimalDate} ({data.optimalDay})
            </p>
          </div>
        </div>

        {/* Urgency */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <UrgencyIcon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0", urgency.color)} />
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Urgency</p>
            <p className={cn("text-[10px] sm:text-xs font-medium uppercase truncate", urgency.color)}>
              {data.urgency}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end mt-2">
        <Button
          size="sm"
          className="h-7 sm:h-8 px-3 sm:px-4 gap-1 sm:gap-1.5 text-xs sm:text-sm bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all active:scale-95"
          asChild
        >
          <Link href={`/ai-writer?source=trend-spotter&keyword=${encodeURIComponent(searchQuery)}&velocity=rising`}>
            <RocketIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Start Writing</span>
            <span className="sm:hidden">Write</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
