// ============================================
// KEYWORD RESEARCH STORE - Drawer Slice
// ============================================

import type { StateCreator } from "zustand"
import { normalizeCountryCode } from "../utils/country-normalizer"
import { DRAWER_CACHE_TTL } from "./constants"
import type { DrawerSlice, DrawerCache, KeywordState } from "./types"

export const createDrawerSlice: StateCreator<KeywordState, [], [], DrawerSlice> = (set, get) => ({
  selectedKeyword: null,
  drawerCache: {},

  setSelectedKeyword: (keyword) => set({ selectedKeyword: keyword }),
  openKeywordDrawer: (keyword) => set({ selectedKeyword: keyword }),
  closeKeywordDrawer: () => set({ selectedKeyword: null }),

  setDrawerCache: (country, keyword, type, data) =>
    set((state) => {
      const countryCode = normalizeCountryCode(country)
      const cacheKey = `${countryCode}:${keyword}`

      return {
        drawerCache: {
          ...state.drawerCache,
          [cacheKey]: {
            ...state.drawerCache[cacheKey],
            [type]: data,
            fetchedAt: Date.now(),
          },
        },
      }
    }),

  getCachedData: (country, keyword, type) => {
    const state = get()
    const countryCode = normalizeCountryCode(country)
    const cacheKey = `${countryCode}:${keyword}`

    const entry = state.drawerCache[cacheKey]
    if (!entry) return null

    const fetchedAt = entry.fetchedAt ?? 0
    if (Date.now() - fetchedAt > DRAWER_CACHE_TTL) {
      return null
    }

    return entry[type] ?? null
  },

  clearDrawerCache: (country, keyword) =>
    set((state) => {
      if (country && keyword) {
        const countryCode = normalizeCountryCode(country)
        const cacheKey = `${countryCode}:${keyword}`
        const newCache = { ...state.drawerCache }
        delete newCache[cacheKey]
        return { drawerCache: newCache }
      }

      if (country && !keyword) {
        const countryCode = normalizeCountryCode(country)
        const prefix = `${countryCode}:`
        const newCache: DrawerCache = {}
        for (const [k, v] of Object.entries(state.drawerCache)) {
          if (!k.startsWith(prefix)) {
            newCache[k] = v
          }
        }
        return { drawerCache: newCache }
      }

      return { drawerCache: {} }
    }),
})
