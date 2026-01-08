"use client"

// ============================================
// KEYWORD RESEARCH HEADER - Page Section
// ============================================
// Contains search bar, country selector, mode toggle, etc.
// Wired to fetchKeywords server action
// ============================================

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { Country, MatchType, BulkMode } from "../../types"
import { CountrySelector, BulkModeToggle, MatchTypeToggle } from "../index"
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "../../constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RotateCcw, Search, Loader2 } from "lucide-react"
import { useKeywordStore } from "../../store"
import { fetchKeywords } from "../../actions/fetch-keywords"

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
  // Local search input state
  const [seedKeyword, setSeedKeyword] = useState("")
  
  // Zustand store
  const setKeywords = useKeywordStore((state) => state.setKeywords)
  const setSearching = useKeywordStore((state) => state.setSearching)
  const isSearching = useKeywordStore((state) => state.loading.searching)
  
  // Handle search submission
  const handleSearch = useCallback(async () => {
    const query = seedKeyword.trim()
    
    if (!query) {
      toast.error("Please enter a keyword to search")
      return
    }
    
    // Set loading state
    setSearching(true)
    
    try {
      // Call server action
      const result = await fetchKeywords({
        query,
        country: selectedCountry?.code || "US",
      })
      
      // Check for success
      if (result?.data?.success && result?.data?.data) {
        setKeywords(result.data.data)
        toast.success(`Found ${result.data.data.length} keywords for "${query}"`)
      } else {
        // Handle validation or server errors
        const validationError =
          (result as unknown as { validationErrors?: { query?: { _errors?: string[] } } })
            ?.validationErrors?.query?._errors?.[0]

        const errorMessage = result?.serverError || validationError || "Failed to fetch keywords"
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("[handleSearch] Error:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setSearching(false)
    }
  }, [seedKeyword, selectedCountry, setKeywords, setSearching])
  
  // Handle Enter key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) {
      handleSearch()
    }
  }, [handleSearch, isSearching])

  return (
    <div className="flex flex-col gap-3 py-3 sm:py-4 border-b border-border/50">
      {/* Row 1: Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Enter a seed keyword (e.g., 'best crm software')..."
            value={seedKeyword}
            onChange={(e) => setSeedKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSearching}
            className="pl-9 pr-4 h-10 bg-muted/30 border-border/50 focus:bg-background"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !seedKeyword.trim()}
          className="h-10 px-6 gap-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Explore
            </>
          )}
        </Button>
      </div>
      
      {/* Row 2: Filters and controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
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

        {/* Right: Match type and filter reset */}
        {bulkMode === "explore" && (
          <div className="flex items-center gap-3">
            {/* Reset Button - LEFT side with RED color */}
            {activeFilterCount > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={onResetFilters}
                  className="text-xs font-medium gap-1.5 bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-600/20 dark:focus-visible:ring-red-600/40 dark:bg-red-600/80 dark:hover:bg-red-600/70"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset ({activeFilterCount})
                </Button>
                <div className="h-5 w-px bg-border/50" />
              </>
            )}
            
            <MatchTypeToggle
              value={matchType}
              onChange={onMatchTypeChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
