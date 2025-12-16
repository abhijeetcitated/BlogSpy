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
import { Badge } from "@/components/ui/badge"
import { Flame } from "lucide-react"
import { CommunityDecayRing } from "./CommunityDecayRing"
import { CommunityDecayTooltip } from "./CommunityDecayTooltip"

// ============================================
// COMMUNITY DECAY BADGE
// ============================================

export interface CommunityDecayBadgeProps {
  analysis: CommunityDecayAnalysis | null
  variant?: "default" | "compact" | "mini"
  className?: string
}

// Score-based styling
const getScoreStyle = (score: number) => {
  if (score >= 70) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  if (score >= 50) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  if (score >= 30) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
  return "bg-slate-500/20 text-slate-400 border-slate-500/30"
}

export function CommunityDecayBadge({
  analysis,
  variant = "default",
  className,
}: CommunityDecayBadgeProps) {
  if (!analysis?.hasCommunityContent) {
    return (
      <Badge
        variant="outline"
        className={cn("text-slate-500 border-slate-700", className)}
      >
        <span className="mr-1">—</span>
        No UGC
      </Badge>
    )
  }

  const { decayScore, bestOpportunity, communityCountInTop10 } = analysis

  if (variant === "mini") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={cn("cursor-help gap-1", getScoreStyle(decayScore), className)}>
              <Flame className="h-3 w-3" />
              {decayScore}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 border-slate-700 max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">Community Decay Score: {decayScore}</p>
              <p className="text-xs text-slate-400">
                {communityCountInTop10} community source(s) in top 10
              </p>
              {bestOpportunity && (
                <p className="text-xs text-emerald-400">
                  Best target: {PLATFORM_INFO[bestOpportunity.platform].name} at #{bestOpportunity.rankPosition}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2 cursor-help", className)}>
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium",
                getScoreStyle(decayScore)
              )}>
                <Flame className="h-3.5 w-3.5" />
                <span>{decayScore}</span>
              </div>
              {bestOpportunity && (
                <span className="text-xs text-slate-500">
                  {PLATFORM_INFO[bestOpportunity.platform].name} #{bestOpportunity.rankPosition}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-slate-800 border-slate-700 max-w-sm p-3">
            <CommunityDecayTooltip analysis={analysis} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Default variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-3 cursor-help", className)}>
            <CommunityDecayRing score={decayScore} size="sm" showLabel={false} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">
                {decayScore} Decay
              </span>
              <span className="text-xs text-slate-400">
                {communityCountInTop10} source{communityCountInTop10 !== 1 ? "s" : ""} aging
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 border-slate-700 max-w-sm p-3">
          <CommunityDecayTooltip analysis={analysis} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
