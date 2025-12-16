import { useState, useEffect, useCallback } from "react"

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

const STORAGE_KEY = "on-page-checker-history"
const MAX_HISTORY_ITEMS = 10

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch {
      console.error("Failed to load scan history")
    }
  }, [])

  // Save to localStorage
  const saveHistory = useCallback((items: ScanHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      setHistory(items)
    } catch {
      console.error("Failed to save scan history")
    }
  }, [])

  // Add new scan to history
  const addScan = useCallback((scan: Omit<ScanHistoryItem, "id" | "timestamp">) => {
    const newItem: ScanHistoryItem = {
      ...scan,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    
    // Prepend new item, keep only MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS)
    saveHistory(updatedHistory)
    
    return newItem
  }, [history, saveHistory])

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
