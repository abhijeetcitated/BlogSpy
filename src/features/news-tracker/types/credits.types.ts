/**
 * ============================================
 * NEWS TRACKER - Credit System Types
 * ============================================
 * 
 * Complete type definitions for credit management,
 * purchases, transactions, and billing.
 * 
 * @version 1.0.0
 */

// ============================================
// CREDIT PLAN TYPES
// ============================================

/**
 * Available plan IDs
 */
export type CreditPlanId = "starter" | "pro" | "business" | "enterprise" | "custom"

/**
 * Credit Plan Definition
 */
export interface CreditPlan {
  id: CreditPlanId
  name: string
  credits: number
  price: number // INR
  pricePerCredit: number
  originalPrice?: number // For showing discounts
  discount?: number // Percentage
  features: string[]
  popular: boolean
  badge: string | null
  maxKeywords?: number
  dataRetentionDays: number
  teamMembers: number
  apiAccess: boolean
  prioritySupport: boolean
}

/**
 * Custom credit purchase request
 */
export interface CustomCreditRequest {
  credits: number
  calculatedPrice: number
  pricePerCredit: number
}

// ============================================
// USER CREDIT TYPES
// ============================================

/**
 * User's credit balance
 */
export interface UserCreditBalance {
  userId: string
  totalCredits: number
  usedCredits: number
  availableCredits: number
  reservedCredits: number // For pending operations
  expiringCredits: number
  expiryDate: string | null
  lastUpdated: string
}

/**
 * Credit usage by platform
 */
export interface CreditUsageByPlatform {
  "google-news": number
  "google-discover": number
  total: number
}

/**
 * Credit usage statistics
 */
export interface CreditUsageStats {
  today: CreditUsageByPlatform
  thisWeek: CreditUsageByPlatform
  thisMonth: CreditUsageByPlatform
  allTime: CreditUsageByPlatform
  avgDailyUsage: number
  projectedMonthlyUsage: number
}

// ============================================
// TRANSACTION TYPES
// ============================================

/**
 * Transaction types
 */
export type TransactionType = 
  | "purchase"      // Credit purchase
  | "usage"         // Credit used for tracking
  | "refund"        // Refund issued
  | "bonus"         // Promotional credits
  | "expiry"        // Credits expired
  | "adjustment"    // Manual adjustment
  | "transfer"      // Team credit transfer

/**
 * Transaction status
 */
export type TransactionStatus = 
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled"

/**
 * Payment method types
 */
export type PaymentMethod = 
  | "razorpay"
  | "stripe"
  | "paypal"
  | "upi"
  | "netbanking"
  | "card"
  | "wallet"

/**
 * Credit transaction record
 */
export interface CreditTransaction {
  id: string
  userId: string
  type: TransactionType
  amount: number // Credits (positive for add, negative for deduct)
  balanceBefore: number
  balanceAfter: number
  description: string
  metadata: TransactionMetadata
  status: TransactionStatus
  createdAt: string
  updatedAt: string
}

/**
 * Transaction metadata
 */
export interface TransactionMetadata {
  // For purchases
  planId?: CreditPlanId
  paymentId?: string
  paymentMethod?: PaymentMethod
  orderId?: string
  invoiceId?: string
  priceINR?: number
  taxAmount?: number
  
  // For usage
  keywordId?: string
  keyword?: string
  platform?: "google-news" | "google-discover"
  
  // For refunds
  refundReason?: string
  originalTransactionId?: string
  
  // For bonuses
  bonusType?: "welcome" | "referral" | "promo" | "loyalty"
  promoCode?: string
  
  // Common
  ipAddress?: string
  userAgent?: string
  source?: string
}

// ============================================
// PURCHASE TYPES
// ============================================

/**
 * Purchase request
 */
export interface CreditPurchaseRequest {
  userId: string
  planId: CreditPlanId
  customCredits?: number // For custom plans
  paymentMethod: PaymentMethod
  promoCode?: string
  metadata?: {
    source?: string
    referrer?: string
  }
}

/**
 * Purchase response
 */
export interface CreditPurchaseResponse {
  success: boolean
  orderId: string
  paymentId?: string
  credits: number
  amountPaid: number
  tax: number
  totalAmount: number
  newBalance: number
  transaction: CreditTransaction
  invoice?: InvoiceData
  error?: string
}

/**
 * Invoice data
 */
export interface InvoiceData {
  invoiceId: string
  invoiceNumber: string
  userId: string
  planName: string
  credits: number
  subtotal: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  paymentId: string
  createdAt: string
  downloadUrl?: string
}

// ============================================
// DEDUCTION TYPES
// ============================================

/**
 * Credit deduction request
 */
export interface CreditDeductionRequest {
  userId: string
  credits: number
  reason: string
  platform: "google-news" | "google-discover"
  keywordId?: string
  keyword?: string
}

/**
 * Credit deduction response
 */
export interface CreditDeductionResponse {
  success: boolean
  creditsDeducted: number
  newBalance: number
  transaction: CreditTransaction
  error?: string
  errorCode?: CreditErrorCode
}

/**
 * Credit error codes
 */
export type CreditErrorCode = 
  | "INSUFFICIENT_CREDITS"
  | "INVALID_AMOUNT"
  | "USER_NOT_FOUND"
  | "TRANSACTION_FAILED"
  | "RATE_LIMITED"
  | "ACCOUNT_SUSPENDED"
  | "CREDITS_EXPIRED"

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Credit validation result
 */
export interface CreditValidationResult {
  isValid: boolean
  availableCredits: number
  requiredCredits: number
  canProceed: boolean
  message: string
  suggestedPlan?: CreditPlanId
}

// ============================================
// PROMO & DISCOUNT TYPES
// ============================================

/**
 * Promo code
 */
export interface PromoCode {
  code: string
  type: "percentage" | "fixed" | "credits"
  value: number
  minPurchase?: number
  maxDiscount?: number
  validFrom: string
  validTo: string
  usageLimit?: number
  usedCount: number
  applicablePlans: CreditPlanId[] | "all"
  isActive: boolean
}

/**
 * Applied promo result
 */
export interface AppliedPromoResult {
  isValid: boolean
  code: string
  discountAmount: number
  bonusCredits: number
  finalPrice: number
  message: string
}
