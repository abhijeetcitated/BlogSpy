// ============================================
// KEYWORD RESEARCH STORE - Combined Slices
// ============================================

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

import { createSearchSlice } from "./search.slice"
import { createFilterSlice } from "./filter.slice"
import { createTableSlice } from "./table.slice"
import { createDrawerSlice } from "./drawer.slice"
import {
  DEFAULT_FILTERS,
  DEFAULT_LOADING,
  DEFAULT_PAGINATION,
  DEFAULT_SEARCH,
  DEFAULT_SORT,
} from "./constants"

import type { KeywordState } from "./types"

export const useKeywordStore = create<KeywordState>()(
  devtools(
    persist(
      (set, get, ...rest) => ({
        ...createSearchSlice(set, get, ...rest),
        ...createFilterSlice(set, get, ...rest),
        ...createTableSlice(set, get, ...rest),
        ...createDrawerSlice(set, get, ...rest),

        resetStore: () =>
          set({
            keywords: [],
            selectedIds: {},
            presets: [],
            credits: 0,
            selectedKeyword: null,
            drawerCache: {},
            search: DEFAULT_SEARCH,
            filters: DEFAULT_FILTERS,
            sort: DEFAULT_SORT,
            pagination: DEFAULT_PAGINATION,
            loading: DEFAULT_LOADING,
          }),
      }),
      {
        name: "keyword-research-store",
        partialize: (state) => ({
          presets: state.presets,
        }),
      }
    )
  )
)

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
export const selectSelectedCount = (state: KeywordState) =>
  Object.keys(state.selectedIds).length
export const selectSelectedKeyword = (state: KeywordState) => state.selectedKeyword
export const selectDrawerCache = (state: KeywordState) => state.drawerCache

export type {
  KeywordState,
  KeywordFilters,
  SearchState,
  LoadingState,
  SortConfig,
  SortField,
  SortDirection,
  PaginationState,
  FilterPreset,
  DrawerCacheType,
  DrawerCache,
  DrawerCacheEntry,
} from "./types"
