"use client"

// ============================================
// Match Type Toggle Component
// ============================================

import type { MatchType } from "../types"

interface MatchTypeToggleProps {
  value: MatchType
  onChange: (value: MatchType) => void
}

const MATCH_TYPES: { value: MatchType; label: string }[] = [
  { value: "broad", label: "Broad" },
  { value: "phrase", label: "Phrase" },
  { value: "exact", label: "Exact" },
  { value: "related", label: "Related" },
  { value: "questions", label: "Questions" },
]

export function MatchTypeToggle({ value, onChange }: MatchTypeToggleProps) {
  return (
    <div className="flex items-center rounded-lg bg-secondary/50 p-0.5 overflow-x-auto scrollbar-none">
      {MATCH_TYPES.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
            value === type.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}
