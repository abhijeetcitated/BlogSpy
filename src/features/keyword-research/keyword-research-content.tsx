"use client"

// ============================================
// KEYWORD RESEARCH - Main Component (Zustand Version)
// ============================================
// Uses Zustand for centralized state management
// Split into smaller sub-components
// Supports Guest Mode for PLG flow
// ============================================

import React, { useMemo, useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import { Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

// Zustand store
import { useKeywordStore, type KeywordFilters } from "./store"
import { normalizeCountryCode } from "./utils/country-normalizer"
import { bulkSearchKeywords } from "./actions/fetch-keywords"
import { getFilterPresets } from "./actions/filter-presets"

// Feature imports
import type { Country, MatchType, BulkMode, Keyword } from "./types"
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "./constants"
import { applyAllFilters } from "./utils"
import { applyFilters as applyEngineFilters } from "./utils/filter-logic"
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
  includeKeywords: string[]
  excludeKeywords: string[]
  trendDirection: string | null
  selectedTrend: string[]
  minTrendGrowth: number
  weakSpotToggle: string
}): number {
  let count = 0
  if (filters.volumeRange[0] > 0 || filters.volumeRange[1] < 10000000) count++
  if (filters.kdRange[0] > 0 || filters.kdRange[1] < 100) count++
  if (filters.cpcRange[0] > 0 || filters.cpcRange[1] < 100) count++
  if (filters.geoRange[0] > 0 || filters.geoRange[1] < 100) count++
  if (filters.selectedIntents.length > 0) count++
  if (filters.selectedSerpFeatures.length > 0) count++
  if (filters.includeKeywords.length > 0 || filters.includeTerms.length > 0) count++
  if (filters.excludeKeywords.length > 0 || filters.excludeTerms.length > 0) count++
  const hasTrendFilter =
    filters.selectedTrend.length > 0 ||
    filters.minTrendGrowth > 0 ||
    (!!filters.trendDirection && filters.selectedTrend.length === 0)
  if (hasTrendFilter) count++
  if (filters.weakSpotToggle !== "all") count++
  return count
}

interface KeywordResearchContentProps {
  initialKeywords?: Keyword[]
}

