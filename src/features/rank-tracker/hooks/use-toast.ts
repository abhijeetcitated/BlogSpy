// ============================================
// RANK TRACKER - Toast Hook with Cleanup
// ============================================

"use client"

import { useCallback, useRef, useEffect } from "react"

interface UseToastOptions {
  /** Duration in milliseconds before auto-hide */
  duration?: number
  /** Callback when toast is shown */
  onShow?: (message: string) => void
  /** Callback when toast is hidden */
  onHide?: () => void
}

/**
 * Hook for managing toast notifications with proper cleanup
 * Prevents memory leaks from setTimeout
 */
export function useToast({
  duration = 3000,
  onShow,
  onHide,
}: UseToastOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Show toast with auto-hide
  const showToast = useCallback(
    (message: string) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Show toast
      onShow?.(message)

      // Set auto-hide timeout
      timeoutRef.current = setTimeout(() => {
        onHide?.()
        timeoutRef.current = null
      }, duration)
    },
    [duration, onShow, onHide]
  )

  // Manually hide toast
  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    onHide?.()
  }, [onHide])

  return { showToast, hideToast }
}
