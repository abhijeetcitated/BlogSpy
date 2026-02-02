// ============================================
// KEYWORD RESEARCH STORE - Defaults
// ============================================

import type {
  KeywordFilters,
  SearchState,
  LoadingState,
  SortConfig,
  PaginationState,
} from "./types"

export const DEFAULT_FILTERS: KeywordFilters = {
  searchText: "",
  matchType: "broad",
  volumeRange: [0, 10000000],
  kdRange: [0, 100],
  cpcRange: [0, 1000],
  geoRange: [0, 100],
  selectedIntents: [],
  selectedSerpFeatures: [],
  includeKeywords: [],
  excludeKeywords: [],
  includeTerms: [],
  excludeTerms: [],
  trendDirection: null,
  minTrendGrowth: 0,
  selectedTrend: [],
  weakSpotToggle: "all",
  weakSpotTypes: [],
}

export const DEFAULT_SEARCH: SearchState = {
  seedKeyword: "",
  country: "US",
  languageCode: "en",
  deviceType: "desktop",
  mode: "explore",
  bulkKeywords: "",
}

export const DEFAULT_LOADING: LoadingState = {
  searching: false,
  exporting: false,
  refreshing: false,
}

export const DEFAULT_SORT: SortConfig = {
  field: "volume",
  direction: "desc",
}

export const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 50,
}

export const DRAWER_CACHE_TTL = 5 * 60 * 1000
