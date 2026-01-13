"use client"

// ============================================
// KEYWORD RESEARCH HEADER - Page Section
// ============================================
// Contains search bar, country selector, mode toggle, etc.
// Wired to fetchKeywords server action
// ============================================

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { Country, MatchType, BulkMode, SERPFeature } from "../../types"
import { CountrySelector, BulkModeToggle, MatchTypeToggle } from "../index"
import { POPULAR_COUNTRIES, ALL_COUNTRIES } from "../../constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RotateCcw, Search, Loader2 } from "lucide-react"
import { useKeywordStore } from "../../store"
import { bulkSearchKeywords } from "../../actions/fetch-keywords"

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

    // DEMO: guest users get mock results (no API/network)
    if (isGuest) {
      setSearching(true)
      try {
        const { MOCK_KEYWORDS } = await import("../../__mocks__/keyword-data")
        
        // First try to filter existing mock data
        let filtered = MOCK_KEYWORDS.filter((k) =>
          k.keyword.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 50)

        // If no matches, generate dynamic mock keywords based on query
        if (filtered.length === 0) {
          const suffixes = [
            "tools", "software", "guide", "tutorial", "alternatives", 
            "review", "pricing", "free", "best", "how to use",
            "vs competitors", "features", "comparison", "tips"
          ]
          const intents: (("I" | "C" | "T" | "N")[])[] = [["C"], ["I"], ["T"], ["C", "I"], ["T", "I"]]
          const serpOptions: SERPFeature[][] = [
            ["featured_snippet", "people_also_ask"],
            ["video_pack", "reviews"],
            ["shopping_ads", "ai_overview"],
            ["featured_snippet", "video_pack"],
            ["people_also_ask", "reviews", "ai_overview"]
          ]
          
          filtered = suffixes.map((suffix, idx) => {
            // ============================================
            // WEAK SPOT DETECTION FORMULA (Probability-Based)
            // ============================================
            // 
            // REAL API SIMULATION:
            // Each platform has independent probability of ranking in top 10
            // Based on keyword characteristics and search intent
            //
            // FORMULA:
            // P(Reddit)    = 40% for discussion keywords + 20% base = ~35% overall
            // P(Quora)     = 35% for question keywords + 15% base = ~25% overall  
            // P(Pinterest) = 45% for visual keywords + 10% base = ~20% overall
            //
            // Combined Probability (any platform): ~60%
            // P(All 3 together) = 0.35 * 0.25 * 0.20 = ~1.75% (rare but possible)
            // P(2 platforms)    = ~15% of keywords
            // P(1 platform)     = ~40% of keywords
            // P(none)           = ~40% of keywords
            //
            // SERP Position Formula (when present):
            // Position = floor(random * 10) + 1  → Range: 1-10
            // Lower position = better opportunity to outrank
            // ============================================
            
            // Seeded random for consistent demo data (based on keyword index)
            const seed = (idx * 7 + 13) % 100
            const seed2 = (idx * 11 + 17) % 100
            const seed3 = (idx * 13 + 19) % 100
            
            // Platform detection based on keyword characteristics
            const isDiscussionKeyword = suffix.includes("best") || suffix.includes("vs") || suffix.includes("review")
            const isQuestionKeyword = suffix.includes("how") || suffix.includes("what") || suffix.includes("why")
            const isVisualKeyword = suffix.includes("ideas") || suffix.includes("design") || suffix.includes("template")
            
            // Independent probability calculation (allows all 3 to be true)
            const redditThreshold = isDiscussionKeyword ? 60 : 35  // 60% for discussion, 35% base
            const quoraThreshold = isQuestionKeyword ? 55 : 25     // 55% for questions, 25% base
            const pinterestThreshold = isVisualKeyword ? 65 : 20   // 65% for visual, 20% base
            
            const hasReddit = seed < redditThreshold
            const hasQuora = seed2 < quoraThreshold
            const hasPinterest = seed3 < pinterestThreshold
            
            // Generate SERP position (1-10) - lower is better opportunity
            const redditRank = hasReddit ? (seed % 10) + 1 : null
            const quoraRank = hasQuora ? (seed2 % 10) + 1 : null
            const pinterestRank = hasPinterest ? (seed3 % 10) + 1 : null
            
            return {
              id: 1000 + idx,
              keyword: `${query} ${suffix}`,
              intent: intents[idx % intents.length],
              volume: Math.floor(Math.random() * 50000) + 500,
              trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
              weakSpots: {
                reddit: redditRank,
                quora: quoraRank,
                pinterest: pinterestRank,
              },
              kd: Math.floor(Math.random() * 80) + 10,
              cpc: Math.round((Math.random() * 10 + 0.5) * 100) / 100,
              serpFeatures: serpOptions[idx % serpOptions.length],
              geoScore: Math.floor(Math.random() * 100),
            }
          })
        }

        setKeywords(filtered)
        toast.success(`Found ${filtered.length} keywords for "${query}"`, {
          description: "Demo mode — testing with mock data.",
        })
      } finally {
        setSearching(false)
      }
      return
    }

    // Set loading state
    setSearching(true)

    try {
      // Call credit-gated server action for authenticated users
      const result = await bulkSearchKeywords({
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

        const serverError = result?.serverError
        const errorMessage = serverError || validationError || "Failed to fetch keywords"

        if (typeof serverError === "string" && serverError.toLowerCase().includes("insufficient")) {
          toast.error("Insufficient credits", {
            description: "This search uses 1 credit.",
          })
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error("[handleSearch] Error:", error)
      const message = error instanceof Error ? error.message : "An unexpected error occurred"

      if (message.toLowerCase().includes("insufficient")) {
        toast.error("Insufficient credits", {
          description: "This search uses 1 credit.",
        })
      } else {
        toast.error(message)
      }
    } finally {
      setSearching(false)
    }
  }, [isGuest, seedKeyword, selectedCountry, setKeywords, setSearching])
  
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
