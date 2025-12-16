"use client"

import { cn } from "@/lib/utils"
import {
  type RTVAnalysis,
  getRTVColor,
  getRTVBgColor,
  formatVolume,
} from "@/types/rtv.types"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MousePointerClick,
} from "lucide-react"

// ============================================
// RTV CARD
// ============================================
// Larger card with detailed RTV breakdown

interface RTVCardProps {
  analysis: RTVAnalysis
  className?: string
}

export function RTVCard({ analysis, className }: RTVCardProps) {
  const percentage = Math.round(analysis.rtvPercentage * 100)
  
  const OpportunityIcon = {
    excellent: CheckCircle,
    good: CheckCircle,
    moderate: AlertTriangle,
    low: AlertTriangle,
    very_low: XCircle,
  }[analysis.opportunityLevel]

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        getRTVBgColor(analysis.opportunityLevel),
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Realizable Traffic</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={cn("text-3xl font-bold", getRTVColor(analysis.opportunityLevel))}>
              {formatVolume(analysis.rtv)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatVolume(analysis.rawVolume)}
            </span>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
          getRTVBgColor(analysis.opportunityLevel)
        )}>
          <OpportunityIcon className={cn("h-3.5 w-3.5", getRTVColor(analysis.opportunityLevel))} />
          <span className={getRTVColor(analysis.opportunityLevel)}>
            {percentage}% Realizable
          </span>
        </div>
      </div>

      {/* CTR Breakdown Bar */}
      <div className="mb-3">
        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
          {analysis.ctrBreakdown.map((item) => (
            <div
              key={item.feature}
              className={cn(
                "h-full transition-all",
                item.feature === "organic" ? "bg-emerald-500" : 
                item.feature === "ai_overview" ? "bg-purple-500" :
                item.feature === "featured_snippet" ? "bg-blue-500" :
                item.feature === "video_carousel" ? "bg-red-500" :
                item.feature === "top_ads" ? "bg-amber-500" :
                "bg-slate-500"
              )}
              style={{ width: `${item.ctrShare * 100}%` }}
              title={`${item.label}: ${Math.round(item.ctrShare * 100)}%`}
            />
          ))}
        </div>
      </div>

      {/* Feature breakdown */}
      <div className="space-y-1.5 mb-3">
        {analysis.ctrBreakdown.slice(0, 4).map((item) => (
          <div key={item.feature} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className={item.feature === "organic" ? "text-emerald-400" : "text-muted-foreground"}>
              {Math.round(item.ctrShare * 100)}% ({formatVolume(item.volumeShare)})
            </span>
          </div>
        ))}
      </div>

      {/* Estimated clicks */}
      <div className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MousePointerClick className="h-3 w-3" />
            Est. Clicks (Position #{analysis.position})
          </span>
          <span className="text-sm font-bold text-foreground">
            {analysis.estimatedClicks.toLocaleString()}/mo
          </span>
        </div>
      </div>
    </div>
  )
}
