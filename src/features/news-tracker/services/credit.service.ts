/**
 * ============================================
 * NEWS TRACKER - CREDIT SERVICE
 * ============================================
 * 
 * Complete credit management system for News Tracker
 * Handles purchases, deductions, validations, and transactions
 * 
 * Integration Points (TODO):
 * 1. Razorpay - Primary payment gateway
 * 2. Stripe - International payments
 * 3. Supabase - Database storage
 * 
 * @version 1.0.0
 */

import type {
  CreditPlan,
  CreditPlanId,
  UserCreditBalance,
  CreditTransaction,
  CreditPurchaseRequest,
  CreditPurchaseResponse,
  CreditDeductionRequest,
  CreditDeductionResponse,
  CreditValidationResult,
  CreditUsageStats,
  PromoCode,
  AppliedPromoResult,
  TransactionType,
  TransactionStatus,
} from "../types/credits.types"
import { BLOGSPY_API_CONFIG } from "../config"

// ============================================
// CREDIT PLANS DEFINITION
// ============================================

export const CREDIT_PLANS: Record<CreditPlanId, CreditPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 199,
    pricePerCredit: 1.99,
    features: [
      "100 keyword tracks",
      "News + Discover both",
      "7-day data history",
      "Email alerts",
    ],
    popular: false,
    badge: null,
    dataRetentionDays: 7,
    teamMembers: 1,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    credits: 300,
    price: 399,
    pricePerCredit: 1.33,
    originalPrice: 450,
    discount: 11,
    features: [
      "300 keyword tracks",
      "News + Discover both",
      "30-day data history",
      "Priority refresh",
      "Slack integration",
      "CSV export",
    ],
    popular: true,
    badge: "BEST VALUE",
    dataRetentionDays: 30,
    teamMembers: 1,
    apiAccess: false,
    prioritySupport: false,
  },
  business: {
    id: "business",
    name: "Business",
    credits: 750,
    price: 799,
    pricePerCredit: 1.07,
    originalPrice: 1125,
    discount: 29,
    features: [
      "750 keyword tracks",
      "News + Discover both",
      "90-day data history",
      "Export CSV/PDF",
      "Team access (3 users)",
      "API access (limited)",
      "Priority support",
    ],
    popular: false,
    badge: "TEAMS",
    dataRetentionDays: 90,
    teamMembers: 3,
    apiAccess: true,
    prioritySupport: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    credits: 2000,
    price: 1499,
    pricePerCredit: 0.75,
    originalPrice: 3000,
    discount: 50,
    features: [
      "2000 keyword tracks",
      "News + Discover both",
      "1-year data history",
      "Full API access",
      "Unlimited team",
      "White-label reports",
      "Dedicated support",
      "Custom integrations",
    ],
    popular: false,
    badge: "ENTERPRISE",
    dataRetentionDays: 365,
    teamMembers: -1, // Unlimited
    apiAccess: true,
    prioritySupport: true,
  },
  custom: {
    id: "custom",
    name: "Custom",
    credits: 0, // Variable
    price: 0, // Variable
    pricePerCredit: 0, // Variable
    features: ["Custom credit amount", "Flexible pricing"],
    popular: false,
    badge: null,
    dataRetentionDays: 30,
    teamMembers: 1,
    apiAccess: false,
    prioritySupport: false,
  },
}

// ============================================
// IN-MEMORY STORAGE (Replace with DB)
// ============================================

// Temporary in-memory storage for development
// TODO: Replace with Supabase/Prisma
const userBalances: Map<string, UserCreditBalance> = new Map()
const transactions: Map<string, CreditTransaction[]> = new Map()
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
])

// ============================================
// CREDIT SERVICE CLASS
// ============================================

class CreditService {
  // ============================================
  // PLAN METHODS
  // ============================================

  /**
   * Get all available plans
   */
  getPlans(): CreditPlan[] {
    return Object.values(CREDIT_PLANS).filter(p => p.id !== "custom")
  }

  /**
   * Get a specific plan
   */
  getPlan(planId: CreditPlanId): CreditPlan | null {
    return CREDIT_PLANS[planId] || null
  }

  /**
   * Calculate custom plan price
   */
  calculateCustomPrice(credits: number): { price: number; pricePerCredit: number } {
    // Tiered pricing: more credits = lower per-credit cost
    let pricePerCredit: number
    
    if (credits <= 100) {
      pricePerCredit = 2.00 // ₹2/credit
    } else if (credits <= 300) {
      pricePerCredit = 1.50 // ₹1.50/credit
    } else if (credits <= 750) {
      pricePerCredit = 1.20 // ₹1.20/credit
    } else {
      pricePerCredit = 1.00 // ₹1/credit
    }

    return {
      price: Math.round(credits * pricePerCredit),
      pricePerCredit,
    }
  }

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

    let suggestedPlan: CreditPlanId | undefined
    if (!canProceed) {
      // Suggest appropriate plan based on deficit
      const deficit = requiredCredits - balance.availableCredits
      if (deficit <= 100) suggestedPlan = "starter"
      else if (deficit <= 300) suggestedPlan = "pro"
      else if (deficit <= 750) suggestedPlan = "business"
      else suggestedPlan = "enterprise"
    }

