// ============================================
// RANK TRACKER - State Management Hook
// ============================================
// 
// Centralized state management using useReducer pattern.
// Replaces 25+ individual useState hooks with a single reducer.
// 
// Usage:
//   const { state, actions } = useRankTrackerState()
//   actions.setSearchQuery("keyword")
//   actions.toggleSort("rank")
// ============================================

"use client"

import { useReducer, useCallback, useMemo } from "react"
import type { RankData, FilterTab, SortField, SortDirection, SearchPlatform } from "../types"
import type { AlertSettingsState } from "../components/modals"

/**
 * Main state interface for the rank tracker feature
 * @description Contains all UI state including filters, pagination, modals, and loading states
 */
export interface RankTrackerState {
  // Search & Filter
  searchQuery: string
  activeTab: FilterTab
  sortField: SortField
  sortDirection: SortDirection
  
  // Loading States
  isLoading: boolean
  isRefreshing: boolean
  lastUpdated: Date | null
  
  // Platform & Country
  activePlatform: SearchPlatform
  activeCountry: string
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  dateRange: "7d" | "30d" | "90d" | "all"
  
  // Selection
  selectedKeywords: Set<string>
  
  // Modals
  isAddModalOpen: boolean
  isAlertSettingsOpen: boolean
  isBulkDeleteOpen: boolean
  deleteConfirmKeyword: RankData | null
  editingKeyword: RankData | null
  detailKeyword: RankData | null
  
  // Alert States
  isAlertsEnabled: boolean
  alertSettings: AlertSettingsState
  
  // Toast
  showToast: boolean
  toastMessage: string
  
  // Auto Refresh
  autoRefreshInterval: number | null
  
  // Operation States
  isAdding: boolean
  isDeleting: boolean
  isEditing: boolean
}

/**
 * Union type of all possible actions for the rank tracker reducer
 */
type RankTrackerAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: FilterTab }
  | { type: "SET_SORT"; payload: { field: SortField; direction: SortDirection } }
  | { type: "TOGGLE_SORT"; payload: SortField }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_LAST_UPDATED"; payload: Date }
  | { type: "SET_PLATFORM"; payload: SearchPlatform }
  | { type: "SET_COUNTRY"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_ITEMS_PER_PAGE"; payload: number }
  | { type: "SET_DATE_RANGE"; payload: "7d" | "30d" | "90d" | "all" }
  | { type: "SELECT_KEYWORD"; payload: string }
  | { type: "SELECT_ALL"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "OPEN_ADD_MODAL" }
  | { type: "CLOSE_ADD_MODAL" }
  | { type: "OPEN_ALERT_SETTINGS" }
  | { type: "CLOSE_ALERT_SETTINGS" }
  | { type: "OPEN_BULK_DELETE" }
  | { type: "CLOSE_BULK_DELETE" }
  | { type: "SET_DELETE_CONFIRM"; payload: RankData | null }
  | { type: "SET_EDITING_KEYWORD"; payload: RankData | null }
  | { type: "SET_DETAIL_KEYWORD"; payload: RankData | null }
  | { type: "TOGGLE_ALERTS"; payload?: boolean }
  | { type: "SET_ALERT_SETTINGS"; payload: AlertSettingsState }
  | { type: "SHOW_TOAST"; payload: string }
  | { type: "HIDE_TOAST" }
  | { type: "SET_AUTO_REFRESH"; payload: number | null }
  | { type: "SET_ADDING"; payload: boolean }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SET_EDITING"; payload: boolean }
  | { type: "RESET_FILTERS" }

// Initial State
const initialState: RankTrackerState = {
  searchQuery: "",
  activeTab: "All",
  sortField: null,
  sortDirection: "desc",
  isLoading: false,
  isRefreshing: false,
  lastUpdated: null,
  activePlatform: "google",
  activeCountry: "worldwide",
  currentPage: 1,
  itemsPerPage: 10,
  dateRange: "30d",
  selectedKeywords: new Set(),
  isAddModalOpen: false,
  isAlertSettingsOpen: false,
  isBulkDeleteOpen: false,
  deleteConfirmKeyword: null,
  editingKeyword: null,
  detailKeyword: null,
  isAlertsEnabled: false,
  alertSettings: {
    rankDrops: true,
    rankImprovements: true,
    top3Entry: true,
    top10Entry: true,
    aiOverviewChanges: false,
    emailNotifications: true,
    slackIntegration: false,
  },
  showToast: false,
  toastMessage: "",
  autoRefreshInterval: null,
  isAdding: false,
  isDeleting: false,
  isEditing: false,
}

// Reducer
function rankTrackerReducer(
  state: RankTrackerState,
  action: RankTrackerAction
): RankTrackerState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, currentPage: 1 }

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload, currentPage: 1 }

    case "SET_SORT":
      return {
        ...state,
        sortField: action.payload.field,
        sortDirection: action.payload.direction,
      }

    case "TOGGLE_SORT":
      if (state.sortField === action.payload) {
        return {
          ...state,
          sortDirection: state.sortDirection === "asc" ? "desc" : "asc",
        }
      }
      return { ...state, sortField: action.payload, sortDirection: "desc" }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_REFRESHING":
      return { ...state, isRefreshing: action.payload }

    case "SET_LAST_UPDATED":
      return { ...state, lastUpdated: action.payload }

    case "SET_PLATFORM":
      return { ...state, activePlatform: action.payload, currentPage: 1 }

    case "SET_COUNTRY":
      return { ...state, activeCountry: action.payload, currentPage: 1 }

    case "SET_PAGE":
      return { ...state, currentPage: action.payload }

    case "SET_ITEMS_PER_PAGE":
      return { ...state, itemsPerPage: action.payload, currentPage: 1 }

    case "SET_DATE_RANGE":
      return { ...state, dateRange: action.payload }

    case "SELECT_KEYWORD": {
      const next = new Set(state.selectedKeywords)
      if (next.has(action.payload)) {
        next.delete(action.payload)
      } else {
        next.add(action.payload)
      }
      return { ...state, selectedKeywords: next }
    }

    case "SELECT_ALL":
      if (state.selectedKeywords.size === action.payload.length) {
        return { ...state, selectedKeywords: new Set() }
      }
      return { ...state, selectedKeywords: new Set(action.payload) }

    case "CLEAR_SELECTION":
      return { ...state, selectedKeywords: new Set() }

    case "OPEN_ADD_MODAL":
      return { ...state, isAddModalOpen: true }

    case "CLOSE_ADD_MODAL":
      return { ...state, isAddModalOpen: false }

    case "OPEN_ALERT_SETTINGS":
      return { ...state, isAlertSettingsOpen: true }

    case "CLOSE_ALERT_SETTINGS":
      return { ...state, isAlertSettingsOpen: false }

    case "OPEN_BULK_DELETE":
      return { ...state, isBulkDeleteOpen: true }

    case "CLOSE_BULK_DELETE":
      return { ...state, isBulkDeleteOpen: false }

    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirmKeyword: action.payload }

    case "SET_EDITING_KEYWORD":
      return { ...state, editingKeyword: action.payload }

    case "SET_DETAIL_KEYWORD":
      return { ...state, detailKeyword: action.payload }

    case "TOGGLE_ALERTS":
      return {
        ...state,
        isAlertsEnabled: action.payload ?? !state.isAlertsEnabled,
      }

    case "SET_ALERT_SETTINGS":
      return { ...state, alertSettings: action.payload }

    case "SHOW_TOAST":
      return { ...state, showToast: true, toastMessage: action.payload }

    case "HIDE_TOAST":
      return { ...state, showToast: false }

    case "SET_AUTO_REFRESH":
      return { ...state, autoRefreshInterval: action.payload }

    case "SET_ADDING":
      return { ...state, isAdding: action.payload }

    case "SET_DELETING":
      return { ...state, isDeleting: action.payload }

    case "SET_EDITING":
      return { ...state, isEditing: action.payload }

    case "RESET_FILTERS":
      return {
        ...state,
        searchQuery: "",
        activeTab: "All",
        currentPage: 1,
        selectedKeywords: new Set(),
      }

    default:
      return state
  }
}

/**
 * Hook for managing Rank Tracker state with useReducer
 * @description Centralizes all UI state management, replacing 25+ individual useState calls.
 * Returns current state and memoized action creators.
 * 
 * @returns {Object} State and actions
 * @returns {RankTrackerState} state - Current state object
 * @returns {Object} actions - Memoized action creators
 * 
 * @example
 * ```tsx
 * const { state, actions } = useRankTrackerState()
 * 
 * // Read state
 * console.log(state.searchQuery, state.isLoading)
 * 
 * // Dispatch actions
 * actions.setSearchQuery("seo tools")
 * actions.toggleSort("rank")
 * actions.openAddModal()
 * ```
 */
