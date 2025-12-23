"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SOURCE_CONFIG } from "../constants/source-config"
import type { ForumSource } from "../../../types"

interface SourceBadgeProps {
  source: ForumSource
  subSource: string
}

export function SourceBadge({ source, subSource }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source]
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
          <span className="text-[10px] text-muted-foreground truncate max-w-20">
            {subSource}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {source === "reddit" && `r/${subSource}`}
        {source === "quora" && `Topic: ${subSource}`}
        {source === "stackoverflow" && `Tag: ${subSource}`}
        {source === "hackernews" && `Category: ${subSource}`}
        {source === "youtube" && `Channel: ${subSource}`}
      </TooltipContent>
    </Tooltip>
  )
}
