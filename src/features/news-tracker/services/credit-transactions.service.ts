/**
 * ============================================
 * NEWS TRACKER - CREDIT TRANSACTIONS SERVICE
 * ============================================
 * 
 * Transaction recording and history management
 * Split from credit.service.ts for better maintainability
 * 
 * @version 1.0.0
 */

import type {
  CreditTransaction,
  TransactionType,
  TransactionStatus,
  CreditUsageStats,
  CreditUsageByPlatform,
} from "../types/credits.types"

// ============================================
// IN-MEMORY STORAGE (Replace with DB)
// ============================================

const transactions: Map<string, CreditTransaction[]> = new Map()

// ============================================
// TRANSACTION SERVICE CLASS
// ============================================

class CreditTransactionService {
  /**
   * Record a new transaction
   */
  async recordTransaction(data: {
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
   * Get a specific transaction by ID
   */
  async getTransaction(userId: string, transactionId: string): Promise<CreditTransaction | null> {
    const userTxns = transactions.get(userId) || []
    return userTxns.find(t => t.id === transactionId) || null
  }

  /**
   * Get user's transaction history with pagination and filtering
   */
  async getTransactionHistory(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      type?: TransactionType
      status?: TransactionStatus
      startDate?: string
      endDate?: string
    }
  ): Promise<{ transactions: CreditTransaction[]; total: number }> {
    let userTxns = transactions.get(userId) || []

    // Filter by type
    if (options?.type) {
      userTxns = userTxns.filter(t => t.type === options.type)
    }

    // Filter by status
    if (options?.status) {
      userTxns = userTxns.filter(t => t.status === options.status)
    }

    // Filter by date range
    if (options?.startDate) {
      const startDate = new Date(options.startDate)
      userTxns = userTxns.filter(t => new Date(t.createdAt) >= startDate)
    }

    if (options?.endDate) {
      const endDate = new Date(options.endDate)
      userTxns = userTxns.filter(t => new Date(t.createdAt) <= endDate)
    }

    const total = userTxns.length

    // Apply pagination
    const start = options?.offset || 0
    const end = start + (options?.limit || 50)
    const paginated = userTxns.slice(start, end).reverse() // Newest first

    return { transactions: paginated, total }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(
    userId: string,
    count: number = 10
  ): Promise<CreditTransaction[]> {
    const userTxns = transactions.get(userId) || []
    return userTxns.slice(-count).reverse()
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

    const calculateUsage = (txns: CreditTransaction[]): CreditUsageByPlatform => {
      const result: CreditUsageByPlatform = { "google-news": 0, "google-discover": 0, total: 0 }
      txns.forEach(t => {
        const platform = t.metadata.platform as "google-news" | "google-discover"
        if (platform && platform in result) {
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

  /**
   * Get spending summary
   */
  async getSpendingSummary(userId: string): Promise<{
    totalPurchased: number
    totalUsed: number
    totalBonus: number
    totalRefunded: number
  }> {
    const userTxns = transactions.get(userId) || []

    let totalPurchased = 0
    let totalUsed = 0
    let totalBonus = 0
    let totalRefunded = 0

    userTxns.forEach(t => {
      switch (t.type) {
        case "purchase":
          totalPurchased += t.amount
          break
        case "usage":
          totalUsed += Math.abs(t.amount)
          break
        case "bonus":
          totalBonus += t.amount
          break
        case "refund":
          totalRefunded += t.amount
          break
      }
    })

    return { totalPurchased, totalUsed, totalBonus, totalRefunded }
  }

  /**
   * Clear all transactions for a user (for testing)
   */
  clearUserTransactions(userId: string): void {
    transactions.delete(userId)
  }
}

// Export singleton instance
export const creditTransactionService = new CreditTransactionService()

// Export class for testing
export { CreditTransactionService }
