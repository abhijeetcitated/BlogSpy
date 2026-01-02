"use client"

// ============================================
// KEYWORD RESEARCH PROVIDER - Feature context provider
// ============================================

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { KeywordFilters } from "@/types/keyword.types"

// ============================================
// Types
// ============================================

interface KeywordResearchState {
  // Search state
  query: string
  isSearching: boolean
  searchMode: "single" | "bulk"
  
  // Filter state
  filters: KeywordFilters
  
  // Selection state
  selectedKeywords: Set<string>
  
  // UI state
  isFilterPanelOpen: boolean
  activeModal: "export" | "presets" | "details" | null
  selectedKeywordId: string | null
}

type KeywordResearchAction =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_SEARCHING"; payload: boolean }
  | { type: "SET_SEARCH_MODE"; payload: "single" | "bulk" }
  | { type: "SET_FILTERS"; payload: Partial<KeywordFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "SELECT_KEYWORD"; payload: string }
  | { type: "DESELECT_KEYWORD"; payload: string }
  | { type: "SELECT_ALL"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "TOGGLE_FILTER_PANEL" }
  | { type: "SET_ACTIVE_MODAL"; payload: KeywordResearchState["activeModal"] }
  | { type: "SET_SELECTED_KEYWORD_ID"; payload: string | null }

// ============================================
// Initial State
// ============================================

const initialFilters: KeywordFilters = {
  search: "",
  minVolume: 0,
  maxVolume: 1000000,
  minKd: 0,
  maxKd: 100,
  intents: [],
  serpFeatures: [],
  hasWeakSpot: null,
}

const initialState: KeywordResearchState = {
  query: "",
  isSearching: false,
  searchMode: "single",
  filters: initialFilters,
  selectedKeywords: new Set(),
  isFilterPanelOpen: false,
  activeModal: null,
  selectedKeywordId: null,
}

// ============================================
// Reducer
// ============================================

function keywordResearchReducer(
  state: KeywordResearchState,
  action: KeywordResearchAction
): KeywordResearchState {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload }
    
    case "SET_SEARCHING":
      return { ...state, isSearching: action.payload }
    
    case "SET_SEARCH_MODE":
      return { ...state, searchMode: action.payload }
    
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } }
    
    case "RESET_FILTERS":
      return { ...state, filters: initialFilters }
    
    case "SELECT_KEYWORD": {
      const newSelected = new Set(state.selectedKeywords)
      newSelected.add(action.payload)
      return { ...state, selectedKeywords: newSelected }
    }
    
    case "DESELECT_KEYWORD": {
      const newSelected = new Set(state.selectedKeywords)
      newSelected.delete(action.payload)
      return { ...state, selectedKeywords: newSelected }
    }
    
    case "SELECT_ALL":
      return { ...state, selectedKeywords: new Set(action.payload) }
    
    case "CLEAR_SELECTION":
      return { ...state, selectedKeywords: new Set() }
    
    case "TOGGLE_FILTER_PANEL":
      return { ...state, isFilterPanelOpen: !state.isFilterPanelOpen }
    
    case "SET_ACTIVE_MODAL":
      return { ...state, activeModal: action.payload }
    
    case "SET_SELECTED_KEYWORD_ID":
      return { ...state, selectedKeywordId: action.payload }
    
    default:
      return state
  }
}

// ============================================
// Context
// ============================================

interface KeywordResearchContextValue {
  state: KeywordResearchState
  dispatch: React.Dispatch<KeywordResearchAction>
  // Convenience actions
  setQuery: (query: string) => void
  setFilters: (filters: Partial<KeywordFilters>) => void
  resetFilters: () => void
  toggleKeyword: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  openModal: (modal: KeywordResearchState["activeModal"]) => void
  closeModal: () => void
}

const KeywordResearchContext = createContext<KeywordResearchContextValue | null>(null)

// ============================================
// Provider
// ============================================

interface KeywordResearchProviderProps {
  children: ReactNode
  initialQuery?: string
}

export function KeywordResearchProvider({
  children,
  initialQuery = "",
}: KeywordResearchProviderProps) {
  const [state, dispatch] = useReducer(keywordResearchReducer, {
    ...initialState,
    query: initialQuery,
  })

  const value: KeywordResearchContextValue = {
    state,
    dispatch,
    setQuery: (query) => dispatch({ type: "SET_QUERY", payload: query }),
    setFilters: (filters) => dispatch({ type: "SET_FILTERS", payload: filters }),
    resetFilters: () => dispatch({ type: "RESET_FILTERS" }),
    toggleKeyword: (id) => {
      if (state.selectedKeywords.has(id)) {
        dispatch({ type: "DESELECT_KEYWORD", payload: id })
      } else {
        dispatch({ type: "SELECT_KEYWORD", payload: id })
      }
    },
    selectAll: (ids) => dispatch({ type: "SELECT_ALL", payload: ids }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),
    openModal: (modal) => dispatch({ type: "SET_ACTIVE_MODAL", payload: modal }),
    closeModal: () => dispatch({ type: "SET_ACTIVE_MODAL", payload: null }),
  }

  return (
    <KeywordResearchContext.Provider value={value}>
      {children}
    </KeywordResearchContext.Provider>
  )
}

// ============================================
// Hook
// ============================================

export function useKeywordResearch() {
  const context = useContext(KeywordResearchContext)
  if (!context) {
    throw new Error("useKeywordResearch must be used within a KeywordResearchProvider")
  }
  return context
}

// Export types
export type { KeywordResearchState, KeywordResearchAction, KeywordResearchContextValue }
