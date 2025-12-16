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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Eye className="h-4 w-4 text-emerald-400" />
        </div>
        <h3 className="font-medium text-foreground">Google Search Preview</h3>
        <span className="text-xs text-muted-foreground">How your snippet will appear</span>
      </div>

      {/* Google Search Results Container */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 max-w-2xl">
        {/* Search Bar Mock */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-full border border-slate-200">
          <Search className="h-5 w-5 text-slate-400" />
          <span className="text-slate-700">{snippet.keyword}</span>
        </div>

        {/* Featured Snippet Box */}
        <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-slate-50/50">
          <p className="text-slate-800 text-[15px] leading-relaxed mb-3">
            {userSnippet}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
              Y
            </div>
            <span className="text-emerald-600 font-medium">your-site.com</span>
            <span className="text-slate-400">› blog › {slug}</span>
          </div>
        </div>

        {/* Your Result */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
              Y
            </div>
            <span className="text-emerald-600">your-site.com</span>
            <span className="text-slate-400">› blog › {slug}</span>
          </div>
          <h4 className="text-blue-700 text-lg font-medium hover:underline cursor-pointer">
            {keywordCapitalized} - Complete Guide 2024
          </h4>
          <p className="text-slate-600 text-sm line-clamp-2">
            {userSnippet.substring(0, 160)}...
          </p>
        </div>

        {/* Competitor Result (pushed down) */}
        <div className="space-y-1 opacity-60">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-5 w-5 rounded bg-slate-300 flex items-center justify-center text-slate-600 text-[10px] font-bold">
              C
            </div>
            <span className="text-slate-500">competitor-site.com</span>
          </div>
          <h4 className="text-blue-600/70 text-base hover:underline cursor-pointer">
            {keywordCapitalized} Tips
          </h4>
          <p className="text-slate-500 text-sm line-clamp-2">
            {snippet.competitorSnippet.substring(0, 120)}...
          </p>
        </div>
      </div>

      {/* Success Message */}
      <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="text-sm font-medium text-emerald-400">
            Your snippet is optimized for Featured Snippet!
          </p>
          <p className="text-xs text-emerald-400/70 mt-0.5">
            Word count: {wordCount} • Keywords used: {keywordsUsed}/{snippet.targetKeywords.length}
          </p>
        </div>
      </div>

      {/* Back to Editor Button */}
      <Button
        variant="outline"
        onClick={onBackToEditor}
        className="w-full h-11"
      >
        <PenLine className="h-4 w-4 mr-2" />
        Back to Editor
      </Button>
    </div>
  )
}
