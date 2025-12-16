"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import type { MyPlanItem } from "../types"
import { urgencyConfig, nicheConfig } from "../constants"
import { 
  CalendarPlanIcon, 
  XIcon, 
  ExternalLinkIcon, 
  RocketIcon,
  WriteIcon 
} from "./icons"

interface MyPlanSidebarProps {
  items: MyPlanItem[]
  onRemove: (eventId: string) => void
}

export function MyPlanSidebar({ items, onRemove }: MyPlanSidebarProps) {
  if (items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
            <CalendarPlanIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            My Content Plan
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Add events from the calendar to build your content plan.
          </p>
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 md:py-10 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center mb-3 sm:mb-4">
              <CalendarPlanIcon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-muted-foreground opacity-40" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              No events in your plan yet
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              Click "Add to My Plan" on any event
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
            <CalendarPlanIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">My Content Plan</span>
            <span className="sm:hidden">My Plan</span>
          </h3>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold text-xs sm:text-sm px-1.5 sm:px-2 py-0.5">
            {items.length}
          </Badge>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {items.map((item) => {
            const urgency = urgencyConfig[item.event.urgency]
            const niche = nicheConfig.find(n => n.value === item.event.niche)

            return (
              <div
                key={item.eventId}
                className={cn(
                  "p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all",
                  "bg-muted",
                  urgency.borderColor
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                      {urgency.icon}
                      <span className={cn("text-[9px] sm:text-[10px] font-bold uppercase tracking-wide", urgency.color)}>
                        {item.event.daysUntil >= 0 ? `${item.event.daysUntil}d` : "Past"}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      {item.event.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => onRemove(item.eventId)}
                    className="p-1 sm:p-1.5 rounded-md sm:rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:bg-muted shrink-0"
                  >
                    <XIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 flex-wrap">
                  <span className={cn("flex items-center shrink-0", niche?.color)}>{niche?.icon}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{niche?.label}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">•</span>
                  <span className="text-[10px] sm:text-xs text-purple-400 font-medium">{item.event.predictedVolume}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 sm:h-9 text-[10px] sm:text-xs gap-1 sm:gap-1.5 bg-card border-border text-foreground hover:bg-muted active:bg-muted font-medium"
                  asChild
                >
                  <Link href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(item.event.keyword)}`}>
                    <WriteIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Write Article</span>
                    <span className="sm:hidden">Write</span>
                    <ExternalLinkIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>

        {items.length > 0 && (
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border">
            <Button
              className="w-full h-9 sm:h-10 md:h-11 gap-1.5 sm:gap-2 text-xs sm:text-sm bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25"
              asChild
            >
              <Link href="/dashboard/creation/ai-writer">
                <RocketIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Start Writing First Article</span>
                <span className="sm:hidden">Start Writing</span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
