"use client"

// ============================================
// KEYWORD MAGIC - Search Component
// ============================================

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface KeywordMagicSearchProps {
  filterText: string
  onFilterTextChange: (text: string) => void
}

export function KeywordMagicSearch({
  filterText,
  onFilterTextChange,
}: KeywordMagicSearchProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Filter by keyword..."
        value={filterText}
        onChange={(e) => onFilterTextChange(e.target.value)}
        className="pl-9 h-9 bg-secondary/50 border-border text-sm"
      />
      {filterText && (
        <button
          onClick={() => onFilterTextChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          ×
        </button>
      )}
    </div>
  )
}
