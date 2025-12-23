"use client"

import { ArrowUp, MessageCircle, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface EngagementDisplayProps {
  upvotes: number
  comments: number
}

export function EngagementDisplay({ upvotes, comments }: EngagementDisplayProps) {
  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  const totalEngagement = upvotes + comments
  const isHot = totalEngagement > 1000

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md border",
              isHot 
                ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30" 
                : "bg-muted border-border"
            )}>
              <ArrowUp className={cn("w-3.5 h-3.5", isHot ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
              <span className={cn("text-xs font-bold tabular-nums", isHot ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
                {formatNumber(upvotes)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Upvotes</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30">
              <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {formatNumber(comments)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Comments</TooltipContent>
        </Tooltip>
      </div>
      {isHot && (
        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
          <Flame className="w-3 h-3" />
          <span>Hot topic</span>
        </div>
      )}
    </div>
  )
}
