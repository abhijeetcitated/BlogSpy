"use client"

// ============================================
// KEYWORD RESEARCH - Main Component (Zustand Version)
// ============================================
// Uses Zustand for centralized state management
// Split into smaller sub-components
// Supports Guest Mode for PLG flow
// ============================================

import React, { useMemo, useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import { createBrowserClient } from "@supabase/ssr"
import { AlertCircle, Sparkles } from "lucide-react"

// Zustand store
import { useKeywordStore, type KeywordFilters } from "./store"

// Feature imports
import type { Country, MatchType, BulkMode, SERPFeature } from "./types"
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "./constants"
import { applyAllFilters } from "./utils"
import { 
  BulkKeywordsInput,
  VolumeFilter,
  KDFilter,
  IntentFilter,
  CPCFilter,
  GeoFilter,
  WeakSpotFilter,
  SerpFilter,
  TrendFilter,
  IncludeExcludeFilter,
} from "./components"

// Sub-components
import {
  KeywordResearchHeader,
  KeywordResearchSearch,
  KeywordResearchResults,
} from "./components/page-sections"

// ============================================
// HELPER: Count active filters
// ============================================
function getActiveFilterCount(filters: {
  volumeRange: [number, number]
  kdRange: [number, number]
  cpcRange: [number, number]
  geoRange: [number, number]
  selectedIntents: string[]
  selectedSerpFeatures: string[]
  includeTerms: string[]
  excludeTerms: string[]
  trendDirection: string | null
  weakSpotToggle: string
}): number {
  let count = 0
  if (filters.volumeRange[0] > 0 || filters.volumeRange[1] < 1000000) count++
  if (filters.kdRange[0] > 0 || filters.kdRange[1] < 100) count++
  if (filters.cpcRange[0] > 0 || filters.cpcRange[1] < 100) count++
  if (filters.geoRange[0] > 0 || filters.geoRange[1] < 100) count++
  if (filters.selectedIntents.length > 0) count++
  if (filters.selectedSerpFeatures.length > 0) count++
  if (filters.includeTerms.length > 0) count++
  if (filters.excludeTerms.length > 0) count++
  if (filters.trendDirection) count++
  if (filters.weakSpotToggle !== "all") count++
  return count
}

export function KeywordResearchContent() {
  // ============================================
  // GUEST MODE CHECK (PLG Flow)
  // ============================================
  const [isGuest, setIsGuest] = useState(true) // Default to guest
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
          const { data: { user } } = await supabase.auth.getUser()
          setIsGuest(!user)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsGuest(true)
      }
    }
    checkAuth()
  }, [])

  // ============================================
  // URL PARAMS (for sharing/bookmarking)
  // ============================================
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize from URL params if present
  const initialSearch = searchParams.get("q") || ""
  const initialCountryCode = searchParams.get("country") || null
  
  // Find initial country
  const initialCountry = useMemo(() => {
    if (initialCountryCode) {
      const all = [...POPULAR_COUNTRIES, ...ALL_COUNTRIES]
      return all.find(c => c.code === initialCountryCode) || POPULAR_COUNTRIES[0]
    }
    return POPULAR_COUNTRIES[0] // Default to US
  }, [initialCountryCode])

  // ============================================
  // ZUSTAND STORE
  // ============================================
  const {
    // Data
    keywords: storeKeywords,
    
    // Search state
    search,
    setSeedKeyword,
    setCountry,
    setMode,
    setBulkKeywords,
    
    // Filters
    filters,
    setFilter,
    setFilters,
    resetFilters,
    
    // Loading
    loading,
    setSearching,
  } = useKeywordStore()
  
  // Local UI state for country popover
  const [countryOpen, setCountryOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(initialCountry)

  // ============================================
  // DERIVED STATE
  // ============================================
  const activeFilterCount = useMemo(() => getActiveFilterCount(filters), [filters])
  
  // Debounce filter text for better performance (300ms delay)
  const debouncedFilterText = useDebounce(filters.searchText, 300)

  // ============================================
  // FILTERED KEYWORDS (with memoization)
  // ============================================
  const filteredKeywords = useMemo(() => {
    // Use keywords from store (populated by fetchKeywords action)
    return applyAllFilters(storeKeywords, {
      filterText: debouncedFilterText,
      matchType: filters.matchType,
      volumeRange: filters.volumeRange,
      kdRange: filters.kdRange,
      cpcRange: filters.cpcRange,
      geoRange: filters.geoRange,
      selectedIntents: filters.selectedIntents,
      includeTerms: filters.includeTerms,
      excludeTerms: filters.excludeTerms,
      hasWeakSpot: filters.weakSpotToggle !== "all" ? filters.weakSpotToggle === "with" : undefined,
      weakSpotTypes: filters.weakSpotTypes,
      selectedSerpFeatures: filters.selectedSerpFeatures,
      trendDirection: filters.trendDirection as "up" | "down" | "stable" | null,
      minTrendGrowth: filters.minTrendGrowth,
    })
  }, [
    storeKeywords, debouncedFilterText, filters.matchType, filters.volumeRange, filters.kdRange,
    filters.cpcRange, filters.geoRange, filters.selectedIntents, filters.includeTerms,
    filters.excludeTerms, filters.weakSpotToggle, filters.weakSpotTypes,
    filters.selectedSerpFeatures, filters.trendDirection, filters.minTrendGrowth
  ])

  // ============================================
  // BULK ANALYZE HANDLER
  // ============================================
  const bulkAnalyzeTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (bulkAnalyzeTimerRef.current) {
        clearTimeout(bulkAnalyzeTimerRef.current)
      }
    }
  }, [])
  
  const handleBulkAnalyze = useCallback((keywords: string[]) => {
    if (keywords.length === 0) return
    
    setSearching(true)
    
    // Simulate API call delay
    bulkAnalyzeTimerRef.current = setTimeout(() => {
      if (keywords.length === 1) {
        router.push(`/dashboard/research/overview/${encodeURIComponent(keywords[0])}`)
      } else {
        // Store keywords in sessionStorage for bulk view
        try {
          sessionStorage.setItem('bulkKeywords', JSON.stringify(keywords))
        } catch {
          // sessionStorage may be blocked in privacy mode
        }
        toast.info(`Analyzing ${keywords.length} keywords... (API integration pending)`)
      }
      setSearching(false)
    }, 500)
  }, [router, setSearching])

  // ============================================
  // SYNC URL PARAMS (for sharing)
  // ============================================
  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return
    
    const params = new URLSearchParams()
    if (filters.searchText) params.set("q", filters.searchText)
    if (selectedCountry?.code) params.set("country", selectedCountry.code)
    
    // Only update URL if we have params
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    // Replace state without triggering navigation
    window.history.replaceState(null, "", newUrl)
  }, [filters.searchText, selectedCountry])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* 🎭 DEMO MODE BANNER (PLG) */}
      {isGuest && (
        <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20 shrink-0">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            Demo Mode
          </span>
          <span className="text-xs text-muted-foreground">
            — Viewing sample data. Sign up to unlock full features, export, and save your research.
          </span>
          <div className="ml-auto">
            <a 
              href="/register" 
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              Create Free Account →
            </a>
          </div>
        </div>
      )}
      
      <KeywordResearchHeader
        selectedCountry={selectedCountry}
        countryOpen={countryOpen}
        onCountryOpenChange={setCountryOpen}
        onCountrySelect={(country: Country | null) => {
          setSelectedCountry(country)
          setCountry(country?.code || "US")
        }}
        bulkMode={search.mode}
        onBulkModeChange={(mode: BulkMode) => setMode(mode)}
        matchType={filters.matchType}
        onMatchTypeChange={(type: MatchType) => setFilter("matchType", type)}
        activeFilterCount={activeFilterCount}
        onResetFilters={resetFilters}
      />

      {/* Filters Bar */}
      <div className="py-2 sm:py-3 shrink-0 space-y-2">
        {search.mode === "explore" ? (
          <>
            {/* Row 1: Search Input */}
            <KeywordResearchSearch
              filterText={filters.searchText}
              onFilterTextChange={(text: string) => setFilter("searchText", text)}
            />

            {/* Row 2: Filter Popovers */}
            <KeywordResearchFiltersWrapper 
              filters={filters} 
              setFilter={setFilter}
            />
          </>
        ) : (
          <BulkKeywordsInput
            value={search.bulkKeywords}
            onChange={(value: string) => setBulkKeywords(value)}
            onAnalyze={handleBulkAnalyze}
          />
        )}
      </div>

      <KeywordResearchResults
        filteredKeywords={filteredKeywords}
        filterText={filters.searchText}
        activeFilterCount={activeFilterCount}
        isSearching={loading.searching}
        country={selectedCountry?.code}
        isGuest={isGuest}
      />
    </div>
  )
}

