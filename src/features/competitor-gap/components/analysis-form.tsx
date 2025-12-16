"use client"

import { Swords, Target, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// ============================================
// ANALYSIS FORM - Domain input section
// ============================================

interface AnalysisFormProps {
  yourDomain: string
  competitor1: string
  competitor2: string
  isLoading: boolean
  onYourDomainChange: (value: string) => void
  onCompetitor1Change: (value: string) => void
  onCompetitor2Change: (value: string) => void
  onAnalyze: () => void
}

export function AnalysisForm({
  yourDomain,
  competitor1,
  competitor2,
  isLoading,
  onYourDomainChange,
  onCompetitor1Change,
  onCompetitor2Change,
  onAnalyze,
}: AnalysisFormProps) {
  const canAnalyze = yourDomain.trim() && competitor1.trim()

  return (
    <div className="px-6 py-5 border-b border-border bg-card/30">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your Domain
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <Input
              placeholder="myblog.com"
              value={yourDomain}
              onChange={(e) => onYourDomainChange(e.target.value)}
              className="pl-9 h-10 bg-secondary/50 border-border"
            />
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Competitor 1
          </label>
          <div className="relative">
            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
            <Input
              placeholder="techcrunch.com"
              value={competitor1}
              onChange={(e) => onCompetitor1Change(e.target.value)}
              className="pl-9 h-10 bg-secondary/50 border-border"
            />
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Competitor 2{" "}
            <span className="text-muted-foreground/50">(Optional)</span>
          </label>
          <div className="relative">
            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
            <Input
              placeholder="theverge.com"
              value={competitor2}
              onChange={(e) => onCompetitor2Change(e.target.value)}
              className="pl-9 h-10 bg-secondary/50 border-border"
            />
          </div>
        </div>
        <Button
          onClick={onAnalyze}
          disabled={isLoading || !canAnalyze}
          className="h-10 px-6 bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Swords className="h-4 w-4 mr-2" />
              Find Missing Keywords
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
