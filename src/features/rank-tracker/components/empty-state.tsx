// ============================================
// RANK TRACKER - Empty State Component
// ============================================

"use client"

import { Search, Plus, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  type: "no-data" | "no-results"
  searchQuery?: string
  onAddKeywords?: () => void
  onClearFilters?: () => void
}

/**
 * Empty state component for when there's no data or no search results
 */
export function EmptyState({
  type,
  searchQuery,
  onAddKeywords,
  onClearFilters,
}: EmptyStateProps) {
  if (type === "no-data") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No keywords tracked yet
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          Start tracking your keyword rankings across multiple search engines to monitor your SEO performance.
        </p>
        {onAddKeywords && (
          <Button
            onClick={onAddKeywords}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Keywords
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No results found
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {searchQuery
          ? `No keywords match "${searchQuery}". Try a different search term.`
          : "No keywords match your current filters."}
      </p>
      {onClearFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="border-border text-muted-foreground hover:bg-muted"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
