"use client"

// ============================================
// KEYWORD MAGIC - State Reducer
// ============================================
// Centralized state management using useReducer
// ============================================

import type { Country, MatchType, BulkMode, SERPFeature } from "../types"
import {
  DEFAULT_VOLUME_RANGE,
  DEFAULT_KD_RANGE,
  DEFAULT_CPC_RANGE,
} from "../constants"

// Default ranges
export const DEFAULT_GEO_RANGE: [number, number] = [0, 100]

// ============================================
// STATE TYPE
// ============================================

export interface KeywordMagicState {
  // Search & Mode
  filterText: string
  matchType: MatchType
  bulkMode: BulkMode
  bulkKeywords: string
  isSearching: boolean
  
  // Country
  selectedCountry: Country | null
  countryOpen: boolean
  
  // Popover open states
  volumeOpen: boolean
  kdOpen: boolean
  intentOpen: boolean
  cpcOpen: boolean
  geoOpen: boolean
  weakSpotOpen: boolean
  serpOpen: boolean
  trendOpen: boolean
  
  // Temp filter states (before Apply)
  tempVolumeRange: [number, number]
  tempKdRange: [number, number]
  tempSelectedIntents: string[]
  tempCpcRange: [number, number]
  tempGeoRange: [number, number]
  tempHasWeakSpot: boolean | null
  tempWeakSpotTypes: string[]
  tempSelectedSerpFeatures: SERPFeature[]
  tempTrendDirection: "up" | "down" | "stable" | null
  tempMinTrendGrowth: number | null
  volumePreset: string | null
  
  // Applied filter states
  volumeRange: [number, number]
  kdRange: [number, number]
  selectedIntents: string[]
  cpcRange: [number, number]
  geoRange: [number, number]
  hasWeakSpot: boolean | null
  weakSpotTypes: string[]
  selectedSerpFeatures: SERPFeature[]
  trendDirection: "up" | "down" | "stable" | null
  minTrendGrowth: number | null
  
  // Include/Exclude
  includeTerms: string[]
  excludeTerms: string[]
  includeInput: string
  excludeInput: string
}

// ============================================
// INITIAL STATE FACTORY
// ============================================

export function createInitialState(
  initialSearch: string,
  initialCountry: Country | null
): KeywordMagicState {
  return {
    // Search & Mode
    filterText: initialSearch,
    matchType: "broad",
    bulkMode: "explore",
    bulkKeywords: "",
    isSearching: false,
    
    // Country
    selectedCountry: initialCountry,
    countryOpen: false,
    
    // Popover open states
    volumeOpen: false,
    kdOpen: false,
    intentOpen: false,
    cpcOpen: false,
    geoOpen: false,
    weakSpotOpen: false,
    serpOpen: false,
    trendOpen: false,
    
    // Temp filter states
    tempVolumeRange: DEFAULT_VOLUME_RANGE,
    tempKdRange: DEFAULT_KD_RANGE,
    tempSelectedIntents: [],
    tempCpcRange: DEFAULT_CPC_RANGE,
    tempGeoRange: DEFAULT_GEO_RANGE,
    tempHasWeakSpot: null,
    tempWeakSpotTypes: [],
    tempSelectedSerpFeatures: [],
    tempTrendDirection: null,
    tempMinTrendGrowth: null,
    volumePreset: null,
    
    // Applied filter states
    volumeRange: DEFAULT_VOLUME_RANGE,
    kdRange: DEFAULT_KD_RANGE,
    selectedIntents: [],
    cpcRange: DEFAULT_CPC_RANGE,
    geoRange: DEFAULT_GEO_RANGE,
    hasWeakSpot: null,
    weakSpotTypes: [],
    selectedSerpFeatures: [],
    trendDirection: null,
    minTrendGrowth: null,
    
    // Include/Exclude
    includeTerms: [],
    excludeTerms: [],
    includeInput: "",
    excludeInput: "",
  }
}

// ============================================
// ACTION TYPES
// ============================================

