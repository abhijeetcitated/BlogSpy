/**
 * ============================================
 * CREDIT SERVICE - FACADE
 * ============================================
 * 
 * Unified interface for all credit operations
 * Delegates to specialized services
 * 
 * @version 2.0.0
 * @lastUpdated 2025-12-24
 */

import { balanceService, BalanceService } from "./balance.service"
import { transactionService, TransactionService } from "./transaction.service"
import { purchaseService, PurchaseService } from "./purchase.service"
import { usageService, UsageService } from "./usage.service"
import { promoService, PromoService } from "./promo.service"
import { 
  CREDIT_PACKAGES, 
  PLATFORM_CREDIT_COSTS,
  calculateCustomPrice,
} from "../config/pricing.config"

import type {
  BalanceResponse,
  TransactionsResponse,
  PurchaseResponse,
  UsageResponse,
  CreditUsageRequest,
  CreatePurchaseRequest,
  CreditUsageStats,
  ReferralInfo,
  CreditApiResponse,
} from "../types/credit.types"

/**
 * Credit Service Facade
 * Provides unified API for credit operations
 */
class CreditService {
  private static instance: CreditService
  
  private constructor() {}

  static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService()
    }
    return CreditService.instance
  }

  // ============================================
  // BALANCE OPERATIONS
  // ============================================

  async getBalance(userId: string): Promise<BalanceResponse> {
    return balanceService.getBalance(userId)
  }

  async hasEnoughCredits(userId: string, creditsNeeded: number): Promise<boolean> {
    return balanceService.hasEnoughCredits(userId, creditsNeeded)
  }

  // ============================================
  // TRANSACTION OPERATIONS
  // ============================================

  async getTransactions(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<TransactionsResponse> {
    return transactionService.getTransactions(userId, page, limit)
  }

  // ============================================
  // PURCHASE OPERATIONS
  // ============================================

  async createPurchase(
    userId: string,
    request: CreatePurchaseRequest
  ): Promise<PurchaseResponse> {
    return purchaseService.createPurchase(userId, request)
  }

  async completePurchase(
    userId: string,
    purchaseId: string,
    paymentId: string
  ): Promise<PurchaseResponse> {
    return purchaseService.completePurchase(userId, purchaseId, paymentId)
  }

  // ============================================
  // USAGE OPERATIONS
  // ============================================

  async useCredits(request: CreditUsageRequest): Promise<UsageResponse> {
    return usageService.useCredits(request)
  }

  async getUsageStats(userId: string): Promise<CreditApiResponse<CreditUsageStats>> {
    return usageService.getUsageStats(userId)
  }

  // ============================================
  // PROMO & REFERRAL OPERATIONS
  // ============================================

  async validatePromoCode(
    code: string,
    purchaseAmount: number
  ): Promise<CreditApiResponse<{ valid: boolean; discount: number; message: string }>> {
    return promoService.validatePromoCode(code, purchaseAmount)
  }

  async getReferralInfo(userId: string): Promise<CreditApiResponse<ReferralInfo>> {
    return promoService.getReferralInfo(userId)
  }

  // ============================================
  // PACKAGE INFO
  // ============================================

  getPackages() {
    return CREDIT_PACKAGES
  }

  getPlatformCosts() {
    return PLATFORM_CREDIT_COSTS
  }

  calculatePrice(credits: number) {
    return calculateCustomPrice(credits)
  }
}

// Export singleton instance
export const creditService = CreditService.getInstance()

// Export class for testing
export { CreditService }

// Re-export individual services for direct access
export { balanceService, transactionService, purchaseService, usageService, promoService }
