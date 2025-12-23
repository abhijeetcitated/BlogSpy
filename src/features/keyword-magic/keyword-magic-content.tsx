"use client"

// ============================================
// KEYWORD MAGIC - Main Component (Refactored)
// ============================================
// Uses useReducer for centralized state management
// Split into smaller sub-components
// ============================================

import { useReducer, useMemo, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

// State management
import {
  keywordMagicReducer,
  createInitialState,
  getActiveFilterCount,
} from "./state"

// Feature imports
import type { Country } from "./types"
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "./constants"
import { MOCK_KEYWORDS } from "./__mocks__"
import { applyAllFilters } from "./utils"
import { BulkKeywordsInput } from "./components"

// Sub-components
import {
  KeywordMagicHeader,
  KeywordMagicSearch,
  KeywordMagicFilters,
  KeywordMagicResults,
} from "./components/keyword-magic"

export function KeywordMagicContent() {
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
  // REDUCER STATE
  // ============================================
  const [state, dispatch] = useReducer(
    keywordMagicReducer,
    { initialSearch, initialCountry },
    ({ initialSearch, initialCountry }) => createInitialState(initialSearch, initialCountry)
  )

  // ============================================
  // DERIVED STATE
  // ============================================
  const activeFilterCount = useMemo(() => getActiveFilterCount(state), [state])
  
  // Debounce filter text for better performance (300ms delay)
  const debouncedFilterText = useDebounce(state.filterText, 300)

  // ============================================
  // FILTERED KEYWORDS (with memoization)
  // ============================================
  const filteredKeywords = useMemo(() => {
    return applyAllFilters(MOCK_KEYWORDS, {
      filterText: debouncedFilterText,
      matchType: state.matchType,
      volumeRange: state.volumeRange,
      kdRange: state.kdRange,
      cpcRange: state.cpcRange,
      geoRange: state.geoRange,
      selectedIntents: state.selectedIntents,
      includeTerms: state.includeTerms,
      excludeTerms: state.excludeTerms,
      hasWeakSpot: state.hasWeakSpot,
      weakSpotTypes: state.weakSpotTypes,
      selectedSerpFeatures: state.selectedSerpFeatures,
      trendDirection: state.trendDirection,
      minTrendGrowth: state.minTrendGrowth,
    })
  }, [
    debouncedFilterText, state.matchType, state.volumeRange, state.kdRange,
    state.cpcRange, state.geoRange, state.selectedIntents, state.includeTerms,
    state.excludeTerms, state.hasWeakSpot, state.weakSpotTypes,
    state.selectedSerpFeatures, state.trendDirection, state.minTrendGrowth
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
    
    dispatch({ type: "SET_IS_SEARCHING", payload: true })
    
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
      dispatch({ type: "SET_IS_SEARCHING", payload: false })
    }, 500)
  }, [router])

  // ============================================
  // SYNC URL PARAMS (for sharing)
  // ============================================
  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return
    
    const params = new URLSearchParams()
    if (state.filterText) params.set("q", state.filterText)
    if (state.selectedCountry?.code) params.set("country", state.selectedCountry.code)
    
    // Only update URL if we have params
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    // Replace state without triggering navigation
    window.history.replaceState(null, "", newUrl)
  }, [state.filterText, state.selectedCountry])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="flex flex-col min-h-full">
      <KeywordMagicHeader
        selectedCountry={state.selectedCountry}
        countryOpen={state.countryOpen}
        onCountryOpenChange={(open) => dispatch({ type: "SET_COUNTRY_OPEN", payload: open })}
        onCountrySelect={(country: Country | null) => dispatch({ type: "SET_SELECTED_COUNTRY", payload: country })}
        bulkMode={state.bulkMode}
        onBulkModeChange={(mode) => dispatch({ type: "SET_BULK_MODE", payload: mode })}
        matchType={state.matchType}
        onMatchTypeChange={(type) => dispatch({ type: "SET_MATCH_TYPE", payload: type })}
        activeFilterCount={activeFilterCount}
        onResetFilters={() => dispatch({ type: "RESET_ALL_FILTERS" })}
      />

      {/* Filters Bar */}
      <div className="py-2 sm:py-3 shrink-0 space-y-2">
        {state.bulkMode === "explore" ? (
          <>
            {/* Row 1: Search Input */}
            <KeywordMagicSearch
              filterText={state.filterText}
              onFilterTextChange={(text) => dispatch({ type: "SET_FILTER_TEXT", payload: text })}
            />

            {/* Row 2: Filter Popovers */}
            <KeywordMagicFilters state={state} dispatch={dispatch} />
          </>
        ) : (
          <BulkKeywordsInput
            value={state.bulkKeywords}
            onChange={(value) => dispatch({ type: "SET_BULK_KEYWORDS", payload: value })}
            onAnalyze={handleBulkAnalyze}
          />
        )}
      </div>

      <KeywordMagicResults
        filteredKeywords={filteredKeywords}
        filterText={state.filterText}
        activeFilterCount={activeFilterCount}
        isSearching={state.isSearching}
        country={state.selectedCountry?.code}
      />
    </div>
  )
}
