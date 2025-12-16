/**
 * ============================================
 * SOCIAL TRACKER - CREDIT HOOKS
 * ============================================
 * 
 * React hooks for credit system integration
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-15
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { creditService } from "../services/credit.service"
import { 
  CREDIT_PACKAGES, 
  PLATFORM_CREDIT_COSTS,
  calculateCustomPrice,
  formatPrice,
} from "../config/pricing.config"
import type {
  CreditBalance,
  CreditTransaction,
  CreditPurchase,
  CreatePurchaseRequest,
  CreditUsageStats,
  CreditPackage,
  PlatformCreditConfig,
} from "../types/credit.types"

// ============================================
// CREDIT BALANCE HOOK
// ============================================

interface UseCreditBalanceReturn {
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

  useEffect(() => {
    refresh()
  }, [refresh])

  const hasCredits = useCallback((amount: number): boolean => {
    return balance ? balance.availableCredits >= amount : false
  }, [balance])

  return { balance, isLoading, error, refresh, hasCredits }
}

// ============================================
// CREDIT TRANSACTIONS HOOK
// ============================================

interface UseCreditTransactionsReturn {
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

  useEffect(() => {
    setPage(1)
    loadTransactions(1, false)
  }, [loadTransactions])

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

// ============================================
// CREDIT PURCHASE HOOK
// ============================================

interface UseCreditPurchaseReturn {
  purchase: CreditPurchase | null
  isLoading: boolean
  error: string | null
  initiatePurchase: (request: CreatePurchaseRequest) => Promise<string | null>
  completePurchase: (purchaseId: string, paymentId: string) => Promise<boolean>
  reset: () => void
}

export function useCreditPurchase(userId: string | null): UseCreditPurchaseReturn {
  const [purchase, setPurchase] = useState<CreditPurchase | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiatePurchase = useCallback(async (request: CreatePurchaseRequest): Promise<string | null> => {
    if (!userId) {
      setError("User not authenticated")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await creditService.createPurchase(userId, request)
      if (response.success && response.data) {
        setPurchase(response.data.purchase || null)
        return response.data.checkoutUrl || null
      } else {
        setError(response.error?.message || "Failed to initiate purchase")
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const completePurchase = useCallback(async (
    purchaseId: string, 
    paymentId: string
  ): Promise<boolean> => {
    if (!userId) {
      setError("User not authenticated")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await creditService.completePurchase(userId, purchaseId, paymentId)
      if (response.success && response.data) {
        setPurchase(response.data.purchase || null)
        return true
      } else {
        setError(response.error?.message || "Failed to complete purchase")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const reset = useCallback(() => {
    setPurchase(null)
    setError(null)
  }, [])

  return { purchase, isLoading, error, initiatePurchase, completePurchase, reset }
}

// ============================================
// CREDIT USAGE HOOK
// ============================================

interface UseCreditUsageReturn {
  isLoading: boolean
  error: string | null
  useCredits: (platform: string, action: string, keyword?: string) => Promise<boolean>
  usageStats: CreditUsageStats | null
  refreshStats: () => Promise<void>
}

export function useCreditUsage(userId: string | null): UseCreditUsageReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usageStats, setUsageStats] = useState<CreditUsageStats | null>(null)

  const useCredits = useCallback(async (
    platform: string,
    action: string,
    keyword?: string
  ): Promise<boolean> => {
    if (!userId) {
      setError("User not authenticated")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const platformConfig = PLATFORM_CREDIT_COSTS[platform]
      if (!platformConfig) {
        setError(`Invalid platform: ${platform}`)
        return false
      }

      let credits = 0
      switch (action) {
        case "track_keyword":
          credits = platformConfig.creditsPerKeyword
          break
        case "refresh":
          credits = platformConfig.creditsPerRefresh
          break
        case "competitor_analysis":
          credits = platformConfig.creditsPerCompetitor
          break
        default:
          credits = platformConfig.creditsPerKeyword
      }

      const response = await creditService.useCredits({
        userId,
        platform,
        action: action as "track_keyword" | "refresh" | "competitor_analysis",
        keyword,
        credits,
      })

      if (response.success && response.data?.success) {
        return true
      } else {
        setError(response.error?.message || "Failed to use credits")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const refreshStats = useCallback(async () => {
    if (!userId) return

    try {
      const response = await creditService.getUsageStats(userId)
      if (response.success && response.data) {
        setUsageStats(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch usage stats:", err)
    }
  }, [userId])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  return { isLoading, error, useCredits, usageStats, refreshStats }
}

// ============================================
// CREDIT PACKAGES HOOK
// ============================================

interface UseCreditPackagesReturn {
  packages: CreditPackage[]
  platformCosts: Record<string, PlatformCreditConfig>
  calculatePrice: (credits: number) => {
    pricePerCredit: number
    totalPrice: number
    discount: number
    savings: number
  }
  formatPrice: (amount: number) => string
  getPackageById: (id: string) => CreditPackage | undefined
}

export function useCreditPackages(): UseCreditPackagesReturn {
  const packages = useMemo(() => CREDIT_PACKAGES, [])
  const platformCosts = useMemo(() => PLATFORM_CREDIT_COSTS, [])

  const getPackageById = useCallback((id: string): CreditPackage | undefined => {
    return packages.find(pkg => pkg.id === id)
  }, [packages])

  return {
    packages,
    platformCosts,
    calculatePrice: calculateCustomPrice,
    formatPrice,
    getPackageById,
  }
}

// ============================================
// PROMO CODE HOOK
// ============================================

interface UsePromoCodeReturn {
  isValidating: boolean
  isValid: boolean | null
  discount: number
  message: string
  validateCode: (code: string, amount: number) => Promise<void>
  reset: () => void
}

export function usePromoCode(): UsePromoCodeReturn {
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [discount, setDiscount] = useState(0)
  const [message, setMessage] = useState("")

  const validateCode = useCallback(async (code: string, amount: number) => {
    if (!code.trim()) {
      setIsValid(null)
      setMessage("")
      setDiscount(0)
      return
    }

    setIsValidating(true)

    try {
      const response = await creditService.validatePromoCode(code, amount)
      if (response.success && response.data) {
        setIsValid(response.data.valid)
        setDiscount(response.data.discount)
        setMessage(response.data.message)
      }
    } catch (err) {
      setIsValid(false)
      setMessage("Failed to validate promo code")
    } finally {
      setIsValidating(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsValid(null)
    setDiscount(0)
    setMessage("")
  }, [])

  return { isValidating, isValid, discount, message, validateCode, reset }
}
