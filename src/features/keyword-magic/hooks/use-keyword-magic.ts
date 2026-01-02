"use client"

// ============================================
// KEYWORD MAGIC - Custom Hooks
// ============================================
// React hooks for keyword magic functionality
// ============================================

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import type { Keyword, MatchType, BulkMode, Country, FilterState, SERPFeature } from "../types"
import type { SortableField, KeywordResearchRequest } from "../types/api.types"
import { keywordMagicAPI } from "../services"
import { applyAllFilters } from "../utils"
import { MOCK_KEYWORDS } from "../__mocks__"
import {
  DEFAULT_VOLUME_RANGE,
  DEFAULT_KD_RANGE,
  DEFAULT_CPC_RANGE,
} from "../constants"

// ============================================
// FILTER STATE HOOK
// ============================================

export interface UseKeywordFiltersReturn {
  // Filter values (applied)
  volumeRange: [number, number]
  kdRange: [number, number]
  cpcRange: [number, number]
  selectedIntents: string[]
  includeTerms: string[]
  excludeTerms: string[]
  
  // Temp values (before apply)
  tempVolumeRange: [number, number]
  tempKdRange: [number, number]
  tempCpcRange: [number, number]
  tempSelectedIntents: string[]
  
  // Setters for temp values
  setTempVolumeRange: (range: [number, number]) => void
  setTempKdRange: (range: [number, number]) => void
  setTempCpcRange: (range: [number, number]) => void
  toggleTempIntent: (intent: string) => void
  
  // Include/Exclude
  includeInput: string
  excludeInput: string
  setIncludeInput: (value: string) => void
  setExcludeInput: (value: string) => void
  addIncludeTerm: () => void
  addExcludeTerm: () => void
  removeIncludeTerm: (term: string) => void
  removeExcludeTerm: (term: string) => void
  
  // Apply handlers
  applyVolumeFilter: () => void
  applyKdFilter: () => void
  applyCpcFilter: () => void
  applyIntentFilter: () => void
  
  // Reset
  resetAllFilters: () => void
  
  // Active filter count
  activeFilterCount: number
  
  // Check if any filter is active
  hasActiveFilters: boolean
}

