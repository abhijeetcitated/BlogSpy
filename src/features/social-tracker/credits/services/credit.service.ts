/**
 * ============================================
 * SOCIAL TRACKER - CREDIT SERVICE
 * ============================================
 * 
 * Production-ready credit management service
 * Handles all credit-related business logic
 * 
 * NOTE: Currently using MOCK implementation
 * Real API integration will be added later
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-15
 */

import { 
  CREDIT_PACKAGES, 
  PLATFORM_CREDIT_COSTS,
  calculateCustomPrice,
  calculateBonusCredits,
  getPackageById,
  formatPrice,
} from "../config/pricing.config"

import type {
  CreditBalance,
  CreditTransaction,
  CreditTransactionType,
  CreditTransactionStatus,
  CreditPurchase,
  CreatePurchaseRequest,
  CreatePurchaseResponse,
  CreditUsageRequest,
  CreditUsageResponse,
  CreditUsageStats,
  PromoCode,
  ReferralInfo,
  CreditApiResponse,
  BalanceResponse,
  TransactionsResponse,
  PurchaseResponse,
  UsageResponse,
} from "../types/credit.types"

// ============================================
// MOCK DATA STORE (Replace with DB/API)
// ============================================

interface MockStore {
  balances: Map<string, CreditBalance>
  transactions: Map<string, CreditTransaction[]>
  purchases: Map<string, CreditPurchase[]>
  promoCodes: Map<string, PromoCode>
}

