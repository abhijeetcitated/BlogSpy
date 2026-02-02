// ============================================
// KEYWORD RESEARCH STORE - Types
// ============================================

import type { Keyword, MatchType, BulkMode } from "../types"
import type { SortDirection as SharedSortDirection } from "@/types/shared"

// ============================================
// SORT CONFIG
// ============================================
export type KeywordResearchStoreSortField =
  | "keyword"
  | "volume"
  | "kd"
  | "cpc"
  | "trend"
  | "geoScore"
export type SortField = KeywordResearchStoreSortField
export type SortDirection = SharedSortDirection

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface FilterPreset {
  id: string
  name: string
  filters: KeywordFilters
  isDefault: boolean
  createdAt: string
}

// ============================================
// PAGINATION CONFIG
// ============================================
export interface PaginationState {
  pageIndex: number
  pageSize: number
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
  selectedSerpFeatures: string[]
  includeKeywords: string[]
  excludeKeywords: string[]
  includeTerms: string[]
  excludeTerms: string[]
  trendDirection: "up" | "down" | "stable" | null
  minTrendGrowth: number
  selectedTrend: ("rising" | "falling" | "stable")[]
  weakSpotToggle: "all" | "with" | "without"
  weakSpotTypes: string[]
}

// ============================================
// SEARCH STATE INTERFACE
// ============================================
export interface SearchState {
  seedKeyword: string
  /** Normalized ISO-3166-1 alpha-2 (e.g. "US", "GB", "IN") */
  country: string
  /** ISO-639-1 language code (e.g. "en", "hi") */
  languageCode: string
  /** Device targeting for SERP requests */
  deviceType: "desktop" | "mobile" | "all"
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
  commerce?: unknown
  social?: unknown
  fetchedAt?: number
}

export interface DrawerCache {
  /** Cache key: `${countryCode}:${keyword}` */
  [cacheKey: string]: DrawerCacheEntry
}

// ============================================
// SLICE TYPES
// ============================================
export interface SearchSlice {
  search: SearchState
  setSeedKeyword: (keyword: string) => void
  /** Accepts ISO code or alias; stored as normalized code */
  setCountry: (country: string) => void
  setMode: (mode: BulkMode) => void
  setBulkKeywords: (keywords: string) => void
  setLanguageCode: (languageCode: string) => void
  setDeviceType: (deviceType: SearchState["deviceType"]) => void
}

export interface FilterSlice {
  filters: KeywordFilters
  presets: FilterPreset[]
  setFilter: <K extends keyof KeywordFilters>(
    key: K,
    value: KeywordFilters[K]
  ) => void
  setFilterRange: (key: keyof KeywordFilters, value: [number, number]) => void
  setFilters: (filters: Partial<KeywordFilters>) => void
  resetFilters: () => void
  setSearchQuery: (query: string) => void
  setSearchText: (text: string) => void
  toggleIntent: (code: string) => void
  toggleSerpFeature: (feature: string) => void
  setSelectedIntents: (intents: string[]) => void
  setSelectedSerpFeatures: (features: string[]) => void
  setIncludeKeywords: (words: string[]) => void
  setExcludeKeywords: (words: string[]) => void
  setIncludeTerms: (terms: string[]) => void
  setExcludeTerms: (terms: string[]) => void
  setWeakSpotFilters: (platforms: string[]) => void
  toggleTrendFilter: (status: string) => void
  applyPreset: (preset: FilterPreset) => void
  setPresets: (presets: FilterPreset[]) => void
  addPreset: (preset: FilterPreset) => void
  removePreset: (id: string) => void
}

export interface TableSlice {
  keywords: Keyword[]
  selectedIds: Record<string, boolean>
  credits: number | null
  loading: LoadingState
  sort: SortConfig
  pagination: PaginationState
  setSearching: (searching: boolean) => void
  setExporting: (exporting: boolean) => void
  setRefreshing: (refreshing: boolean) => void
  setKeywords: (keywords: Keyword[]) => void
  addKeywords: (keywords: Keyword[]) => void
  updateKeyword: (id: number, updates: Partial<Keyword>) => void
  updateKeywordsBatch: (updates: Array<{ id: number; updates: Partial<Keyword> }>) => void
  updateRow: (id: string, updates: Partial<Keyword>) => void
  removeKeyword: (id: number) => void
  setCredits: (credits: number | null) => void
  setSort: (field: SortField, direction?: SortDirection) => void
  toggleSortDirection: () => void
  setPageIndex: (index: number) => void
  setPageSize: (size: number) => void
  toggleSelection: (id: string) => void
  selectVisible: (ids: string[]) => void
  clearSelection: () => void
}

export interface DrawerSlice {
  selectedKeyword: Keyword | null
  drawerCache: DrawerCache
  setSelectedKeyword: (keyword: Keyword | null) => void
  openKeywordDrawer: (keyword: Keyword) => void
  closeKeywordDrawer: () => void
  setDrawerCache: (
    country: string,
    keyword: string,
    type: DrawerCacheType,
    data: unknown
  ) => void
  getCachedData: (country: string, keyword: string, type: DrawerCacheType) => unknown | null
  clearDrawerCache: (country?: string, keyword?: string) => void
}

export type KeywordState = SearchSlice &
  FilterSlice &
  TableSlice &
  DrawerSlice & {
    resetStore: () => void
  }
