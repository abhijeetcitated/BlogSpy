"use client"

// ============================================
// KEYWORD MAGIC - Results Component
// ============================================

import { Loader2 } from "lucide-react"
import type { Keyword } from "../../types"
import { KeywordTable } from "../KeywordTable"

interface KeywordMagicResultsProps {
  filteredKeywords: Keyword[]
  filterText: string
  activeFilterCount: number
  isSearching: boolean
  country?: string
}

export function KeywordMagicResults({
  filteredKeywords,
  filterText,
  activeFilterCount,
  isSearching,
  country,
}: KeywordMagicResultsProps) {
  return (
    <>
      {/* Results Summary */}
      {(filterText || activeFilterCount > 0) && (
        <div className="flex items-center gap-2 pb-2 text-sm text-muted-foreground shrink-0">
          <span>
            Found <span className="font-medium text-foreground">{filteredKeywords.length}</span> keywords
            {filterText && (
              <> matching "<span className="font-medium text-foreground">{filterText}</span>"</>
            )}
          </span>
        </div>
      )}

      {/* Data Table - Sticky Card that fills viewport when scrolled */}
      <div 
        className="sticky top-0 bg-card border border-border rounded-lg shadow-sm overflow-hidden" 
        style={{ height: 'calc(100vh - 6rem)' }}
      >
        {isSearching ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <KeywordTable 
            keywords={filteredKeywords} 
            country={country}
          />
        )}
      </div>
    </>
  )
}
