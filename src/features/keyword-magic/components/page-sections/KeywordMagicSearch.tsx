"use client"

// ============================================
// KEYWORD MAGIC SEARCH - Page Section
// ============================================
// Contains the main search input for filter text
// ============================================

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface KeywordMagicSearchProps {
  filterText: string
  onFilterTextChange: (text: string) => void
}

export function KeywordMagicSearch({
  filterText,
  onFilterTextChange,
}: KeywordMagicSearchProps) {
  return (
    <div className="relative flex-1 max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="Filter keywords..."
        value={filterText}
        onChange={(e) => onFilterTextChange(e.target.value)}
        className="pl-9 pr-8 h-9 bg-muted/30 border-border/50 focus:bg-background"
      />
      {filterText && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => onFilterTextChange("")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
