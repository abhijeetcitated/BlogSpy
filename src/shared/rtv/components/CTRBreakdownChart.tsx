"use client"

import { cn } from "@/lib/utils"
import { type RTVAnalysis } from "@/types/rtv.types"

// ============================================
// CTR BREAKDOWN CHART
// ============================================
// Visual breakdown of where CTR goes

interface CTRBreakdownChartProps {
  analysis: RTVAnalysis
  className?: string
}

export function CTRBreakdownChart({ analysis, className }: CTRBreakdownChartProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-xs font-medium text-muted-foreground mb-2">CTR Distribution</div>
      {analysis.ctrBreakdown.map((item) => (
        <div key={item.feature} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={item.feature === "organic" ? "text-emerald-400 font-medium" : "text-muted-foreground"}>
              {item.label}
            </span>
            <span className={item.feature === "organic" ? "text-emerald-400" : ""}>
              {Math.round(item.ctrShare * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                item.feature === "organic" ? "bg-emerald-500" :
                item.feature === "ai_overview" ? "bg-purple-500" :
                item.feature === "featured_snippet" ? "bg-blue-500" :
                item.feature === "video_carousel" ? "bg-red-500" :
                item.feature === "top_ads" ? "bg-amber-500" :
                item.feature === "shopping_ads" ? "bg-orange-500" :
                item.feature === "people_also_ask" ? "bg-cyan-500" :
                "bg-slate-500"
              )}
              style={{ width: `${item.ctrShare * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
