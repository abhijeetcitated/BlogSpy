"use client"

// ============================================
// KEYWORD RESEARCH HEADER - Page Section
// ============================================
// Contains search bar, country selector, mode toggle, etc.
// ============================================

import type { Country, MatchType, BulkMode } from "../../types"
import { KeywordResearchSearch } from "./KeywordResearchSearch"

interface KeywordResearchHeaderProps {
  isGuest?: boolean
  selectedCountry: Country | null
  countryOpen: boolean
  onCountryOpenChange: (open: boolean) => void
  onCountrySelect: (country: Country | null) => void
  bulkMode: BulkMode
  onBulkModeChange: (mode: BulkMode) => void
  matchType: MatchType
  onMatchTypeChange: (type: MatchType) => void
  activeFilterCount: number
  onResetFilters: () => void
}

export function KeywordResearchHeader({
  isGuest = false,
  selectedCountry,
  countryOpen,
  onCountryOpenChange,
  onCountrySelect,
  bulkMode,
  onBulkModeChange,
  matchType,
  onMatchTypeChange,
  activeFilterCount,
  onResetFilters,
}: KeywordResearchHeaderProps) {
  return (
    <div className="flex flex-col gap-3 py-3 sm:py-4 border-b border-border/50">
      {/* Search Bar + Unified Toolbar */}
      <KeywordResearchSearch
        mode="seed"
        isGuest={isGuest}
        selectedCountry={selectedCountry}
        countryOpen={countryOpen}
        onCountryOpenChange={onCountryOpenChange}
        onCountrySelect={onCountrySelect}
        bulkMode={bulkMode}
        onBulkModeChange={onBulkModeChange}
        matchType={matchType}
        onMatchTypeChange={onMatchTypeChange}
        activeFilterCount={activeFilterCount}
        onResetFilters={onResetFilters}
      />
    </div>
  )
}
