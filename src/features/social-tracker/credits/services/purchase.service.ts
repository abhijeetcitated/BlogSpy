/**
 * Purchase Service
 * Handles credit purchase operations
 */

import { mockStore, generateId, getCurrentTimestamp, delay } from "../__mocks__/credit-mock-store"
import { balanceService } from "./balance.service"
import { transactionService } from "./transaction.service"
import { 
  getPackageById, 
  calculateBonusCredits 
} from "../config/pricing.config"
import type { 
  CreditPurchase, 
  CreatePurchaseRequest, 
  PurchaseResponse 
} from "../types/credit.types"

class PurchaseService {
  private static instance: PurchaseService
  
  private constructor() {}

  static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService()
    }
    return PurchaseService.instance
  }

  /**
   * Create a credit purchase (initiate checkout)
   */
  async createPurchase(
    userId: string,
    request: CreatePurchaseRequest
  ): Promise<PurchaseResponse> {
    try {
      await delay(200)

      const pkg = getPackageById(request.packageId)

      let credits = request.credits
      let amount = request.amount
      // packageName kept for future logging/analytics
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const packageName = pkg?.name ?? "Custom"

      if (pkg) {
        credits = pkg.credits
        amount = pkg.price
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
      const balance = await balanceService.addCredits(
        userId,
        purchase.credits,
        purchase.bonusCredits
      )

      // Create transaction record
      await transactionService.createTransaction(
        userId,
        "purchase",
        purchase.totalCredits,
        balance.availableCredits,
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

  /**
   * Get user's purchase history
   */
  async getPurchaseHistory(userId: string): Promise<CreditPurchase[]> {
    return mockStore.purchases.get(userId) || []
  }
}

export const purchaseService = PurchaseService.getInstance()
export { PurchaseService }
