"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { CommerceKeyword, CommerceSummary, CommerceIntent } from "../types"
import { MOCK_COMMERCE_KEYWORDS, MOCK_COMMERCE_SUMMARY, generateCommerceKeywords, generateCommerceSummary } from "../__mocks__"

// Filter types
export type OpportunityFilter = "all" | "high" | "medium" | "low"
export type PositionFilter = "all" | "top3" | "top10" | "top20" | "unranked"
export type SortField = "keyword" | "searchVolume" | "position" | "cpc" | "opportunity" | "lastUpdated"
export type SortOrder = "asc" | "desc"

export interface CommerceFilters {
  search: string
  category: string
  opportunity: OpportunityFilter
  position: PositionFilter
  intent: CommerceIntent | "all"
  hasOurProduct: boolean | null
}

export interface CommerceTrackerState {
  keywords: CommerceKeyword[]
  summary: CommerceSummary
  filters: CommerceFilters
  sortField: SortField
  sortOrder: SortOrder
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  page: number
  pageSize: number
  selectedKeywords: string[]
}

const DEFAULT_FILTERS: CommerceFilters = {
  search: "",
  category: "all",
  opportunity: "all",
  position: "all",
  intent: "all",
  hasOurProduct: null,
}

const DEFAULT_STATE: CommerceTrackerState = {
  keywords: [],
  summary: MOCK_COMMERCE_SUMMARY,
  filters: DEFAULT_FILTERS,
  sortField: "searchVolume",
  sortOrder: "desc",
  isLoading: true,
  isRefreshing: false,
  error: null,
  page: 1,
  pageSize: 10,
  selectedKeywords: [],
}

