"use client"

import { cn } from "@/lib/utils"
import {
  type PixelRankScore,
  getPixelRankColor,
  getPixelRankBgColor,
  getSERPElementName,
} from "@/types/pixel.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Monitor, ArrowDown, Eye, MousePointer2 } from "lucide-react"

interface PixelRankBadgeProps {
  score: PixelRankScore
  showPixels?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-1 gap-1.5",
  lg: "text-sm px-2.5 py-1.5 gap-2",
}

export function PixelRankBadge({
  score,
  showPixels = true,
  size = "md",
  className,
}: PixelRankBadgeProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center rounded-md border font-medium cursor-default",
              sizeClasses[size],
              getPixelRankBgColor(score.grade),
              className
            )}
          >
            <Monitor className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
            <span className={getPixelRankColor(score.grade)}>{score.grade}</span>
            {showPixels && (
              <span className="text-muted-foreground">
                {score.pixelPosition}px
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Pixel Rank</span>
              <span className={cn("font-bold", getPixelRankColor(score.grade))}>
                {score.grade} ({score.pixelPosition}px)
              </span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>Visibility: {score.visibilityScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-3 w-3" />
                <span>Est. CTR: {(score.estimatedCTR * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="h-3 w-3" />
                <span>Organic Rank: #{score.organicRank}</span>
              </div>
            </div>
            {score.competingElements.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Above you:</p>
                <div className="flex flex-wrap gap-1">
                  {score.competingElements.slice(0, 4).map((el) => (
                    <span
                      key={el}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {getSERPElementName(el)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
