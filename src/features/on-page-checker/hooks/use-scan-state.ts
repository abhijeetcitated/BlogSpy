import { useReducer, useCallback } from "react"
import type { CurrentIssue } from "../types"

// State interface
export interface OnPageScanState {
  // Input state
  url: string
  targetKeyword: string
  // Scan state
  isScanning: boolean
  scanComplete: boolean
  scanProgress: number
  scanError: string | null
  // Modal state
  showAIModal: boolean
  currentIssue: CurrentIssue | null
  // Toast state
  showToast: boolean
  toastMessage: string
}

// Action types
type OnPageScanAction =
  | { type: "SET_URL"; payload: string }
  | { type: "SET_TARGET_KEYWORD"; payload: string }
  | { type: "START_SCAN" }
  | { type: "UPDATE_PROGRESS"; payload: number }
  | { type: "COMPLETE_SCAN" }
  | { type: "SCAN_ERROR"; payload: string }
  | { type: "RESET_SCAN" }
  | { type: "RETRY_SCAN" }
  | { type: "SHOW_AI_MODAL"; payload: CurrentIssue }
  | { type: "HIDE_AI_MODAL" }
  | { type: "SHOW_TOAST"; payload: string }
  | { type: "HIDE_TOAST" }
  | { type: "SELECT_FROM_HISTORY"; payload: { url: string; targetKeyword: string } }

// Initial state
const initialState: OnPageScanState = {
  url: "",
  targetKeyword: "",
  isScanning: false,
  scanComplete: false,
  scanProgress: 0,
  scanError: null,
  showAIModal: false,
  currentIssue: null,
  showToast: false,
  toastMessage: "",
}

// Reducer function
function scanReducer(state: OnPageScanState, action: OnPageScanAction): OnPageScanState {
  switch (action.type) {
    case "SET_URL":
      return { ...state, url: action.payload }
    
    case "SET_TARGET_KEYWORD":
      return { ...state, targetKeyword: action.payload }
    
    case "START_SCAN":
      return {
        ...state,
        isScanning: true,
        scanComplete: false,
        scanProgress: 0,
        scanError: null,
      }
    
    case "UPDATE_PROGRESS":
      return { ...state, scanProgress: action.payload }
    
    case "COMPLETE_SCAN":
      return {
        ...state,
        isScanning: false,
        scanComplete: true,
        scanProgress: 100,
      }
    
    case "SCAN_ERROR":
      return {
        ...state,
        isScanning: false,
        scanError: action.payload,
      }
    
    case "RESET_SCAN":
      return {
        ...state,
        isScanning: false,
        scanComplete: false,
        scanProgress: 0,
        scanError: null,
      }
    
    case "RETRY_SCAN":
      return {
        ...state,
        scanError: null,
        isScanning: true,
        scanProgress: 0,
      }
    
    case "SHOW_AI_MODAL":
      return {
        ...state,
        showAIModal: true,
        currentIssue: action.payload,
      }
    
    case "HIDE_AI_MODAL":
      return { ...state, showAIModal: false }
    
    case "SHOW_TOAST":
      return {
        ...state,
        showToast: true,
        toastMessage: action.payload,
      }
    
    case "HIDE_TOAST":
      return { ...state, showToast: false }
    
    case "SELECT_FROM_HISTORY":
      return {
        ...state,
        url: action.payload.url,
        targetKeyword: action.payload.targetKeyword,
      }
    
    default:
      return state
  }
}

/**
 * Hook for managing on-page scan state with useReducer
 * Consolidates multiple useState into a single state object with typed actions
 */
export function useScanState() {
  const [state, dispatch] = useReducer(scanReducer, initialState)

  // Action creators
  const actions = {
    setUrl: useCallback((url: string) => {
      dispatch({ type: "SET_URL", payload: url })
    }, []),

    setTargetKeyword: useCallback((keyword: string) => {
      dispatch({ type: "SET_TARGET_KEYWORD", payload: keyword })
    }, []),

    startScan: useCallback(() => {
      dispatch({ type: "START_SCAN" })
    }, []),

    updateProgress: useCallback((progress: number) => {
      dispatch({ type: "UPDATE_PROGRESS", payload: progress })
    }, []),

    completeScan: useCallback(() => {
      dispatch({ type: "COMPLETE_SCAN" })
    }, []),

    scanError: useCallback((error: string) => {
      dispatch({ type: "SCAN_ERROR", payload: error })
    }, []),

    resetScan: useCallback(() => {
      dispatch({ type: "RESET_SCAN" })
    }, []),

    retryScan: useCallback(() => {
      dispatch({ type: "RETRY_SCAN" })
    }, []),

    showAIModal: useCallback((issue: CurrentIssue) => {
      dispatch({ type: "SHOW_AI_MODAL", payload: issue })
    }, []),

    hideAIModal: useCallback(() => {
      dispatch({ type: "HIDE_AI_MODAL" })
    }, []),

    showToast: useCallback((message: string) => {
      dispatch({ type: "SHOW_TOAST", payload: message })
    }, []),

    hideToast: useCallback(() => {
      dispatch({ type: "HIDE_TOAST" })
    }, []),

    selectFromHistory: useCallback((url: string, targetKeyword: string) => {
      dispatch({ type: "SELECT_FROM_HISTORY", payload: { url, targetKeyword } })
    }, []),
  }

  return { state, actions, dispatch }
}

export type { OnPageScanAction }
