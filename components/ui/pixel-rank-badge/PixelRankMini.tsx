"use client"

import { cn } from "@/lib/utils"
import type { PixelRankGrade } from "@/types/pixel.types"
import { getPixelRankColor, getPixelRankBgColor } from "@/types/pixel.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PixelRankMiniProps {
  grade: PixelRankGrade
  pixelPosition: number
  className?: string
}

export function PixelRankMini({
  grade,
  pixelPosition,
  className,
}: PixelRankMiniProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold border cursor-default",
              getPixelRankBgColor(grade),
              getPixelRankColor(grade),
              className
            )}
          >
            {grade}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Pixel Rank: {pixelPosition}px from top</p>
          <p className="text-muted-foreground">
            {pixelPosition <= 800 ? "Above fold ✓" : "Below fold - requires scroll"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