export function useRankTrackerState() {
  const [state, dispatch] = useReducer(rankTrackerReducer, initialState)

  // Action creators - memoized to prevent unnecessary re-renders
  const actions = useMemo(
    () => ({
      /** Update the search query for filtering keywords */
      setSearchQuery: (query: string) =>
        dispatch({ type: "SET_SEARCH_QUERY", payload: query }),

      setActiveTab: (tab: FilterTab) =>
        dispatch({ type: "SET_ACTIVE_TAB", payload: tab }),

      toggleSort: (field: SortField) =>
        dispatch({ type: "TOGGLE_SORT", payload: field }),

      setLoading: (loading: boolean) =>
        dispatch({ type: "SET_LOADING", payload: loading }),

      setRefreshing: (refreshing: boolean) =>
        dispatch({ type: "SET_REFRESHING", payload: refreshing }),

      setLastUpdated: (date: Date) =>
        dispatch({ type: "SET_LAST_UPDATED", payload: date }),

      setPlatform: (platform: SearchPlatform) =>
        dispatch({ type: "SET_PLATFORM", payload: platform }),

      setCountry: (country: string) =>
        dispatch({ type: "SET_COUNTRY", payload: country }),

      setPage: (page: number) =>
        dispatch({ type: "SET_PAGE", payload: page }),

      setItemsPerPage: (count: number) =>
        dispatch({ type: "SET_ITEMS_PER_PAGE", payload: count }),

      setDateRange: (range: "7d" | "30d" | "90d" | "all") =>
        dispatch({ type: "SET_DATE_RANGE", payload: range }),

      selectKeyword: (id: string) =>
        dispatch({ type: "SELECT_KEYWORD", payload: id }),

      selectAll: (ids: string[]) =>
        dispatch({ type: "SELECT_ALL", payload: ids }),

      clearSelection: () =>
        dispatch({ type: "CLEAR_SELECTION" }),

      openAddModal: () =>
        dispatch({ type: "OPEN_ADD_MODAL" }),

      closeAddModal: () =>
        dispatch({ type: "CLOSE_ADD_MODAL" }),

      openAlertSettings: () =>
        dispatch({ type: "OPEN_ALERT_SETTINGS" }),

      closeAlertSettings: () =>
        dispatch({ type: "CLOSE_ALERT_SETTINGS" }),

      openBulkDelete: () =>
        dispatch({ type: "OPEN_BULK_DELETE" }),

      closeBulkDelete: () =>
        dispatch({ type: "CLOSE_BULK_DELETE" }),

      setDeleteConfirm: (keyword: RankData | null) =>
        dispatch({ type: "SET_DELETE_CONFIRM", payload: keyword }),

      setEditingKeyword: (keyword: RankData | null) =>
        dispatch({ type: "SET_EDITING_KEYWORD", payload: keyword }),

      setDetailKeyword: (keyword: RankData | null) =>
        dispatch({ type: "SET_DETAIL_KEYWORD", payload: keyword }),

      toggleAlerts: (enabled?: boolean) =>
        dispatch({ type: "TOGGLE_ALERTS", payload: enabled }),

      setAlertSettings: (settings: AlertSettingsState) =>
        dispatch({ type: "SET_ALERT_SETTINGS", payload: settings }),

      showToast: (message: string) =>
        dispatch({ type: "SHOW_TOAST", payload: message }),

      hideToast: () =>
        dispatch({ type: "HIDE_TOAST" }),

      setAutoRefresh: (interval: number | null) =>
        dispatch({ type: "SET_AUTO_REFRESH", payload: interval }),

      setAdding: (adding: boolean) =>
        dispatch({ type: "SET_ADDING", payload: adding }),

      setDeleting: (deleting: boolean) =>
        dispatch({ type: "SET_DELETING", payload: deleting }),

      setEditing: (editing: boolean) =>
        dispatch({ type: "SET_EDITING", payload: editing }),

      resetFilters: () =>
        dispatch({ type: "RESET_FILTERS" }),
    }),
    []
  )

  return { state, actions, dispatch }
}
