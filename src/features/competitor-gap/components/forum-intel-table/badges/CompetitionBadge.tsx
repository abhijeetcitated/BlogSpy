"use client"

import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { COMPETITION_CONFIG } from "../constants/competition-config"
import type { CompetitionLevel } from "../../../types"

interface CompetitionBadgeProps {
  level: CompetitionLevel
  articles: number
}

export function CompetitionBadge({ level, articles }: CompetitionBadgeProps) {
  const config = COMPETITION_CONFIG[level]
  const Icon = config.icon
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <div className="flex items-center gap-1.5">
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            <span className={cn("text-xs font-semibold", config.color)}>{config.label}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{articles} article{articles !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {level === "low" && "Few competing articles - great opportunity!"}
        {level === "medium" && "Moderate competition"}
        {level === "high" && "Many competing articles"}
      </TooltipContent>
    </Tooltip>
  )
}
