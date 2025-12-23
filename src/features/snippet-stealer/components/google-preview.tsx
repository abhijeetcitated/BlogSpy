"use client"

import { Eye, Search, CheckCircle2, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { capitalizeFirst, generateSlug } from "../utils/snippet-utils"
import type { SnippetOpportunity } from "../types"

interface GooglePreviewProps {
  snippet: SnippetOpportunity
  userSnippet: string
  wordCount: number
  keywordsUsed: number
  onBackToEditor: () => void
}

export function GooglePreview({
  snippet,
  userSnippet,
  wordCount,
  keywordsUsed,
  onBackToEditor,
}: GooglePreviewProps) {
  const keywordCapitalized = capitalizeFirst(snippet.keyword)
  const slug = generateSlug(snippet.keyword)

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Eye className="h-4 w-4 text-emerald-400" />
        </div>
        <h3 className="font-medium text-base sm:text-lg text-foreground">Google Search Preview</h3>
        <span className="text-xs sm:text-sm text-muted-foreground">How your snippet will appear</span>
      </div>

      {/* Google Search Results Container */}
      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg border border-slate-200 max-w-2xl">
        {/* Search Bar Mock */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 p-2 sm:p-3 bg-slate-50 rounded-full border border-slate-200">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          <span className="text-sm sm:text-base text-slate-700">{snippet.keyword}</span>
        </div>

        {/* Featured Snippet Box */}
        <div className="border border-slate-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50/50">
          <p className="text-slate-800 text-[15px] sm:text-base leading-relaxed mb-2 sm:mb-3">
            {userSnippet}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">
              Y
            </div>
            <span className="text-emerald-600 font-medium">your-site.com</span>
            <span className="text-slate-400 hidden xs:inline">› blog › {slug}</span>
          </div>
        </div>

        {/* Your Result */}
        <div className="space-y-0.5 sm:space-y-1 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold">
              Y
            </div>
            <span className="text-emerald-600">your-site.com</span>
            <span className="text-slate-400 hidden xs:inline">› blog › {slug}</span>
          </div>
          <h4 className="text-blue-700 text-base sm:text-lg font-medium hover:underline cursor-pointer">
            {keywordCapitalized} - Complete Guide 2024
          </h4>
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2">
            {userSnippet.substring(0, 160)}...
          </p>
        </div>

        {/* Competitor Result (pushed down) */}
        <div className="space-y-0.5 sm:space-y-1 opacity-60">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-slate-300 flex items-center justify-center text-slate-600 text-[9px] sm:text-[10px] font-bold">
              C
            </div>
            <span className="text-slate-500">competitor-site.com</span>
          </div>
          <h4 className="text-blue-600/70 text-sm sm:text-base hover:underline cursor-pointer">
            {keywordCapitalized} Tips
          </h4>
          <p className="text-slate-500 text-xs sm:text-sm line-clamp-2">
            {snippet.competitorSnippet.substring(0, 120)}...
          </p>
        </div>
      </div>

      {/* Success Message */}
      <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg sm:rounded-xl">
        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm sm:text-base font-medium text-emerald-400">
            Your snippet is optimized for Featured Snippet!
          </p>
          <p className="text-xs sm:text-sm text-emerald-400/70 mt-0.5">
            Words: {wordCount} • Keywords: {keywordsUsed}/{snippet.targetKeywords.length}
          </p>
        </div>
      </div>

      {/* Back to Editor Button */}
      <Button
        variant="outline"
        onClick={onBackToEditor}
        className="w-full h-11 touch-manipulation min-h-11"
      >
        <PenLine className="h-4 w-4 mr-2" />
        <span className="text-sm sm:text-base">Back to Editor</span>
      </Button>
    </div>
  )
}
