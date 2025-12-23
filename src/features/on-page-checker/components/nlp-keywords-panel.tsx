"use client"

import { Brain, TrendingUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { NLPKeyword } from "../types"

interface NLPKeywordsPanelProps {
  keywords: NLPKeyword[]
}

export function NLPKeywordsPanel({ keywords }: NLPKeywordsPanelProps) {
  return (
    <div className="col-span-4 bg-card/30 overflow-y-auto">
      <div className="p-2 sm:p-3 md:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
          NLP Semantic Keywords
        </h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
          Keywords extracted using NLP analysis. Tap to see density and suggestions.
        </p>
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {keywords.map((keyword, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "px-2.5 sm:px-3 py-1.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all hover:scale-105 active:scale-95 touch-manipulation min-h-[36px] sm:min-h-0 flex items-center",
                      keyword.status === "optimal"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : keyword.status === "overused"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    )}
                  >
                    {keyword.keyword}
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="bg-popover border-border p-3 max-w-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{keyword.keyword}</span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          keyword.status === "optimal"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : keyword.status === "overused"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {keyword.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Density: {keyword.density}</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {keyword.volume.toLocaleString()}/mo
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{keyword.suggestion}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
