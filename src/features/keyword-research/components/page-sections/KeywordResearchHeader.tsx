"use client"

// ============================================
// KEYWORD RESEARCH HEADER - Page Section
// ============================================
// Contains country selector, mode toggle, match type, etc.
// ============================================

import type { Country, MatchType, BulkMode } from "../../types"
import { CountrySelector, BulkModeToggle, MatchTypeToggle } from "../index"
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "../../constants"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface KeywordResearchHeaderProps {
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
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 py-3 sm:py-4 border-b border-border/50">
      {/* Left: Mode toggle and country selector */}
      <div className="flex flex-wrap items-center gap-3">
        <BulkModeToggle 
          value={bulkMode} 
          onChange={onBulkModeChange} 
        />
        
        <div className="h-5 w-px bg-border/50" />
        
        <CountrySelector
          selectedCountry={selectedCountry}
          open={countryOpen}
          onOpenChange={onCountryOpenChange}
          onSelect={onCountrySelect}
          popularCountries={POPULAR_COUNTRIES}
          allCountries={ALL_COUNTRIES}
        />
      </div>

      {/* Right: Match type and filter reset (desktop: same row, mobile: new row) */}
      {bulkMode === "explore" && (
        <div className="flex items-center gap-3">
          <MatchTypeToggle
            value={matchType}
            onChange={onMatchTypeChange}
          />
          
          {activeFilterCount > 0 && (
            <>
              <div className="h-5 w-px bg-border/50" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset ({activeFilterCount})
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
