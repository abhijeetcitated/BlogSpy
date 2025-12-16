"use client"

import { cn } from "@/lib/utils"
import {
  type AIOverviewAnalysis,
  getAIOpportunityBgColor,
} from "@/types/ai-overview.types"
import { AIOverviewStatusBadge } from "./AIOverviewStatusBadge"
import { AIOpportunityBadge } from "./AIOpportunityBadge"
import { EntityGrid } from "./EntityGrid"
import { RecommendationCard } from "./RecommendationCard"
import { Sparkles, Target, Lightbulb } from "lucide-react"

// ============================================
// AI OVERVIEW ANALYSIS CARD
// ============================================

export interface AIOverviewCardProps {
  analysis: AIOverviewAnalysis
  compact?: boolean
  className?: string
}

export function AIOverviewCard({ 
  analysis, 
  compact = false,
  className 
}: AIOverviewCardProps) {
  const weakSources = analysis.citations.filter(c => c.isWeakSource)
  const missingEntities = analysis.entities.filter(e => !e.isFromYourContent)

  if (compact) {
    return (
      <div className={cn(
        "p-4 rounded-lg border",
        getAIOpportunityBgColor(analysis.opportunityLevel),
        className
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium">AI Overview</span>
          </div>
          <AIOpportunityBadge 
            score={analysis.opportunityScore} 
            level={analysis.opportunityLevel}
            size="sm"
          />
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Citation Status</span>
            <AIOverviewStatusBadge
              hasAIOverview={analysis.hasAIOverview}
              isCited={analysis.yourContent.isCited}
              citationPosition={analysis.yourContent.citationPosition}
              size="sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Weak Sources</span>
            <span className={weakSources.length > 0 ? "text-amber-400" : "text-slate-400"}>
              {weakSources.length} found
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Missing Entities</span>
            <span className={missingEntities.length > 0 ? "text-amber-400" : "text-emerald-400"}>
              {missingEntities.length}
            </span>
          </div>
        </div>

        {analysis.recommendations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-purple-300">
              💡 {analysis.recommendations[0].title}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden",
      "bg-gradient-to-br from-slate-900/80 to-purple-900/20 border-purple-500/30",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Overview Analysis</h3>
              <p className="text-xs text-muted-foreground">"{analysis.keyword}"</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AIOverviewStatusBadge
              hasAIOverview={analysis.hasAIOverview}
              isCited={analysis.yourContent.isCited}
              citationPosition={analysis.yourContent.citationPosition}
            />
            <AIOpportunityBadge 
              score={analysis.opportunityScore} 
              level={analysis.opportunityLevel}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-2xl font-bold text-foreground">{analysis.citationCount}</p>
            <p className="text-xs text-muted-foreground">Citations</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-2xl font-bold text-amber-400">{weakSources.length}</p>
            <p className="text-xs text-muted-foreground">Weak Sources</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-2xl font-bold text-foreground">{analysis.entities.length}</p>
            <p className="text-xs text-muted-foreground">Entities</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-2xl font-bold text-purple-400">{analysis.yourContent.contentMatchScore}%</p>
            <p className="text-xs text-muted-foreground">Match Score</p>
          </div>
        </div>

        {/* AI Answer Snippet */}
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
          <p className="text-xs text-muted-foreground mb-1">AI Overview Answer:</p>
          <p className="text-sm text-foreground italic">"{analysis.answerSnippet}"</p>
          <p className="text-xs text-muted-foreground mt-1">
            {analysis.answerWordCount} words · {analysis.overviewType} format
          </p>
        </div>

        {/* Entities */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-400" />
            Key Entities
          </h4>
          <EntityGrid entities={analysis.entities} />
        </div>

        {/* Top Recommendation */}
        {analysis.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Top Recommendation
            </h4>
            <RecommendationCard recommendation={analysis.recommendations[0]} />
          </div>
        )}
      </div>
    </div>
  )
}
