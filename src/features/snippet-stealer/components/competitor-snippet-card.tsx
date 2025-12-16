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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-red-400" />
        </div>
        <h3 className="font-medium text-foreground">The Enemy</h3>
        <span className="text-xs text-muted-foreground">Current Featured Snippet</span>
      </div>

      {/* Google Snippet Card - Authentic Google Style */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
        <p className="text-slate-900 text-[15px] leading-relaxed font-sans">
          {snippet.competitorSnippet}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="h-5 w-5 rounded bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600">
              C
            </div>
            <span className="text-red-600">competitor-site.com</span>
          </div>
        </div>
      </div>

      {/* Forensics Bar */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-xl border border-border">
        <div className="flex items-center gap-2 text-sm">
          <Type className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Word Count:</span>
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
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Reading Level:</span>
          <span className="font-medium text-foreground">{snippet.competitorReadingLevel}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Keywords:</span>
          <span className="font-medium text-foreground">{snippet.competitorKeywords}</span>
        </div>
      </div>
    </div>
  )
}
