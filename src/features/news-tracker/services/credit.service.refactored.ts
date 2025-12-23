/**
 * ============================================
 * NEWS TRACKER - CREDIT SERVICE (REFACTORED)
 * ============================================
 * 
 * Complete credit management system for News Tracker
 * Refactored to import from split modules
 * 
 * Integration Points (TODO):
 * 1. Razorpay - Primary payment gateway
 * 2. Stripe - International payments
 * 3. Supabase - Database storage
 * 
 * @version 2.0.0
 */

import type {
  CreditPlanId,
  UserCreditBalance,
  CreditTransaction,
  CreditPurchaseRequest,
  CreditPurchaseResponse,
  CreditDeductionRequest,
  CreditDeductionResponse,
  CreditValidationResult,
  CreditUsageStats,
  TransactionType,
  TransactionStatus,
} from "../types/credits.types"

// Import from split modules
import { CREDIT_PLANS, getPlans, getPlan, calculateCustomPrice, suggestPlan } from "./credit-plans"
import { promoCodeService } from "./promo-codes.service"
import { creditTransactionService } from "./credit-transactions.service"
import { BLOGSPY_API_CONFIG } from "../config"

// ============================================
// IN-MEMORY STORAGE (Replace with DB)
// ============================================

const userBalances: Map<string, UserCreditBalance> = new Map()

// ============================================
// CREDIT SERVICE CLASS
// ============================================

class CreditService {
  // ============================================
  // PLAN METHODS (Delegated to credit-plans.ts)
  // ============================================

  getPlans = getPlans
  getPlan = getPlan
  calculateCustomPrice = calculateCustomPrice
  suggestPlan = suggestPlan

  // ============================================
  // BALANCE METHODS
  // ============================================

  /**
   * Get user's credit balance
   */
  async getBalance(userId: string): Promise<UserCreditBalance> {
    let balance = userBalances.get(userId)
    
    if (!balance) {
      // Create default balance for new users
      balance = {
        userId,
        totalCredits: 0,
        usedCredits: 0,
        availableCredits: 0,
        reservedCredits: 0,
        expiringCredits: 0,
        expiryDate: null,
        lastUpdated: new Date().toISOString(),
      }
      userBalances.set(userId, balance)
    }

    return balance
  }

  /**
   * Validate if user has enough credits
   */
  async validateCredits(
    userId: string,
    requiredCredits: number
  ): Promise<CreditValidationResult> {
    const balance = await this.getBalance(userId)
    const canProceed = balance.availableCredits >= requiredCredits

    let suggestedPlanId: CreditPlanId | undefined
    if (!canProceed) {
      const deficit = requiredCredits - balance.availableCredits
      suggestedPlanId = suggestPlan(deficit)
    }

    return {
      isValid: canProceed,
      availableCredits: balance.availableCredits,
      requiredCredits,
      canProceed,
      message: canProceed
        ? "Sufficient credits available"
        : `Insufficient credits. Need ${requiredCredits}, have ${balance.availableCredits}`,
      suggestedPlan: suggestedPlanId,
    }
  }

  // ============================================
  // PURCHASE METHODS
  // ============================================

