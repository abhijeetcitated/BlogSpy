"use client"

// ============================================
// KEYWORD RESEARCH RESULTS - Page Section
// ============================================
// Contains the results table and empty states
// Supports Guest Mode for PLG flow
// ============================================

import type { Keyword } from "../../types"
import dynamic from "next/dynamic"
import { useKeywordStore } from "../../store"
import { Loader2, SearchX, Sparkles } from "lucide-react"
import { TableLoadingSkeleton } from "../shared"
import { parseBulkKeywords } from "../../utils/input-parser"

const KeywordTable = dynamic(
  async () => {
    const mod = await import("../table")
    return mod.KeywordTable
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    ),
  }
)

const KeywordDrawer = dynamic(
  async () => {
    const mod = await import("../drawers")
    return mod.KeywordDrawer
  },
  { ssr: false }
)

interface KeywordResearchResultsProps {
  filteredKeywords: Keyword[]
  filterText: string
  activeFilterCount: number
  isSearching: boolean
  isGuest?: boolean
}

export function KeywordResearchResults({
  filteredKeywords,
  filterText,
  activeFilterCount,
  isSearching,
  isGuest = false,
}: KeywordResearchResultsProps) {
  // Zustand store for drawer
  const openKeywordDrawer = useKeywordStore((state) => state.openKeywordDrawer)
  const selectedCountryCode = useKeywordStore((state) => state.search.country)
  const bulkMode = useKeywordStore((state) => state.search.mode)
  const bulkKeywords = useKeywordStore((state) => state.search.bulkKeywords)
  const bulkCount = parseBulkKeywords(bulkKeywords).length
  const shouldShowBulkSkeleton = bulkMode === "bulk" && bulkCount >= 10

  // Strict country isolation: only display rows for the currently selected country.
  // We attach `countryCode` at the action boundary; defensively allow missing values.
  const countryFilteredKeywords = filteredKeywords.filter(
    (kw) => !kw.countryCode || kw.countryCode === selectedCountryCode
  )

  // Handle row click → open drawer
  const handleKeywordClick = (keyword: Keyword) => {
    openKeywordDrawer(keyword)
  }
  // Loading state
  if (isSearching) {
    if (shouldShowBulkSkeleton) {
      const rows = Math.min(Math.max(bulkCount, 10), 25)
      return (
        <div className="flex-1 flex flex-col min-h-0 h-full pt-2">
          <div className="flex items-center justify-between mb-2 px-1 shrink-0">
            <span className="text-xs text-muted-foreground">Analyzing batch...</span>
          </div>
          <div className="flex-1 h-full min-h-0 border border-border/50 rounded-lg bg-card overflow-hidden">
            <TableLoadingSkeleton rows={rows} />
          </div>
        </div>
      )
    }

    const loadingLabel = bulkMode === "bulk" ? "Analyzing batch..." : "Searching keywords..."
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{loadingLabel}</p>
      </div>
    )
  }

  // Empty state - no keywords match filters
  if (countryFilteredKeywords.length === 0) {
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
          {countryFilteredKeywords.length.toLocaleString()} keywords found
        </span>
      </div>
      
      {/* Table - flex-1 with h-full min-h-0 passes height down for sticky to work */}
      <div className="flex-1 h-full min-h-0 border border-border/50 rounded-lg bg-card overflow-hidden">
        <KeywordTable
          keywords={countryFilteredKeywords}
          isGuest={isGuest}
          onKeywordClick={handleKeywordClick}
        />
      </div>

      {/* Keyword Details Drawer */}
      <KeywordDrawer />
    </div>
  )
}
