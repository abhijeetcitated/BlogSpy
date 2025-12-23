/**
 * Transaction Service
 * Handles credit transaction operations
 */

import { mockStore, generateId, getCurrentTimestamp, delay } from "../__mocks__/credit-mock-store"
import type { 
  CreditTransaction, 
  CreditTransactionType, 
  TransactionsResponse 
} from "../types/credit.types"

class TransactionService {
  private static instance: TransactionService
  
  private constructor() {}

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService()
    }
    return TransactionService.instance
  }

  /**
   * Create a transaction record
   */
  async createTransaction(
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

  /**
   * Get transactions by type
   */
  async getTransactionsByType(
    userId: string,
    type: CreditTransactionType
  ): Promise<CreditTransaction[]> {
    const allTransactions = mockStore.transactions.get(userId) || []
    return allTransactions.filter(t => t.type === type)
  }
}

export const transactionService = TransactionService.getInstance()
export { TransactionService }
