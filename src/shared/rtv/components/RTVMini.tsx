"use client"

import { cn } from "@/lib/utils"
import {
  type RTVOpportunityLevel,
  getRTVColor,
  formatVolume,
} from "@/types/rtv.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================
// RTV MINI
// ============================================
// Super compact for table cells

interface RTVMiniProps {
  rtv: number
  rawVolume: number
  opportunityLevel: RTVOpportunityLevel
  className?: string
}

export function RTVMini({
  rtv,
  rawVolume,
  opportunityLevel,
  className,
}: RTVMiniProps) {
  const percentage = Math.round((rtv / rawVolume) * 100)

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex flex-col items-end", className)}>
            <span className={cn("text-sm font-semibold tabular-nums", getRTVColor(opportunityLevel))}>
              {formatVolume(rtv)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {percentage}% of {formatVolume(rawVolume)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">RTV: {rtv.toLocaleString()}</p>
          <p className="text-muted-foreground mt-0.5">From {rawVolume.toLocaleString()} raw volume</p>
          <p className="text-muted-foreground">{100 - percentage}% captured by SERP features</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