export type KeywordMagicAction =
  // Search & Mode
  | { type: "SET_FILTER_TEXT"; payload: string }
  | { type: "SET_MATCH_TYPE"; payload: MatchType }
  | { type: "SET_BULK_MODE"; payload: BulkMode }
  | { type: "SET_BULK_KEYWORDS"; payload: string }
  | { type: "SET_IS_SEARCHING"; payload: boolean }
  
  // Country
  | { type: "SET_SELECTED_COUNTRY"; payload: Country | null }
  | { type: "SET_COUNTRY_OPEN"; payload: boolean }
  
  // Popover open states
  | { type: "SET_POPOVER_OPEN"; payload: { name: keyof Pick<KeywordMagicState, "volumeOpen" | "kdOpen" | "intentOpen" | "cpcOpen" | "geoOpen" | "weakSpotOpen" | "serpOpen" | "trendOpen">; value: boolean } }
  
  // Temp filter states
  | { type: "SET_TEMP_VOLUME_RANGE"; payload: [number, number] }
  | { type: "SET_TEMP_KD_RANGE"; payload: [number, number] }
  | { type: "SET_TEMP_CPC_RANGE"; payload: [number, number] }
  | { type: "SET_TEMP_GEO_RANGE"; payload: [number, number] }
  | { type: "SET_VOLUME_PRESET"; payload: string | null }
  | { type: "TOGGLE_TEMP_INTENT"; payload: string }
  | { type: "SET_TEMP_HAS_WEAK_SPOT"; payload: boolean | null }
  | { type: "TOGGLE_TEMP_WEAK_SPOT_TYPE"; payload: string }
  | { type: "TOGGLE_TEMP_SERP_FEATURE"; payload: SERPFeature }
  | { type: "SET_TEMP_TREND_DIRECTION"; payload: "up" | "down" | "stable" | null }
  | { type: "SET_TEMP_MIN_TREND_GROWTH"; payload: number | null }
  
  // Apply filters
  | { type: "APPLY_VOLUME_FILTER" }
  | { type: "APPLY_KD_FILTER" }
  | { type: "APPLY_INTENT_FILTER" }
  | { type: "APPLY_CPC_FILTER" }
  | { type: "APPLY_GEO_FILTER" }
  | { type: "APPLY_WEAK_SPOT_FILTER" }
  | { type: "APPLY_SERP_FILTER" }
  | { type: "APPLY_TREND_FILTER" }
  
  // Include/Exclude
  | { type: "SET_INCLUDE_INPUT"; payload: string }
  | { type: "SET_EXCLUDE_INPUT"; payload: string }
  | { type: "ADD_INCLUDE_TERM" }
  | { type: "ADD_EXCLUDE_TERM" }
  | { type: "REMOVE_INCLUDE_TERM"; payload: string }
  | { type: "REMOVE_EXCLUDE_TERM"; payload: string }
  
  // Reset
  | { type: "RESET_ALL_FILTERS" }

// ============================================
// REDUCER
// ============================================

