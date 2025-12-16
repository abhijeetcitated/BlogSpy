"use client"

import { cn } from "@/lib/utils"
import {
  type AIOverviewAnalysis,
  getAIOpportunityColor,
  getAIOpportunityBgColor,
} from "@/types/ai-overview.types"
import { Target } from "lucide-react"

// ============================================
// AI OPPORTUNITY SCORE BADGE
// ============================================

export interface AIOpportunityBadgeProps {
  score: number
  level: AIOverviewAnalysis["opportunityLevel"]
  showScore?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
}

const levelLabels = {
  excellent: "Excellent",
  high: "High",
  medium: "Medium",
  low: "Low",
  very_low: "Very Low",
}

export function AIOpportunityBadge({
  score,
  level,
  showScore = true,
  size = "md",
  className,
}: AIOpportunityBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium border",
      getAIOpportunityBgColor(level),
      getAIOpportunityColor(level),
      sizeClasses[size],
      className
    )}>
      <Target className="h-3 w-3" />
      {showScore ? `${score}%` : levelLabels[level]}
    </span>
  )
}
