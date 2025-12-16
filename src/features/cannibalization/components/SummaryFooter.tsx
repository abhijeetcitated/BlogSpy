"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Zap, TrendingUp } from "lucide-react"
import type { CannibalizationIssue } from "../types"

interface SummaryFooterProps {
  filteredCount: number
  totalCount: number
  issues: CannibalizationIssue[]
}

export function SummaryFooter({ filteredCount, totalCount, issues }: SummaryFooterProps) {
  const totalPotentialRecovery = issues.reduce((sum, i) => sum + i.potentialGain, 0)
  const criticalCount = issues.filter(i => i.severity === "critical").length
  
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4",
      "p-3 sm:p-4 rounded-xl",
      "bg-gradient-to-r from-card/80 to-card/50 dark:from-card/50 dark:to-card/30",
      "border border-border/50 dark:border-border/30"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredCount}</span> of{" "}
          <span className="font-medium text-foreground">{totalCount}</span> issues
        </span>
        <div className="hidden sm:block h-4 w-px bg-border/50" />
        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-muted-foreground">Total potential recovery:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{totalPotentialRecovery.toLocaleString()} visits/mo
          </span>
        </div>
      </div>
      
      {criticalCount > 0 && (
        <Button 
          size="sm" 
          className={cn(
            "bg-gradient-to-r from-emerald-600 to-emerald-500",
            "hover:from-emerald-500 hover:to-emerald-400",
            "text-white shadow-lg shadow-emerald-500/20",
            "transition-all duration-200 hover:scale-[1.02]",
            "w-full sm:w-auto"
          )}
        >
          <Zap className="h-3.5 w-3.5 mr-1.5" />
          Fix All Critical ({criticalCount})
        </Button>
      )}
    </div>
  )
}
