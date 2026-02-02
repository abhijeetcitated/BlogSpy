"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================
// AI OVERVIEW MINI (for tables)
// ============================================

export interface AIOverviewMiniProps {
  hasAIOverview: boolean
  isCited: boolean
  citationPosition?: number | null
  opportunityScore: number
  className?: string
}

export function AIOverviewMini({
  hasAIOverview,
  isCited,
  citationPosition,
  opportunityScore,
  className,
}: AIOverviewMiniProps) {
  if (!hasAIOverview) {
    return (
      <span className="text-xs text-muted-foreground">No AIO</span>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex flex-col items-end", className)}>
            <span className={cn(
              "text-sm font-semibold",
              isCited ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            )}>
              {isCited ? `#${citationPosition}` : "—"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {opportunityScore}% opp
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{isCited 
            ? `Cited at position #${citationPosition}` 
            : "Not cited in AI Overview"}
          </p>
          <p className="text-muted-foreground mt-0.5">
            Opportunity Score: {opportunityScore}%
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