  /**
   * Purchase credits (Mock - Ready for payment gateway integration)
   */
  async purchaseCredits(request: CreditPurchaseRequest): Promise<CreditPurchaseResponse> {
    const { userId, planId, customCredits, promoCode } = request
    
    try {
      // Get plan details
      let credits: number
      let price: number

      if (planId === "custom" && customCredits) {
        const customPricing = calculateCustomPrice(customCredits)
        credits = customCredits
        price = customPricing.price
      } else {
        const plan = getPlan(planId)
        if (!plan) {
          return this.createPurchaseError("INVALID_PLAN", "Plan not found")
        }
        credits = plan.credits
        price = plan.price
      }

      // Apply promo code if provided
      let discount = 0
      let bonusCredits = 0
      if (promoCode) {
        const promoResult = await promoCodeService.applyPromoCode(promoCode, price, planId)
        if (promoResult.isValid) {
          discount = promoResult.discountAmount
          bonusCredits = promoResult.bonusCredits
          price = promoResult.finalPrice
        }
      }

      // Calculate tax (18% GST for India)
      const taxRate = 0.18
      const tax = Math.round(price * taxRate)
      const totalAmount = price + tax

      // TODO: Integrate with Razorpay/Stripe
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Update balance
      const balance = await this.getBalance(userId)
      const totalCreditsToAdd = credits + bonusCredits
      balance.totalCredits += totalCreditsToAdd
      balance.availableCredits += totalCreditsToAdd
      balance.lastUpdated = new Date().toISOString()
      
      // Set expiry (1 year from purchase)
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      balance.expiryDate = expiryDate.toISOString()

      userBalances.set(userId, balance)

      // Record transaction using transaction service
      const transaction = await creditTransactionService.recordTransaction({
        userId,
        type: "purchase",
        amount: totalCreditsToAdd,
        balanceBefore: balance.availableCredits - totalCreditsToAdd,
        balanceAfter: balance.availableCredits,
        description: `Purchased ${credits} credits${bonusCredits ? ` + ${bonusCredits} bonus` : ""} (${planId} plan)`,
        status: "completed",
        metadata: {
          planId,
          paymentId,
          paymentMethod: request.paymentMethod,
          orderId,
          priceINR: price,
          taxAmount: tax,
          promoCode: promoCode || undefined,
        },
      })

      return {
        success: true,
        orderId,
        paymentId,
        credits: totalCreditsToAdd,
        amountPaid: price,
        tax,
        totalAmount,
        newBalance: balance.availableCredits,
        transaction,
        invoice: {
          invoiceId: `inv_${Date.now()}`,
          invoiceNumber: `BLG-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          userId,
          planName: planId === "custom" ? "Custom" : CREDIT_PLANS[planId].name,
          credits: totalCreditsToAdd,
          subtotal: price,
          tax,
          total: totalAmount,
          paymentMethod: request.paymentMethod,
          paymentId,
          createdAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      return this.createPurchaseError(
        "PURCHASE_FAILED",
        error instanceof Error ? error.message : "Purchase failed"
      )
    }
  }

  // ============================================
  // DEDUCTION METHODS
  // ============================================

  /**
   * Deduct credits for keyword tracking
   */
  async deductCredits(request: CreditDeductionRequest): Promise<CreditDeductionResponse> {
    const { userId, credits, reason, platform, keywordId, keyword } = request

    try {
      const validation = await this.validateCredits(userId, credits)
      if (!validation.canProceed) {
        return {
          success: false,
          creditsDeducted: 0,
          newBalance: validation.availableCredits,
          transaction: null as unknown as CreditTransaction,
          error: validation.message,
          errorCode: "INSUFFICIENT_CREDITS",
        }
      }

      // Update balance
      const balance = await this.getBalance(userId)
      balance.usedCredits += credits
      balance.availableCredits -= credits
      balance.lastUpdated = new Date().toISOString()
      userBalances.set(userId, balance)

      // Record transaction
      const transaction = await creditTransactionService.recordTransaction({
        userId,
        type: "usage",
        amount: -credits,
        balanceBefore: balance.availableCredits + credits,
        balanceAfter: balance.availableCredits,
        description: reason,
        status: "completed",
        metadata: { keywordId, keyword, platform },
      })

      return {
        success: true,
        creditsDeducted: credits,
        newBalance: balance.availableCredits,
        transaction,
      }
    } catch (error) {
      return {
        success: false,
        creditsDeducted: 0,
        newBalance: 0,
        transaction: null as unknown as CreditTransaction,
        error: error instanceof Error ? error.message : "Deduction failed",
        errorCode: "TRANSACTION_FAILED",
      }
    }
  }

  /**
   * Reserve credits (for batch operations)
   */
  async reserveCredits(userId: string, credits: number): Promise<boolean> {
    const balance = await this.getBalance(userId)
    
    if (balance.availableCredits < credits) {
      return false
    }

    balance.availableCredits -= credits
    balance.reservedCredits += credits
    balance.lastUpdated = new Date().toISOString()
    userBalances.set(userId, balance)

    return true
  }

  /**
   * Release reserved credits (if operation cancelled)
   */
  async releaseReservedCredits(userId: string, credits: number): Promise<void> {
    const balance = await this.getBalance(userId)
    
    const toRelease = Math.min(credits, balance.reservedCredits)
    balance.reservedCredits -= toRelease
    balance.availableCredits += toRelease
    balance.lastUpdated = new Date().toISOString()
    userBalances.set(userId, balance)
  }

  /**
   * Commit reserved credits (after successful operation)
   */
  async commitReservedCredits(
    userId: string,
    credits: number,
    reason: string
  ): Promise<CreditDeductionResponse> {
    const balance = await this.getBalance(userId)
    
    const toCommit = Math.min(credits, balance.reservedCredits)
    balance.reservedCredits -= toCommit
    balance.usedCredits += toCommit
    balance.lastUpdated = new Date().toISOString()
    userBalances.set(userId, balance)

    const transaction = await creditTransactionService.recordTransaction({
      userId,
      type: "usage",
      amount: -toCommit,
      balanceBefore: balance.availableCredits,
      balanceAfter: balance.availableCredits,
      description: reason,
      status: "completed",
      metadata: {},
    })

    return {
      success: true,
      creditsDeducted: toCommit,
      newBalance: balance.availableCredits,
      transaction,
    }
  }

  // ============================================
  // TRANSACTION METHODS (Delegated)
  // ============================================

  async getTransactionHistory(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      type?: TransactionType
    }
  ): Promise<{ transactions: CreditTransaction[]; total: number }> {
    return creditTransactionService.getTransactionHistory(userId, options)
  }

  async getUsageStats(userId: string): Promise<CreditUsageStats> {
    return creditTransactionService.getUsageStats(userId)
  }

  // ============================================
  // PROMO CODE METHODS (Delegated)
  // ============================================

  async applyPromoCode(code: string, purchaseAmount: number, planId: CreditPlanId) {
    return promoCodeService.applyPromoCode(code, purchaseAmount, planId)
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private createPurchaseError(code: string, message: string): CreditPurchaseResponse {
    return {
      success: false,
      orderId: "",
      credits: 0,
      amountPaid: 0,
      tax: 0,
      totalAmount: 0,
      newBalance: 0,
      transaction: null as unknown as CreditTransaction,
      error: message,
    }
  }

  /**
   * Add bonus credits (for promotions, referrals, etc.)
   */
  async addBonusCredits(
    userId: string,
    credits: number,
    reason: string,
    bonusType: "welcome" | "referral" | "promo" | "loyalty"
  ): Promise<CreditTransaction> {
    const balance = await this.getBalance(userId)
    balance.totalCredits += credits
    balance.availableCredits += credits
    balance.lastUpdated = new Date().toISOString()
    userBalances.set(userId, balance)

    return creditTransactionService.recordTransaction({
      userId,
      type: "bonus",
      amount: credits,
      balanceBefore: balance.availableCredits - credits,
      balanceAfter: balance.availableCredits,
      description: reason,
      status: "completed",
      metadata: { bonusType },
    })
  }
}

// Export singleton instance
export const creditService = new CreditService()

// Export class for testing
export { CreditService }

// Re-export from split modules for convenience
export { CREDIT_PLANS } from "./credit-plans"
export { promoCodeService } from "./promo-codes.service"
export { creditTransactionService } from "./credit-transactions.service"