const mockStore: MockStore = {
  balances: new Map(),
  transactions: new Map(),
  purchases: new Map(),
  promoCodes: new Map([
    ["LAUNCH50", {
      code: "LAUNCH50",
      discountType: "percentage",
      discountValue: 50,
      minPurchase: 500,
      maxDiscount: 2500,
      validFrom: "2025-01-01",
      validUntil: "2025-12-31",
      usageLimit: 1000,
      usedCount: 0,
      isActive: true,
    }],
    ["WELCOME25", {
      code: "WELCOME25",
      discountType: "credits",
      discountValue: 25,
      minPurchase: 0,
      validFrom: "2025-01-01",
      validUntil: "2025-12-31",
      usedCount: 0,
      isActive: true,
    }],
  ]),
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================
// CREDIT SERVICE CLASS
// ============================================

class CreditService {
  private static instance: CreditService
  
  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService()
    }
    return CreditService.instance
  }

  // ============================================
  // BALANCE OPERATIONS
  // ============================================

  /**
   * Get user's credit balance
   */
  async getBalance(userId: string): Promise<BalanceResponse> {
    try {
      await delay(100) // Simulate API call

      let balance = mockStore.balances.get(userId)
      
      if (!balance) {
        // Initialize new user with 0 credits
        balance = {
          userId,
          totalCredits: 0,
          usedCredits: 0,
          availableCredits: 0,
          bonusCredits: 0,
          lastUpdated: getCurrentTimestamp(),
        }
        mockStore.balances.set(userId, balance)
      }

      return {
        success: true,
        data: balance,
        meta: {
          timestamp: getCurrentTimestamp(),
          requestId: generateId("req"),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "BALANCE_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch balance",
        },
      }
    }
  }

  /**
   * Add credits to user's balance
   */
  private async addCredits(
    userId: string, 
    credits: number, 
    bonusCredits: number = 0,
    transactionType: CreditTransactionType,
    metadata: Record<string, unknown>
  ): Promise<CreditBalance> {
    const balanceResponse = await this.getBalance(userId)
    const balance = balanceResponse.data!
    
    const totalCreditsToAdd = credits + bonusCredits

    balance.totalCredits += totalCreditsToAdd
    balance.availableCredits += totalCreditsToAdd
    balance.bonusCredits += bonusCredits
    balance.lastUpdated = getCurrentTimestamp()

    mockStore.balances.set(userId, balance)

    // Create transaction record
    await this.createTransaction(userId, transactionType, totalCreditsToAdd, balance.availableCredits, metadata)

    return balance
  }

  /**
   * Deduct credits from user's balance
   */
  private async deductCredits(
    userId: string,
    credits: number,
    metadata: Record<string, unknown>
  ): Promise<{ success: boolean; balance?: CreditBalance; error?: string }> {
    const balanceResponse = await this.getBalance(userId)
    const balance = balanceResponse.data!

    if (balance.availableCredits < credits) {
      return {
        success: false,
        error: "Insufficient credits",
      }
    }

    balance.usedCredits += credits
    balance.availableCredits -= credits
    balance.lastUpdated = getCurrentTimestamp()

    mockStore.balances.set(userId, balance)

    // Create usage transaction
    await this.createTransaction(userId, "usage", -credits, balance.availableCredits, metadata)

    return {
      success: true,
      balance,
    }
  }

  // ============================================
  // TRANSACTION OPERATIONS
  // ============================================

  /**
   * Create a transaction record
   */
  private async createTransaction(
    userId: string,
    type: CreditTransactionType,
    amount: number,
    balance: number,
    metadata: Record<string, unknown>
  ): Promise<CreditTransaction> {
    const transaction: CreditTransaction = {
      id: generateId("txn"),
      userId,
      type,
      amount,
      balance,
      description: this.getTransactionDescription(type, amount, metadata),
      metadata: metadata as CreditTransaction["metadata"],
      status: "completed",
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    }

    const userTransactions = mockStore.transactions.get(userId) || []
    userTransactions.unshift(transaction)
    mockStore.transactions.set(userId, userTransactions)

    return transaction
  }

  /**
   * Get transaction description
   */
  private getTransactionDescription(
    type: CreditTransactionType,
    amount: number,
    metadata: Record<string, unknown>
  ): string {
    switch (type) {
      case "purchase":
        return `Purchased ${amount} credits - ${metadata.packageName || "Custom"} package`
      case "usage":
        return `Used ${Math.abs(amount)} credits - ${metadata.platform || "Platform"} - ${metadata.keyword || "keyword tracking"}`
      case "bonus":
        return `Received ${amount} bonus credits - ${metadata.bonusType || "Bonus"}`
      case "referral":
        return `Referral reward - ${amount} credits`
      case "refund":
        return `Refund - ${amount} credits`
      case "promo":
        return `Promo code applied - ${metadata.promoCode || ""} - ${amount} credits`
      default:
        return `Credit ${type} - ${amount} credits`
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<TransactionsResponse> {
    try {
      await delay(100)

      const allTransactions = mockStore.transactions.get(userId) || []
      const startIndex = (page - 1) * limit
      const transactions = allTransactions.slice(startIndex, startIndex + limit)

      return {
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total: allTransactions.length,
            hasMore: startIndex + limit < allTransactions.length,
          },
        },
        meta: {
          timestamp: getCurrentTimestamp(),
          requestId: generateId("req"),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "TRANSACTIONS_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch transactions",
        },
      }
    }
  }

  // ============================================
  // PURCHASE OPERATIONS
  // ============================================

  /**
   * Create a credit purchase (initiate checkout)
   */
  async createPurchase(
    userId: string,
    request: CreatePurchaseRequest
  ): Promise<PurchaseResponse> {
    try {
      await delay(200)

      // Get package details
      const pkg = getPackageById(request.packageId)
      const isCustom = !pkg

      // Calculate pricing
      let credits = request.credits
      let amount = request.amount
      let packageName = "Custom"

      if (pkg) {
        credits = pkg.credits
        amount = pkg.price
        packageName = pkg.name
      }

      // Apply promo code if provided
      let discount = 0
      let promoCredits = 0
      if (request.promoCode) {
        const promo = mockStore.promoCodes.get(request.promoCode.toUpperCase())
        if (promo && promo.isActive) {
          if (promo.discountType === "percentage") {
            discount = Math.min(amount * (promo.discountValue / 100), promo.maxDiscount || Infinity)
          } else if (promo.discountType === "fixed") {
            discount = promo.discountValue
          } else if (promo.discountType === "credits") {
            promoCredits = promo.discountValue
          }
          amount -= discount
        }
      }

      // Check if first purchase
      const userPurchases = mockStore.purchases.get(userId) || []
      const isFirstPurchase = userPurchases.length === 0

      // Calculate bonus credits
      const bonusCredits = calculateBonusCredits(credits, isFirstPurchase) + promoCredits

      // Create purchase record
      const purchase: CreditPurchase = {
        id: generateId("purch"),
        userId,
        packageId: request.packageId,
        credits,
        bonusCredits,
        totalCredits: credits + bonusCredits,
        amount: Math.round(amount),
        currency: "INR",
        paymentMethod: request.paymentMethod,
        status: "initiated",
        metadata: {
          isFirstPurchase,
          promoCode: request.promoCode,
          referralCode: request.referralCode,
          discount,
          originalAmount: request.amount,
        },
        createdAt: getCurrentTimestamp(),
      }

      userPurchases.push(purchase)
      mockStore.purchases.set(userId, userPurchases)

      // Generate mock checkout URL
      // In production, this would call Razorpay/Stripe API
      const checkoutUrl = `/checkout/credits?orderId=${purchase.id}&amount=${amount}`

      return {
        success: true,
        data: {
          success: true,
          purchase,
          checkoutUrl,
          orderId: purchase.id,
        },
        meta: {
          timestamp: getCurrentTimestamp(),
          requestId: generateId("req"),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PURCHASE_CREATE_ERROR",
          message: error instanceof Error ? error.message : "Failed to create purchase",
        },
      }
    }
  }

  /**
   * Complete a purchase (called after payment success)
   */
  async completePurchase(
    userId: string,
    purchaseId: string,
    paymentId: string
  ): Promise<PurchaseResponse> {
    try {
      await delay(100)

      const userPurchases = mockStore.purchases.get(userId) || []
      const purchase = userPurchases.find(p => p.id === purchaseId)

      if (!purchase) {
        return {
          success: false,
          error: {
            code: "PURCHASE_NOT_FOUND",
            message: "Purchase not found",
          },
        }
      }

      if (purchase.status === "completed") {
        return {
          success: false,
          error: {
            code: "PURCHASE_ALREADY_COMPLETED",
            message: "Purchase already completed",
          },
        }
      }

      // Update purchase status
      purchase.status = "completed"
      purchase.paymentId = paymentId
      purchase.completedAt = getCurrentTimestamp()
      mockStore.purchases.set(userId, userPurchases)

      // Add credits to balance
      const pkg = getPackageById(purchase.packageId)
      await this.addCredits(
        userId,
        purchase.credits,
        purchase.bonusCredits,
        "purchase",
        {
          packageId: purchase.packageId,
          packageName: pkg?.name || "Custom",
          orderId: purchase.id,
          paymentId,
        }
      )

      return {
        success: true,
        data: {
          success: true,
          purchase,
        },
        meta: {
          timestamp: getCurrentTimestamp(),
          requestId: generateId("req"),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "PURCHASE_COMPLETE_ERROR",
          message: error instanceof Error ? error.message : "Failed to complete purchase",
        },
      }
    }
  }

  // ============================================
  // CREDIT USAGE OPERATIONS
  // ============================================

  /**
   * Use credits for a platform action
   */
  async useCredits(request: CreditUsageRequest): Promise<UsageResponse> {
    try {
      await delay(50)

      const platformConfig = PLATFORM_CREDIT_COSTS[request.platform]
      if (!platformConfig) {
        return {
          success: false,
          error: {
            code: "INVALID_PLATFORM",
            message: `Invalid platform: ${request.platform}`,
          },
        }
      }

      // Calculate credits needed
      let creditsNeeded = request.credits
      if (!creditsNeeded) {
        switch (request.action) {
          case "track_keyword":
            creditsNeeded = platformConfig.creditsPerKeyword
            break
          case "refresh":
            creditsNeeded = platformConfig.creditsPerRefresh
            break
          case "competitor_analysis":
            creditsNeeded = platformConfig.creditsPerCompetitor
            break
        }
      }

      // Deduct credits
      const result = await this.deductCredits(request.userId, creditsNeeded, {
        platform: request.platform,
        action: request.action,
        keyword: request.keyword,
      })

      if (!result.success) {
        return {
          success: false,
          error: {
            code: "INSUFFICIENT_CREDITS",
            message: result.error || "Insufficient credits",
          },
        }
      }

      return {
        success: true,
        data: {
          success: true,
          creditsUsed: creditsNeeded,
          remainingCredits: result.balance!.availableCredits,
          transactionId: generateId("txn"),
        },
        meta: {
          timestamp: getCurrentTimestamp(),
          requestId: generateId("req"),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "CREDIT_USAGE_ERROR",
          message: error instanceof Error ? error.message : "Failed to use credits",
        },
      }
    }
  }

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, creditsNeeded: number): Promise<boolean> {
    const balanceResponse = await this.getBalance(userId)
    if (!balanceResponse.success || !balanceResponse.data) {
      return false
    }
    return balanceResponse.data.availableCredits >= creditsNeeded
  }

  /**
   * Get credit usage stats
   */
  async getUsageStats(userId: string): Promise<CreditApiResponse<CreditUsageStats>> {
    try {
      await delay(100)

      const transactions = mockStore.transactions.get(userId) || []
      const usageTransactions = transactions.filter(t => t.type === "usage")

      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(startOfDay.getTime() - (now.getDay() * 24 * 60 * 60 * 1000))
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const stats: CreditUsageStats = {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        allTime: 0,
        byPlatform: {
          pinterest: 0,
          twitter: 0,
          instagram: 0,
          tiktok: 0,
        },
      }

      usageTransactions.forEach(t => {
        const amount = Math.abs(t.amount)
        const date = new Date(t.createdAt)
        const platform = t.metadata.platform as keyof typeof stats.byPlatform

        stats.allTime += amount
        
        if (date >= startOfDay) stats.today += amount
        if (date >= startOfWeek) stats.thisWeek += amount
        if (date >= startOfMonth) stats.thisMonth += amount
        
        if (platform && stats.byPlatform[platform] !== undefined) {
          stats.byPlatform[platform] += amount
        }
      })

      return {
        success: true,
        data: stats,
        meta: {
          timestamp: getCurrentTimestamp(),
          requestId: generateId("req"),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "STATS_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch stats",
        },
      }
    }
  }

  // ============================================
  // PROMO CODE OPERATIONS
  // ============================================

  /**
   * Validate promo code
   */
  async validatePromoCode(
    code: string,
    purchaseAmount: number
  ): Promise<CreditApiResponse<{ valid: boolean; discount: number; message: string }>> {
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

  // ============================================
  // REFERRAL OPERATIONS
  // ============================================

  /**
   * Get referral info
   */
  async getReferralInfo(userId: string): Promise<CreditApiResponse<ReferralInfo>> {
    try {
      await delay(100)

      // Mock referral info
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

  // ============================================
  // PACKAGE INFO
  // ============================================

  /**
   * Get all available packages
   */
  getPackages() {
    return CREDIT_PACKAGES
  }

  /**
   * Get platform credit costs
   */
  getPlatformCosts() {
    return PLATFORM_CREDIT_COSTS
  }

  /**
   * Calculate custom pricing
   */
  calculatePrice(credits: number) {
    return calculateCustomPrice(credits)
  }
}

// Export singleton instance
export const creditService = CreditService.getInstance()

// Export class for testing
export { CreditService }
