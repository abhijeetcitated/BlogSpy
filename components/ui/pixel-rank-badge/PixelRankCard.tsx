"use client"

import { cn } from "@/lib/utils"
import {
  type PixelRankScore,
  getPixelRankColor,
  getPixelRankBgColor,
} from "@/types/pixel.types"
import {
  Monitor,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

interface PixelRankCardProps {
  score: PixelRankScore
  previousScore?: PixelRankScore
  className?: string
}

export function PixelRankCard({
  score,
  previousScore,
  className,
}: PixelRankCardProps) {
  const change = previousScore
    ? previousScore.pixelPosition - score.pixelPosition
    : 0
  const changeDirection = change > 0 ? "up" : change < 0 ? "down" : "same"

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        getPixelRankBgColor(score.grade),
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pixel Rank</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", getPixelRankColor(score.grade))}>
              {score.grade}
            </span>
            <span className="text-lg text-muted-foreground">
              {score.pixelPosition}px
            </span>
          </div>
        </div>

        {previousScore && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
              changeDirection === "up" && "bg-emerald-500/20 text-emerald-400",
              changeDirection === "down" && "bg-red-500/20 text-red-400",
              changeDirection === "same" && "bg-muted text-muted-foreground"
            )}
          >
            {changeDirection === "up" && <TrendingUp className="h-3 w-3" />}
            {changeDirection === "down" && <TrendingDown className="h-3 w-3" />}
            {changeDirection === "same" && <Minus className="h-3 w-3" />}
            {change !== 0 && <span>{Math.abs(change)}px</span>}
            {change === 0 && <span>No change</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-semibold">{score.visibilityScore}%</div>
          <div className="text-xs text-muted-foreground">Visibility</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">
            {(score.estimatedCTR * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">Est. CTR</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">#{score.organicRank}</div>
          <div className="text-xs text-muted-foreground">Organic</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full",
            score.foldStatus === "above" && "bg-emerald-500/20 text-emerald-400",
            score.foldStatus === "partial" && "bg-amber-500/20 text-amber-400",
            score.foldStatus === "below" && "bg-red-500/20 text-red-400"
          )}
        >
          {score.foldStatus === "above" && "Above fold ✓"}
          {score.foldStatus === "partial" && "Partially visible"}
          {score.foldStatus === "below" && "Below fold ↓"}
        </span>
      </div>
    </div>
  )
}
