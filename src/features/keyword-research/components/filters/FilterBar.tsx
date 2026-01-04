"use client"

// ============================================
// FILTER BAR - Horizontal Scrollable Filter Bar
// ============================================
// Combines all filter components in a single row
// Connected to Zustand store (useKeywordStore)
// ============================================

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Search, X } from "lucide-react"

import { useKeywordStore } from "../../store"
import { VolumeFilter } from "./volume"
import { KDFilter } from "./kd"
import { IntentFilter } from "./intent"
import { CPCFilter } from "./cpc"
import { GeoFilter } from "./geo"
import { WeakSpotFilter } from "./weak-spot"
import { SerpFilter } from "./serp"
import { TrendFilter } from "./trend"
import { IncludeExcludeFilter } from "./include-exclude"

// ============================================
// FILTER BAR COMPONENT
// ============================================

export function FilterBar() {
  // ─────────────────────────────────────────
  // ZUSTAND STORE CONNECTION
  // ─────────────────────────────────────────
  const filters = useKeywordStore((state) => state.filters)
  const setFilter = useKeywordStore((state) => state.setFilter)
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

  // Temp state for filters (before Apply)
  const [tempVolumeRange, setTempVolumeRange] = useState(filters.volumeRange)
  const [tempKdRange, setTempKdRange] = useState(filters.kdRange)
  const [tempCpcRange, setTempCpcRange] = useState(filters.cpcRange)
  const [tempGeoRange, setTempGeoRange] = useState(filters.geoRange)
  const [tempIntents, setTempIntents] = useState(filters.selectedIntents)
  const [tempSerpFeatures, setTempSerpFeatures] = useState(filters.selectedSerpFeatures)
  const [tempTrendDirection, setTempTrendDirection] = useState(filters.trendDirection)
  const [tempMinGrowth, setTempMinGrowth] = useState(filters.minTrendGrowth)
  const [tempHasWeakSpot, setTempHasWeakSpot] = useState<boolean | null>(
    filters.weakSpotToggle === "with" ? true : filters.weakSpotToggle === "without" ? false : null
  )
  const [tempWeakSpotTypes, setTempWeakSpotTypes] = useState(filters.weakSpotTypes)

  // Preset states
  const [volumePreset, setVolumePreset] = useState<string | null>(null)

  // Include/Exclude input state
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")

  // ─────────────────────────────────────────
  // COUNT ACTIVE FILTERS
  // ─────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.searchText) count++
    if (filters.volumeRange[0] > 0 || filters.volumeRange[1] < 1000000) count++
    if (filters.kdRange[0] > 0 || filters.kdRange[1] < 100) count++
    if (filters.cpcRange[0] > 0 || filters.cpcRange[1] < 100) count++
    if (filters.geoRange[0] > 0 || filters.geoRange[1] < 100) count++
    if (filters.selectedIntents.length > 0) count++
    if (filters.selectedSerpFeatures.length > 0) count++
    if (filters.includeTerms.length > 0) count++
    if (filters.excludeTerms.length > 0) count++
    if (filters.trendDirection !== null) count++
    if (filters.weakSpotToggle !== "all") count++
    return count
  }, [filters])

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  // Search text
  const handleSearchChange = useCallback(
    (value: string) => {
      setFilter("searchText", value)
    },
    [setFilter]
  )

  // Volume
  const handleVolumeApply = useCallback(() => {
    setFilter("volumeRange", tempVolumeRange)
    setVolumeOpen(false)
  }, [setFilter, tempVolumeRange])

  // KD
  const handleKdApply = useCallback(() => {
    setFilter("kdRange", tempKdRange)
    setKdOpen(false)
  }, [setFilter, tempKdRange])

  // CPC
  const handleCpcApply = useCallback(() => {
    setFilter("cpcRange", tempCpcRange)
    setCpcOpen(false)
  }, [setFilter, tempCpcRange])

  // GEO
  const handleGeoApply = useCallback(() => {
    setFilter("geoRange", tempGeoRange)
    setGeoOpen(false)
  }, [setFilter, tempGeoRange])

  // Intent
  const handleToggleIntent = useCallback((value: string) => {
    setTempIntents((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    )
  }, [])

  const handleIntentApply = useCallback(() => {
    setFilter("selectedIntents", tempIntents)
    setIntentOpen(false)
  }, [setFilter, tempIntents])

  // SERP Features
  const handleToggleSerpFeature = useCallback((feature: string) => {
    setTempSerpFeatures((prev) =>
      prev.includes(feature as never)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature as never]
    )
  }, [])

  const handleSerpApply = useCallback(() => {
    setFilter("selectedSerpFeatures", tempSerpFeatures)
    setSerpOpen(false)
  }, [setFilter, tempSerpFeatures])

  // Trend
  const handleTrendApply = useCallback(() => {
    setFilter("trendDirection", tempTrendDirection)
    setFilter("minTrendGrowth", tempMinGrowth)
    setTrendOpen(false)
  }, [setFilter, tempTrendDirection, tempMinGrowth])

  // Weak Spot
  const handleWeakSpotApply = useCallback(() => {
    const toggle = tempHasWeakSpot === true ? "with" : tempHasWeakSpot === false ? "without" : "all"
    setFilter("weakSpotToggle", toggle)
    setFilter("weakSpotTypes", tempWeakSpotTypes)
    setWeakSpotOpen(false)
  }, [setFilter, tempHasWeakSpot, tempWeakSpotTypes])

  const handleToggleWeakSpotType = useCallback((type: string) => {
    setTempWeakSpotTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  // Include Terms
  const handleAddIncludeTerm = useCallback(() => {
    if (includeInput.trim()) {
      setFilter("includeTerms", [...filters.includeTerms, includeInput.trim()])
      setIncludeInput("")
    }
  }, [setFilter, filters.includeTerms, includeInput])

  const handleRemoveIncludeTerm = useCallback(
    (term: string) => {
      setFilter(
        "includeTerms",
        filters.includeTerms.filter((t) => t !== term)
      )
    },
    [setFilter, filters.includeTerms]
  )

  // Exclude Terms
  const handleAddExcludeTerm = useCallback(() => {
    if (excludeInput.trim()) {
      setFilter("excludeTerms", [...filters.excludeTerms, excludeInput.trim()])
      setExcludeInput("")
    }
  }, [setFilter, filters.excludeTerms, excludeInput])

  const handleRemoveExcludeTerm = useCallback(
    (term: string) => {
      setFilter(
        "excludeTerms",
        filters.excludeTerms.filter((t) => t !== term)
      )
    },
    [setFilter, filters.excludeTerms]
  )

  // Reset all
  const handleResetFilters = useCallback(() => {
    resetFilters()
    // Reset local temp states
    setTempVolumeRange([0, 1000000])
    setTempKdRange([0, 100])
    setTempCpcRange([0, 100])
    setTempGeoRange([0, 100])
    setTempIntents([])
    setTempSerpFeatures([])
    setTempTrendDirection(null)
    setTempMinGrowth(null)
    setTempHasWeakSpot(null)
    setTempWeakSpotTypes([])
    setVolumePreset(null)
    setIncludeInput("")
    setExcludeInput("")
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
          value={filters.searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 pr-7 h-8 text-sm bg-muted/30 border-border/50"
        />
        {filters.searchText && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => handleSearchChange("")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-border/50 shrink-0" />

      {/* Volume Filter */}
      <VolumeFilter
        open={volumeOpen}
        onOpenChange={setVolumeOpen}
        tempRange={tempVolumeRange}
        onTempRangeChange={setTempVolumeRange}
        volumePreset={volumePreset}
        onPresetChange={setVolumePreset}
        onApply={handleVolumeApply}
      />

      {/* KD Filter */}
      <KDFilter
        open={kdOpen}
        onOpenChange={setKdOpen}
        tempRange={tempKdRange}
        onTempRangeChange={setTempKdRange}
        onApply={handleKdApply}
      />

      {/* CPC Filter */}
      <CPCFilter
        open={cpcOpen}
        onOpenChange={setCpcOpen}
        tempRange={tempCpcRange}
        onTempRangeChange={setTempCpcRange}
        onApply={handleCpcApply}
      />

      {/* Intent Filter */}
      <IntentFilter
        open={intentOpen}
        onOpenChange={setIntentOpen}
        selectedIntents={filters.selectedIntents}
        tempSelectedIntents={tempIntents}
        onToggleIntent={handleToggleIntent}
        onApply={handleIntentApply}
      />

      {/* GEO Filter */}
      <GeoFilter
        open={geoOpen}
        onOpenChange={setGeoOpen}
        tempRange={tempGeoRange}
        onTempRangeChange={setTempGeoRange}
        onApply={handleGeoApply}
      />

      {/* Weak Spot Filter */}
      <WeakSpotFilter
        open={weakSpotOpen}
        onOpenChange={setWeakSpotOpen}
        tempHasWeakSpot={tempHasWeakSpot}
        tempWeakSpotTypes={tempWeakSpotTypes}
        onTempHasWeakSpotChange={setTempHasWeakSpot}
        onToggleWeakSpotType={handleToggleWeakSpotType}
        onApply={handleWeakSpotApply}
      />

      {/* SERP Features Filter */}
      <SerpFilter
        open={serpOpen}
        onOpenChange={setSerpOpen}
        selectedFeatures={filters.selectedSerpFeatures}
        tempSelectedFeatures={tempSerpFeatures}
        onToggleFeature={handleToggleSerpFeature}
        onApply={handleSerpApply}
      />

      {/* Trend Filter */}
      <TrendFilter
        open={trendOpen}
        onOpenChange={setTrendOpen}
        tempTrendDirection={tempTrendDirection}
        tempMinGrowth={tempMinGrowth}
        onTempTrendDirectionChange={setTempTrendDirection}
        onTempMinGrowthChange={setTempMinGrowth}
        onApply={handleTrendApply}
      />

      {/* Include/Exclude Filter */}
      <IncludeExcludeFilter
        includeTerms={filters.includeTerms}
        excludeTerms={filters.excludeTerms}
        includeInput={includeInput}
        excludeInput={excludeInput}
        onIncludeInputChange={setIncludeInput}
        onExcludeInputChange={setExcludeInput}
        onAddIncludeTerm={handleAddIncludeTerm}
        onAddExcludeTerm={handleAddExcludeTerm}
        onRemoveIncludeTerm={handleRemoveIncludeTerm}
        onRemoveExcludeTerm={handleRemoveExcludeTerm}
      />

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
