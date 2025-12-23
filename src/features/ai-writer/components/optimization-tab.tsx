// ============================================
// AI WRITER - Optimization Tab Content
// ============================================

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageSquare,
  Wand2,
  Trophy,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EditorStats, NLPKeyword, CriticalIssue, AIAction } from "../types"

interface OptimizationTabProps {
  editorStats: EditorStats
  nlpKeywords: NLPKeyword[]
  criticalIssues: CriticalIssue[]
  targetKeyword: string
  isAIGenerating: boolean
  aiAction: AIAction
  onGenerateFAQ: () => void
  onWriteConclusion: () => void
}

export function OptimizationTab({
  editorStats,
  nlpKeywords,
  criticalIssues,
  targetKeyword,
  isAIGenerating,
  aiAction,
  onGenerateFAQ,
  onWriteConclusion,
}: OptimizationTabProps) {
  return (
    <div className="p-3 sm:p-4 space-y-6">
      {/* Content Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Words</p>
          <p className="text-xl font-bold text-foreground">
            {editorStats.wordCount.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Keyword Density</p>
          <p
            className={cn(
              "text-xl font-bold",
              editorStats.keywordDensity >= 1 && editorStats.keywordDensity <= 2
                ? "text-emerald-400"
                : "text-amber-400"
            )}
          >
            {editorStats.keywordDensity}%
          </p>
        </div>
      </div>

      {/* Critical Issues Section */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Critical Issues
        </h3>
        <div className="space-y-2">
          {criticalIssues.map((issue) => {
            const passed = issue.check(editorStats)
            return (
              <div key={issue.id} className="flex items-center gap-2 text-sm">
                {passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span className={passed ? "text-muted-foreground" : "text-foreground"}>
                  {issue.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* NLP Keywords Section */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          NLP Keywords (LSI)
          <span className="text-xs text-muted-foreground ml-auto">
            {nlpKeywords.filter((k) => k.used).length}/{nlpKeywords.length}
          </span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {nlpKeywords.map((keyword, i) => (
            <Badge
              key={i}
              variant="outline"
              className={cn(
                "text-xs transition-colors",
                keyword.used
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              {keyword.text}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Tools Section */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-cyan-400" />
          AI Tools
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateFAQ}
            disabled={isAIGenerating}
            className="justify-start gap-2 h-9 bg-card/50 border-border hover:bg-card hover:border-emerald-500/50"
          >
            {aiAction === "faq" && isAIGenerating ? (
              <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4 text-emerald-400" />
            )}
            Generate FAQ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onWriteConclusion}
            disabled={isAIGenerating}
            className="justify-start gap-2 h-9 bg-card/50 border-border hover:bg-card hover:border-cyan-500/50"
          >
            {aiAction === "conclusion" && isAIGenerating ? (
              <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-cyan-400" />
            )}
            Write Conclusion
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isAIGenerating}
            className="justify-start gap-2 h-9 bg-card/50 border-border hover:bg-card hover:border-yellow-500/50"
          >
            <CheckCircle2 className="h-4 w-4 text-yellow-400" />
            Fix Grammar
          </Button>
        </div>
      </div>

      {/* Snippet Stealer Integration */}
      <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground mb-1">
              Featured Snippet Opportunity
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Competitor defines &quot;{targetKeyword}&quot; in 45 words.
            </p>
            <Button
              size="sm"
              className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-background font-medium"
            >
              Draft Better Definition
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
