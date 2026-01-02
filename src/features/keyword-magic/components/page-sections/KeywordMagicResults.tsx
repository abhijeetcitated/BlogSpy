"use client"

// ============================================
// KEYWORD MAGIC RESULTS - Page Section
// ============================================
// Contains the results table and empty states
// Supports Guest Mode for PLG flow
// ============================================

import type { Keyword } from "../../types"
import { KeywordTable } from "../table"
import { Loader2, SearchX, Sparkles } from "lucide-react"

interface KeywordMagicResultsProps {
  filteredKeywords: Keyword[]
  filterText: string
  activeFilterCount: number
  isSearching: boolean
  country?: string
  isGuest?: boolean
}

export function KeywordMagicResults({
  filteredKeywords,
  filterText,
  activeFilterCount,
  isSearching,
  country,
  isGuest = false,
}: KeywordMagicResultsProps) {
  // Loading state
  if (isSearching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Searching keywords...</p>
      </div>
    )
  }

  // Empty state - no keywords match filters
  if (filteredKeywords.length === 0) {
    const hasFilters = filterText.length > 0 || activeFilterCount > 0
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center">
        {hasFilters ? (
          <>
            <SearchX className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h3 className="font-medium text-foreground">No keywords found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search term
              </p>
            </div>
          </>
        ) : (
          <>
            <Sparkles className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h3 className="font-medium text-foreground">Ready to explore keywords</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter a seed keyword to discover opportunities
              </p>
            </div>
          </>
        )}
      </div>
    )
  }

  // Results table
  return (
    <div className="flex-1 flex flex-col min-h-0 h-full pt-2">
      {/* Results count */}
      <div className="flex items-center justify-between mb-2 px-1 shrink-0">
        <span className="text-xs text-muted-foreground">
          {filteredKeywords.length.toLocaleString()} keywords found
        </span>
      </div>
      
      {/* Table - flex-1 with h-full min-h-0 passes height down for sticky to work */}
      <div className="flex-1 h-full min-h-0 border border-border/50 rounded-lg bg-card overflow-hidden">
        <KeywordTable
          keywords={filteredKeywords}
          country={country}
          isGuest={isGuest}
        />
      </div>
    </div>
  )
}
