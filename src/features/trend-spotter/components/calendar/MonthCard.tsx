"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

import type { SeasonalTrend } from "../../types"
import { seasonIcons, seasonColors } from "../../constants"
import { calculateDaysUntil } from "../../utils/date-utils"
import { EventItem } from "./EventItem"

interface MonthCardProps {
  month: SeasonalTrend
  isCurrentMonth: boolean
  isExpanded: boolean
  onToggleExpand: () => void
}

export function MonthCard({
  month,
  isCurrentMonth,
  isExpanded,
  onToggleExpand,
}: MonthCardProps) {
  const SeasonIcon = seasonIcons[month.season]
  const displayEvents = isExpanded ? month.events : month.events.slice(0, 3)
  const hasMore = month.events.length > 3

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all",
        isCurrentMonth 
          ? "border-purple-500/50 bg-purple-500/5" 
          : "border-border/50 bg-muted/20 hover:bg-muted/30"
      )}
    >
      {/* Month Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${seasonColors[month.season]}`}>
            <SeasonIcon className="h-3 w-3" />
          </div>
          <span className={cn(
            "text-sm font-semibold",
            isCurrentMonth ? "text-purple-400" : "text-foreground"
          )}>
            {month.month}
          </span>
          <span className="text-[10px] text-muted-foreground">{month.year}</span>
          {isCurrentMonth && (
            <Badge className="bg-purple-500 text-white text-[8px] px-1 py-0">NOW</Badge>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{month.events.length} events</span>
      </div>

      {/* Events */}
      <div className="space-y-1.5">
        {displayEvents.map((event, eventIdx) => {
          const daysUntil = calculateDaysUntil(
            month.monthIndex, 
            parseInt(event.exactDate.split("-")[1]), 
            month.year
          )

          return (
            <EventItem
              key={eventIdx}
              event={event}
              monthIndex={month.monthIndex}
              year={month.year}
              daysUntil={daysUntil}
              variant="grid"
            />
          )
        })}
      </div>

      {/* Show More/Less */}
      {hasMore && (
        <button
          onClick={onToggleExpand}
          className="w-full mt-2 py-1 text-[10px] text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              +{month.events.length - 3} more events
            </>
          )}
        </button>
      )}
    </div>
  )
}
