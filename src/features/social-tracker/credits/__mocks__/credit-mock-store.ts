/**
 * Credit Mock Store
 * Centralized mock data store for credit service testing
 * Replace with actual database in production
 */

import type {
  CreditBalance,
  CreditTransaction,
  CreditPurchase,
  PromoCode,
} from "../types/credit.types"

export interface MockStore {
  balances: Map<string, CreditBalance>
  transactions: Map<string, CreditTransaction[]>
  purchases: Map<string, CreditPurchase[]>
  promoCodes: Map<string, PromoCode>
}

/**
 * Initial promo codes for testing
 */
const initialPromoCodes: [string, PromoCode][] = [
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
]

/**
 * Mock data store instance
 * In production, replace with database queries
 */
export const mockStore: MockStore = {
  balances: new Map(),
  transactions: new Map(),
  purchases: new Map(),
  promoCodes: new Map(initialPromoCodes),
}

/**
 * Reset mock store (for testing)
 */
export function resetMockStore(): void {
  mockStore.balances.clear()
  mockStore.transactions.clear()
  mockStore.purchases.clear()
  mockStore.promoCodes = new Map(initialPromoCodes)
}

/**
 * Utility: Generate unique ID
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Utility: Get current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Utility: Simulate API delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
