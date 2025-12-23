// ============================================
// RANK TRACKER - Auto Refresh Hook
// ============================================

"use client"

import { useEffect, useRef, useCallback } from "react"

interface UseAutoRefreshOptions {
  /** Refresh interval in minutes (null to disable) */
  intervalMinutes: number | null
  /** Callback to execute on each refresh */
  onRefresh: () => Promise<void>
  /** Whether refresh is currently in progress */
  isRefreshing?: boolean
}

/**
 * Hook for managing auto-refresh functionality
 */
export function useAutoRefresh({
  intervalMinutes,
  onRefresh,
  isRefreshing = false,
}: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clear interval on unmount or when disabled
  const clearRefreshInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Set up auto-refresh interval
  useEffect(() => {
    clearRefreshInterval()

    if (intervalMinutes && intervalMinutes > 0 && !isRefreshing) {
      intervalRef.current = setInterval(() => {
        onRefresh()
      }, intervalMinutes * 60 * 1000)
    }

    return clearRefreshInterval
  }, [intervalMinutes, onRefresh, isRefreshing, clearRefreshInterval])

  return { clearRefreshInterval }
}
