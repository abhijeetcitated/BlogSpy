"use client"

import { AlertCircle, Type, BookOpen, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { isCompetitorWordCountIdeal } from "../utils/snippet-utils"
import type { SnippetOpportunity } from "../types"

interface CompetitorSnippetCardProps {
  snippet: SnippetOpportunity
}

export function CompetitorSnippetCard({ snippet }: CompetitorSnippetCardProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-red-400" />
        </div>
        <h3 className="font-medium text-base sm:text-lg text-foreground">The Enemy</h3>
        <span className="text-xs sm:text-sm text-muted-foreground">Current Featured Snippet</span>
      </div>

      {/* Google Snippet Card - Authentic Google Style */}
      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg border border-slate-200">
        <p className="text-slate-900 text-[15px] sm:text-base leading-relaxed font-sans">
          {snippet.competitorSnippet}
        </p>
        <div className="mt-2 sm:mt-3 flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-red-100 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-red-600">
              C
            </div>
            <span className="text-red-600 text-[10px] sm:text-xs">competitor-site.com</span>
          </div>
        </div>
      </div>

      {/* Forensics Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 bg-muted/50 rounded-lg sm:rounded-xl border border-border text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Type className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-xs sm:text-sm">Words:</span>
          <span
            className={cn(
              "font-mono font-medium",
              isCompetitorWordCountIdeal(snippet.competitorWordCount)
                ? "text-emerald-400"
                : "text-amber-400",
            )}
          >
            {snippet.competitorWordCount} words
          </span>
        </div>
        <div className="h-3 sm:h-4 w-px bg-border hidden xs:block" />
        <div className="flex items-center gap-1.5 sm:gap-2\">\n          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-[10px] sm:text-xs\">Level:</span>
          <span className="font-medium text-foreground text-[10px] sm:text-xs">{snippet.competitorReadingLevel}</span>
        </div>
        <div className="h-3 sm:h-4 w-px bg-border hidden xs:block" />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-[10px] sm:text-xs\">Keywords:</span>
          <span className="font-medium text-foreground text-[10px] sm:text-xs">{snippet.competitorKeywords}</span>
        </div>
      </div>
    </div>
  )
}
