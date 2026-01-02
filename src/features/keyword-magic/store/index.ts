// ============================================
// KEYWORD MAGIC STORE - Extended Zustand Store
// ============================================
// Feature-specific store with all fields needed by keyword-magic-content
// ============================================

import { create } from "zustand"
import type { Keyword, MatchType, BulkMode, Country, SERPFeature } from "../types"

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

// ============================================
// STORE INTERFACE
// ============================================
export interface KeywordState {
  // Data
  keywords: Keyword[]
  selectedIds: Set<number>
  
  // Search state
  search: SearchState
  
  // Filters
  filters: KeywordFilters
  
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
  
  // Selection actions
  selectKeyword: (id: number) => void
  deselectKeyword: (id: number) => void
  toggleKeyword: (id: number) => void
  selectAll: () => void
  deselectAll: () => void
  clearSelection: () => void
}

// ============================================
// ZUSTAND STORE
// ============================================
export const useKeywordStore = create<KeywordState>((set, get) => ({
  // Initial state
  keywords: [],
  selectedIds: new Set(),
  search: DEFAULT_SEARCH,
  filters: DEFAULT_FILTERS,
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
}))
