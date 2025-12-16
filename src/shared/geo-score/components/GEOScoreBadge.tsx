"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getGEOOpportunityLevel } from "@/types/geo.types"
import { Sparkles } from "lucide-react"

/**
 * GEO Score Badge - Compact inline display
 */
export function GEOScoreBadge({ 
  score, 
  className 
}: { 
  score: number
  className?: string 
}) {
  const opportunity = getGEOOpportunityLevel(score)
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-help",
              score >= 70 && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40",
              score >= 45 && score < 70 && "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40",
              score >= 20 && score < 45 && "bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/40",
              score < 20 && "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40",
              className
            )}
          >
            <Sparkles className="w-3 h-3" />
            <span>{score}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs font-medium">GEO Score: {score}/100</p>
          <p className="text-xs text-muted-foreground mt-0.5">{opportunity} opportunity</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
