"use client"

import Link from "next/link"
import { Sparkles, Type, Target, CheckCircle2, Loader2, Save, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { 
  getWordCountStatus, 
  calculateProgressPercent, 
  getKeywordCountColor 
} from "../utils/snippet-utils"
import type { SnippetOpportunity } from "../types"

interface SnippetEditorProps {
  snippet: SnippetOpportunity
  userSnippet: string
  wordCount: number
  keywordsUsed: number
  isGenerating: boolean
  isSaving: boolean
  isSaved: boolean
  onSnippetChange: (value: string) => void
  onGenerate: () => void
  onSave: () => void
}

export function SnippetEditor({
  snippet,
  userSnippet,
  wordCount,
  keywordsUsed,
  isGenerating,
  isSaving,
  isSaved,
  onSnippetChange,
  onGenerate,
  onSave,
}: SnippetEditorProps) {
  const wordCountStatus = getWordCountStatus(wordCount)
  const progressPercent = calculateProgressPercent(wordCount)

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-emerald-400" />
        </div>
        <h3 className="font-medium text-base sm:text-lg text-foreground">Your Winning Snippet</h3>
      </div>

      {/* Textarea */}
      <Textarea
        value={userSnippet}
        onChange={(e) => onSnippetChange(e.target.value)}
        placeholder="Write your better answer here, or let AI generate one..."
        className="min-h-25 sm:min-h-35 bg-muted/50 border-border resize-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/20"
      />

      {/* Live Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-2 sm:p-3 bg-muted/50 rounded-lg sm:rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Word Count */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Words:</span>
            <span className={cn("font-mono font-bold text-sm sm:text-base", wordCountStatus.color)}>
              {wordCount}
            </span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs px-1.5",
                wordCountStatus.ideal 
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
                  : "border-border text-muted-foreground"
              )}
            >
              {wordCountStatus.label}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-24 sm:w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 ease-out",
                  wordCountStatus.bg
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">40-60 ideal</span>
          </div>
          
          {/* Keywords Used */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Keywords:</span>
            <span className={cn(
              "font-mono font-bold text-sm sm:text-base",
              getKeywordCountColor(keywordsUsed)
            )}>
              {keywordsUsed}/{snippet.targetKeywords.length}
            </span>
          </div>
        </div>
      </div>

      {/* Target Keywords Pills */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto mb-1 sm:mb-0">Target Keywords:</span>
        {snippet.targetKeywords.map((keyword, idx) => {
          const isUsed = userSnippet.toLowerCase().includes(keyword.toLowerCase())
          return (
            <Badge
              key={idx}
              variant="outline"
              className={cn(
                "text-xs sm:text-sm transition-all",
                isUsed
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                  : "border-border text-muted-foreground bg-muted/50"
              )}
            >
              {isUsed && <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />}
              {keyword}
            </Badge>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 h-11 sm:h-11 touch-manipulation min-h-11"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-sm sm:text-base">Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Generate Better Answer</span>
            </>
          )}
        </Button>
        
        <Button
          onClick={onSave}
          disabled={isSaving || !userSnippet.trim() || isSaved}
          variant="outline"
          className={cn(
            "h-11 sm:h-11 px-4 sm:px-6 touch-manipulation min-h-11",
            isSaved 
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 cursor-default"
              : ""
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-sm sm:text-base">Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Saved</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Save Snippet</span>
            </>
          )}
        </Button>
        
        {/* Write Full Article Button */}
        <Button
          asChild
          variant="outline"
          className="h-11 sm:h-11 px-4 sm:px-6 touch-manipulation min-h-11 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
        >
          <Link href={`/ai-writer?source=snippet-stealer&keyword=${encodeURIComponent(snippet.keyword)}&volume=${snippet.volume || 0}&difficulty=${50}&serp_features=featured_snippet&intent=informational`}>
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Write Full Article</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
