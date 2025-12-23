/**
 * Credit Transactions Hook
 * Manages transaction history with pagination
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { creditService } from "../services/credit.service"
import type { CreditTransaction } from "../types/credit.types"

export interface UseCreditTransactionsReturn {
  transactions: CreditTransaction[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useCreditTransactions(
  userId: string | null,
  limit: number = 20
): UseCreditTransactionsReturn {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const loadTransactions = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!userId) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await creditService.getTransactions(userId, pageNum, limit)
      if (response.success && response.data) {
        if (append) {
          setTransactions(prev => [...prev, ...response.data!.transactions])
        } else {
          setTransactions(response.data.transactions)
        }
        setHasMore(response.data.pagination.hasMore)
      } else {
        setError(response.error?.message || "Failed to fetch transactions")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [userId, limit])

  // Initial load with cleanup
  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (!userId) {
        if (isMounted) {
          setTransactions([])
          setIsLoading(false)
        }
        return
      }

      if (isMounted) setIsLoading(true)
      if (isMounted) setError(null)

      try {
        const response = await creditService.getTransactions(userId, 1, limit)
        if (isMounted) {
          if (response.success && response.data) {
            setTransactions(response.data.transactions)
            setHasMore(response.data.pagination.hasMore)
          } else {
            setError(response.error?.message || "Failed to fetch transactions")
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

    setPage(1)
    load()
    
    return () => {
      isMounted = false
    }
  }, [userId, limit])

  const loadMore = useCallback(async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await loadTransactions(nextPage, true)
  }, [page, loadTransactions])

  const refresh = useCallback(async () => {
    setPage(1)
    await loadTransactions(1, false)
  }, [loadTransactions])

  return { transactions, isLoading, error, hasMore, loadMore, refresh }
}
