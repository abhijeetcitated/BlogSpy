/**
 * ============================================
 * NEWS TRACKER - useCredits Hook
 * ============================================
 * 
 * Custom hook for credit management in components
 * Provides credit balance, purchase, and validation functions
 * 
 * @version 1.0.0
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { creditService, CREDIT_PLANS } from "../services"
import type {
  UserCreditBalance,
  CreditPlan,
  CreditPlanId,
  CreditTransaction,
  CreditUsageStats,
  CreditValidationResult,
  PaymentMethod,
} from "../types/credits.types"

// ============================================
// HOOK INTERFACE
// ============================================

interface UseCreditsOptions {
  userId: string
  autoFetch?: boolean
  refreshInterval?: number // ms
}

interface UseCreditsReturn {
  // State
  balance: UserCreditBalance | null
  plans: CreditPlan[]
  transactions: CreditTransaction[]
  usageStats: CreditUsageStats | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchBalance: () => Promise<void>
  purchaseCredits: (planId: CreditPlanId, paymentMethod: PaymentMethod, promoCode?: string) => Promise<boolean>
  purchaseCustomCredits: (credits: number, paymentMethod: PaymentMethod) => Promise<boolean>
  validateCredits: (requiredCredits: number) => Promise<CreditValidationResult>
  deductCredits: (credits: number, reason: string, platform: "google-news" | "google-discover") => Promise<boolean>
  applyPromoCode: (code: string, planId: CreditPlanId) => Promise<{ valid: boolean; discount: number; message: string }>
  fetchTransactions: (limit?: number) => Promise<void>
  fetchUsageStats: () => Promise<void>
  refreshAll: () => Promise<void>

  // Computed
  hasCredits: boolean
  lowCredits: boolean
  creditPercentUsed: number
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useCredits(options: UseCreditsOptions): UseCreditsReturn {
  const { userId, autoFetch = true, refreshInterval } = options

  // State
  const [balance, setBalance] = useState<UserCreditBalance | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [usageStats, setUsageStats] = useState<CreditUsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get plans
  const plans = useMemo(() => creditService.getPlans(), [])

  // ============================================
  // FETCH METHODS
  // ============================================

  const fetchBalance = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)
      const result = await creditService.getBalance(userId)
      setBalance(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const fetchTransactions = useCallback(async (limit = 50) => {
    if (!userId) return

    try {
      const result = await creditService.getTransactionHistory(userId, { limit })
      setTransactions(result.transactions)
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
    }
  }, [userId])

  const fetchUsageStats = useCallback(async () => {
    if (!userId) return

    try {
      const stats = await creditService.getUsageStats(userId)
      setUsageStats(stats)
    } catch (err) {
      console.error("Failed to fetch usage stats:", err)
    }
  }, [userId])

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchBalance(),
      fetchTransactions(),
      fetchUsageStats(),
    ])
  }, [fetchBalance, fetchTransactions, fetchUsageStats])

  // ============================================
  // PURCHASE METHODS
  // ============================================

  const purchaseCredits = useCallback(async (
    planId: CreditPlanId,
    paymentMethod: PaymentMethod,
    promoCode?: string
  ): Promise<boolean> => {
    if (!userId) {
      toast.error("User not authenticated")
      return false
    }

    try {
      setIsLoading(true)

      const result = await creditService.purchaseCredits({
        userId,
        planId,
        paymentMethod,
        promoCode,
      })

      if (result.success) {
        setBalance(prev => prev ? {
          ...prev,
          totalCredits: prev.totalCredits + result.credits,
          availableCredits: result.newBalance,
          lastUpdated: new Date().toISOString(),
        } : null)

        toast.success(`🎉 ${result.credits} credits added!`, {
          description: `Your new balance is ${result.newBalance} credits`,
        })

        // Refresh data
        await refreshAll()
        return true
      } else {
        toast.error("Purchase failed", {
          description: result.error || "Please try again",
        })
        return false
      }
    } catch (err) {
      toast.error("Purchase error", {
        description: err instanceof Error ? err.message : "Unknown error",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId, refreshAll])

  const purchaseCustomCredits = useCallback(async (
    credits: number,
    paymentMethod: PaymentMethod
  ): Promise<boolean> => {
    if (!userId) {
      toast.error("User not authenticated")
      return false
    }

    try {
      setIsLoading(true)

      const result = await creditService.purchaseCredits({
        userId,
        planId: "custom",
        customCredits: credits,
        paymentMethod,
      })

      if (result.success) {
        setBalance(prev => prev ? {
          ...prev,
          totalCredits: prev.totalCredits + result.credits,
          availableCredits: result.newBalance,
          lastUpdated: new Date().toISOString(),
        } : null)

        toast.success(`🎉 ${result.credits} credits added!`, {
          description: `Paid ₹${result.totalAmount}`,
        })

        await refreshAll()
        return true
      } else {
        toast.error("Purchase failed", {
          description: result.error,
        })
        return false
      }
    } catch (err) {
      toast.error("Purchase error")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId, refreshAll])

  // ============================================
  // VALIDATION METHODS
  // ============================================

  const validateCredits = useCallback(async (
    requiredCredits: number
  ): Promise<CreditValidationResult> => {
    if (!userId) {
      return {
        isValid: false,
        availableCredits: 0,
        requiredCredits,
        canProceed: false,
        message: "User not authenticated",
      }
    }

    return creditService.validateCredits(userId, requiredCredits)
  }, [userId])

  const deductCredits = useCallback(async (
    credits: number,
    reason: string,
    platform: "google-news" | "google-discover"
  ): Promise<boolean> => {
    if (!userId) return false

    try {
      const result = await creditService.deductCredits({
        userId,
        credits,
        reason,
        platform,
      })

      if (result.success) {
        setBalance(prev => prev ? {
          ...prev,
          usedCredits: prev.usedCredits + credits,
          availableCredits: result.newBalance,
          lastUpdated: new Date().toISOString(),
        } : null)
        return true
      } else {
        if (result.errorCode === "INSUFFICIENT_CREDITS") {
          toast.error("Insufficient credits", {
            description: "Please purchase more credits to continue",
          })
        }
        return false
      }
    } catch {
      return false
    }
  }, [userId])

  // ============================================
  // PROMO CODE METHODS
  // ============================================

  const applyPromoCode = useCallback(async (
    code: string,
    planId: CreditPlanId
  ): Promise<{ valid: boolean; discount: number; message: string }> => {
    const plan = creditService.getPlan(planId)
    if (!plan) {
      return { valid: false, discount: 0, message: "Invalid plan" }
    }

    const result = await creditService.applyPromoCode(code, plan.price, planId)

    if (result.isValid) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }

    return {
      valid: result.isValid,
      discount: result.discountAmount + (result.bonusCredits * plan.pricePerCredit),
      message: result.message,
    }
  }, [])

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const hasCredits = useMemo(() => {
    return (balance?.availableCredits || 0) > 0
  }, [balance])

  const lowCredits = useMemo(() => {
    const available = balance?.availableCredits || 0
    return available > 0 && available < 20
  }, [balance])

  const creditPercentUsed = useMemo(() => {
    if (!balance || balance.totalCredits === 0) return 0
    return Math.round((balance.usedCredits / balance.totalCredits) * 100)
  }, [balance])

  // ============================================
  // EFFECTS
  // ============================================

  // Initial fetch
  useEffect(() => {
    if (autoFetch && userId) {
      fetchBalance()
    }
  }, [autoFetch, userId, fetchBalance])

  // Refresh interval
  useEffect(() => {
    if (!refreshInterval || !userId) return

    const interval = setInterval(fetchBalance, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, userId, fetchBalance])

  // Low credit warning
  useEffect(() => {
    if (lowCredits && balance) {
      toast.warning("Low credits", {
        description: `Only ${balance.availableCredits} credits remaining`,
        duration: 5000,
      })
    }
  }, [lowCredits, balance])

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    balance,
    plans,
    transactions,
    usageStats,
    isLoading,
    error,

    // Actions
    fetchBalance,
    purchaseCredits,
    purchaseCustomCredits,
    validateCredits,
    deductCredits,
    applyPromoCode,
    fetchTransactions,
    fetchUsageStats,
    refreshAll,

    // Computed
    hasCredits,
    lowCredits,
    creditPercentUsed,
  }
}
