"use client"

// ============================================
// Bulk Keywords Input Component
// ============================================

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MAX_BULK_KEYWORDS } from "../constants"
import { parseBulkKeywords } from "../utils"

interface BulkKeywordsInputProps {
  value: string
  onChange: (value: string) => void
  onAnalyze: (keywords: string[]) => void
}

export function BulkKeywordsInput({ value, onChange, onAnalyze }: BulkKeywordsInputProps) {
  const keywordCount = parseBulkKeywords(value).length

  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <textarea
          placeholder="Paste up to 100 keywords, one per line..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-32 p-3 text-sm bg-secondary/50 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground"
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {keywordCount} / {MAX_BULK_KEYWORDS} keywords
        </div>
      </div>
      <Button
        className="bg-primary hover:bg-primary/90 gap-2"
        onClick={() => onAnalyze(parseBulkKeywords(value))}
      >
        <Sparkles className="h-4 w-4" />
        Analyze Keywords
      </Button>
    </div>
  )
}
