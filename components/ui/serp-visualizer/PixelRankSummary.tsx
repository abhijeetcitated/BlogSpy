"use client"

import { Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SERPElementType } from "@/types/pixel.types"
import { getPixelRankGrade, getPixelRankColor } from "@/types/pixel.types"

interface PixelRankSummaryProps {
  pixelPosition: number
  organicRank: number
  competingElements: SERPElementType[]
  className?: string
}

export function PixelRankSummary({
  pixelPosition,
  organicRank,
  competingElements,
  className,
}: PixelRankSummaryProps) {
  const grade = getPixelRankGrade(pixelPosition)

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Grade badge */}
      <div
        className={cn(
          "flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2",
          grade === "A+" || grade === "A" ? "border-emerald-500 bg-emerald-500/10" :
          grade === "B" ? "border-cyan-500 bg-cyan-500/10" :
          grade === "C" ? "border-amber-500 bg-amber-500/10" :
          grade === "D" ? "border-orange-500 bg-orange-500/10" :
          "border-red-500 bg-red-500/10"
        )}
      >
        <span className={cn("text-xl font-bold", getPixelRankColor(grade))}>
          {grade}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {pixelPosition}px
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">Pixel Rank Analysis</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Rank #{organicRank} appears at {pixelPosition}px
          {pixelPosition > 800 && (
            <span className="text-amber-400"> (requires scroll)</span>
          )}
        </div>
        {competingElements.length > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            {competingElements.length} SERP feature{competingElements.length > 1 ? "s" : ""} above
          </div>
        )}
      </div>
    </div>
  )
}
