// ============================================
// KEYWORD RESEARCH STORE - Extended Zustand Store
// ============================================
// Feature-specific store with all fields needed by keyword-research-content
// Replaces legacy useReducer implementation
// ============================================

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { Keyword, MatchType, BulkMode, Country, SERPFeature } from "../types"
import type { SortDirection as SharedSortDirection } from "@/types/shared"

// ============================================
// SORT CONFIG
// ============================================
export type KeywordResearchStoreSortField = "keyword" | "volume" | "kd" | "cpc" | "trend" | "geoScore"
export type SortField = KeywordResearchStoreSortField
export type SortDirection = SharedSortDirection

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

// ============================================
// PAGINATION CONFIG
// ============================================
export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

// ============================================
// FILTER STATE INTERFACE
// ============================================
export interface KeywordFilters {
  searchText: string
  matchType: MatchType
  volumeRange: [number, number]
  kdRange: [number, number]
  cpcRange: [number, number]
  geoRange: [number, number]
  selectedIntents: string[]
  selectedSerpFeatures: SERPFeature[]
  includeTerms: string[]
  excludeTerms: string[]
  trendDirection: "up" | "down" | "stable" | null
  minTrendGrowth: number | null
  weakSpotToggle: "all" | "with" | "without"
  weakSpotTypes: string[]
}

// ============================================
// SEARCH STATE INTERFACE
// ============================================
export interface SearchState {
  seedKeyword: string
  country: string
  mode: BulkMode
  bulkKeywords: string
}

// ============================================
// LOADING STATE
// ============================================
export interface LoadingState {
  searching: boolean
  exporting: boolean
  refreshing: boolean
}

// ============================================
// DRAWER CACHE (for Commerce & Social tabs)
// ============================================
export type DrawerCacheType = "commerce" | "social"

export interface DrawerCacheEntry {
  commerce?: unknown // Amazon/affiliate data
  social?: unknown   // Reddit/YouTube data
  fetchedAt?: number // Timestamp for cache invalidation
}

export interface DrawerCache {
  [keyword: string]: DrawerCacheEntry
}

// Cache TTL: 5 minutes (in milliseconds)
const DRAWER_CACHE_TTL = 5 * 60 * 1000

// ============================================
// DEFAULT VALUES
// ============================================
const DEFAULT_FILTERS: KeywordFilters = {
  searchText: "",
  matchType: "broad",
  volumeRange: [0, 1000000],
  kdRange: [0, 100],
  cpcRange: [0, 100],
  geoRange: [0, 100],
  selectedIntents: [],
  selectedSerpFeatures: [],
  includeTerms: [],
  excludeTerms: [],
  trendDirection: null,
  minTrendGrowth: null,
  weakSpotToggle: "all",
  weakSpotTypes: [],
}

const DEFAULT_SEARCH: SearchState = {
  seedKeyword: "",
  country: "US",
  mode: "explore",
  bulkKeywords: "",
}

const DEFAULT_LOADING: LoadingState = {
  searching: false,
  exporting: false,
  refreshing: false,
}

const DEFAULT_SORT: SortConfig = {
  field: "volume",
  direction: "desc",
}

const DEFAULT_PAGINATION: PaginationConfig = {
  page: 1,
  pageSize: 50,
  total: 0,
  hasMore: false,
}

// ============================================
// STORE INTERFACE
// ============================================
export interface KeywordState {
  // Data
  keywords: Keyword[]
  selectedIds: Set<number>

  // Credits
  credits: number | null
  
  // Drawer state (single keyword for detail view)
  selectedKeyword: Keyword | null
  
  // Drawer cache (for Commerce & Social tabs)
  drawerCache: DrawerCache
  
  // Search state
  search: SearchState
  
  // Filters
  filters: KeywordFilters
  
  // Sorting
  sort: SortConfig
  
  // Pagination
  pagination: PaginationConfig
  
  // Loading states
  loading: LoadingState
  
  // Search actions
  setSeedKeyword: (keyword: string) => void
  setCountry: (country: string) => void
  setMode: (mode: BulkMode) => void
  setBulkKeywords: (keywords: string) => void
  
