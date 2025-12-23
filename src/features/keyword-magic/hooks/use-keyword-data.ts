"use client"

// ============================================
// KEYWORD MAGIC - Keyword Data Hook
// ============================================
// Manages keyword data, sorting, selection, pagination
// ============================================

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import type { Keyword, MatchType, FilterState, SERPFeature } from "../types"
import type { SortableField } from "../types/api.types"
import { keywordMagicAPI } from "../services"
import { applyAllFilters } from "../utils"
import { MOCK_KEYWORDS } from "../__mocks__"

// ============================================
// TYPES
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

// ============================================
// HOOK
// ============================================

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
