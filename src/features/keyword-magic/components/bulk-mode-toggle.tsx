"use client"

// ============================================
// Bulk Mode Toggle Component
// ============================================

import { Search, Filter } from "lucide-react"
import type { BulkMode } from "../types"

interface BulkModeToggleProps {
  value: BulkMode
  onChange: (value: BulkMode) => void
}

export function BulkModeToggle({ value, onChange }: BulkModeToggleProps) {
  return (
    <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 w-fit">
      <button
        onClick={() => onChange("explore")}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 ${
          value === "explore"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Explore
      </button>
      <button
        onClick={() => onChange("bulk")}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 ${
          value === "bulk"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Bulk Analysis</span>
        <span className="sm:hidden">Bulk</span>
      </button>
    </div>
  )
}