  // Filter actions
  setFilter: <K extends keyof KeywordFilters>(key: K, value: KeywordFilters[K]) => void
  setFilters: (filters: Partial<KeywordFilters>) => void
  resetFilters: () => void
  
  // Loading actions
  setSearching: (searching: boolean) => void
  setExporting: (exporting: boolean) => void
  setRefreshing: (refreshing: boolean) => void
  
  // Data actions
  setKeywords: (keywords: Keyword[]) => void
  addKeywords: (keywords: Keyword[]) => void
  updateKeyword: (id: number, updates: Partial<Keyword>) => void
  updateRow: (id: string, updates: Partial<Keyword>) => void
  removeKeyword: (id: number) => void

  // Credit actions
  setCredits: (credits: number | null) => void
  
  // Drawer actions
  setSelectedKeyword: (keyword: Keyword | null) => void
  openKeywordDrawer: (keyword: Keyword) => void
  closeKeywordDrawer: () => void
  
  // Drawer cache actions
  setDrawerCache: (keyword: string, type: DrawerCacheType, data: unknown) => void
  getCachedData: (keyword: string, type: DrawerCacheType) => unknown | null
  clearDrawerCache: (keyword?: string) => void
  
  // Sort actions
  setSort: (field: SortField, direction?: SortDirection) => void
  toggleSortDirection: () => void
  
  // Pagination actions
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setPagination: (pagination: Partial<PaginationConfig>) => void
  nextPage: () => void
  prevPage: () => void
  
  // Selection actions
  selectKeyword: (id: number) => void
  deselectKeyword: (id: number) => void
  toggleKeyword: (id: number) => void
  selectAll: () => void
  deselectAll: () => void
  clearSelection: () => void
  
  // Reset actions
  resetStore: () => void
}