export function useKeywordFilters(): UseKeywordFiltersReturn {
  // Applied filter states
  const [volumeRange, setVolumeRange] = useState<[number, number]>(DEFAULT_VOLUME_RANGE)
  const [kdRange, setKdRange] = useState<[number, number]>(DEFAULT_KD_RANGE)
  const [cpcRange, setCpcRange] = useState<[number, number]>(DEFAULT_CPC_RANGE)
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  const [includeTerms, setIncludeTerms] = useState<string[]>([])
  const [excludeTerms, setExcludeTerms] = useState<string[]>([])
  
  // Temp filter states (before apply)
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>(DEFAULT_VOLUME_RANGE)
  const [tempKdRange, setTempKdRange] = useState<[number, number]>(DEFAULT_KD_RANGE)
  const [tempCpcRange, setTempCpcRange] = useState<[number, number]>(DEFAULT_CPC_RANGE)
  const [tempSelectedIntents, setTempSelectedIntents] = useState<string[]>([])
  
  // Include/Exclude inputs
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")
  
  // Toggle intent in temp state
  const toggleTempIntent = useCallback((intent: string) => {
    setTempSelectedIntents((prev) =>
      prev.includes(intent)
        ? prev.filter((i) => i !== intent)
        : [...prev, intent]
    )
  }, [])
  
  // Add/Remove include terms
  const addIncludeTerm = useCallback(() => {
    const term = includeInput.trim()
    if (term && !includeTerms.includes(term)) {
      setIncludeTerms((prev) => [...prev, term])
      setIncludeInput("")
    }
  }, [includeInput, includeTerms])
  
  const removeIncludeTerm = useCallback((term: string) => {
    setIncludeTerms((prev) => prev.filter((t) => t !== term))
  }, [])
  
  // Add/Remove exclude terms
  const addExcludeTerm = useCallback(() => {
    const term = excludeInput.trim()
    if (term && !excludeTerms.includes(term)) {
      setExcludeTerms((prev) => [...prev, term])
      setExcludeInput("")
    }
  }, [excludeInput, excludeTerms])
  
  const removeExcludeTerm = useCallback((term: string) => {
    setExcludeTerms((prev) => prev.filter((t) => t !== term))
  }, [])
  
  // Apply filters
  const applyVolumeFilter = useCallback(() => {
    setVolumeRange(tempVolumeRange)
  }, [tempVolumeRange])
  
  const applyKdFilter = useCallback(() => {
    setKdRange(tempKdRange)
  }, [tempKdRange])
  
  const applyCpcFilter = useCallback(() => {
    setCpcRange(tempCpcRange)
  }, [tempCpcRange])
  
  const applyIntentFilter = useCallback(() => {
    setSelectedIntents(tempSelectedIntents)
  }, [tempSelectedIntents])
  
  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setVolumeRange(DEFAULT_VOLUME_RANGE)
    setKdRange(DEFAULT_KD_RANGE)
    setCpcRange(DEFAULT_CPC_RANGE)
    setSelectedIntents([])
    setIncludeTerms([])
    setExcludeTerms([])
    setTempVolumeRange(DEFAULT_VOLUME_RANGE)
    setTempKdRange(DEFAULT_KD_RANGE)
    setTempCpcRange(DEFAULT_CPC_RANGE)
    setTempSelectedIntents([])
    setIncludeInput("")
    setExcludeInput("")
  }, [])
  
  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (volumeRange[0] !== DEFAULT_VOLUME_RANGE[0] || volumeRange[1] !== DEFAULT_VOLUME_RANGE[1]) count++
    if (kdRange[0] !== DEFAULT_KD_RANGE[0] || kdRange[1] !== DEFAULT_KD_RANGE[1]) count++
    if (cpcRange[0] !== DEFAULT_CPC_RANGE[0] || cpcRange[1] !== DEFAULT_CPC_RANGE[1]) count++
    if (selectedIntents.length > 0) count++
    if (includeTerms.length > 0) count++
    if (excludeTerms.length > 0) count++
    return count
  }, [volumeRange, kdRange, cpcRange, selectedIntents, includeTerms, excludeTerms])
  
  const hasActiveFilters = activeFilterCount > 0
  
  return {
    volumeRange,
    kdRange,
    cpcRange,
    selectedIntents,
    includeTerms,
    excludeTerms,
    tempVolumeRange,
    tempKdRange,
    tempCpcRange,
    tempSelectedIntents,
    setTempVolumeRange,
    setTempKdRange,
    setTempCpcRange,
    toggleTempIntent,
    includeInput,
    excludeInput,
    setIncludeInput,
    setExcludeInput,
    addIncludeTerm,
    addExcludeTerm,
    removeIncludeTerm,
    removeExcludeTerm,
    applyVolumeFilter,
    applyKdFilter,
    applyCpcFilter,
    applyIntentFilter,
    resetAllFilters,
    activeFilterCount,
    hasActiveFilters,
  }
}

// ============================================
// KEYWORD DATA HOOK
// ============================================

export interface UseKeywordDataOptions {
  initialKeywords?: Keyword[]
  pageSize?: number
}

export interface UseKeywordDataReturn {
  // Data
  keywords: Keyword[]
  filteredKeywords: Keyword[]
  displayedKeywords: Keyword[]
  
  // Loading states
  isLoading: boolean
  isLoadingMore: boolean
  error: Error | null
  
  // Pagination
  page: number
  hasMore: boolean
  loadMore: () => void
  resetPagination: () => void
  totalCount: number
  displayedCount: number
  
  // Sorting
  sortField: SortableField | null
  sortDirection: "asc" | "desc"
  handleSort: (field: SortableField) => void
  
  // Selection
  selectedIds: Set<number>
  selectAll: boolean
  handleSelectAll: () => void
  handleSelectRow: (id: number) => void
  clearSelection: () => void
  selectedCount: number
  
  // Actions
  exportToCSV: () => Promise<void>
  refreshData: () => Promise<void>
}

