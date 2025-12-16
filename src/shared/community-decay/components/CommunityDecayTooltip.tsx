"use client"

import {
  type CommunityDecayAnalysis,
  PLATFORM_INFO,
  formatAge,
} from "@/types/community-decay.types"
import { Flame, Target, Sparkles } from "lucide-react"

// ============================================
// TOOLTIP CONTENT (Internal component)
// ============================================

export interface CommunityDecayTooltipProps {
  analysis: CommunityDecayAnalysis
}

export function CommunityDecayTooltip({ analysis }: CommunityDecayTooltipProps) {
  const { decayScore, avgContentAge, bestOpportunity, recommendations } = analysis

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-400" />
        <span className="font-semibold">Community Decay Analysis</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-slate-400">Decay Score</div>
          <div className="text-lg font-bold text-orange-400">{decayScore}</div>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-slate-400">Avg Age</div>
          <div className="text-lg font-bold">{formatAge(avgContentAge)}</div>
        </div>
      </div>

      {bestOpportunity && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
            <Target className="h-3.5 w-3.5" />
            Best Target
          </div>
          <div className="mt-1 text-sm">
            {PLATFORM_INFO[bestOpportunity.platform].name} at #{bestOpportunity.rankPosition}
            <span className="text-slate-400 ml-1">
              ({formatAge(bestOpportunity.ageInDays)} old)
            </span>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="text-xs text-slate-300">
          <Sparkles className="h-3 w-3 inline mr-1 text-amber-400" />
          {recommendations[0].title}
        </div>
      )}
    </div>
  )
}
