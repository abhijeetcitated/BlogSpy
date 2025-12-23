"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface RanksDisplayProps {
  yourRank: number | null
  comp1Rank: number | null
  comp2Rank: number | null
}

export function RanksDisplay({ yourRank, comp1Rank, comp2Rank }: RanksDisplayProps) {
  const formatRank = (rank: number | null) => rank ?? "—"
  const getRankStyle = (rank: number | null, isYou: boolean) => {
    if (!rank) return "text-muted-foreground bg-muted"
    if (isYou) {
      if (rank <= 10) return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30"
      if (rank <= 30) return "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-500/15 border-yellow-500/30"
      return "text-muted-foreground bg-muted border-border"
    }
    return "text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/15 border-red-500/20"
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "w-8 h-7 flex items-center justify-center rounded-md text-xs font-bold border",
            getRankStyle(yourRank, true)
          )}>
            {formatRank(yourRank)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Your Rank</TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground text-xs">/</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "w-8 h-7 flex items-center justify-center rounded-md text-xs font-medium border",
            getRankStyle(comp1Rank, false)
          )}>
            {formatRank(comp1Rank)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Competitor 1</TooltipContent>
      </Tooltip>
      <span className="text-muted-foreground text-xs">/</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "w-8 h-7 flex items-center justify-center rounded-md text-xs font-medium border",
            "border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/15"
          )}>
            {formatRank(comp2Rank)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Competitor 2</TooltipContent>
      </Tooltip>
    </div>
  )
}
