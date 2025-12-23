"use client"

import { Swords, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { MainView } from "../hooks/useCompetitorGap"

interface HeaderProps {
  mainView: MainView
  onViewChange: (view: MainView) => void
}

export function Header({ mainView, onViewChange }: HeaderProps) {
  const isGapAnalysis = mainView === "gap-analysis"

  return (
    <div className="py-4 sm:py-5 border-b border-border -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20">
            <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Gap Analysis</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Discover competitor keywords & community opportunities
            </p>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-xl border border-border bg-card w-full sm:w-auto">
          <button
            onClick={() => onViewChange("gap-analysis")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border",
              isGapAnalysis 
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40" 
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            <Swords className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isGapAnalysis && "text-amber-600 dark:text-amber-400")} />
            <span className="hidden xs:inline">Competitor</span>
            <span>Gap</span>
          </button>
          <button
            onClick={() => onViewChange("forum-intel")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border",
              !isGapAnalysis 
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40" 
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            <MessageSquare className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", !isGapAnalysis && "text-emerald-600 dark:text-emerald-400")} />
            <span>Forum</span>
            <Badge 
              variant="outline" 
              className="ml-0.5 sm:ml-1 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 font-bold border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
            >
              PRO
            </Badge>
          </button>
        </div>
      </div>
    </div>
  )
}
