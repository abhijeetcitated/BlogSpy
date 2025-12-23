/**
 * Promo Code Hook
 * Validates and applies promo codes
 */

"use client"

import { useState, useCallback } from "react"
import { creditService } from "../services/credit.service"

export interface UsePromoCodeReturn {
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