export function useKeywordData(
  filterState: FilterState & { filterText: string; matchType: MatchType },
  options: UseKeywordDataOptions = {}
): UseKeywordDataReturn {
  const { initialKeywords = MOCK_KEYWORDS, pageSize = 20 } = options
  
  // Data state
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  
  // Sorting
  const [sortField, setSortField] = useState<SortableField | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  // Apply filters
  const filteredKeywords = useMemo(() => {
    return applyAllFilters(keywords, {
      filterText: filterState.filterText,
      matchType: filterState.matchType,
      volumeRange: filterState.volumeRange,
      kdRange: filterState.kdRange,
      cpcRange: filterState.cpcRange,
      selectedIntents: filterState.selectedIntents,
      includeTerms: filterState.includeTerms,
      excludeTerms: filterState.excludeTerms,
    })
  }, [keywords, filterState])
  
  // Apply sorting
  const sortedKeywords = useMemo(() => {
    if (!sortField) return filteredKeywords
    
    return [...filteredKeywords].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case "keyword":
          comparison = a.keyword.localeCompare(b.keyword)
          break
        case "volume":
          comparison = a.volume - b.volume
          break
        case "kd":
          comparison = a.kd - b.kd
          break
        case "cpc":
          comparison = a.cpc - b.cpc
          break
        case "trend":
          const aTrend = a.trend[a.trend.length - 1] - a.trend[0]
          const bTrend = b.trend[b.trend.length - 1] - b.trend[0]
          comparison = aTrend - bTrend
          break
        case "geoScore":
          comparison = (a.geoScore ?? 50) - (b.geoScore ?? 50)
          break
        default:
          comparison = 0
      }
      
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredKeywords, sortField, sortDirection])
  
  // Paginate
  const displayedKeywords = useMemo(() => {
    return sortedKeywords.slice(0, page * pageSize)
  }, [sortedKeywords, page, pageSize])
  
  const hasMore = displayedKeywords.length < sortedKeywords.length
  
  // Handlers
  const handleSort = useCallback((field: SortableField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }, [sortField])
  
  const loadMoreTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    // Simulate loading delay for UX
    loadMoreTimerRef.current = setTimeout(() => {
      setPage((prev) => prev + 1)
      setIsLoadingMore(false)
    }, 300)
  }, [hasMore, isLoadingMore])
  
  // Cleanup loadMore timer on unmount
  useEffect(() => {
    return () => {
      if (loadMoreTimerRef.current) {
        clearTimeout(loadMoreTimerRef.current)
      }
    }
  }, [])
  
  const resetPagination = useCallback(() => {
    setPage(1)
  }, [])
  
  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sortedKeywords.map((k) => k.id)))
    }
    setSelectAll(!selectAll)
  }, [selectAll, sortedKeywords])
  
  const handleSelectRow = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])
  
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setSelectAll(false)
  }, [])
  
  // Export
  const exportToCSV = useCallback(async () => {
    const dataToExport = selectedIds.size > 0
      ? sortedKeywords.filter((k) => selectedIds.has(k.id))
      : sortedKeywords
    
    const blob = await keywordMagicAPI.exportKeywords(dataToExport, {
      format: "csv",
      columns: ["keyword", "volume", "kd", "cpc"],
      includeMetrics: true,
      keywords: "all",
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `keywords-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [sortedKeywords, selectedIds])
  
  // Refresh data from API
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await keywordMagicAPI.researchKeywords({
        seedKeyword: filterState.filterText,
        country: "US",
        matchType: filterState.matchType,
        filters: {
          volumeMin: filterState.volumeRange[0],
          volumeMax: filterState.volumeRange[1],
          kdMin: filterState.kdRange[0],
          kdMax: filterState.kdRange[1],
          cpcMin: filterState.cpcRange[0],
          cpcMax: filterState.cpcRange[1],
          intents: filterState.selectedIntents as ("I" | "C" | "T" | "N")[],
          includeTerms: filterState.includeTerms,
          excludeTerms: filterState.excludeTerms,
        },
        page: 1,
        limit: 100,
        sortBy: sortField || "volume",
        sortOrder: sortDirection,
      })
      
      if (response.success) {
        // Transform API keywords to local format
        const transformed = response.data.keywords.map((k) => ({
          id: parseInt(k.id, 10),
          keyword: k.keyword,
          intent: k.intent.all,
          volume: k.volume,
          trend: k.trend.values,
          weakSpot: {
            type: k.weakSpot.type as "reddit" | "quora" | null,
            rank: k.weakSpot.rank ?? undefined,
          },
          kd: k.kd,
          cpc: k.cpc,
          serpFeatures: k.serp.features.map((f) => f.type) as SERPFeature[],
          geoScore: k.geoScore.score,
        }))
        setKeywords(transformed)
        setPage(1)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch keywords"))
    } finally {
      setIsLoading(false)
    }
  }, [filterState, sortField, sortDirection])
  
  // Reset pagination when filters change
  useEffect(() => {
    setPage(1)
  }, [filterState])
  
  // Update selectAll state based on selection
  useEffect(() => {
    setSelectAll(selectedIds.size === sortedKeywords.length && sortedKeywords.length > 0)
  }, [selectedIds, sortedKeywords.length])
  
  return {
    keywords,
    filteredKeywords,
    displayedKeywords,
    isLoading,
    isLoadingMore,
    error,
    page,
    hasMore,
    loadMore,
    resetPagination,
    totalCount: sortedKeywords.length,
    displayedCount: displayedKeywords.length,
    sortField,
    sortDirection,
    handleSort,
    selectedIds,
    selectAll,
    handleSelectAll,
    handleSelectRow,
    clearSelection,
    selectedCount: selectedIds.size,
    exportToCSV,
    refreshData,
  }
}

// ============================================
// BULK ANALYSIS HOOK
// ============================================

export interface UseBulkAnalysisReturn {
  bulkMode: BulkMode
  setBulkMode: (mode: BulkMode) => void
  bulkKeywords: string
  setBulkKeywords: (value: string) => void
  parsedKeywords: string[]
  keywordCount: number
  isAnalyzing: boolean
  error: Error | null
  handleBulkAnalyze: () => Promise<void>
  canAnalyze: boolean
}

export function useBulkAnalysis(): UseBulkAnalysisReturn {
  const router = useRouter()
  
  const [bulkMode, setBulkMode] = useState<BulkMode>("explore")
  const [bulkKeywords, setBulkKeywords] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Parse keywords from input
  const parsedKeywords = useMemo(() => {
    return bulkKeywords
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }, [bulkKeywords])
  
  const keywordCount = parsedKeywords.length
  const canAnalyze = keywordCount > 0 && keywordCount <= 100
  
  const handleBulkAnalyze = useCallback(async () => {
    if (!canAnalyze || isAnalyzing) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      if (parsedKeywords.length === 1) {
        // Single keyword - navigate to overview
        router.push(`/dashboard/research/overview/${encodeURIComponent(parsedKeywords[0])}`)
      } else {
        // Multiple keywords - call bulk API
        const response = await keywordMagicAPI.bulkAnalyze({
          keywords: parsedKeywords,
          country: "US",
          options: {
            includeRTV: true,
            includeGEO: true,
            includeAIO: true,
            includeDecay: true,
          },
        })
        
        if (response.success) {
          // Store results and navigate to bulk results view
          try {
            sessionStorage.setItem("bulkAnalysisResults", JSON.stringify(response.data.results))
            sessionStorage.setItem("bulkKeywords", JSON.stringify(parsedKeywords))
          } catch {
            // sessionStorage may be blocked in privacy mode
          }
          // TODO: Navigate to bulk results page
          toast.success(`Analyzed ${response.data.results.length} keywords successfully!`)
        } else {
          throw new Error(response.error?.message || "Bulk analysis failed")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Analysis failed"))
    } finally {
      setIsAnalyzing(false)
    }
  }, [canAnalyze, isAnalyzing, parsedKeywords, router])
  
  return {
    bulkMode,
    setBulkMode,
    bulkKeywords,
    setBulkKeywords,
    parsedKeywords,
    keywordCount,
    isAnalyzing,
    error,
    handleBulkAnalyze,
    canAnalyze,
  }
}

// ============================================
// COUNTRY SELECTOR HOOK
// ============================================

export interface UseCountrySelectorReturn {
  selectedCountry: Country | null
  setSelectedCountry: (country: Country | null) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function useCountrySelector(): UseCountrySelectorReturn {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  return {
    selectedCountry,
    setSelectedCountry,
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
  }
}

// ============================================
// COMBINED KEYWORD MAGIC HOOK
// ============================================
// Legacy hook that combines all functionality
// For new code, prefer using individual hooks

export function useKeywordMagic() {
  const filters = useKeywordFilters()
  
  // Construct filterState from individual filter values with required fields
  const filterState = {
    volumeRange: filters.volumeRange,
    kdRange: filters.kdRange,
    cpcRange: filters.cpcRange,
    selectedIntents: filters.selectedIntents,
    includeTerms: filters.includeTerms,
    excludeTerms: filters.excludeTerms,
    filterText: "", // Default empty filter text
    matchType: "broad" as const, // Default match type
  }
  
  const data = useKeywordData(filterState)
  const bulk = useBulkAnalysis()
  const country = useCountrySelector()

  return {
    // Filters
    ...filters,
    // Data
    ...data,
    // Bulk
    ...bulk,
    // Country
    ...country,
  }
}
