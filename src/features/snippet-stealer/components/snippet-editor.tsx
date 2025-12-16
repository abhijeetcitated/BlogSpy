"use client"

import { Sparkles, Type, Target, CheckCircle2, Loader2, Save } from "lucide-react"
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-emerald-400" />
        </div>
        <h3 className="font-medium text-foreground">Your Winning Snippet</h3>
      </div>

      {/* Textarea */}
      <Textarea
        value={userSnippet}
        onChange={(e) => onSnippetChange(e.target.value)}
        placeholder="Write your better answer here, or let AI generate one..."
        className="min-h-[140px] bg-muted/50 border-border resize-none text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/20"
      />

      {/* Live Stats Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          {/* Word Count */}
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Words:</span>
            <span className={cn("font-mono font-bold text-sm", wordCountStatus.color)}>
              {wordCount}
            </span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] px-1.5",
                wordCountStatus.ideal 
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
                  : "border-border text-muted-foreground"
              )}
            >
              {wordCountStatus.label}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 ease-out",
                  wordCountStatus.bg
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">40-60 ideal</span>
          </div>
          
          {/* Keywords Used */}
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Keywords:</span>
            <span className={cn(
              "font-mono font-bold text-sm",
              getKeywordCountColor(keywordsUsed)
            )}>
              {keywordsUsed}/{snippet.targetKeywords.length}
            </span>
          </div>
        </div>
      </div>

      {/* Target Keywords Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Target Keywords:</span>
        {snippet.targetKeywords.map((keyword, idx) => {
          const isUsed = userSnippet.toLowerCase().includes(keyword.toLowerCase())
          return (
            <Badge
              key={idx}
              variant="outline"
              className={cn(
                "text-xs transition-all",
                isUsed
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                  : "border-border text-muted-foreground bg-muted/50"
              )}
            >
              {isUsed && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {keyword}
            </Badge>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 h-11"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Better Answer
            </>
          )}
        </Button>
        
        <Button
          onClick={onSave}
          disabled={isSaving || !userSnippet.trim() || isSaved}
          variant="outline"
          className={cn(
            "h-11 px-6",
            isSaved 
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 cursor-default"
              : ""
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Snippet
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
