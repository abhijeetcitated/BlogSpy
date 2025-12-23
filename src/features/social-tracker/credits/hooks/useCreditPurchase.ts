/**
 * Credit Purchase Hook
 * Manages credit purchase flow with Stripe
 */

"use client"

import { useState, useCallback } from "react"
import { creditService } from "../services/credit.service"
import type { CreditPurchase, CreatePurchaseRequest } from "../types/credit.types"

export interface UseCreditPurchaseReturn {
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
