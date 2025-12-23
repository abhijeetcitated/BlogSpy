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
    <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
      <div className="inline-flex items-center rounded-lg bg-secondary/50 p-0.5 border border-border w-full sm:w-auto">
        {MATCH_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`flex-1 sm:flex-none px-3 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap text-center ${
              value === type.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}
