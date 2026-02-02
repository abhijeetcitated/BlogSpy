"use client"

// ============================================
// FILTER BAR - Horizontal Scrollable Filter Bar
// ============================================
// Combines all filter components in a single row
// Connected to Zustand store (useKeywordStore)
// ============================================

import { useState, useMemo, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChevronDown, RotateCcw, Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

import { useKeywordStore } from "../../store"
import { KD_LEVELS } from "../../constants"
import { WeakSpotFilter } from "./weak-spot"
import { TrendFilter } from "./trend"
import { IncludeExcludeFilter } from "./IncludeExcludeFilter"
import { RangeFilter } from "./RangeFilter"
import { IntentFilter } from "./IntentFilter"
import { SerpFilter } from "./SerpFilter"

// ============================================
// FILTER BAR COMPONENT
// ============================================

export function FilterBar() {
  // ─────────────────────────────────────────
  // ZUSTAND STORE CONNECTION
  // ─────────────────────────────────────────
  const filters = useKeywordStore((state) => state.filters)
  const setSearchText = useKeywordStore((state) => state.setSearchText)
  const resetFilters = useKeywordStore((state) => state.resetFilters)

  // ─────────────────────────────────────────
  // LOCAL STATE FOR POPOVERS
  // ─────────────────────────────────────────
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [kdOpen, setKdOpen] = useState(false)
  const [cpcOpen, setCpcOpen] = useState(false)
  const [geoOpen, setGeoOpen] = useState(false)
  const [intentOpen, setIntentOpen] = useState(false)
  const [serpOpen, setSerpOpen] = useState(false)
  const [trendOpen, setTrendOpen] = useState(false)
  const [weakSpotOpen, setWeakSpotOpen] = useState(false)

  // Debounced search input state
  const [searchValue, setSearchValue] = useState(filters.searchText)
  const debouncedSearchValue = useDebounce(searchValue, 300)

  useEffect(() => {
    setSearchText(debouncedSearchValue)
  }, [debouncedSearchValue, setSearchText])

  useEffect(() => {
    setSearchValue(filters.searchText)
  }, [filters.searchText])

  const kdPresets = useMemo(
    () =>
      KD_LEVELS.map((level) => ({
        label: level.label,
        range: [level.min, level.max] as [number, number],
        color: level.color,
      })),
    []
  )

  // ─────────────────────────────────────────
  // COUNT ACTIVE FILTERS
  // ─────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.searchText) count++
    if (filters.volumeRange[0] > 0 || filters.volumeRange[1] < 10000000) count++
    if (filters.kdRange[0] > 0 || filters.kdRange[1] < 100) count++
    if (filters.cpcRange[0] > 0 || filters.cpcRange[1] < 1000) count++
    if (filters.geoRange[0] > 0 || filters.geoRange[1] < 100) count++
    if (filters.selectedIntents.length > 0) count++
    if (filters.selectedSerpFeatures.length > 0) count++
    if (filters.includeKeywords.length > 0 || filters.includeTerms.length > 0) count++
    if (filters.excludeKeywords.length > 0 || filters.excludeTerms.length > 0) count++
    if (filters.selectedTrend.length > 0 || filters.minTrendGrowth > 0) count++
    if (filters.weakSpotToggle !== "all") count++
    return count
  }, [filters])

  const volumeActive = filters.volumeRange[0] > 0 || filters.volumeRange[1] < 10000000
  const kdActive = filters.kdRange[0] > 0 || filters.kdRange[1] < 100
  const cpcActive = filters.cpcRange[0] > 0 || filters.cpcRange[1] < 1000
  const geoActive = filters.geoRange[0] > 0 || filters.geoRange[1] < 100

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  // Search text
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchValue("")
    setSearchText("")
  }, [setSearchText])

  // Intent + SERP apply handled inside filters

  // Reset all
  const handleResetFilters = useCallback(() => {
    resetFilters()
  }, [resetFilters])

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
      {/* Search Input */}
      <div className="relative min-w-[180px] sm:min-w-60 shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Filter keywords..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault()
              clearSearch()
            }
          }}
          className="pl-8 pr-7 h-8 text-sm bg-muted/30 border-border/50"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-border/50 shrink-0" />

      {/* Volume Filter */}
      <Popover open={volumeOpen} onOpenChange={setVolumeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-foreground text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
              volumeActive && "border-[#FFD700]/70"
            )}
          >
            Vol
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-3" align="start">
          <RangeFilter
            label="Volume"
            min={0}
            max={10000000}
            step={100}
            unit="Vol"
            storeKey="volumeRange"
          />
        </PopoverContent>
      </Popover>

      {/* KD Filter */}
      <Popover open={kdOpen} onOpenChange={setKdOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-foreground text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
              kdActive && "border-[#FFD700]/70"
            )}
          >
            KD
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-3" align="start">
          <RangeFilter
            label="KD"
            min={0}
            max={100}
            step={1}
            unit="%"
            presets={kdPresets}
            storeKey="kdRange"
          />
        </PopoverContent>
      </Popover>

      {/* CPC Filter */}
      <Popover open={cpcOpen} onOpenChange={setCpcOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-foreground text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
              cpcActive && "border-[#FFD700]/70"
            )}
          >
            CPC
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-3" align="start">
          <RangeFilter
            label="CPC"
            min={0}
            max={1000}
            step={0.1}
            unit="$"
            storeKey="cpcRange"
          />
        </PopoverContent>
      </Popover>

      {/* Intent Filter */}
      <IntentFilter
        open={intentOpen}
        onOpenChange={setIntentOpen}
        selectedIntents={filters.selectedIntents}
      />

      {/* GEO Filter */}
      <Popover open={geoOpen} onOpenChange={setGeoOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-foreground text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
              geoActive && "border-[#FFD700]/70"
            )}
          >
            GEO
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-3" align="start">
          <RangeFilter
            label="GEO"
            min={0}
            max={100}
            step={1}
            storeKey="geoRange"
          />
        </PopoverContent>
      </Popover>

      {/* Weak Spot Filter */}
      <WeakSpotFilter
        open={weakSpotOpen}
        onOpenChange={setWeakSpotOpen}
        selectedTypes={filters.weakSpotTypes}
        weakSpotToggle={filters.weakSpotToggle}
      />

      {/* SERP Features Filter */}
      <SerpFilter
        open={serpOpen}
        onOpenChange={setSerpOpen}
        selectedFeatures={filters.selectedSerpFeatures}
      />

      {/* Trend Filter */}
      <TrendFilter
        open={trendOpen}
        onOpenChange={setTrendOpen}
      />

      {/* Include/Exclude Filter */}
      <IncludeExcludeFilter />

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <>
          <div className="h-5 w-px bg-border/50 shrink-0" />
          <Button
            size="sm"
            onClick={handleResetFilters}
            className="h-8 text-xs font-medium gap-1.5 bg-red-600 text-white hover:bg-red-600/90 shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
            <Badge variant="secondary" className="ml-0.5 h-4 px-1.5 text-[10px] bg-white/20 text-white">
              {activeFilterCount}
            </Badge>
          </Button>
        </>
      )}
    </div>
  )
}

export default FilterBar
