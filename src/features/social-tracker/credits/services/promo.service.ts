/**
 * Promo Service
 * Handles promo code and referral operations
 */

import { mockStore, generateId, getCurrentTimestamp, delay } from "../__mocks__/credit-mock-store"
import { formatPrice } from "../config/pricing.config"
import type { 
  CreditApiResponse,
  ReferralInfo
} from "../types/credit.types"

interface PromoValidationResult {
  valid: boolean
  discount: number
  message: string
}

class PromoService {
  private static instance: PromoService
  
  private constructor() {}

  static getInstance(): PromoService {
    if (!PromoService.instance) {
      PromoService.instance = new PromoService()
    }
    return PromoService.instance
  }

  /**
   * Validate promo code
   */
  async validatePromoCode(
    code: string,
    purchaseAmount: number
  ): Promise<CreditApiResponse<PromoValidationResult>> {
    try {
      await delay(50)

      const promo = mockStore.promoCodes.get(code.toUpperCase())

      if (!promo) {
        return {
          success: true,
          data: { valid: false, discount: 0, message: "Invalid promo code" },
        }
      }

      if (!promo.isActive) {
        return {
          success: true,
          data: { valid: false, discount: 0, message: "Promo code is no longer active" },
        }
      }

      const now = new Date()
      if (new Date(promo.validFrom) > now || new Date(promo.validUntil) < now) {
        return {
          success: true,
          data: { valid: false, discount: 0, message: "Promo code has expired" },
        }
      }

      if (promo.minPurchase && purchaseAmount < promo.minPurchase) {
        return {
          success: true,
          data: { valid: false, discount: 0, message: `Minimum purchase of ${formatPrice(promo.minPurchase)} required` },
        }
      }

      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return {
          success: true,
          data: { valid: false, discount: 0, message: "Promo code usage limit reached" },
        }
      }

      let discount = 0
      let message = ""

      if (promo.discountType === "percentage") {
        discount = Math.min(purchaseAmount * (promo.discountValue / 100), promo.maxDiscount || Infinity)
        message = `${promo.discountValue}% off - You save ${formatPrice(discount)}`
      } else if (promo.discountType === "fixed") {
        discount = promo.discountValue
        message = `${formatPrice(discount)} off your purchase`
      } else if (promo.discountType === "credits") {
        message = `${promo.discountValue} bonus credits`
      }

      return {
        success: true,
        data: { valid: true, discount, message },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PROMO_VALIDATION_ERROR",
          message: error instanceof Error ? error.message : "Failed to validate promo code",
        },
      }
    }
  }

  /**
   * Apply promo code (increment usage count)
   */
  async applyPromoCode(code: string): Promise<boolean> {
    const promo = mockStore.promoCodes.get(code.toUpperCase())
    if (promo) {
      promo.usedCount += 1
      mockStore.promoCodes.set(code.toUpperCase(), promo)
      return true
    }
    return false
  }

  /**
   * Get referral info
   */
  async getReferralInfo(userId: string): Promise<CreditApiResponse<ReferralInfo>> {
    try {
      await delay(100)

      const referralCode = `REF${userId.toUpperCase().slice(0, 6)}`

      return {
        success: true,
        data: {
          code: referralCode,
          referrerId: userId,
          totalReferrals: 0,
          creditsEarned: 0,
          pendingCredits: 0,
          link: `https://blogspy.io/r/${referralCode}`,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "REFERRAL_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch referral info",
        },
      }
    }
  }
}

export const promoService = PromoService.getInstance()
export { PromoService }
