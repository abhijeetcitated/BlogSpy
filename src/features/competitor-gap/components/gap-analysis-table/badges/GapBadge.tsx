"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { GAP_CONFIG } from "../constants/gap-config"
import type { GapKeyword } from "../../../types"

interface GapBadgeProps {
  gapType: GapKeyword["gapType"]
}

export function GapBadge({ gapType }: GapBadgeProps) {
  if (gapType === "all") return null
  const config = GAP_CONFIG[gapType]
  const Icon = config.icon
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <Icon className={cn("w-3.5 h-3.5", config.text)} />
          <span className={cn("text-xs font-semibold", config.text)}>
            {config.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs bg-popover border-border">
        {gapType === "missing" && "You don't rank for this keyword"}
        {gapType === "weak" && "You rank lower than competitors"}
        {gapType === "strong" && "You outrank competitors"}
        {gapType === "shared" && "Similar rankings"}
      </TooltipContent>
    </Tooltip>
  )
}
