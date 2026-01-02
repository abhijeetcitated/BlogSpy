"use client"

// ============================================
// VOLUME COLUMN - Search volume display
// ============================================

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface VolumeColumnProps {
  volume: number
  trend?: "up" | "down" | "stable"
  change?: number
  className?: string
}

export function VolumeColumn({
  volume,
  trend,
  change,
  className,
}: VolumeColumnProps) {
  const formatVolume = (vol: number): string => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
    return vol.toString()
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="font-medium tabular-nums">{formatVolume(volume)}</span>
      {trend && (
        <div className={cn("flex items-center gap-0.5", trendColor)}>
          <TrendIcon className="h-3 w-3" />
          {change !== undefined && (
            <span className="text-xs">{change > 0 ? "+" : ""}{change}%</span>
          )}
        </div>
      )}
    </div>
  )
}