export function useCommerceTracker() {
  const [state, setState] = useState<CommerceTrackerState>(DEFAULT_STATE)

  // Initialize data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Simulate API call delay
        await new Promise(r => setTimeout(r, 800))
        
        const keywords = generateCommerceKeywords(15)
        const summary = generateCommerceSummary(keywords)
        
        setState(prev => ({
          ...prev,
          keywords,
          summary,
          isLoading: false,
          error: null,
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to load commerce data",
        }))
      }
    }

    loadInitialData()
  }, [])

  // Update filter
  const setFilter = useCallback(<K extends keyof CommerceFilters>(
    key: K,
    value: CommerceFilters[K]
  ) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1, // Reset to first page on filter change
    }))
  }, [])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: DEFAULT_FILTERS,
      page: 1,
    }))
  }, [])

  // Set sort
  const setSort = useCallback((field: SortField) => {
    setState(prev => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === "desc" ? "asc" : "desc",
    }))
  }, [])

  // Set page
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }))
  }, [])

  // Set page size
  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, page: 1 }))
  }, [])

  // Toggle keyword selection
  const toggleKeywordSelection = useCallback((keywordId: string) => {
    setState(prev => ({
      ...prev,
      selectedKeywords: prev.selectedKeywords.includes(keywordId)
        ? prev.selectedKeywords.filter(id => id !== keywordId)
        : [...prev.selectedKeywords, keywordId],
    }))
  }, [])

  // Select all keywords (from current filtered list)
  const selectAllKeywords = useCallback((keywordIds: string[]) => {
    setState(prev => ({
      ...prev,
      selectedKeywords: keywordIds,
    }))
  }, [])

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedKeywords: [] }))
  }, [])

  // Refresh data
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true, error: null }))

    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1500))
      
      const keywords = generateCommerceKeywords(15)
      const summary = generateCommerceSummary(keywords)
      
      setState(prev => ({
        ...prev,
        keywords,
        summary,
        isRefreshing: false,
        selectedKeywords: [],
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error: "Failed to refresh data",
      }))
    }
  }, [])

  // Add new keyword
  const addKeyword = useCallback(async (keywordText: string, category: string) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000))
      
      const [newKeyword] = generateCommerceKeywords(1)
      const keywordToAdd: CommerceKeyword = {
        ...newKeyword,
        id: `commerce-${Date.now()}`,
        keyword: keywordText,
        category,
      }

      setState(prev => {
        const updatedKeywords = [keywordToAdd, ...prev.keywords]
        return {
          ...prev,
          keywords: updatedKeywords,
          summary: generateCommerceSummary(updatedKeywords),
          isLoading: false,
        }
      })

      return { success: true, keyword: keywordToAdd }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to add keyword" }))
      return { success: false, error: "Failed to add keyword" }
    }
  }, [])

  // Delete keywords
  const deleteKeywords = useCallback(async (keywordIds: string[]) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 500))

      setState(prev => {
        const updatedKeywords = prev.keywords.filter(k => !keywordIds.includes(k.id))
        return {
          ...prev,
          keywords: updatedKeywords,
          summary: generateCommerceSummary(updatedKeywords),
          isLoading: false,
          selectedKeywords: prev.selectedKeywords.filter(id => !keywordIds.includes(id)),
        }
      })

      return { success: true }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to delete keywords" }))
      return { success: false }
    }
  }, [])

  // Export keywords to CSV
  const exportToCSV = useCallback((keywords: CommerceKeyword[]) => {
    const headers = [
      "Keyword",
      "Search Volume",
      "CPC",
      "Difficulty",
      "Category",
      "Intent",
      "Position",
      "Position Change",
      "Opportunity",
      "Avg Price",
      "Avg Rating",
      "Prime %",
      "Has Our Product",
    ]

    const rows = keywords.map(k => {
      const amazon = k.platforms.amazon
      return [
        k.keyword,
        k.searchVolume,
        k.cpc,
        k.difficulty,
        k.category,
        k.commerceIntent,
        amazon?.position ?? "N/A",
        amazon?.positionChange ?? 0,
        amazon?.opportunity ?? "N/A",
        amazon?.avgPrice ?? 0,
        amazon?.avgRating ?? 0,
        amazon?.primePercentage ?? 0,
        amazon?.hasOurProduct ? "Yes" : "No",
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `commerce-tracker-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  // Filtered and sorted keywords
  const processedKeywords = useMemo(() => {
    let result = [...state.keywords]

    // Apply filters
    const { search, category, opportunity, position, intent, hasOurProduct } = state.filters

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(k => 
        k.keyword.toLowerCase().includes(searchLower) ||
        k.category.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (category !== "all") {
      result = result.filter(k => k.category === category)
    }

    // Opportunity filter
    if (opportunity !== "all") {
      result = result.filter(k => k.platforms.amazon?.opportunity === opportunity)
    }

    // Position filter
    if (position !== "all") {
      result = result.filter(k => {
        const pos = k.platforms.amazon?.position
        switch (position) {
          case "top3":
            return pos !== null && pos !== undefined && pos <= 3
          case "top10":
            return pos !== null && pos !== undefined && pos <= 10
          case "top20":
            return pos !== null && pos !== undefined && pos <= 20
          case "unranked":
            return pos === null || pos === undefined
          default:
            return true
        }
      })
    }

    // Intent filter
    if (intent !== "all") {
      result = result.filter(k => k.commerceIntent === intent)
    }

    // Has our product filter
    if (hasOurProduct !== null) {
      result = result.filter(k => k.platforms.amazon?.hasOurProduct === hasOurProduct)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      
      switch (state.sortField) {
        case "keyword":
          comparison = a.keyword.localeCompare(b.keyword)
          break
        case "searchVolume":
          comparison = a.searchVolume - b.searchVolume
          break
        case "position":
          const posA = a.platforms.amazon?.position ?? 999
          const posB = b.platforms.amazon?.position ?? 999
          comparison = posA - posB
          break
        case "cpc":
          comparison = a.cpc - b.cpc
          break
        case "opportunity":
          const oppOrder = { high: 1, medium: 2, low: 3 }
          const oppA = a.platforms.amazon?.opportunity ?? "low"
          const oppB = b.platforms.amazon?.opportunity ?? "low"
          comparison = oppOrder[oppA] - oppOrder[oppB]
          break
        case "lastUpdated":
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
          break
      }

      return state.sortOrder === "asc" ? comparison : -comparison
    })

    return result
  }, [state.keywords, state.filters, state.sortField, state.sortOrder])

  // Paginated keywords
  const paginatedKeywords = useMemo(() => {
    const start = (state.page - 1) * state.pageSize
    const end = start + state.pageSize
    return processedKeywords.slice(start, end)
  }, [processedKeywords, state.page, state.pageSize])

  // Stats derived from filtered keywords
  const stats = useMemo(() => {
    const keywords = processedKeywords
    const withAmazon = keywords.filter(k => k.platforms.amazon)
    
    return {
      totalKeywords: keywords.length,
      highOpportunity: withAmazon.filter(k => k.platforms.amazon?.opportunity === "high").length,
      ourProducts: withAmazon.filter(k => k.platforms.amazon?.hasOurProduct).length,
      top3Count: withAmazon.filter(k => {
        const pos = k.platforms.amazon?.position
        return pos !== null && pos !== undefined && pos <= 3
      }).length,
      top10Count: withAmazon.filter(k => {
        const pos = k.platforms.amazon?.position
        return pos !== null && pos !== undefined && pos <= 10
      }).length,
      avgCpc: keywords.length > 0 
        ? (keywords.reduce((s, k) => s + k.cpc, 0) / keywords.length).toFixed(2)
        : "0.00",
      avgSearchVolume: keywords.length > 0
        ? Math.round(keywords.reduce((s, k) => s + k.searchVolume, 0) / keywords.length)
        : 0,
    }
  }, [processedKeywords])

  // Pagination info
  const pagination = useMemo(() => ({
    currentPage: state.page,
    pageSize: state.pageSize,
    totalItems: processedKeywords.length,
    totalPages: Math.ceil(processedKeywords.length / state.pageSize),
    hasNextPage: state.page < Math.ceil(processedKeywords.length / state.pageSize),
    hasPrevPage: state.page > 1,
  }), [state.page, state.pageSize, processedKeywords.length])

  return {
    // State
    keywords: paginatedKeywords,
    allFilteredKeywords: processedKeywords,
    summary: state.summary,
    filters: state.filters,
    sortField: state.sortField,
    sortOrder: state.sortOrder,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    selectedKeywords: state.selectedKeywords,
    stats,
    pagination,

    // Actions
    setFilter,
    resetFilters,
    setSort,
    setPage,
    setPageSize,
    toggleKeywordSelection,
    selectAllKeywords,
    clearSelection,
    refreshData,
    addKeyword,
    deleteKeywords,
    exportToCSV,
  }
}
