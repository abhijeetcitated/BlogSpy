"use client"

import { cn } from "@/lib/utils"
import { type AICitationSource } from "@/types/ai-overview.types"
import { CitationSourceCard } from "./CitationSourceCard"
import { Lightbulb } from "lucide-react"

// ============================================
// CITATION LIST COMPONENT
// ============================================

export interface CitationListProps {
  citations: AICitationSource[]
  showWeakSourcesFirst?: boolean
  className?: string
}

export function CitationList({ 
  citations, 
  showWeakSourcesFirst = true,
  className 
}: CitationListProps) {
  const sortedCitations = showWeakSourcesFirst
    ? [...citations].sort((a, b) => {
        if (a.isWeakSource && !b.isWeakSource) return -1
        if (!a.isWeakSource && b.isWeakSource) return 1
        return a.position - b.position
      })
    : citations

  const weakCount = citations.filter(c => c.isWeakSource).length

  return (
    <div className={cn("space-y-3", className)}>
      {weakCount > 0 && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20">
          <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <span className="text-xs text-amber-600 dark:text-amber-300">
            {weakCount} weak source{weakCount > 1 ? 's' : ''} found - High opportunity to get cited!
          </span>
        </div>
      )}
      
      <div className="space-y-2">
        {sortedCitations.map((source) => (
          <CitationSourceCard key={source.position} source={source} />
        ))}
      </div>
    </div>
  )
}
