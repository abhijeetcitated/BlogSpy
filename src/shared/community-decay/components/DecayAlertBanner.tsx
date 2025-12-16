"use client"

import { cn } from "@/lib/utils"
import { type CommunityDecayAnalysis } from "@/types/community-decay.types"
import { Badge } from "@/components/ui/badge"
import { Flame } from "lucide-react"

// ============================================
// DECAY ALERT BANNER
// ============================================

export interface DecayAlertBannerProps {
  analysis: CommunityDecayAnalysis
  onAction?: () => void
  className?: string
}

export function DecayAlertBanner({
  analysis,
  onAction,
  className,
}: DecayAlertBannerProps) {
  if (!analysis.hasCommunityContent || analysis.decayScore < 60) {
    return null
  }

  const { bestOpportunity, decayScore, recommendations } = analysis
  const topRec = recommendations[0]

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border",
        "bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10",
        "border-orange-500/20",
        className
      )}
    >
      <div className="flex-shrink-0 p-2 bg-orange-500/20 rounded-full">
        <Flame className="h-5 w-5 text-orange-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-orange-300">
            Community Decay Detected
          </span>
          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
            Score: {decayScore}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {topRec?.description || `${bestOpportunity?.platform} content at #${bestOpportunity?.rankPosition} is ripe for replacement`}
        </p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="flex-shrink-0 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 
                     text-orange-300 rounded-md text-xs font-medium transition-colors"
        >
          View Details
        </button>
      )}
    </div>
  )
}
