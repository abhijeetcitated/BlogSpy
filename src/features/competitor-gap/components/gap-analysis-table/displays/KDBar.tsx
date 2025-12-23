"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface KDBarProps {
  kd: number
}

export function KDBar({ kd }: KDBarProps) {
  const getConfig = () => {
    if (kd < 30) return { color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Easy" }
    if (kd < 50) return { color: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", label: "Medium" }
    if (kd < 70) return { color: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", label: "Hard" }
    return { color: "bg-red-500", text: "text-red-600 dark:text-red-400", label: "Very Hard" }
  }
  const config = getConfig()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-default">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden border border-border">
            <div 
              className={cn("h-full rounded-full transition-all", config.color)}
              style={{ width: `${kd}%` }}
            />
          </div>
          <span className={cn("text-xs font-bold w-6 tabular-nums", config.text)}>{kd}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {config.label} difficulty
      </TooltipContent>
    </Tooltip>
  )
}
