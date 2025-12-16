// ============================================
// KEYWORDS TABLE - Sub-components
// ============================================

"use client"

import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// ============================================
// BULK ACTION BAR
// ============================================

interface BulkActionBarProps {
  selectedCount: number
  onBulkAdd: () => void
  onClearSelection: () => void
}

export function BulkActionBar({
  selectedCount,
  onBulkAdd,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-3">
      <span className="text-sm font-medium text-amber-400">
        {selectedCount} keyword{selectedCount > 1 ? "s" : ""} selected
      </span>
      <Button
        size="sm"
        onClick={onBulkAdd}
        className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add {selectedCount} Keywords to Roadmap
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
        className="h-7 px-3 text-muted-foreground hover:text-foreground text-xs"
      >
        Clear Selection
      </Button>
    </div>
  )
}

// ============================================
// EMPTY STATE
// ============================================

export function KeywordsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground">
        No keywords found
      </h3>
      <p className="text-xs text-muted-foreground mt-1">
        Try adjusting your filters or search query
      </p>
    </div>
  )
}
