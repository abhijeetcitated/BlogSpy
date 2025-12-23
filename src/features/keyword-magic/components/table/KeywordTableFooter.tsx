"use client"

// ============================================
// KEYWORD TABLE - Footer Component
// ============================================

import { Button } from "@/components/ui/button"

interface KeywordTableFooterProps {
  displayedCount: number
  totalCount: number
  selectedCount: number
  hasMore: boolean
  onLoadMore: () => void
}

export function KeywordTableFooter({
  displayedCount,
  totalCount,
  selectedCount,
  hasMore,
  onLoadMore,
}: KeywordTableFooterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 border-t border-border bg-muted/30 shrink-0 rounded-b-lg">
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
          {displayedCount}/{totalCount}
        </span>
        {selectedCount > 0 && (
          <span className="text-[10px] sm:text-xs text-primary font-medium">{selectedCount} selected</span>
        )}
      </div>
      {hasMore ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLoadMore} 
          className="gap-1.5 sm:gap-2 h-7 sm:h-8 text-[10px] sm:text-xs w-full sm:w-auto"
        >
          Load More
          <span className="text-muted-foreground">({totalCount - displayedCount})</span>
        </Button>
      ) : (
        <span className="text-[10px] sm:text-xs text-muted-foreground">All loaded</span>
      )}
    </div>
  )
}
