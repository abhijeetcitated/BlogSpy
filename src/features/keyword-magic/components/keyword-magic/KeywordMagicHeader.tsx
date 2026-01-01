"use client"

// ============================================
// KEYWORD MAGIC - Header Component
// ============================================

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw } from "lucide-react"
import type { Country, MatchType, BulkMode } from "../../types"
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "../../constants"
import {
  CountrySelector,
  MatchTypeToggle,
  BulkModeToggle,
} from "../"

interface KeywordMagicHeaderProps {
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

export function KeywordMagicHeader({
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
}: KeywordMagicHeaderProps) {
  return (
    <>
      {/* Header - Title + Controls */}
      <div className="px-0 py-3 sm:py-4 shrink-0">
        <div className="flex flex-col gap-3">
          {/* Title Row - with Country selector on right */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Keyword Explorer</h1>
            {/* Single Country Selector - responsive */}
            <CountrySelector
              selectedCountry={selectedCountry}
              onSelect={onCountrySelect}
              popularCountries={POPULAR_COUNTRIES}
              allCountries={ALL_COUNTRIES}
              open={countryOpen}
              onOpenChange={onCountryOpenChange}
            />
          </div>
          
          {/* Desktop subtitle */}
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block -mt-2">
            Discover high-value keywords with competitive insights
          </p>
          
          {/* Mobile Only: Explore/Bulk toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <BulkModeToggle value={bulkMode} onChange={onBulkModeChange} />
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-8 gap-1 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <Badge variant="secondary" className="h-5 px-1 text-xs bg-orange-100 text-orange-700">
                  {activeFilterCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mode & Match Type Row - Desktop Only */}
      <div className="hidden sm:block py-2 sm:py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mode Toggle + Reset */}
          <div className="flex items-center gap-3">
            <BulkModeToggle value={bulkMode} onChange={onBulkModeChange} />
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-8 gap-1.5 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
                <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-orange-100 text-orange-700">
                  {activeFilterCount}
                </Badge>
              </Button>
            )}
          </div>
          
          {/* Right: Match Type Toggle (only in explore mode) */}
          {bulkMode === "explore" && (
            <MatchTypeToggle value={matchType} onChange={onMatchTypeChange} />
          )}
        </div>
      </div>

      {/* Mobile Only: Match Type Row - Centered */}
      {bulkMode === "explore" && (
        <div className="sm:hidden py-2 shrink-0 flex justify-center">
          <MatchTypeToggle value={matchType} onChange={onMatchTypeChange} />
        </div>
      )}
    </>
  )
}
