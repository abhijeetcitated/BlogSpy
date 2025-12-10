// ============================================
// KEYWORD STORE (Zustand)
// ============================================
// Keyword research state management
// ============================================

import { create } from "zustand"
import type { Keyword, KeywordFilters, KeywordSortOptions } from "@/types/keyword.types"

interface KeywordState {
  // Data
  keywords: Keyword[]
  selectedKeywords: Set<number>
  
  // Filters
  filters: KeywordFilters
  sortOptions: KeywordSortOptions
  
  // Search
  searchQuery: string
  isSearching: boolean
  
  // Actions
  setKeywords: (keywords: Keyword[]) => void
  addKeywords: (keywords: Keyword[]) => void
  
  // Selection
  selectKeyword: (id: number) => void
  deselectKeyword: (id: number) => void
  toggleKeyword: (id: number) => void
  selectAll: () => void
  deselectAll: () => void
  
  // Filters
  setFilters: (filters: Partial<KeywordFilters>) => void
  resetFilters: () => void
  
  // Sort
  setSortOptions: (options: KeywordSortOptions) => void
  
  // Search
  setSearchQuery: (query: string) => void
  setIsSearching: (isSearching: boolean) => void
}

const DEFAULT_FILTERS: KeywordFilters = {
  search: "",
  minVolume: 0,
  maxVolume: 1000000,
  minKd: 0,
  maxKd: 100,
  intents: [],
  serpFeatures: [],
  hasWeakSpot: null,
}

export const useKeywordStore = create<KeywordState>((set, get) => ({
  // Initial state
  keywords: [],
  selectedKeywords: new Set(),
  filters: DEFAULT_FILTERS,
  sortOptions: { field: null, direction: "desc" },
  searchQuery: "",
  isSearching: false,

  // Data actions
  setKeywords: (keywords) => set({ keywords }),
  addKeywords: (newKeywords) => 
    set((state) => ({ keywords: [...state.keywords, ...newKeywords] })),

  // Selection actions
  selectKeyword: (id) => 
    set((state) => {
      const newSet = new Set(state.selectedKeywords)
      newSet.add(id)
      return { selectedKeywords: newSet }
    }),
    
  deselectKeyword: (id) => 
    set((state) => {
      const newSet = new Set(state.selectedKeywords)
      newSet.delete(id)
      return { selectedKeywords: newSet }
    }),
    
  toggleKeyword: (id) => 
    set((state) => {
      const newSet = new Set(state.selectedKeywords)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return { selectedKeywords: newSet }
    }),
    
  selectAll: () => 
    set((state) => ({
      selectedKeywords: new Set(state.keywords.map((k) => k.id)),
    })),
    
  deselectAll: () => set({ selectedKeywords: new Set() }),

  // Filter actions
  setFilters: (newFilters) => 
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
    
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  // Sort actions
  setSortOptions: (options) => set({ sortOptions: options }),

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsSearching: (isSearching) => set({ isSearching }),
}))
