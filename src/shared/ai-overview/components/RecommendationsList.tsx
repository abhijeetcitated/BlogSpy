"use client"

import { cn } from "@/lib/utils"
import { type AIOptimizationRecommendation } from "@/types/ai-overview.types"
import { RecommendationCard } from "./RecommendationCard"
import { Button } from "@/components/ui/button"
import { Zap, ChevronRight } from "lucide-react"

// ============================================
// RECOMMENDATIONS LIST
// ============================================

export interface RecommendationsListProps {
  recommendations: AIOptimizationRecommendation[]
  maxItems?: number
  className?: string
}

export function RecommendationsList({ 
  recommendations, 
  maxItems = 5,
  className 
}: RecommendationsListProps) {
  const displayedRecs = recommendations.slice(0, maxItems)
  const quickWins = recommendations.filter(r => r.effort === "quick" && r.impact === "high")

  return (
    <div className={cn("space-y-4", className)}>
      {quickWins.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-emerald-300 font-medium">
            {quickWins.length} Quick Win{quickWins.length > 1 ? 's' : ''} Available
          </span>
        </div>
      )}
      
      <div className="space-y-3">
        {displayedRecs.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
      
      {recommendations.length > maxItems && (
        <Button variant="outline" className="w-full" size="sm">
          View {recommendations.length - maxItems} more recommendations
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  )
}