// ============================================
// WRAPPER FOR FILTERS (with proper popover state management)
// ============================================

function KeywordResearchFiltersWrapper({ 
  filters,
  setFilter 
}: { 
  filters: KeywordFilters
  setFilter: <K extends keyof KeywordFilters>(key: K, value: KeywordFilters[K]) => void
}) {
  // Local popover open states
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [kdOpen, setKdOpen] = useState(false)
  const [cpcOpen, setCpcOpen] = useState(false)
  const [intentOpen, setIntentOpen] = useState(false)
  const [geoOpen, setGeoOpen] = useState(false)
  const [serpOpen, setSerpOpen] = useState(false)
  const [weakSpotOpen, setWeakSpotOpen] = useState(false)
  const [trendOpen, setTrendOpen] = useState(false)

  // Temp states for filters (before apply)
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>(filters.volumeRange)
  const [tempKdRange, setTempKdRange] = useState<[number, number]>(filters.kdRange)
  const [tempCpcRange, setTempCpcRange] = useState<[number, number]>(filters.cpcRange)
  const [tempGeoRange, setTempGeoRange] = useState<[number, number]>(filters.geoRange)
  const [tempSelectedIntents, setTempSelectedIntents] = useState<string[]>(filters.selectedIntents)
  const [tempSelectedSerpFeatures, setTempSelectedSerpFeatures] = useState<SERPFeature[]>(filters.selectedSerpFeatures)
  const [tempWeakSpotToggle, setTempWeakSpotToggle] = useState<"all" | "with" | "without">(filters.weakSpotToggle)
  const [tempWeakSpotTypes, setTempWeakSpotTypes] = useState<string[]>(filters.weakSpotTypes)
  const [tempTrendDirection, setTempTrendDirection] = useState<"up" | "down" | "stable" | null>(filters.trendDirection)
  const [tempMinTrendGrowth, setTempMinTrendGrowth] = useState<number | null>(filters.minTrendGrowth)
  const [volumePreset, setVolumePreset] = useState<string | null>(null)

  // Include/Exclude inputs
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")

  // Sync temp states when filters change externally
  useEffect(() => {
    setTempVolumeRange(filters.volumeRange)
    setTempKdRange(filters.kdRange)
    setTempCpcRange(filters.cpcRange)
    setTempGeoRange(filters.geoRange)
    setTempSelectedIntents(filters.selectedIntents)
    setTempSelectedSerpFeatures(filters.selectedSerpFeatures)
    setTempWeakSpotToggle(filters.weakSpotToggle)
    setTempWeakSpotTypes(filters.weakSpotTypes)
    setTempTrendDirection(filters.trendDirection)
    setTempMinTrendGrowth(filters.minTrendGrowth)
  }, [filters])

  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-1 px-1">
      <VolumeFilter
        open={volumeOpen}
        onOpenChange={setVolumeOpen}
        tempRange={tempVolumeRange}
        onTempRangeChange={setTempVolumeRange}
        volumePreset={volumePreset}
        onPresetChange={setVolumePreset}
        onApply={() => {
          setFilter("volumeRange", tempVolumeRange)
          setVolumeOpen(false)
        }}
      />

      <KDFilter
        open={kdOpen}
        onOpenChange={setKdOpen}
        tempRange={tempKdRange}
        onTempRangeChange={setTempKdRange}
        onApply={() => {
          setFilter("kdRange", tempKdRange)
          setKdOpen(false)
        }}
      />

      <IntentFilter
        open={intentOpen}
        onOpenChange={setIntentOpen}
        selectedIntents={filters.selectedIntents}
        tempSelectedIntents={tempSelectedIntents}
        onToggleIntent={(intent) => {
          setTempSelectedIntents(prev => 
            prev.includes(intent) 
              ? prev.filter(i => i !== intent) 
              : [...prev, intent]
          )
        }}
        onApply={() => {
          setFilter("selectedIntents", tempSelectedIntents)
          setIntentOpen(false)
        }}
      />

      <CPCFilter
        open={cpcOpen}
        onOpenChange={setCpcOpen}
        tempRange={tempCpcRange}
        onTempRangeChange={setTempCpcRange}
        onApply={() => {
          setFilter("cpcRange", tempCpcRange)
          setCpcOpen(false)
        }}
      />

      <GeoFilter
        open={geoOpen}
        onOpenChange={setGeoOpen}
        tempRange={tempGeoRange}
        onTempRangeChange={setTempGeoRange}
        onApply={() => {
          setFilter("geoRange", tempGeoRange)
          setGeoOpen(false)
        }}
      />

      <WeakSpotFilter
        open={weakSpotOpen}
        onOpenChange={setWeakSpotOpen}
        tempHasWeakSpot={tempWeakSpotToggle === "all" ? null : tempWeakSpotToggle === "with"}
        tempWeakSpotTypes={tempWeakSpotTypes}
        onTempHasWeakSpotChange={(value) => {
          setTempWeakSpotToggle(value === null ? "all" : value ? "with" : "without")
        }}
        onToggleWeakSpotType={(type) => {
          setTempWeakSpotTypes(prev =>
            prev.includes(type)
              ? prev.filter(t => t !== type)
              : [...prev, type]
          )
        }}
        onApply={() => {
          setFilter("weakSpotToggle", tempWeakSpotToggle)
          setFilter("weakSpotTypes", tempWeakSpotTypes)
          setWeakSpotOpen(false)
        }}
      />

      <SerpFilter
        open={serpOpen}
        onOpenChange={setSerpOpen}
        selectedFeatures={filters.selectedSerpFeatures}
        tempSelectedFeatures={tempSelectedSerpFeatures}
        onToggleFeature={(feature) => {
          setTempSelectedSerpFeatures(prev =>
            prev.includes(feature)
              ? prev.filter(f => f !== feature)
              : [...prev, feature]
          )
        }}
        onApply={() => {
          setFilter("selectedSerpFeatures", tempSelectedSerpFeatures)
          setSerpOpen(false)
        }}
      />

      <TrendFilter
        open={trendOpen}
        onOpenChange={setTrendOpen}
        tempTrendDirection={tempTrendDirection}
        tempMinGrowth={tempMinTrendGrowth}
        onTempTrendDirectionChange={setTempTrendDirection}
        onTempMinGrowthChange={setTempMinTrendGrowth}
        onApply={() => {
          setFilter("trendDirection", tempTrendDirection)
          setFilter("minTrendGrowth", tempMinTrendGrowth)
          setTrendOpen(false)
        }}
      />

      <IncludeExcludeFilter
        includeTerms={filters.includeTerms}
        excludeTerms={filters.excludeTerms}
        includeInput={includeInput}
        excludeInput={excludeInput}
        onIncludeInputChange={setIncludeInput}
        onExcludeInputChange={setExcludeInput}
        onAddIncludeTerm={() => {
          if (includeInput.trim()) {
            setFilter("includeTerms", [...filters.includeTerms, includeInput.trim()])
            setIncludeInput("")
          }
        }}
        onAddExcludeTerm={() => {
          if (excludeInput.trim()) {
            setFilter("excludeTerms", [...filters.excludeTerms, excludeInput.trim()])
            setExcludeInput("")
          }
        }}
        onRemoveIncludeTerm={(term) => {
          setFilter("includeTerms", filters.includeTerms.filter(t => t !== term))
        }}
        onRemoveExcludeTerm={(term) => {
          setFilter("excludeTerms", filters.excludeTerms.filter(t => t !== term))
        }}
      />
    </div>
  )
}
