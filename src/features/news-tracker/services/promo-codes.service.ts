/**
 * ============================================
 * NEWS TRACKER - PROMO CODES SERVICE
 * ============================================
 * 
 * Promo code management and validation
 * Split from credit.service.ts for better maintainability
 * 
 * @version 1.0.0
 */

import type { 
  CreditPlanId, 
  PromoCode, 
  AppliedPromoResult 
} from "../types/credits.types"

// ============================================
// IN-MEMORY STORAGE (Replace with DB)
// ============================================

const promoCodes: Map<string, PromoCode> = new Map([
  ["WELCOME50", {
    code: "WELCOME50",
    type: "credits",
    value: 50,
    validFrom: "2024-01-01",
    validTo: "2025-12-31",
    usageLimit: 1,
    usedCount: 0,
    applicablePlans: "all",
    isActive: true,
  }],
  ["FLAT20", {
    code: "FLAT20",
    type: "percentage",
    value: 20,
    minPurchase: 299,
    maxDiscount: 200,
    validFrom: "2024-01-01",
    validTo: "2025-12-31",
    usageLimit: 1000,
    usedCount: 0,
    applicablePlans: ["pro", "business", "enterprise"],
    isActive: true,
  }],
  ["NEWUSER25", {
    code: "NEWUSER25",
    type: "percentage",
    value: 25,
    minPurchase: 199,
    maxDiscount: 100,
    validFrom: "2024-01-01",
    validTo: "2025-12-31",
    usageLimit: 5000,
    usedCount: 0,
    applicablePlans: "all",
    isActive: true,
  }],
  ["BONUS100", {
    code: "BONUS100",
    type: "credits",
    value: 100,
    minPurchase: 499,
    validFrom: "2024-01-01",
    validTo: "2025-12-31",
    usageLimit: 500,
    usedCount: 0,
    applicablePlans: ["pro", "business", "enterprise"],
    isActive: true,
  }],
])

// ============================================
// PROMO CODE CLASS
// ============================================

class PromoCodeService {
  /**
   * Get all active promo codes (for admin)
   */
  getAllPromoCodes(): PromoCode[] {
    return Array.from(promoCodes.values())
  }

  /**
   * Get a specific promo code
   */
  getPromoCode(code: string): PromoCode | null {
    return promoCodes.get(code.toUpperCase()) || null
  }

  /**
   * Add a new promo code
   */
  addPromoCode(promo: PromoCode): boolean {
    if (promoCodes.has(promo.code.toUpperCase())) {
      return false // Already exists
    }
    promoCodes.set(promo.code.toUpperCase(), promo)
    return true
  }

  /**
   * Deactivate a promo code
   */
  deactivatePromoCode(code: string): boolean {
    const promo = promoCodes.get(code.toUpperCase())
    if (!promo) return false
    
    promo.isActive = false
    promoCodes.set(code.toUpperCase(), promo)
    return true
  }

  /**
   * Validate and apply promo code
   */
  async applyPromoCode(
    code: string,
    purchaseAmount: number,
    planId: CreditPlanId
  ): Promise<AppliedPromoResult> {
    const promo = promoCodes.get(code.toUpperCase())

    // Check if code exists
    if (!promo) {
      return this.createInvalidResult(code, purchaseAmount, "Invalid promo code")
    }

    // Check if active
    if (!promo.isActive) {
      return this.createInvalidResult(code, purchaseAmount, "Promo code is no longer active")
    }

    // Check validity dates
    const now = new Date()
    if (now < new Date(promo.validFrom) || now > new Date(promo.validTo)) {
      return this.createInvalidResult(code, purchaseAmount, "Promo code has expired")
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return this.createInvalidResult(code, purchaseAmount, "Promo code usage limit reached")
    }

    // Check minimum purchase
    if (promo.minPurchase && purchaseAmount < promo.minPurchase) {
      return this.createInvalidResult(
        code, 
        purchaseAmount, 
        `Minimum purchase of ₹${promo.minPurchase} required`
      )
    }

    // Check applicable plans
    if (promo.applicablePlans !== "all" && !promo.applicablePlans.includes(planId)) {
      return this.createInvalidResult(code, purchaseAmount, "Promo code not applicable for this plan")
    }

    // Calculate discount
    let discountAmount = 0
    let bonusCredits = 0

    switch (promo.type) {
      case "percentage":
        discountAmount = Math.round(purchaseAmount * (promo.value / 100))
        if (promo.maxDiscount) {
          discountAmount = Math.min(discountAmount, promo.maxDiscount)
        }
        break
      case "fixed":
        discountAmount = promo.value
        break
      case "credits":
        bonusCredits = promo.value
        break
    }

    // Update usage count
    promo.usedCount++
    promoCodes.set(code.toUpperCase(), promo)

    return {
      isValid: true,
      code,
      discountAmount,
      bonusCredits,
      finalPrice: purchaseAmount - discountAmount,
      message: promo.type === "credits"
        ? `+${bonusCredits} bonus credits applied!`
        : `₹${discountAmount} discount applied!`,
    }
  }

  /**
   * Check if promo code is valid (without applying)
   */
  async validatePromoCode(
    code: string,
    purchaseAmount: number,
    planId: CreditPlanId
  ): Promise<{ isValid: boolean; message: string }> {
    const result = await this.applyPromoCode(code, purchaseAmount, planId)
    
    // Rollback the usage count increment if we were just validating
    if (result.isValid) {
      const promo = promoCodes.get(code.toUpperCase())
      if (promo) {
        promo.usedCount--
        promoCodes.set(code.toUpperCase(), promo)
      }
    }

    return {
      isValid: result.isValid,
      message: result.message,
    }
  }

  /**
   * Helper to create invalid promo result
   */
  private createInvalidResult(
    code: string,
    purchaseAmount: number,
    message: string
  ): AppliedPromoResult {
    return {
      isValid: false,
      code,
      discountAmount: 0,
      bonusCredits: 0,
      finalPrice: purchaseAmount,
      message,
    }
  }
}

// Export singleton instance
export const promoCodeService = new PromoCodeService()

// Export class for testing
export { PromoCodeService }
