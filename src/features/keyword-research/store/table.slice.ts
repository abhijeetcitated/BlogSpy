// ============================================
// KEYWORD RESEARCH STORE - Table Slice
// ============================================

import type { StateCreator } from "zustand"
import { DEFAULT_LOADING, DEFAULT_PAGINATION, DEFAULT_SORT } from "./constants"
import type { KeywordState, TableSlice } from "./types"

export const createTableSlice: StateCreator<KeywordState, [], [], TableSlice> = (set) => ({
  keywords: [],
  selectedIds: {},
  credits: 0,
  loading: DEFAULT_LOADING,
  sort: DEFAULT_SORT,
  pagination: DEFAULT_PAGINATION,

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

  setKeywords: (keywords) => set({ keywords, selectedIds: {} }),

  addKeywords: (newKeywords) =>
    set((state) => ({ keywords: [...state.keywords, ...newKeywords] })),

  updateKeyword: (id, updates) =>
    set((state) => ({
      keywords: state.keywords.map((k) => (k.id === id ? { ...k, ...updates } : k)),
      selectedKeyword:
        state.selectedKeyword?.id === id
          ? { ...state.selectedKeyword, ...updates }
          : state.selectedKeyword,
    })),

  updateKeywordsBatch: (updates) =>
    set((state) => {
      const updateMap = new Map(updates.map((entry) => [entry.id, entry.updates]))
      if (updateMap.size === 0) {
        return state
      }

      const keywords = state.keywords.map((k) => {
        const patch = updateMap.get(k.id)
        return patch ? { ...k, ...patch } : k
      })

      const selectedKeyword =
        state.selectedKeyword && updateMap.has(state.selectedKeyword.id)
          ? { ...state.selectedKeyword, ...updateMap.get(state.selectedKeyword.id)! }
          : state.selectedKeyword

      return { keywords, selectedKeyword }
    }),

  updateRow: (id, updates) =>
    set((state) => {
      const numericId = Number(id)
      if (!Number.isFinite(numericId)) return state

      return {
        keywords: state.keywords.map((k) => (k.id === numericId ? { ...k, ...updates } : k)),
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
        const next = { ...state.selectedIds }
        delete next[String(id)]
        return next
      })(),
    })),

  setCredits: (credits) => set({ credits }),

  setSort: (field, direction) =>
    set((state) => ({
      sort: {
        field,
        direction:
          direction ??
          (state.sort.field === field
            ? state.sort.direction === "asc"
              ? "desc"
              : "asc"
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

  setPageIndex: (pageIndex) =>
    set((state) => ({
      pagination: { ...state.pagination, pageIndex: Math.max(0, pageIndex) },
    })),

  setPageSize: (pageSize) =>
    set((state) => ({
      pagination: { ...state.pagination, pageSize: Math.max(1, pageSize), pageIndex: 0 },
    })),

  toggleSelection: (id) =>
    set((state) => {
      const key = String(id)
      if (!key) return state

      const next = { ...state.selectedIds }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = true
      }

      return { selectedIds: next }
    }),

  selectVisible: (ids) =>
    set((state) => {
      if (!ids.length) return state
      const next = { ...state.selectedIds }
      ids.forEach((id) => {
        const key = String(id)
        if (key) next[key] = true
      })
      return { selectedIds: next }
    }),

  clearSelection: () => set({ selectedIds: {} }),
})
