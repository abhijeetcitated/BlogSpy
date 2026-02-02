// ============================================
// KEYWORD RESEARCH STORE - Filter Slice
// ============================================

import type { StateCreator } from "zustand"
import { DEFAULT_FILTERS, DEFAULT_PAGINATION } from "./constants"
import type { FilterSlice, KeywordFilters, KeywordState } from "./types"

function normalizeSerpFeature(feature: string): string {
  const normalized = feature.trim().toLowerCase()
  if (!normalized) return ""

  switch (normalized) {
    case "ai overview":
    case "ai_overview":
      return "ai_overview"
    case "featured snippet":
    case "featured_snippet":
      return "featured_snippet"
    case "faq / paa":
    case "people also ask":
    case "people_also_ask":
      return "people_also_ask"
    case "video":
    case "video pack":
    case "video_pack":
      return "video_pack"
    case "image":
    case "image pack":
    case "image_pack":
      return "image_pack"
    case "shopping":
    case "shopping ads":
    case "shopping_ads":
      return "shopping_ads"
    case "ads":
    case "ads_top":
      return "ads_top"
    case "local pack":
    case "local_pack":
      return "local_pack"
    case "news":
    case "top stories":
    case "top_stories":
      return "top_stories"
    case "reviews":
      return "reviews"
    default:
      return normalized.replace(/[^a-z0-9_]+/g, "_")
  }
}

export const createFilterSlice: StateCreator<KeywordState, [], [], FilterSlice> = (set) => ({
  filters: DEFAULT_FILTERS,
  presets: [],

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, pageIndex: 0 },
    })),

  setFilterRange: (key, value) =>
    set((state) => {
      const safeMin = Math.max(0, value[0])
      const safeMax = Math.max(0, value[1])
      const shouldSwap = safeMin > safeMax && safeMax !== 0
      const nextRange: [number, number] = shouldSwap
        ? [safeMax, safeMin]
        : [safeMin, safeMax]

      return {
        filters: {
          ...state.filters,
          [key]: nextRange,
        },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, pageIndex: 0 },
    })),

  resetFilters: () =>
    set((state) => ({
      filters: DEFAULT_FILTERS,
      pagination: { ...state.pagination, pageIndex: 0 },
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchText: query },
      pagination: { ...state.pagination, pageIndex: 0 },
    })),

  setSearchText: (text) =>
    set((state) => ({
      filters: { ...state.filters, searchText: text },
      pagination: { ...state.pagination, pageIndex: 0 },
    })),

  toggleIntent: (code) =>
    set((state) => {
      const normalized = code.trim().toUpperCase()
      if (!normalized) return state

      const exists = state.filters.selectedIntents.includes(normalized)
      const selectedIntents = exists
        ? state.filters.selectedIntents.filter((intent) => intent !== normalized)
        : [...state.filters.selectedIntents, normalized]

      return {
        filters: { ...state.filters, selectedIntents },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  toggleSerpFeature: (feature) =>
    set((state) => {
      const normalized = normalizeSerpFeature(feature)
      if (!normalized) return state

      const exists = state.filters.selectedSerpFeatures.includes(normalized)
      const selectedSerpFeatures = exists
        ? state.filters.selectedSerpFeatures.filter((item) => item !== normalized)
        : [...state.filters.selectedSerpFeatures, normalized]

      return {
        filters: { ...state.filters, selectedSerpFeatures },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  setSelectedIntents: (intents) =>
    set((state) => {
      const selectedIntents = intents
        .map((intent) => intent.trim().toUpperCase())
        .filter((intent) => intent.length > 0)

      return {
        filters: { ...state.filters, selectedIntents },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  setSelectedSerpFeatures: (features) =>
    set((state) => {
      const selectedSerpFeatures = features
        .map((feature) => normalizeSerpFeature(feature))
        .filter((feature) => feature.length > 0)

      return {
        filters: { ...state.filters, selectedSerpFeatures },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  setIncludeKeywords: (words) =>
    set((state) => {
      const includeKeywords = words
        .map((word) => word.trim())
        .filter((word) => word.length > 0)

      return {
        filters: { ...state.filters, includeKeywords },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  setExcludeKeywords: (words) =>
    set((state) => {
      const excludeKeywords = words
        .map((word) => word.trim())
        .filter((word) => word.length > 0)

      return {
        filters: { ...state.filters, excludeKeywords },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  setIncludeTerms: (terms) =>
    set((state) => {
      const includeTerms = terms
        .map((term) => term.trim())
        .filter((term) => term.length > 0)

      return {
        filters: { ...state.filters, includeTerms },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  setExcludeTerms: (terms) =>
    set((state) => {
      const excludeTerms = terms
        .map((term) => term.trim())
        .filter((term) => term.length > 0)

      return {
        filters: { ...state.filters, excludeTerms },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  setWeakSpotFilters: (platforms) =>
    set((state) => {
      const weakSpotTypes = platforms
        .map((platform) => platform.trim().toLowerCase())
        .filter((platform) => platform.length > 0)

      return {
        filters: { ...state.filters, weakSpotTypes },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  toggleTrendFilter: (status) =>
    set((state) => {
      const normalized = status.trim().toLowerCase()
      if (normalized !== "rising" && normalized !== "falling" && normalized !== "stable") {
        return state
      }

      const exists = state.filters.selectedTrend.includes(
        normalized as KeywordFilters["selectedTrend"][number]
      )
      const selectedTrend = exists
        ? state.filters.selectedTrend.filter((value) => value !== normalized)
        : [...state.filters.selectedTrend, normalized as KeywordFilters["selectedTrend"][number]]

      return {
        filters: { ...state.filters, selectedTrend },
        pagination: { ...state.pagination, pageIndex: 0 },
      }
    }),

  applyPreset: (preset) =>
    set(() => ({
      filters: { ...DEFAULT_FILTERS, ...preset.filters },
      pagination: { ...DEFAULT_PAGINATION, pageIndex: 0 },
    })),

  setPresets: (presets) => set({ presets }),

  addPreset: (preset) =>
    set((state) => ({
      presets: [preset, ...state.presets.filter((item) => item.id !== preset.id)],
    })),

  removePreset: (id) =>
    set((state) => ({
      presets: state.presets.filter((preset) => preset.id !== id),
    })),
})
