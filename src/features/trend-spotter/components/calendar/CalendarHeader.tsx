"use client"

import { Calendar, LayoutGrid, List, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CalendarView } from "../../types"

interface CalendarHeaderProps {
  totalEvents: number
  upcomingEvents: number
  calendarView: CalendarView
  showUpcomingOnly: boolean
  onViewChange: (view: CalendarView) => void
  onToggleUpcoming: () => void
}

export function CalendarHeader({
  totalEvents,
  upcomingEvents,
  calendarView,
  showUpcomingOnly,
  onViewChange,
  onToggleUpcoming,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          Trend Calendar
        </CardTitle>
        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
          {totalEvents} events
        </Badge>
        {upcomingEvents > 0 && (
          <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">
            🔥 {upcomingEvents} upcoming
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center bg-muted/50 rounded-md p-0.5">
          <button
            onClick={() => onViewChange("grid")}
            className={cn(
              "p-1.5 rounded transition-colors",
              calendarView === "grid" 
                ? "bg-card text-purple-400 shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Grid View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={cn(
              "p-1.5 rounded transition-colors",
              calendarView === "list" 
                ? "bg-card text-purple-400 shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="List View"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Upcoming Only Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleUpcoming}
          className={cn(
            "h-7 text-[10px] gap-1",
            showUpcomingOnly && "bg-amber-500/20 border-amber-500/30 text-amber-400"
          )}
        >
          {showUpcomingOnly ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          Upcoming Only
        </Button>
      </div>
    </div>
  )
}
