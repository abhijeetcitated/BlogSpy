"use client"

import { useState, useCallback } from "react"

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseApiReturn<T, P extends unknown[]> {
  data: T | null
  error: Error | null
  isLoading: boolean
  execute: (...args: P) => Promise<T | null>
  reset: () => void
}

/**
 * Generic hook for API calls with loading/error states
 * 
 * @example
 * const { data, isLoading, execute } = useApi(api.getKeywords)
 * 
 * // Call the API
 * await execute({ search: "seo" })
 */
export function useApi<T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<{ success: boolean; data?: T; error?: string }>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiFunction(...args)

        if (response.success && response.data) {
          setData(response.data)
          options.onSuccess?.(response.data)
          return response.data
        } else {
          const err = new Error(response.error || "API request failed")
          setError(err)
          options.onError?.(err)
          return null
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)
        options.onError?.(error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [apiFunction, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { data, error, isLoading, execute, reset }
}

/**
 * Simplified fetch hook for one-time data loading
 */
export function useFetch<T>(
  fetcher: () => Promise<{ success: boolean; data?: T; error?: string }>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetcher()
      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(new Error(response.error || "Failed to fetch"))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }, deps)

  // Auto-fetch on mount
  useState(() => {
    refetch()
  })

  return { data, error, isLoading, refetch }
}
