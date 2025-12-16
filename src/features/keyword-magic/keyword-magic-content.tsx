"use client"

// ============================================
// KEYWORD MAGIC - Main Component
// ============================================
// API-ready with comprehensive filter logic
// All columns and filters properly implemented
// ============================================

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, RotateCcw, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Feature imports
import type { Country, MatchType, BulkMode } from "./types"
import {
  POPULAR_COUNTRIES,
  ALL_COUNTRIES,
  DEFAULT_VOLUME_RANGE,
  DEFAULT_KD_RANGE,
  DEFAULT_CPC_RANGE,
} from "./constants"
import { MOCK_KEYWORDS } from "./__mocks__"
import { applyAllFilters } from "./utils"
import {
  CountrySelector,
  VolumeFilter,
  KDFilter,
  IntentFilter,
  KeywordTable,
  CPCFilter,
  GeoFilter,
  WeakSpotFilter,
  SerpFilter,
  TrendFilter,
  IncludeExcludeFilter,
  MatchTypeToggle,
  BulkModeToggle,
  BulkKeywordsInput,
} from "./components"

// Default ranges
const DEFAULT_GEO_RANGE: [number, number] = [0, 100]

export function KeywordMagicContent() {
  // ============================================
  // URL PARAMS (for sharing/bookmarking)
  // ============================================
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize from URL params if present
  const initialSearch = searchParams.get("q") || ""
  const initialCountry = searchParams.get("country") || null

  // ============================================
  // SEARCH & MODE STATES
  // ============================================
  const [filterText, setFilterText] = useState(initialSearch)
  const [matchType, setMatchType] = useState<MatchType>("broad")
  const [bulkMode, setBulkMode] = useState<BulkMode>("explore")
  const [bulkKeywords, setBulkKeywords] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // ============================================
  // COUNTRY STATE
  // ============================================
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(() => {
    if (initialCountry) {
      const all = [...POPULAR_COUNTRIES, ...ALL_COUNTRIES]
      return all.find(c => c.code === initialCountry) || null
    }
    return POPULAR_COUNTRIES[0] // Default to US
  })
  const [countryOpen, setCountryOpen] = useState(false)

  // ============================================
  // POPOVER OPEN STATES
  // ============================================
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [kdOpen, setKdOpen] = useState(false)
  const [intentOpen, setIntentOpen] = useState(false)
  const [cpcOpen, setCpcOpen] = useState(false)
  const [geoOpen, setGeoOpen] = useState(false)
  const [weakSpotOpen, setWeakSpotOpen] = useState(false)
  const [serpOpen, setSerpOpen] = useState(false)
  const [trendOpen, setTrendOpen] = useState(false)

  // ============================================
  // TEMP FILTER STATES (before Apply)
  // ============================================
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>(DEFAULT_VOLUME_RANGE)
  const [tempKdRange, setTempKdRange] = useState<[number, number]>(DEFAULT_KD_RANGE)
  const [tempSelectedIntents, setTempSelectedIntents] = useState<string[]>([])
  const [tempCpcRange, setTempCpcRange] = useState<[number, number]>(DEFAULT_CPC_RANGE)
  const [tempGeoRange, setTempGeoRange] = useState<[number, number]>(DEFAULT_GEO_RANGE)
  const [tempHasWeakSpot, setTempHasWeakSpot] = useState<boolean | null>(null)
  const [tempWeakSpotTypes, setTempWeakSpotTypes] = useState<string[]>([])
  const [tempSelectedSerpFeatures, setTempSelectedSerpFeatures] = useState<string[]>([])
  const [tempTrendDirection, setTempTrendDirection] = useState<"up" | "down" | "stable" | null>(null)
  const [tempMinTrendGrowth, setTempMinTrendGrowth] = useState<number | null>(null)
  const [volumePreset, setVolumePreset] = useState<string | null>(null)

  // ============================================
  // APPLIED FILTER STATES
  // ============================================
  const [volumeRange, setVolumeRange] = useState<[number, number]>(DEFAULT_VOLUME_RANGE)
  const [kdRange, setKdRange] = useState<[number, number]>(DEFAULT_KD_RANGE)
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  const [cpcRange, setCpcRange] = useState<[number, number]>(DEFAULT_CPC_RANGE)
  const [geoRange, setGeoRange] = useState<[number, number]>(DEFAULT_GEO_RANGE)
  const [hasWeakSpot, setHasWeakSpot] = useState<boolean | null>(null)
  const [weakSpotTypes, setWeakSpotTypes] = useState<string[]>([])
  const [selectedSerpFeatures, setSelectedSerpFeatures] = useState<string[]>([])
  const [trendDirection, setTrendDirection] = useState<"up" | "down" | "stable" | null>(null)
  const [minTrendGrowth, setMinTrendGrowth] = useState<number | null>(null)

  // ============================================
  // INCLUDE/EXCLUDE STATES
  // ============================================
  const [includeTerms, setIncludeTerms] = useState<string[]>([])
  const [excludeTerms, setExcludeTerms] = useState<string[]>([])
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")

  // ============================================
  // FILTER HANDLERS
  // ============================================
  const toggleIntent = useCallback((value: string) => {
    setTempSelectedIntents((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }, [])

  const toggleWeakSpotType = useCallback((type: string) => {
    setTempWeakSpotTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const toggleSerpFeature = useCallback((feature: string) => {
    setTempSelectedSerpFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }, [])

  const addIncludeTerm = useCallback(() => {
    const term = includeInput.trim()
    if (term && !includeTerms.includes(term)) {
      setIncludeTerms(prev => [...prev, term])
      setIncludeInput("")
    }
  }, [includeInput, includeTerms])

  const addExcludeTerm = useCallback(() => {
    const term = excludeInput.trim()
    if (term && !excludeTerms.includes(term)) {
      setExcludeTerms(prev => [...prev, term])
      setExcludeInput("")
    }
  }, [excludeInput, excludeTerms])

  const removeIncludeTerm = useCallback((term: string) => {
    setIncludeTerms(prev => prev.filter(t => t !== term))
  }, [])

  const removeExcludeTerm = useCallback((term: string) => {
    setExcludeTerms(prev => prev.filter(t => t !== term))
  }, [])

  // ============================================
  // RESET ALL FILTERS
  // ============================================
  const resetAllFilters = useCallback(() => {
    // Reset search
    setFilterText("")
    
    // Reset basic filters
    setVolumeRange(DEFAULT_VOLUME_RANGE)
    setKdRange(DEFAULT_KD_RANGE)
    setCpcRange(DEFAULT_CPC_RANGE)
    setGeoRange(DEFAULT_GEO_RANGE)
    setSelectedIntents([])
    
    // Reset advanced filters
    setHasWeakSpot(null)
    setWeakSpotTypes([])
    setSelectedSerpFeatures([])
    setTrendDirection(null)
    setMinTrendGrowth(null)
    
    // Reset include/exclude
    setIncludeTerms([])
    setExcludeTerms([])
    
    // Reset temp states
    setTempVolumeRange(DEFAULT_VOLUME_RANGE)
    setTempKdRange(DEFAULT_KD_RANGE)
    setTempCpcRange(DEFAULT_CPC_RANGE)
    setTempGeoRange(DEFAULT_GEO_RANGE)
    setTempSelectedIntents([])
    setTempHasWeakSpot(null)
    setTempWeakSpotTypes([])
    setTempSelectedSerpFeatures([])
    setTempTrendDirection(null)
    setTempMinTrendGrowth(null)
    setVolumePreset(null)
  }, [])

  // ============================================
  // ACTIVE FILTER COUNT
  // ============================================
  const activeFilterCount = useMemo(() => {
    let count = 0
    // Basic range filters
    if (volumeRange[0] !== DEFAULT_VOLUME_RANGE[0] || volumeRange[1] !== DEFAULT_VOLUME_RANGE[1]) count++
    if (kdRange[0] !== DEFAULT_KD_RANGE[0] || kdRange[1] !== DEFAULT_KD_RANGE[1]) count++
    if (cpcRange[0] !== DEFAULT_CPC_RANGE[0] || cpcRange[1] !== DEFAULT_CPC_RANGE[1]) count++
    if (geoRange[0] !== DEFAULT_GEO_RANGE[0] || geoRange[1] !== DEFAULT_GEO_RANGE[1]) count++
    // Selection filters
    if (selectedIntents.length > 0) count++
    if (selectedSerpFeatures.length > 0) count++
    // Boolean/enum filters
    if (hasWeakSpot !== null) count++
    if (trendDirection !== null) count++
    // Text filters
    if (includeTerms.length > 0) count++
    if (excludeTerms.length > 0) count++
    return count
  }, [volumeRange, kdRange, cpcRange, geoRange, selectedIntents, selectedSerpFeatures, hasWeakSpot, trendDirection, includeTerms, excludeTerms])

  // ============================================
  // FILTERED KEYWORDS (with memoization)
  // ============================================
  const filteredKeywords = useMemo(() => {
    return applyAllFilters(MOCK_KEYWORDS, {
      filterText,
      matchType,
      volumeRange,
      kdRange,
      cpcRange,
      geoRange,
      selectedIntents,
      includeTerms,
      excludeTerms,
      hasWeakSpot,
      weakSpotTypes,
      selectedSerpFeatures,
      trendDirection,
      minTrendGrowth,
    })
  }, [
    filterText, matchType, volumeRange, kdRange, cpcRange, geoRange,
    selectedIntents, includeTerms, excludeTerms, hasWeakSpot, weakSpotTypes,
    selectedSerpFeatures, trendDirection, minTrendGrowth
  ])

  // ============================================
  // BULK ANALYZE HANDLER
  // ============================================
  const handleBulkAnalyze = useCallback((keywords: string[]) => {
    if (keywords.length === 0) return
    
    setIsSearching(true)
    
    // Simulate API call delay
    setTimeout(() => {
      if (keywords.length === 1) {
        router.push(`/dashboard/research/overview/${encodeURIComponent(keywords[0])}`)
      } else {
        // Store keywords in sessionStorage for bulk view
        sessionStorage.setItem('bulkKeywords', JSON.stringify(keywords))
        // TODO: Navigate to bulk results page when implemented
        alert(`Analyzing ${keywords.length} keywords... (API integration pending)`)
      }
      setIsSearching(false)
    }, 500)
  }, [router])

  // ============================================
  // SYNC URL PARAMS (for sharing)
  // ============================================
  useEffect(() => {
    const params = new URLSearchParams()
    if (filterText) params.set("q", filterText)
    if (selectedCountry?.code) params.set("country", selectedCountry.code)
    
    // Only update URL if we have params
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    // Replace state without triggering navigation
    window.history.replaceState(null, "", newUrl)
  }, [filterText, selectedCountry])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="flex flex-col min-h-full">
      {/* Header - Scrolls away */}
      <div className="px-0 sm:px-0 py-3 sm:py-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Keyword Magic</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Discover high-value keywords with competitive insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CountrySelector
              selectedCountry={selectedCountry}
              onSelect={setSelectedCountry}
              popularCountries={POPULAR_COUNTRIES}
              allCountries={ALL_COUNTRIES}
              open={countryOpen}
              onOpenChange={setCountryOpen}
            />
          </div>
        </div>
      </div>

      {/* Mode & Match Type Row */}
      <div className="py-2 sm:py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mode Toggle + Reset */}
          <div className="flex items-center gap-3">
            <BulkModeToggle value={bulkMode} onChange={setBulkMode} />
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
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
            <MatchTypeToggle value={matchType} onChange={setMatchType} />
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="py-2 sm:py-3 shrink-0 space-y-2">
        {bulkMode === "explore" ? (
          <>
            {/* Row 1: Search Input */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by keyword..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-9 h-9 bg-secondary/50 border-border"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ×
                </button>
              )}
            </div>

            {/* Row 2: Filter Popovers Only */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <VolumeFilter
                open={volumeOpen}
                onOpenChange={setVolumeOpen}
                tempRange={tempVolumeRange}
                onTempRangeChange={setTempVolumeRange}
                volumePreset={volumePreset}
                onPresetChange={setVolumePreset}
                onApply={() => { setVolumeRange(tempVolumeRange); setVolumeOpen(false) }}
              />

              <KDFilter
                open={kdOpen}
                onOpenChange={setKdOpen}
                tempRange={tempKdRange}
                onTempRangeChange={setTempKdRange}
                onApply={() => { setKdRange(tempKdRange); setKdOpen(false) }}
              />

              <IntentFilter
                open={intentOpen}
                onOpenChange={setIntentOpen}
                selectedIntents={selectedIntents}
                tempSelectedIntents={tempSelectedIntents}
                onToggleIntent={toggleIntent}
                onApply={() => { setSelectedIntents(tempSelectedIntents); setIntentOpen(false) }}
              />

              <CPCFilter
                open={cpcOpen}
                onOpenChange={setCpcOpen}
                tempRange={tempCpcRange}
                onTempRangeChange={setTempCpcRange}
                onApply={() => { setCpcRange(tempCpcRange); setCpcOpen(false) }}
              />

              <GeoFilter
                open={geoOpen}
                onOpenChange={setGeoOpen}
                tempRange={tempGeoRange}
                onTempRangeChange={setTempGeoRange}
                onApply={() => { setGeoRange(tempGeoRange); setGeoOpen(false) }}
              />

              <WeakSpotFilter
                open={weakSpotOpen}
                onOpenChange={setWeakSpotOpen}
                tempHasWeakSpot={tempHasWeakSpot}
                tempWeakSpotTypes={tempWeakSpotTypes}
                onTempHasWeakSpotChange={setTempHasWeakSpot}
                onToggleWeakSpotType={toggleWeakSpotType}
                onApply={() => { 
                  setHasWeakSpot(tempHasWeakSpot)
                  setWeakSpotTypes(tempWeakSpotTypes)
                  setWeakSpotOpen(false) 
                }}
              />

              <SerpFilter
                open={serpOpen}
                onOpenChange={setSerpOpen}
                selectedFeatures={selectedSerpFeatures}
                tempSelectedFeatures={tempSelectedSerpFeatures}
                onToggleFeature={toggleSerpFeature}
                onApply={() => { setSelectedSerpFeatures(tempSelectedSerpFeatures); setSerpOpen(false) }}
              />

              <TrendFilter
                open={trendOpen}
                onOpenChange={setTrendOpen}
                tempTrendDirection={tempTrendDirection}
                tempMinGrowth={tempMinTrendGrowth}
                onTempTrendDirectionChange={setTempTrendDirection}
                onTempMinGrowthChange={setTempMinTrendGrowth}
                onApply={() => { 
                  setTrendDirection(tempTrendDirection)
                  setMinTrendGrowth(tempMinTrendGrowth)
                  setTrendOpen(false) 
                }}
              />

              <IncludeExcludeFilter
                includeTerms={includeTerms}
                excludeTerms={excludeTerms}
                includeInput={includeInput}
                excludeInput={excludeInput}
                onIncludeInputChange={setIncludeInput}
                onExcludeInputChange={setExcludeInput}
                onAddIncludeTerm={addIncludeTerm}
                onAddExcludeTerm={addExcludeTerm}
                onRemoveIncludeTerm={removeIncludeTerm}
                onRemoveExcludeTerm={removeExcludeTerm}
              />
            </div>
          </>
        ) : (
          <BulkKeywordsInput
            value={bulkKeywords}
            onChange={setBulkKeywords}
            onAnalyze={handleBulkAnalyze}
          />
        )}
      </div>

      {/* Results Summary */}
      {(filterText || activeFilterCount > 0) && (
        <div className="flex items-center gap-2 pb-2 text-sm text-muted-foreground shrink-0">
          <span>
            Found <span className="font-medium text-foreground">{filteredKeywords.length}</span> keywords
            {filterText && (
              <> matching "<span className="font-medium text-foreground">{filterText}</span>"</>
            )}
          </span>
        </div>
      )}

      {/* Data Table - Sticky Card that fills viewport when scrolled */}
      <div 
        className="sticky top-0 bg-card border border-border rounded-lg shadow-sm overflow-hidden" 
        style={{ height: 'calc(100vh - 6rem)' }}
      >
        {isSearching ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <KeywordTable 
            keywords={filteredKeywords} 
            country={selectedCountry?.code}
          />
        )}
      </div>
    </div>
  )
}
