"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TREND_CONFIG } from "../constants/trend-config"
import type { TrendDirection } from "../../../types"

interface TrendIndicatorProps {
  trend: TrendDirection
}

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  const config = TREND_CONFIG[trend]
  const Icon = config.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "p-2 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {config.label}
      </TooltipContent>
    </Tooltip>
  )
}
