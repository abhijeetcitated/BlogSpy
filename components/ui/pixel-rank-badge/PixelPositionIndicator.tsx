"use client"

import { cn } from "@/lib/utils"
import type { PixelRankGrade } from "@/types/pixel.types"

interface PixelPositionIndicatorProps {
  pixelPosition: number
  maxPixels?: number
  grade: PixelRankGrade
  className?: string
}

export function PixelPositionIndicator({
  pixelPosition,
  maxPixels = 2000,
  grade,
  className,
}: PixelPositionIndicatorProps) {
  const percentage = Math.min((pixelPosition / maxPixels) * 100, 100)
  const foldLine = (800 / maxPixels) * 100 // Viewport at 800px

  return (
    <div className={cn("relative", className)}>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        {/* Fold line indicator */}
        <div
          className="absolute top-0 bottom-0 w-px bg-amber-500/50 z-10"
          style={{ left: `${foldLine}%` }}
        />
        
        {/* Position bar */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            grade === "A+" || grade === "A" ? "bg-emerald-500" :
            grade === "B" ? "bg-cyan-500" :
            grade === "C" ? "bg-amber-500" :
            grade === "D" ? "bg-orange-500" : "bg-red-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>0px</span>
        <span className="text-amber-500">fold</span>
        <span>{maxPixels}px</span>
      </div>
    </div>
  )
}
