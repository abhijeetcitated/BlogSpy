"use client"

import Link from "next/link"
import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

import type { SeasonalEvent } from "../../types"
import { sourceConfig, categoryConfig } from "../../constants"

interface EventItemProps {
  event: SeasonalEvent
  monthIndex: number
  year: number
  daysUntil: number
  variant?: "grid" | "list"
  monthName?: string // Only needed for list view
}

export function EventItem({
  event,
  daysUntil,
  variant = "grid",
  monthName,
}: EventItemProps) {
  const isPastEvent = daysUntil < 0
  const isUpcoming = daysUntil >= 0 && daysUntil <= 30
  const catConfig = categoryConfig[event.category]

  if (variant === "list") {
    return (
      <Link
        href={`/dashboard/research/overview/${encodeURIComponent(event.keyword)}`}
        className={cn(
          "flex items-center gap-3 p-2 rounded-md transition-all group",
          isPastEvent 
            ? "opacity-40" 
            : isUpcoming 
              ? "bg-amber-500/10 hover:bg-amber-500/15" 
              : "hover:bg-muted/40"
        )}
      >
        <span className="text-[10px] w-4">{sourceConfig[event.source].icon}</span>
        <span className="text-[10px] text-muted-foreground w-12">{monthName?.slice(0, 3)}</span>
        <span className="text-xs font-medium flex-1 truncate group-hover:text-purple-400">
          {event.name}
        </span>
        <Badge 
          variant="outline" 
          className={cn("text-[8px] px-1 py-0 h-4", catConfig.color, "border-current/30")}
        >
          {event.category}
        </Badge>
        <span className="text-[10px] text-purple-400 font-mono w-12">{event.predictedVolume}</span>
        <span className={cn("text-[10px] w-10", event.yoyGrowth >= 0 ? "text-emerald-400" : "text-red-400")}>
          {event.yoyGrowth >= 0 ? "+" : ""}{event.yoyGrowth}%
        </span>
        <span className={cn(
          "text-[10px] w-10 text-right",
          isPastEvent 
            ? "text-muted-foreground" 
            : isUpcoming 
              ? "text-amber-400 font-medium" 
              : "text-muted-foreground"
        )}>
          {isPastEvent ? "Past" : `${daysUntil}d`}
        </span>
      </Link>
    )
  }

  // Grid variant
  return (
    <Link
      href={`/dashboard/research/overview/${encodeURIComponent(event.keyword)}`}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md transition-all group",
        isPastEvent 
          ? "bg-muted/30 opacity-50" 
          : isUpcoming 
            ? "bg-amber-500/10 hover:bg-amber-500/20" 
            : "bg-muted/40 hover:bg-muted/60"
      )}
    >
      {/* Source Icon */}
      <span className="text-[10px] shrink-0">
        {sourceConfig[event.source].icon}
      </span>
      
      {/* Event Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-xs font-medium truncate",
            isPastEvent 
              ? "text-muted-foreground" 
              : "text-foreground group-hover:text-purple-400"
          )}>
            {event.name}
          </span>
          {event.trafficImpact === "high" && (
            <Target className="h-2.5 w-2.5 text-red-400 shrink-0" />
          )}
          {event.lastYearRank && event.lastYearRank <= 3 && (
            <span className="text-[8px] text-yellow-400">🏆</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
          <span className="text-purple-400 font-mono">{event.predictedVolume}</span>
          <span className={event.yoyGrowth >= 0 ? "text-emerald-400" : "text-red-400"}>
            {event.yoyGrowth >= 0 ? "↑" : "↓"}{Math.abs(event.yoyGrowth)}%
          </span>
          <Badge 
            variant="outline" 
            className={cn("text-[7px] px-1 py-0 h-3", catConfig.color, "border-current/30")}
          >
            {event.category}
          </Badge>
        </div>
      </div>

      {/* Days/Confidence */}
      <div className="text-right shrink-0">
        <div className={cn(
          "text-[10px] font-medium",
          isPastEvent 
            ? "text-muted-foreground" 
            : isUpcoming 
              ? "text-amber-400" 
              : "text-muted-foreground"
        )}>
          {isPastEvent ? "Past" : `${daysUntil}d`}
        </div>
        <div className="text-[9px] text-emerald-400">{event.confidence}%</div>
      </div>
    </Link>
  )
}