export function keywordMagicReducer(
  state: KeywordMagicState,
  action: KeywordMagicAction
): KeywordMagicState {
  switch (action.type) {
    // Search & Mode
    case "SET_FILTER_TEXT":
      return { ...state, filterText: action.payload }
    case "SET_MATCH_TYPE":
      return { ...state, matchType: action.payload }
    case "SET_BULK_MODE":
      return { ...state, bulkMode: action.payload }
    case "SET_BULK_KEYWORDS":
      return { ...state, bulkKeywords: action.payload }
    case "SET_IS_SEARCHING":
      return { ...state, isSearching: action.payload }
    
    // Country
    case "SET_SELECTED_COUNTRY":
      return { ...state, selectedCountry: action.payload }
    case "SET_COUNTRY_OPEN":
      return { ...state, countryOpen: action.payload }
    
    // Popover open states
    case "SET_POPOVER_OPEN":
      return { ...state, [action.payload.name]: action.payload.value }
    
    // Temp filter states
    case "SET_TEMP_VOLUME_RANGE":
      return { ...state, tempVolumeRange: action.payload }
    case "SET_TEMP_KD_RANGE":
      return { ...state, tempKdRange: action.payload }
    case "SET_TEMP_CPC_RANGE":
      return { ...state, tempCpcRange: action.payload }
    case "SET_TEMP_GEO_RANGE":
      return { ...state, tempGeoRange: action.payload }
    case "SET_VOLUME_PRESET":
      return { ...state, volumePreset: action.payload }
    case "TOGGLE_TEMP_INTENT":
      return {
        ...state,
        tempSelectedIntents: state.tempSelectedIntents.includes(action.payload)
          ? state.tempSelectedIntents.filter((v) => v !== action.payload)
          : [...state.tempSelectedIntents, action.payload],
      }
    case "SET_TEMP_HAS_WEAK_SPOT":
      return { ...state, tempHasWeakSpot: action.payload }
    case "TOGGLE_TEMP_WEAK_SPOT_TYPE":
      return {
        ...state,
        tempWeakSpotTypes: state.tempWeakSpotTypes.includes(action.payload)
          ? state.tempWeakSpotTypes.filter((t) => t !== action.payload)
          : [...state.tempWeakSpotTypes, action.payload],
      }
    case "TOGGLE_TEMP_SERP_FEATURE":
      return {
        ...state,
        tempSelectedSerpFeatures: state.tempSelectedSerpFeatures.includes(action.payload)
          ? state.tempSelectedSerpFeatures.filter((f) => f !== action.payload)
          : [...state.tempSelectedSerpFeatures, action.payload],
      }
    case "SET_TEMP_TREND_DIRECTION":
      return { ...state, tempTrendDirection: action.payload }
    case "SET_TEMP_MIN_TREND_GROWTH":
      return { ...state, tempMinTrendGrowth: action.payload }
    
    // Apply filters
    case "APPLY_VOLUME_FILTER":
      return { ...state, volumeRange: state.tempVolumeRange, volumeOpen: false }
    case "APPLY_KD_FILTER":
      return { ...state, kdRange: state.tempKdRange, kdOpen: false }
    case "APPLY_INTENT_FILTER":
      return { ...state, selectedIntents: state.tempSelectedIntents, intentOpen: false }
    case "APPLY_CPC_FILTER":
      return { ...state, cpcRange: state.tempCpcRange, cpcOpen: false }
    case "APPLY_GEO_FILTER":
      return { ...state, geoRange: state.tempGeoRange, geoOpen: false }
    case "APPLY_WEAK_SPOT_FILTER":
      return {
        ...state,
        hasWeakSpot: state.tempHasWeakSpot,
        weakSpotTypes: state.tempWeakSpotTypes,
        weakSpotOpen: false,
      }
    case "APPLY_SERP_FILTER":
      return { ...state, selectedSerpFeatures: state.tempSelectedSerpFeatures, serpOpen: false }
    case "APPLY_TREND_FILTER":
      return {
        ...state,
        trendDirection: state.tempTrendDirection,
        minTrendGrowth: state.tempMinTrendGrowth,
        trendOpen: false,
      }
    
    // Include/Exclude
    case "SET_INCLUDE_INPUT":
      return { ...state, includeInput: action.payload }
    case "SET_EXCLUDE_INPUT":
      return { ...state, excludeInput: action.payload }
    case "ADD_INCLUDE_TERM": {
      const term = state.includeInput.trim()
      if (term && !state.includeTerms.includes(term)) {
        return {
          ...state,
          includeTerms: [...state.includeTerms, term],
          includeInput: "",
        }
      }
      return state
    }
    case "ADD_EXCLUDE_TERM": {
      const term = state.excludeInput.trim()
      if (term && !state.excludeTerms.includes(term)) {
        return {
          ...state,
          excludeTerms: [...state.excludeTerms, term],
          excludeInput: "",
        }
      }
      return state
    }
    case "REMOVE_INCLUDE_TERM":
      return {
        ...state,
        includeTerms: state.includeTerms.filter((t) => t !== action.payload),
      }
    case "REMOVE_EXCLUDE_TERM":
      return {
        ...state,
        excludeTerms: state.excludeTerms.filter((t) => t !== action.payload),
      }
    
    // Reset
    case "RESET_ALL_FILTERS":
      return {
        ...state,
        filterText: "",
        volumeRange: DEFAULT_VOLUME_RANGE,
        kdRange: DEFAULT_KD_RANGE,
        cpcRange: DEFAULT_CPC_RANGE,
        geoRange: DEFAULT_GEO_RANGE,
        selectedIntents: [],
        hasWeakSpot: null,
        weakSpotTypes: [],
        selectedSerpFeatures: [],
        trendDirection: null,
        minTrendGrowth: null,
        includeTerms: [],
        excludeTerms: [],
        tempVolumeRange: DEFAULT_VOLUME_RANGE,
        tempKdRange: DEFAULT_KD_RANGE,
        tempCpcRange: DEFAULT_CPC_RANGE,
        tempGeoRange: DEFAULT_GEO_RANGE,
        tempSelectedIntents: [],
        tempHasWeakSpot: null,
        tempWeakSpotTypes: [],
        tempSelectedSerpFeatures: [],
        tempTrendDirection: null,
        tempMinTrendGrowth: null,
        volumePreset: null,
      }
    
    default:
      return state
  }
}

// ============================================
// SELECTORS
// ============================================

export function getActiveFilterCount(state: KeywordMagicState): number {
  let count = 0
  
  if (state.volumeRange[0] !== DEFAULT_VOLUME_RANGE[0] || state.volumeRange[1] !== DEFAULT_VOLUME_RANGE[1]) count++
  if (state.kdRange[0] !== DEFAULT_KD_RANGE[0] || state.kdRange[1] !== DEFAULT_KD_RANGE[1]) count++
  if (state.cpcRange[0] !== DEFAULT_CPC_RANGE[0] || state.cpcRange[1] !== DEFAULT_CPC_RANGE[1]) count++
  if (state.geoRange[0] !== DEFAULT_GEO_RANGE[0] || state.geoRange[1] !== DEFAULT_GEO_RANGE[1]) count++
  if (state.selectedIntents.length > 0) count++
  if (state.selectedSerpFeatures.length > 0) count++
  if (state.hasWeakSpot !== null) count++
  if (state.trendDirection !== null) count++
  if (state.includeTerms.length > 0) count++
  if (state.excludeTerms.length > 0) count++
  
  return count
}
