/**
 * ============================================
 * SOCIAL TRACKER - CREDIT TYPES
 * ============================================
 * 
 * Type-safe definitions for the credit system
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-15
 */

// ============================================
// CURRENCY
// ============================================

export interface CurrencyConfig {
  code: string
  symbol: string
  locale: string
  decimalPlaces: number
  usdRate: number
}

// ============================================
// CREDIT PACKAGES
// ============================================

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  pricePerCredit: number
  originalPrice: number
  savings: number
  popular: boolean
  badge: string | null
  color: "blue" | "pink" | "purple" | "amber" | "green"
  features: string[]
  estimatedKeywords: {
    pinterest: number
    twitter: number
    instagram: number
  }
}

export interface CreditTier {
  minCredits: number
  maxCredits: number
  pricePerCredit: number
  discount: number
}

// ============================================
// PLATFORM CREDITS
// ============================================

export interface PlatformCreditConfig {
  platformId: string
  platformName: string
  creditsPerKeyword: number
  creditsPerRefresh: number
  creditsPerCompetitor: number
  apiUnitsRequired: number
  estimatedCostPerRequest: number
  description: string
}

// ============================================
// CREDIT BALANCE & TRANSACTIONS
// ============================================

export type CreditTransactionType = 
  | "purchase"
  | "usage"
  | "refund"
  | "bonus"
  | "referral"
  | "promo"
  | "expiry"
  | "adjustment"

export type CreditTransactionStatus = 
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"

export interface CreditBalance {
  userId: string
  totalCredits: number
  usedCredits: number
  availableCredits: number
  bonusCredits: number
  lastUpdated: string
  expiringCredits?: {
    amount: number
    expiryDate: string
  }
}

export interface CreditTransaction {
  id: string
  userId: string
  type: CreditTransactionType
  amount: number
  balance: number
  description: string
  metadata: CreditTransactionMetadata
  status: CreditTransactionStatus
  createdAt: string
  updatedAt: string
}

export interface CreditTransactionMetadata {
  packageId?: string
  packageName?: string
  platform?: string
  keyword?: string
  orderId?: string
  paymentId?: string
  invoiceId?: string
  referralCode?: string
  promoCode?: string
  bonusType?: string
  reason?: string
}

// ============================================
// PURCHASE & CHECKOUT
// ============================================

export type PaymentMethod = "razorpay" | "stripe" | "paytm" | "upi"

export type PurchaseStatus = 
  | "initiated"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"

export interface CreditPurchase {
  id: string
  userId: string
  packageId: string
  credits: number
  bonusCredits: number
  totalCredits: number
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  paymentId?: string
  orderId?: string
  status: PurchaseStatus
  metadata: PurchaseMetadata
  createdAt: string
  completedAt?: string
}

export interface PurchaseMetadata {
  isFirstPurchase?: boolean
  promoCode?: string
  referralCode?: string
  discount?: number
  originalAmount?: number
  ip?: string
  userAgent?: string
}

export interface CreatePurchaseRequest {
  packageId: string
  credits: number
  amount: number
  paymentMethod: PaymentMethod
  promoCode?: string
  referralCode?: string
}

export interface CreatePurchaseResponse {
  success: boolean
  purchase?: CreditPurchase
  checkoutUrl?: string
  orderId?: string
  error?: string
}

// ============================================
// CREDIT USAGE
// ============================================

export interface CreditUsageRequest {
  userId: string
  platform: string
  action: "track_keyword" | "refresh" | "competitor_analysis"
  keyword?: string
  credits: number
}

export interface CreditUsageResponse {
  success: boolean
  creditsUsed: number
  remainingCredits: number
  transactionId?: string
  error?: string
}

export interface CreditUsageStats {
  today: number
  thisWeek: number
  thisMonth: number
  allTime: number
  byPlatform: {
    pinterest: number
    twitter: number
    instagram: number
    tiktok: number
  }
}

// ============================================
// PROMO & REFERRAL
// ============================================

export interface PromoCode {
  code: string
  discountType: "percentage" | "fixed" | "credits"
  discountValue: number
  minPurchase?: number
  maxDiscount?: number
  validFrom: string
  validUntil: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
}

export interface ReferralInfo {
  code: string
  referrerId: string
  totalReferrals: number
  creditsEarned: number
  pendingCredits: number
  link: string
}

// ============================================
// API RESPONSES
// ============================================

export interface CreditApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    timestamp: string
    requestId: string
  }
}

export type BalanceResponse = CreditApiResponse<CreditBalance>
export type TransactionsResponse = CreditApiResponse<{
  transactions: CreditTransaction[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}>
export type PurchaseResponse = CreditApiResponse<CreatePurchaseResponse>
export type UsageResponse = CreditApiResponse<CreditUsageResponse>