export function KeywordResearchContent({ initialKeywords = [] }: KeywordResearchContentProps) {
  // ============================================
  // GUEST MODE CHECK (PLG Flow)
  // ============================================
  // IMPORTANT: Do not run an extra Supabase network call here.
  // Use the global auth context to avoid slowing down first page load.
  const { isAuthenticated } = useAuth()
  const isGuest = !isAuthenticated

  // ============================================
  // URL PARAMS (for sharing/bookmarking)
  // ============================================
  const searchParams = useSearchParams()

  // Initialize from URL params if present
  const initialSearch = searchParams.get("q") || ""
  const initialCountryCodeRaw = searchParams.get("country") || null

  // Normalize the URL country param (UK → GB) before matching.
  // This prevents older shared URLs (?country=UK) from breaking once we standardized on GB.
  const initialCountryCode = useMemo(() => {
    if (!initialCountryCodeRaw) return null

    try {
      // normalizeCountryCode also trims/uppercases/validates.
      return normalizeCountryCode(initialCountryCodeRaw)
    } catch {
      return null
    }
  }, [initialCountryCodeRaw])

  // ============================================
  // SMART COUNTRY DETECTION
  // ============================================
  // Priority: 1. URL Param -> 2. Local Storage -> 3. System Timezone -> 4. Default (US)
  const initialCountry = useMemo(() => {
    // 1. URL Param (Highest Priority)
    if (initialCountryCode) {
      const all = [...POPULAR_COUNTRIES, ...ALL_COUNTRIES]
      return all.find((c) => c.code === initialCountryCode) || POPULAR_COUNTRIES[0]
    }

    // 2. Local Storage (Client-side only)
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("blogspy_last_country")
        if (cached) {
          const all = [...POPULAR_COUNTRIES, ...ALL_COUNTRIES]
          const found = all.find((c) => c.code === cached)
          if (found) return found
        }
      } catch (e) {
        // Ignore storage errors
      }
    }

    // 3. System Timezone (Heuristic)
    if (typeof window !== "undefined") {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (tz.includes("Calcutta") || tz.includes("Kolkata") || tz.includes("India")) {
          return ALL_COUNTRIES.find(c => c.code === "IN") || POPULAR_COUNTRIES[0]
        }
        if (tz.includes("London") || tz.includes("Europe/London")) {
          return POPULAR_COUNTRIES.find(c => c.code === "GB") || POPULAR_COUNTRIES[0]
        }
        // Add more heuristics as needed
      } catch (e) {
        // Ignore timezone errors
      }
    }

    // 4. Default Fallback
    return POPULAR_COUNTRIES[0] // US
  }, [initialCountryCode])

  // ============================================
  // ZUSTAND STORE
  // ============================================
  const {
    // Data
    keywords: storeKeywords,
    setKeywords,
    setCredits,

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
    setSearchQuery,
    setPresets,
    applyPreset,

    // Loading
    loading,
    setSearching,
  } = useKeywordStore()

  // Local UI state for country popover
  const [countryOpen, setCountryOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(initialCountry)
  const [filtersPopoverOpen, setFiltersPopoverOpen] = useState(false)

  // Temporary mock bridge: hydrate store when empty.
  useEffect(() => {
    if (storeKeywords.length === 0 && initialKeywords.length > 0) {
      setKeywords(initialKeywords)
    }
  }, [initialKeywords, setKeywords, storeKeywords.length])

  // Persist country selection
  useEffect(() => {
    if (selectedCountry?.code) {
      localStorage.setItem("blogspy_last_country", selectedCountry.code)
    }
  }, [selectedCountry])

  // ============================================
  // DEMO MODE
  // ============================================
  // Demo (guest) should not auto-populate keywords on page load.
  // Keywords appear only after the user runs a seed search in the header.

  // ============================================
  // DERIVED STATE
  // ============================================
  const activeFilterCount = useMemo(() => getActiveFilterCount(filters), [filters])

  // Debounce filter text for better performance (300ms delay)
  const debouncedFilterText = useDebounce(filters.searchText, 300)

  // ============================================
  // FILTERED KEYWORDS (with memoization)
  // ============================================
  const engineFilteredKeywords = useMemo(() => {
    return applyEngineFilters(storeKeywords, {
      volumeRange: filters.volumeRange,
      kdRange: filters.kdRange,
      cpcRange: filters.cpcRange,
      geoRange: filters.geoRange,
      selectedIntents: filters.selectedIntents,
      selectedSerpFeatures: filters.selectedSerpFeatures,
      includeKeywords: filters.includeKeywords,
      excludeKeywords: filters.excludeKeywords,
      weakSpotTypes: filters.weakSpotTypes,
      selectedTrend: filters.selectedTrend,
      minTrendGrowth: filters.minTrendGrowth,
    })
  }, [
    storeKeywords,
    filters.volumeRange,
    filters.kdRange,
    filters.cpcRange,
    filters.geoRange,
    filters.selectedIntents,
    filters.selectedSerpFeatures,
    filters.includeKeywords,
    filters.excludeKeywords,
    filters.weakSpotTypes,
    filters.selectedTrend,
    filters.minTrendGrowth,
  ])

  const filteredKeywords = useMemo(() => {
    // Use keywords from store (populated by fetchKeywords action)
    return applyAllFilters(engineFilteredKeywords, {
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
    engineFilteredKeywords, debouncedFilterText, filters.matchType, filters.volumeRange, filters.kdRange,
    filters.cpcRange, filters.geoRange, filters.selectedIntents, filters.includeTerms,
    filters.excludeTerms, filters.weakSpotToggle, filters.weakSpotTypes,
    filters.selectedSerpFeatures, filters.trendDirection, filters.minTrendGrowth
  ])

  // ============================================
  // BULK ANALYZE HANDLER
  // ============================================
  const { executeAsync: executeBulk } = useAction(bulkSearchKeywords)
  const { executeAsync: executeFetchPresets } = useAction(getFilterPresets)
  const [presetsLoaded, setPresetsLoaded] = useState(false)
  const defaultPresetApplied = useRef(false)

  const handleBulkAnalyze = useCallback(
    async (keywords: string[]) => {
      if (keywords.length === 0) {
        toast.error("Please enter at least one keyword.")
        return
      }

      if (isGuest) {
        toast.info("Sign up to unlock bulk analysis.")
        return
      }

      setSearching(true)
      const startedAt = Date.now()
      const minDelayMs = 2500

      try {
        const idempotencyKey = crypto.randomUUID()
        const result = await executeBulk({
          keywords,
          country: search.country || "US",
          matchType: filters.matchType,
          idempotency_key: idempotencyKey,
        })

        const serverError =
          typeof result?.serverError === "string" ? result.serverError : undefined
        if (serverError) {
          if (serverError === "INSUFFICIENT_CREDITS") {
            toast.error("You need more credits")
            return
          }
          if (serverError === "PLG_LOGIN_REQUIRED") {
            toast.error("Please sign in to analyze keywords.")
            return
          }
          if (serverError === "GOOGLE_BUSY_REFUNDED") {
            toast.error("Connection error. Your credits have been refunded.")
            return
          }
          toast.error(serverError)
          return
        }

        const keywordErrors = result?.validationErrors?.keywords
        const keywordsValidation = Array.isArray(keywordErrors)
          ? keywordErrors.find((entry) => entry?._errors?.length)?._errors?.[0]
          : keywordErrors?._errors?.[0]
        const validationMessage =
          keywordsValidation ?? result?.validationErrors?.idempotency_key?._errors?.[0]
        if (validationMessage) {
          toast.error(validationMessage)
          return
        }

        if (!result?.data || result.data.success !== true) {
          toast.error("Failed to analyze keywords")
          return
        }

        const elapsed = Date.now() - startedAt
        if (elapsed < minDelayMs) {
          await new Promise((resolve) => setTimeout(resolve, minDelayMs - elapsed))
        }

        setKeywords(result.data.data)
        if (typeof result.data.balance === "number") {
          setCredits(result.data.balance)
        }

        toast.success(
          `Analyzed ${keywords.length} keywords successfully. ${keywords.length} credits deducted.`
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred"
        toast.error(message)
      } finally {
        setSearching(false)
      }
    },
    [executeBulk, filters.matchType, isGuest, search.country, setCredits, setKeywords, setSearching]
  )

  // ============================================
  // PRESET AUTO-APPLY (default preset)
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || presetsLoaded) return

    let cancelled = false

    void (async () => {
      const result = await executeFetchPresets({})
      if (cancelled) return

      setPresetsLoaded(true)

      if (result?.data?.success) {
        const presets = result.data.presets
        setPresets(presets)

        const defaultPreset = presets.find((preset) => preset.isDefault)
        if (defaultPreset && !defaultPresetApplied.current) {
          applyPreset(defaultPreset)
          defaultPresetApplied.current = true
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [applyPreset, executeFetchPresets, isAuthenticated, presetsLoaded, setPresets])

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

  // Reset popover scroll assist when leaving explore mode
  useEffect(() => {
    if (search.mode !== "explore" && filtersPopoverOpen) {
      setFiltersPopoverOpen(false)
    }
  }, [filtersPopoverOpen, search.mode])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full max-w-full overflow-x-hidden",
        filtersPopoverOpen ? "overflow-y-auto pb-[40vh]" : "overflow-hidden"
      )}
    >
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
        isGuest={isGuest}
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
              mode="filter"
              value={filters.searchText}
              onChange={(text: string) => setSearchQuery(text)}
            />

            {/* Row 2: Filter Popovers */}
            <KeywordResearchFiltersWrapper
              filters={filters}
              setFilter={setFilter}
              onAnyPopoverChange={setFiltersPopoverOpen}
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
  setFilter,
  onAnyPopoverChange,
  }: {
    filters: KeywordFilters
    setFilter: <K extends keyof KeywordFilters>(key: K, value: KeywordFilters[K]) => void
    onAnyPopoverChange?: (open: boolean) => void
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

  const anyPopoverOpen =
    volumeOpen ||
    kdOpen ||
    cpcOpen ||
    intentOpen ||
    geoOpen ||
    serpOpen ||
    weakSpotOpen ||
    trendOpen

  useEffect(() => {
    onAnyPopoverChange?.(anyPopoverOpen)
  }, [anyPopoverOpen, onAnyPopoverChange])

  // Temp states for filters (before apply)
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>(filters.volumeRange)
  const [tempKdRange, setTempKdRange] = useState<[number, number]>(filters.kdRange)
  const [tempCpcRange, setTempCpcRange] = useState<[number, number]>(filters.cpcRange)
    const [tempGeoRange, setTempGeoRange] = useState<[number, number]>(filters.geoRange)
    const [volumePreset, setVolumePreset] = useState<string | null>(null)

  // Sync temp states when filters change externally
  useEffect(() => {
    setTempVolumeRange(filters.volumeRange)
    setTempKdRange(filters.kdRange)
    setTempCpcRange(filters.cpcRange)
    setTempGeoRange(filters.geoRange)
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
        selectedTypes={filters.weakSpotTypes}
        weakSpotToggle={filters.weakSpotToggle}
      />

        <SerpFilter
          open={serpOpen}
          onOpenChange={setSerpOpen}
          selectedFeatures={filters.selectedSerpFeatures}
        />

      <TrendFilter
        open={trendOpen}
        onOpenChange={setTrendOpen}
      />

      <IncludeExcludeFilter />
    </div>
  )
}
