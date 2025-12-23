/**
 * Credit Balance Hook
 * Manages user credit balance state and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { creditService } from "../services/credit.service"
import type { CreditBalance } from "../types/credit.types"

export interface UseCreditBalanceReturn {
  balance: CreditBalance | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  hasCredits: (amount: number) => boolean
}

export function useCreditBalance(userId: string | null): UseCreditBalanceReturn {
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setBalance(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await creditService.getBalance(userId)
      if (response.success && response.data) {
        setBalance(response.data)
      } else {
        setError(response.error?.message || "Failed to fetch balance")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Initial load and cleanup
  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (!userId) {
        setBalance(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await creditService.getBalance(userId)
        if (isMounted) {
          if (response.success && response.data) {
            setBalance(response.data)
          } else {
            setError(response.error?.message || "Failed to fetch balance")
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "An error occurred")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()
    
    // Cleanup to prevent memory leaks
    return () => {
      isMounted = false
    }
  }, [userId])

  const hasCredits = useCallback((amount: number): boolean => {
    return balance ? balance.availableCredits >= amount : false
  }, [balance])

  return { balance, isLoading, error, refresh, hasCredits }
}
