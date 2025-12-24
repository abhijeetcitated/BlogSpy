"use client"

import { Brain, Sparkles } from "lucide-react"
import { 
  AIOverviewCard, 
  AIOverviewStatusBadge, 
  CitationList, 
  RecommendationsList 
} from "@/components/ui/ai-overview-card"
import type { AIOverviewAnalysis } from "@/types/ai-overview.types"

interface AIOverviewSectionProps {
  analysis: AIOverviewAnalysis
}

export function AIOverviewSection({ analysis }: AIOverviewSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
      {/* AI Overview Main Card */}
      <div className="lg:col-span-2">
        <AIOverviewCard analysis={analysis} />
      </div>
      
      {/* Citation Sources Card */}
      <div className="lg:col-span-1 bg-card dark:bg-gradient-to-br dark:from-card/80 dark:to-purple-900/10 border border-purple-500/20 rounded-xl p-4 lg:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <h3 className="text-sm font-medium text-muted-foreground">Citation Sources</h3>
          </div>
          <span className="text-xs text-purple-500 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
            {analysis.citationCount} sources
          </span>
        </div>
        
        <CitationList 
          citations={analysis.citations} 
          showWeakSourcesFirst={true}
        />
        
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-purple-600 dark:text-purple-300">
            {analysis.citations.filter(c => c.isWeakSource).length > 0
              ? "🎯 Weak sources detected - High opportunity to replace them!"
              : "Strong competition - Focus on unique angles and fresh data"}
          </p>
        </div>
      </div>
    </div>
  )
}

interface AIRecommendationsSectionProps {
  analysis: AIOverviewAnalysis
}

export function AIRecommendationsSection({ analysis }: AIRecommendationsSectionProps) {
  if (analysis.recommendations.length === 0) return null
  
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <h3 className="text-lg font-semibold text-foreground">AI Citation Optimization</h3>
        </div>
        <AIOverviewStatusBadge
          hasAIOverview={analysis.hasAIOverview}
          isCited={analysis.yourContent.isCited}
          citationPosition={analysis.yourContent.citationPosition}
        />
      </div>
      
      <RecommendationsList 
        recommendations={analysis.recommendations}
        maxItems={4}
      />
    </div>
  )
}
