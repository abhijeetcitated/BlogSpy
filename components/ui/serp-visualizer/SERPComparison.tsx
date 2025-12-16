"use client"

import { cn } from "@/lib/utils"
import type { SERPLayout } from "@/types/pixel.types"
import { getPixelRankGrade, getPixelRankColor } from "@/types/pixel.types"
import { MiniSERPVisualizer } from "./MiniSERPVisualizer"

interface SERPComparisonProps {
  current: SERPLayout
  previous?: SERPLayout
  className?: string
}

export function SERPComparison({
  current,
  previous,
  className,
}: SERPComparisonProps) {
  const currentGrade = getPixelRankGrade(current.yourPixelRank)
  const previousGrade = previous ? getPixelRankGrade(previous.yourPixelRank) : null

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {/* Current */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Current</span>
          <span className={cn("text-sm font-bold", getPixelRankColor(currentGrade))}>
            {currentGrade}
          </span>
        </div>
        <MiniSERPVisualizer layout={current} height={160} />
        <div className="text-xs text-muted-foreground text-center">
          {current.yourPixelRank}px from top
        </div>
      </div>

      {/* Previous */}
      {previous && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Previous</span>
            <span className={cn("text-sm font-bold", getPixelRankColor(previousGrade!))}>
              {previousGrade}
            </span>
          </div>
          <MiniSERPVisualizer layout={previous} height={160} />
          <div className="text-xs text-muted-foreground text-center">
            {previous.yourPixelRank}px from top
          </div>
        </div>
      )}
    </div>
  )
}