// ============================================
// ZUSTAND STORE
// ============================================
export const useKeywordStore = create<KeywordState>()((set, get) => ({
  // Initial state
  keywords: [],
  selectedIds: new Set(),
  credits: null,
  selectedKeyword: null,
  drawerCache: {},
  search: DEFAULT_SEARCH,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
  pagination: DEFAULT_PAGINATION,
  loading: DEFAULT_LOADING,

  // Search actions
  setSeedKeyword: (keyword) =>
    set((state) => ({
      search: { ...state.search, seedKeyword: keyword },
    })),

  setCountry: (country) =>
    set((state) => ({
      search: { ...state.search, country },
    })),

  setMode: (mode) =>
    set((state) => ({
      search: { ...state.search, mode },
    })),

  setBulkKeywords: (keywords) =>
    set((state) => ({
      search: { ...state.search, bulkKeywords: keywords },
    })),

  // Filter actions
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  // Loading actions
  setSearching: (searching) =>
    set((state) => ({
      loading: { ...state.loading, searching },
    })),

  setExporting: (exporting) =>
    set((state) => ({
      loading: { ...state.loading, exporting },
    })),

  setRefreshing: (refreshing) =>
    set((state) => ({
      loading: { ...state.loading, refreshing },
    })),

  // Data actions
  setKeywords: (keywords) => set({ keywords }),
  
  addKeywords: (newKeywords) =>
    set((state) => ({ keywords: [...state.keywords, ...newKeywords] })),
    
  updateKeyword: (id, updates) =>
    set((state) => ({
      keywords: state.keywords.map((k) =>
        k.id === id ? { ...k, ...updates } : k
      ),
      selectedKeyword:
        state.selectedKeyword?.id === id
          ? { ...state.selectedKeyword, ...updates }
          : state.selectedKeyword,
    })),

  updateRow: (id, updates) =>
    set((state) => {
      const numericId = Number(id)
      if (!Number.isFinite(numericId)) return state

      return {
        keywords: state.keywords.map((k) =>
          k.id === numericId ? { ...k, ...updates } : k
        ),
        selectedKeyword:
          state.selectedKeyword?.id === numericId
            ? { ...state.selectedKeyword, ...updates }
            : state.selectedKeyword,
      }
    }),
    
  removeKeyword: (id) =>
    set((state) => ({
      keywords: state.keywords.filter((k) => k.id !== id),
      selectedIds: (() => {
        const newSet = new Set(state.selectedIds)
        newSet.delete(id)
        return newSet
      })(),
    })),

  // Credit actions
  setCredits: (credits) => set({ credits }),

  // Drawer actions
  setSelectedKeyword: (keyword) => set({ selectedKeyword: keyword }),
  openKeywordDrawer: (keyword) => set({ selectedKeyword: keyword }),
  closeKeywordDrawer: () => set({ selectedKeyword: null }),

  // Drawer cache actions
  setDrawerCache: (keyword, type, data) =>
    set((state) => ({
      drawerCache: {
        ...state.drawerCache,
        [keyword]: {
          ...state.drawerCache[keyword],
          [type]: data,
          fetchedAt: Date.now(),
        },
      },
    })),

  getCachedData: (keyword, type) => {
    const state = get()
    const entry = state.drawerCache[keyword]
    if (!entry) return null
    
    // Check if cache is expired (5 min TTL)
    const fetchedAt = entry.fetchedAt ?? 0
    if (Date.now() - fetchedAt > DRAWER_CACHE_TTL) {
      return null
    }
    
    return entry[type] ?? null
  },

  clearDrawerCache: (keyword) =>
    set((state) => {
      if (keyword) {
        // Clear specific keyword cache
        const newCache = { ...state.drawerCache }
        delete newCache[keyword]
        return { drawerCache: newCache }
      }
      // Clear all cache
      return { drawerCache: {} }
    }),

  // Sort actions
  setSort: (field, direction) =>
    set((state) => ({
      sort: {
        field,
        direction: direction ?? (state.sort.field === field 
          ? (state.sort.direction === "asc" ? "desc" : "asc")
          : "desc"),
      },
    })),
    
  toggleSortDirection: () =>
    set((state) => ({
      sort: {
        ...state.sort,
        direction: state.sort.direction === "asc" ? "desc" : "asc",
      },
    })),

  // Pagination actions
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),
    
  setPageSize: (pageSize) =>
    set((state) => ({
      pagination: { ...state.pagination, pageSize, page: 1 },
    })),
    
  setPagination: (newPagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    })),
    
  nextPage: () =>
    set((state) => {
      if (state.pagination.hasMore) {
        return { pagination: { ...state.pagination, page: state.pagination.page + 1 } }
      }
      return state
    }),
    
  prevPage: () =>
    set((state) => {
      if (state.pagination.page > 1) {
        return { pagination: { ...state.pagination, page: state.pagination.page - 1 } }
      }
      return state
    }),

  // Selection actions
  selectKeyword: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds)
      newSet.add(id)
      return { selectedIds: newSet }
    }),

  deselectKeyword: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds)
      newSet.delete(id)
      return { selectedIds: newSet }
    }),

  toggleKeyword: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return { selectedIds: newSet }
    }),

  selectAll: () =>
    set((state) => ({
      selectedIds: new Set(state.keywords.map((k) => k.id)),
    })),

  deselectAll: () => set({ selectedIds: new Set() }),
  
  clearSelection: () => set({ selectedIds: new Set() }),
  
  // Reset actions
  resetStore: () => set({
    keywords: [],
    selectedIds: new Set(),
    selectedKeyword: null,
    search: DEFAULT_SEARCH,
    filters: DEFAULT_FILTERS,
    sort: DEFAULT_SORT,
    pagination: DEFAULT_PAGINATION,
    loading: DEFAULT_LOADING,
  }),
}))

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================
export const selectKeywords = (state: KeywordState) => state.keywords
export const selectFilters = (state: KeywordState) => state.filters
export const selectSearch = (state: KeywordState) => state.search
export const selectSort = (state: KeywordState) => state.sort
export const selectPagination = (state: KeywordState) => state.pagination
export const selectLoading = (state: KeywordState) => state.loading
export const selectSelectedIds = (state: KeywordState) => state.selectedIds
export const selectSelectedCount = (state: KeywordState) => state.selectedIds.size
export const selectSelectedKeyword = (state: KeywordState) => state.selectedKeyword
export const selectDrawerCache = (state: KeywordState) => state.drawerCache
