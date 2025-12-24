"use client"

import { cn } from "@/lib/utils"
import {
  type AIOptimizationRecommendation,
  getImpactColor,
  getEffortLabel,
  getPriorityLabel,
} from "@/types/ai-overview.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Brain,
  Target,
  Eye,
  RefreshCw,
  Shield,
  ArrowRight,
} from "lucide-react"

// ============================================
// RECOMMENDATION CARD
// ============================================

export interface RecommendationCardProps {
  recommendation: AIOptimizationRecommendation
  onAction?: () => void
  className?: string
}

const priorityColors = {
  1: "border-red-500/30 bg-red-500/5",
  2: "border-amber-500/30 bg-amber-500/5",
  3: "border-blue-500/30 bg-blue-500/5",
  4: "border-slate-500/30 bg-slate-500/5",
  5: "border-slate-600/30 bg-slate-600/5",
}

const categoryIcons = {
  content: FileText,
  structure: Brain,
  entity: Target,
  format: Eye,
  freshness: RefreshCw,
  authority: Shield,
}

export function RecommendationCard({ 
  recommendation, 
  onAction,
  className 
}: RecommendationCardProps) {
  const Icon = categoryIcons[recommendation.category]

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all hover:shadow-md",
      priorityColors[recommendation.priority as keyof typeof priorityColors] || priorityColors[3],
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            recommendation.priority <= 2 ? "bg-amber-500/20" : "bg-muted"
          )}>
            <Icon className={cn(
              "h-4 w-4",
              recommendation.priority <= 2 ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-foreground">
                {recommendation.title}
              </h4>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  getImpactColor(recommendation.impact)
                )}
              >
                {recommendation.impact} impact
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {recommendation.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs">
              <span className={cn(
                "px-1.5 py-0.5 rounded",
                recommendation.effort === "quick" ? "bg-emerald-500/20 text-emerald-400" :
                recommendation.effort === "medium" ? "bg-amber-500/20 text-amber-400" :
                "bg-red-500/20 text-red-400"
              )}>
                {getEffortLabel(recommendation.effort)}
              </span>
              <span className="text-muted-foreground">
                Priority: {getPriorityLabel(recommendation.priority)}
              </span>
            </div>

            {recommendation.example && (
              <div className="mt-2 p-2 rounded bg-muted/50 border border-border">
                <p className="text-[11px] text-muted-foreground font-mono">
                  {recommendation.example}
                </p>
              </div>
            )}
          </div>
        </div>

        {onAction && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAction}
            className="shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-foreground">
          <span className="text-muted-foreground">Action: </span>
          {recommendation.action}
        </p>
      </div>
    </div>
  )
}
