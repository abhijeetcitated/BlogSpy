"use client"

import { Plus, PenTool, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIOverviewStatusBadge } from "@/components/ui/ai-overview-card"
import type { KeywordMetrics } from "../types"
import type { AIOverviewAnalysis } from "@/types/ai-overview.types"

interface KeywordHeaderProps {
  metrics: KeywordMetrics
  aiOverviewAnalysis: AIOverviewAnalysis
}

export function KeywordHeader({ metrics, aiOverviewAnalysis }: KeywordHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{metrics.keyword}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs lg:text-sm font-medium bg-blue-500/20 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/30">
            Volume: {metrics.volume}
          </span>
          <span className="px-2.5 py-1 text-xs lg:text-sm font-medium bg-red-500/20 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full border border-red-500/30">
            KD: {metrics.kdLabel} ({metrics.kd}%)
          </span>
          <span className="px-2.5 py-1 text-xs lg:text-sm font-medium bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/30">
            CPC: {metrics.cpc}
          </span>
          <span className="px-2.5 py-1 text-xs lg:text-sm font-medium bg-cyan-500/20 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            GEO: {metrics.geoScore}
          </span>
          <AIOverviewStatusBadge
            hasAIOverview={aiOverviewAnalysis.hasAIOverview}
            isCited={aiOverviewAnalysis.yourContent.isCited}
            citationPosition={aiOverviewAnalysis.yourContent.citationPosition}
            size="md"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <Button variant="outline" size="sm" className="text-xs lg:text-sm">
          <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
          Add to List
        </Button>
        <Button size="sm" className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 text-xs lg:text-sm">
          <PenTool className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1.5 lg:mr-2" />
          Write Article
        </Button>
      </div>
    </div>
  )
}
