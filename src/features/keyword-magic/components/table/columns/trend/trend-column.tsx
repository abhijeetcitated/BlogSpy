"use client"

// ============================================
// TREND COLUMN - Trend sparkline display
// ============================================

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TrendColumnProps {
  data: number[]
  showSparkline?: boolean
  showChange?: boolean
  className?: string
}

export function TrendColumn({
  data,
  showSparkline = true,
  showChange = true,
  className,
}: TrendColumnProps) {
  if (!data || data.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const first = data[0]
  const last = data[data.length - 1]
  const change = first > 0 ? ((last - first) / first) * 100 : 0
  const trend = change > 5 ? "up" : change < -5 ? "down" : "stable"

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"

  // Simple sparkline SVG
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 60
  const height = 20
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-2", className)}>
          {showSparkline && (
            <svg width={width} height={height} className="overflow-visible">
              <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className={trendColor}
              />
            </svg>
          )}
          {showChange && (
            <div className={cn("flex items-center gap-0.5", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span className="text-xs tabular-nums">
                {change > 0 ? "+" : ""}{change.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>12-month trend: {change > 0 ? "+" : ""}{change.toFixed(1)}%</p>
        <p className="text-muted-foreground">
          {trend === "up" ? "Growing" : trend === "down" ? "Declining" : "Stable"}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
