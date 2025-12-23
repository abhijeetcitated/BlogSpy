"use client"

import { LayoutGrid, AlertTriangle, Target, Trophy, Users, Zap, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GapFilter } from "../utils/gap-utils"

interface GapStatsBarProps {
  gapFilter: GapFilter
  onFilterChange: (filter: GapFilter) => void
  stats: {
    all: number
    missing: number
    weak: number
    strong: number
  }
}

interface ForumStatsBarProps {
  stats: {
    total: number
    highOpp: number
    totalEngagement: number
  }
  formatNumber: (num: number) => string
}

export function GapStatsBar({ gapFilter, onFilterChange, stats }: GapStatsBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:inline-flex sm:items-center sm:rounded-xl sm:border sm:border-border sm:bg-card sm:p-1.5 sm:shadow-sm">
      <button
        onClick={() => onFilterChange("all")}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
          gapFilter === "all"
            ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
            : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border sm:border-0"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>All</span>
        <span className={cn("text-xs sm:text-sm font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md", 
          gapFilter === "all" ? "bg-white/20 text-white" : "bg-muted text-foreground"
        )}>
          {stats.all}
        </span>
      </button>
      <button
        onClick={() => onFilterChange("missing")}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
          gapFilter === "missing"
            ? "bg-red-500 text-white shadow-md shadow-red-500/30"
            : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border sm:border-0"
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>Missing</span>
        <span className={cn("text-xs sm:text-sm font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md", 
          gapFilter === "missing" ? "bg-white/20 text-white" : "bg-muted text-foreground"
        )}>
          {stats.missing}
        </span>
      </button>
      <button
        onClick={() => onFilterChange("weak")}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
          gapFilter === "weak"
            ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/30"
            : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border sm:border-0"
        )}
      >
        <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>Weak</span>
        <span className={cn("text-xs sm:text-sm font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md", 
          gapFilter === "weak" ? "bg-white/20 text-white" : "bg-muted text-foreground"
        )}>
          {stats.weak}
        </span>
      </button>
      <button
        onClick={() => onFilterChange("strong")}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
          gapFilter === "strong"
            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
            : "text-muted-foreground hover:text-foreground hover:bg-muted border border-border sm:border-0"
        )}
      >
        <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>Strong</span>
        <span className={cn("text-xs sm:text-sm font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md", 
          gapFilter === "strong" ? "bg-white/20 text-white" : "bg-muted text-foreground"
        )}>
          {stats.strong}
        </span>
      </button>
    </div>
  )
}

export function ForumStatsBar({ stats, formatNumber }: ForumStatsBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:inline-flex sm:items-center sm:rounded-xl sm:border sm:border-border sm:bg-card sm:p-1.5 sm:shadow-sm">
      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-muted/50 border border-border sm:border-0">
        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Total</span>
        <span className="text-xs sm:text-sm font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md bg-muted text-foreground">
          {stats.total}
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border border-border sm:border-0">
        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-emerald-600 dark:text-emerald-400 hidden xs:inline">High Opportunity</span>
        <span className="text-emerald-600 dark:text-emerald-400 xs:hidden">High</span>
        <span className="text-xs sm:text-sm font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          {stats.highOpp}
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border border-border sm:border-0">
        <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
        <span className="text-orange-600 dark:text-orange-400">Engagement</span>
        <span className="text-xs sm:text-sm font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400">
          {formatNumber(stats.totalEngagement)}
        </span>
      </div>
    </div>
  )
}
