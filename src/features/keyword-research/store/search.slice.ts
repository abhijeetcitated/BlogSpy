// ============================================
// KEYWORD RESEARCH STORE - Search Slice
// ============================================

import type { StateCreator } from "zustand"
import { normalizeCountryCode } from "../utils/country-normalizer"
import { DEFAULT_SEARCH } from "./constants"
import type { KeywordState, SearchSlice } from "./types"

export const createSearchSlice: StateCreator<KeywordState, [], [], SearchSlice> = (set) => ({
  search: DEFAULT_SEARCH,

  setSeedKeyword: (keyword) =>
    set((state) => ({
      search: { ...state.search, seedKeyword: keyword },
    })),

  setCountry: (country) =>
    set((state) => {
      let normalized = "US"
      try {
        normalized = normalizeCountryCode(country)
      } catch {
        normalized = "US"
      }

      return {
        search: { ...state.search, country: normalized },
      }
    }),

  setMode: (mode) =>
    set((state) => ({
      search: { ...state.search, mode },
    })),

  setBulkKeywords: (keywords) =>
    set((state) => ({
      search: { ...state.search, bulkKeywords: keywords },
    })),

  setLanguageCode: (languageCode) =>
    set((state) => ({
      search: {
        ...state.search,
        languageCode: languageCode.trim().toLowerCase() || "en",
      },
    })),

  setDeviceType: (deviceType) =>
    set((state) => ({
      search: { ...state.search, deviceType },
    })),
})
