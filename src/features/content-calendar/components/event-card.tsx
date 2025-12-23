"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import type { CalendarEvent } from "../types"
import { urgencyConfig, difficultyConfig, nicheConfig, getMatchScoreStyle } from "../constants"
import {
  CalendarPlanIcon,
  TrendUpIcon,
  SparklesIcon,
  UsersIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  WriteIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from "./icons"

interface EventCardProps {
  event: CalendarEvent
  isExpanded: boolean
  isInPlan: boolean
  onToggleExpand: () => void
  onAddToPlan: () => void
  onRemoveFromPlan: () => void
}

export function EventCard({
  event,
  isExpanded,
  isInPlan,
  onToggleExpand,
  onAddToPlan,
  onRemoveFromPlan,
}: EventCardProps) {
  const urgency = urgencyConfig[event.urgency]
  const difficulty = difficultyConfig[event.difficulty]
  const niche = nicheConfig.find(n => n.value === event.niche)
  const matchStyle = getMatchScoreStyle(event.matchScore)

  // Format date display
  const formatDate = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const [month, day] = event.date.split("-")
    return `${months[parseInt(month) - 1]} ${parseInt(day)}`
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border transition-all duration-300 overflow-hidden",
        "bg-card",
        urgency.borderColor,
        isExpanded && "ring-2 ring-amber-400/30"
      )}
    >
      {/* Urgency Indicator Bar */}
      <div className={cn(
        "h-1.5",
        event.urgency === "urgent" && "bg-linear-to-r from-red-500 to-red-400",
        event.urgency === "upcoming" && "bg-linear-to-r from-amber-500 to-amber-400",
        event.urgency === "planned" && "bg-linear-to-r from-blue-500 to-blue-400",
        event.urgency === "future" && "bg-linear-to-r from-slate-400 to-slate-300",
        event.urgency === "past" && "bg-linear-to-r from-slate-500 to-slate-400"
      )} />

      {/* Main Card Content */}
      <div className="p-3 sm:p-4 md:p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            {/* Urgency Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
              <div className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide",
                urgency.bgColor,
                urgency.color
              )}>
                {urgency.icon}
                {urgency.badge}
              </div>
              {event.daysUntil >= 0 && (
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {event.daysUntil}d left
                </span>
              )}
            </div>
            
            {/* Event Name */}
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-1 sm:mb-1.5 line-clamp-2">
              {event.name}
            </h3>
            
            {/* Date and Niche */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <CalendarPlanIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="font-medium">{formatDate()}, {event.year}</span>
              </span>
              <span className={cn("flex items-center gap-1 sm:gap-1.5", niche?.color)}>
                <span className="shrink-0">{niche?.icon}</span>
                <span className="truncate">{niche?.label}</span>
              </span>
            </div>
          </div>

          {/* Match Score */}
          <div className="flex flex-col items-center shrink-0">
            <div className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm sm:text-base md:text-lg font-bold ring-1",
              matchStyle.bgColor,
              matchStyle.textColor,
              matchStyle.ringColor
            )}>
              {event.matchScore}%
            </div>
            <span className="text-[9px] sm:text-[11px] text-muted-foreground mt-0.5 sm:mt-1 font-medium">Match</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 p-2.5 sm:p-4 bg-muted rounded-lg sm:rounded-xl mb-3 sm:mb-4 border border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-purple-600 dark:text-purple-400 mb-0.5 sm:mb-1">
              <TrendUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm md:text-base font-bold">{event.predictedVolume}</span>
            </div>
            <span className="text-[9px] sm:text-xs text-muted-foreground">Volume</span>
          </div>
          <div className="text-center">
            <div className={cn(
              "flex items-center justify-center gap-1 mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base font-bold",
              event.yoyGrowth >= 0 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-red-600 dark:text-red-400"
            )}>
              <span>{event.yoyGrowth >= 0 ? "+" : ""}{event.yoyGrowth}%</span>
            </div>
            <span className="text-[9px] sm:text-xs text-muted-foreground">YoY</span>
          </div>
          <div className="text-center">
            <div className={cn("flex items-center justify-center gap-1 mb-0.5 sm:mb-1", difficulty.color)}>
              <span className="text-xs sm:text-sm md:text-base font-bold">{difficulty.label}</span>
            </div>
            <span className="text-[9px] sm:text-xs text-muted-foreground">Difficulty</span>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={onToggleExpand}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted active:bg-muted"
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Show Keywords & Details</span>
              <span className="sm:hidden">Details</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5 pt-0 space-y-3 sm:space-y-4 border-t border-border">
          {/* Description */}
          <div className="pt-3 sm:pt-4">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Suggested Keywords */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-2.5 flex items-center gap-1.5 sm:gap-2">
              <SparklesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Suggested Keywords
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Badge 
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-500/10 border-purple-500/30 text-purple-400 font-medium"
              >
                {event.keyword}
              </Badge>
              {event.suggestedKeywords.map((kw, idx) => (
                <Badge 
                  key={idx}
                  variant="outline"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-muted border-border text-muted-foreground"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </div>

          {/* Competitor Info */}
          {event.competitorCount && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-muted px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-border">
              <UsersIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">{event.competitorCount} competitors ranking for this topic</span>
              <span className="sm:hidden">{event.competitorCount} competitors</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
            {isInPlan ? (
              <Button
                variant="outline"
                className="flex-1 h-10 sm:h-12 gap-1.5 sm:gap-2 text-xs sm:text-sm bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-semibold"
                onClick={onRemoveFromPlan}
              >
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Added to My Plan</span>
                <span className="sm:hidden">In Plan</span>
              </Button>
            ) : (
              <Button
                className="flex-1 h-10 sm:h-12 gap-1.5 sm:gap-2 text-xs sm:text-sm bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25"
                onClick={onAddToPlan}
              >
                <PlusCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                Add to My Plan
              </Button>
            )}
            <Button
              variant="outline"
              className="h-10 sm:h-12 gap-1.5 sm:gap-2 px-3 sm:px-5 text-xs sm:text-sm bg-card border-border text-foreground hover:bg-muted font-medium"
              asChild
            >
              <Link href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(event.keyword)}`}>
                <WriteIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Write Now
                <ExternalLinkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-0.5 sm:ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
