"use client"

// ============================================
// SEARCH SUGGESTIONS - Autocomplete dropdown
// ============================================

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, Clock, Search } from "lucide-react"

interface Suggestion {
  keyword: string
  volume?: number
  type: "recent" | "trending" | "related"
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[]
  isOpen: boolean
  onSelect: (keyword: string) => void
  onClose: () => void
}

export function SearchSuggestions({
  suggestions,
  isOpen,
  onSelect,
  onClose,
}: SearchSuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen || suggestions.length === 0) return null

  const getIcon = (type: Suggestion["type"]) => {
    switch (type) {
      case "recent":
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      case "trending":
        return <TrendingUp className="h-3.5 w-3.5 text-green-500" />
      default:
        return <Search className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-full left-0 right-0 mt-1 z-50",
        "bg-popover border border-border rounded-lg shadow-lg",
        "max-h-72 overflow-y-auto"
      )}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion.keyword}-${index}`}
          type="button"
          onClick={() => onSelect(suggestion.keyword)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2",
            "text-sm text-left hover:bg-muted/50 transition-colors",
            index === 0 && "rounded-t-lg",
            index === suggestions.length - 1 && "rounded-b-lg"
          )}
        >
          {getIcon(suggestion.type)}
          <span className="flex-1 truncate">{suggestion.keyword}</span>
          {suggestion.volume && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {suggestion.volume.toLocaleString()}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