    return {
      isValid: canProceed,
      availableCredits: balance.availableCredits,
      requiredCredits,
      canProceed,
      message: canProceed
        ? "Sufficient credits available"
        : `Insufficient credits. Need ${requiredCredits}, have ${balance.availableCredits}`,
      suggestedPlan,
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
        const customPricing = this.calculateCustomPrice(customCredits)
        credits = customCredits
        price = customPricing.price
      } else {
        const plan = this.getPlan(planId)
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
        const promoResult = await this.applyPromoCode(promoCode, price, planId)
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
      // For now, simulate successful payment
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

      // Record transaction
      const transaction = await this.recordTransaction({
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
      // Validate credits
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
      const transaction = await this.recordTransaction({
        userId,
        type: "usage",
        amount: -credits,
        balanceBefore: balance.availableCredits + credits,
        balanceAfter: balance.availableCredits,
        description: reason,
        status: "completed",
        metadata: {
          keywordId,
          keyword,
          platform,
        },
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

    const transaction = await this.recordTransaction({
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
  // PROMO CODE METHODS
  // ============================================

  /**
   * Validate and apply promo code
   */
  async applyPromoCode(
    code: string,
    purchaseAmount: number,
    planId: CreditPlanId
  ): Promise<AppliedPromoResult> {
    const promo = promoCodes.get(code.toUpperCase())

    if (!promo) {
      return {
        isValid: false,
        code,
        discountAmount: 0,
        bonusCredits: 0,
        finalPrice: purchaseAmount,
        message: "Invalid promo code",
      }
    }

    // Check if active
    if (!promo.isActive) {
      return {
        isValid: false,
        code,
        discountAmount: 0,
        bonusCredits: 0,
        finalPrice: purchaseAmount,
        message: "Promo code is no longer active",
      }
    }

    // Check validity dates
    const now = new Date()
    if (now < new Date(promo.validFrom) || now > new Date(promo.validTo)) {
      return {
        isValid: false,
        code,
        discountAmount: 0,
        bonusCredits: 0,
        finalPrice: purchaseAmount,
        message: "Promo code has expired",
      }
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return {
        isValid: false,
        code,
        discountAmount: 0,
        bonusCredits: 0,
        finalPrice: purchaseAmount,
        message: "Promo code usage limit reached",
      }
    }

    // Check minimum purchase
    if (promo.minPurchase && purchaseAmount < promo.minPurchase) {
      return {
        isValid: false,
        code,
        discountAmount: 0,
        bonusCredits: 0,
        finalPrice: purchaseAmount,
        message: `Minimum purchase of ₹${promo.minPurchase} required`,
      }
    }

    // Check applicable plans
    if (promo.applicablePlans !== "all" && !promo.applicablePlans.includes(planId)) {
      return {
        isValid: false,
        code,
        discountAmount: 0,
        bonusCredits: 0,
        finalPrice: purchaseAmount,
        message: "Promo code not applicable for this plan",
      }
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

  // ============================================
  // TRANSACTION METHODS
  // ============================================

  /**
   * Record a transaction
   */
  private async recordTransaction(data: {
    userId: string
    type: TransactionType
    amount: number
    balanceBefore: number
    balanceAfter: number
    description: string
    status: TransactionStatus
    metadata: Record<string, unknown>
  }): Promise<CreditTransaction> {
    const transaction: CreditTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      balanceBefore: data.balanceBefore,
      balanceAfter: data.balanceAfter,
      description: data.description,
      metadata: data.metadata,
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store transaction
    const userTxns = transactions.get(data.userId) || []
    userTxns.push(transaction)
    transactions.set(data.userId, userTxns)

    return transaction
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      type?: TransactionType
    }
  ): Promise<{ transactions: CreditTransaction[]; total: number }> {
    let userTxns = transactions.get(userId) || []

    // Filter by type
    if (options?.type) {
      userTxns = userTxns.filter(t => t.type === options.type)
    }

    const total = userTxns.length

    // Apply pagination
    const start = options?.offset || 0
    const end = start + (options?.limit || 50)
    const paginated = userTxns.slice(start, end).reverse() // Newest first

    return { transactions: paginated, total }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(userId: string): Promise<CreditUsageStats> {
    const userTxns = transactions.get(userId) || []
    const usageTxns = userTxns.filter(t => t.type === "usage")

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

    const calculateUsage = (txns: CreditTransaction[]) => {
      const result = { "google-news": 0, "google-discover": 0, total: 0 }
      txns.forEach(t => {
        const platform = t.metadata.platform as "google-news" | "google-discover"
        if (platform) {
          result[platform] += Math.abs(t.amount)
        }
        result.total += Math.abs(t.amount)
      })
      return result
    }

    const todayTxns = usageTxns.filter(t => new Date(t.createdAt) >= today)
    const weekTxns = usageTxns.filter(t => new Date(t.createdAt) >= weekAgo)
    const monthTxns = usageTxns.filter(t => new Date(t.createdAt) >= monthAgo)

    const todayUsage = calculateUsage(todayTxns)
    const weekUsage = calculateUsage(weekTxns)
    const monthUsage = calculateUsage(monthTxns)
    const allTimeUsage = calculateUsage(usageTxns)

    const avgDailyUsage = monthUsage.total / 30
    const projectedMonthlyUsage = avgDailyUsage * 30

    return {
      today: todayUsage,
      thisWeek: weekUsage,
      thisMonth: monthUsage,
      allTime: allTimeUsage,
      avgDailyUsage: Math.round(avgDailyUsage * 10) / 10,
      projectedMonthlyUsage: Math.round(projectedMonthlyUsage),
    }
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

    return this.recordTransaction({
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
