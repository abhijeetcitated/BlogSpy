import { useState, useEffect, useCallback, useMemo } from "react"

export interface ScanHistoryItem {
  id: string
  url: string
  targetKeyword: string
  score: number
  errorCount: number
  warningCount: number
  passedCount: number
  timestamp: number
}

interface UseScanHistoryOptions {
  /** User ID for user-specific history. If not provided, uses global storage */
  userId?: string
  /** Maximum number of history items to keep */
  maxItems?: number
}

const STORAGE_KEY_PREFIX = "on-page-checker-history"
const DEFAULT_MAX_ITEMS = 10

/**
 * Hook for managing on-page scan history in localStorage
 * Supports user-specific history when userId is provided
 */
export function useScanHistory(options: UseScanHistoryOptions = {}) {
  const { userId, maxItems = DEFAULT_MAX_ITEMS } = options
  const [history, setHistory] = useState<ScanHistoryItem[]>([])
  
  // Create user-specific storage key
  const storageKey = useMemo(() => {
    return userId 
      ? `${STORAGE_KEY_PREFIX}-${userId}` 
      : STORAGE_KEY_PREFIX
  }, [userId])

  // Load from localStorage on mount or when storageKey changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setHistory(JSON.parse(stored))
      } else {
        setHistory([])
      }
    } catch {
      console.error("Failed to load scan history")
      setHistory([])
    }
  }, [storageKey])

  // Save to localStorage
  const saveHistory = useCallback((items: ScanHistoryItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
      setHistory(items)
    } catch {
      console.error("Failed to save scan history")
    }
  }, [storageKey])

  // Add new scan to history
  const addScan = useCallback((scan: Omit<ScanHistoryItem, "id" | "timestamp">) => {
    const newItem: ScanHistoryItem = {
      ...scan,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    
    // Prepend new item, keep only maxItems
    const updatedHistory = [newItem, ...history].slice(0, maxItems)
    saveHistory(updatedHistory)
    
    return newItem
  }, [history, saveHistory, maxItems])

  // Remove scan from history
  const removeScan = useCallback((id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    saveHistory(updatedHistory)
  }, [history, saveHistory])

  // Clear all history
  const clearHistory = useCallback(() => {
    saveHistory([])
  }, [saveHistory])

  return {
    history,
    addScan,
    removeScan,
    clearHistory,
  }
}
