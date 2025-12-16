"use client"

import { cn } from "@/lib/utils"
import {
  type CommunityDecayAnalysis,
  PLATFORM_INFO,
} from "@/types/community-decay.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Clock, Timer, Skull } from "lucide-react"
import { CommunityDecayTooltip } from "./CommunityDecayTooltip"

// ============================================
// MINI BADGE FOR TABLE CELLS
// ============================================

export interface CommunityDecayMiniProps {
  analysis: CommunityDecayAnalysis | null
  onClick?: () => void
  className?: string
}

export function CommunityDecayMini({
  analysis,
  onClick,
  className,
}: CommunityDecayMiniProps) {
  if (!analysis?.hasCommunityContent) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>—</span>
    )
  }

  const { decayScore, bestOpportunity } = analysis

  // Icon based on decay level
  const DecayIcon = decayScore >= 70 ? Skull : decayScore >= 40 ? Timer : Clock

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
              decayScore >= 70
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30"
                : decayScore >= 40
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30"
                : "bg-slate-500/20 text-slate-600 dark:text-slate-400 hover:bg-slate-500/30",
              className
            )}
          >
            <DecayIcon className="h-3 w-3" />
            {decayScore}
            {bestOpportunity && (
              <span className="opacity-70 ml-1">
                {PLATFORM_INFO[bestOpportunity.platform].icon}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-3 max-w-xs">
          <CommunityDecayTooltip analysis={analysis} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
