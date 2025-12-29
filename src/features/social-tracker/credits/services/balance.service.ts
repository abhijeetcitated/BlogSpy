/**
 * Balance Service
 * Handles credit balance operations
 */

import { mockStore, generateId, getCurrentTimestamp, delay } from "../__mocks__/credit-mock-store"
import type { CreditBalance, BalanceResponse } from "../types/credit.types"

class BalanceService {
  private static instance: BalanceService
  
  private constructor() {}

  static getInstance(): BalanceService {
    if (!BalanceService.instance) {
      BalanceService.instance = new BalanceService()
    }
    return BalanceService.instance
  }

  /**
   * Get user's credit balance
   */
  async getBalance(userId: string): Promise<BalanceResponse> {
    try {
      await delay(100)

      let balance = mockStore.balances.get(userId)
      
      if (!balance) {
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
  async addCredits(
    userId: string, 
    credits: number, 
    bonusCredits: number = 0
  ): Promise<CreditBalance> {
    const balanceResponse = await this.getBalance(userId)
    const balance = balanceResponse.data!
    
    const totalCreditsToAdd = credits + bonusCredits

    balance.totalCredits += totalCreditsToAdd
    balance.availableCredits += totalCreditsToAdd
    balance.bonusCredits += bonusCredits
    balance.lastUpdated = getCurrentTimestamp()

    mockStore.balances.set(userId, balance)

    return balance
  }

  /**
   * Deduct credits from user's balance
   */
  async deductCredits(
    userId: string,
    credits: number
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

    return {
      success: true,
      balance,
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
}

export const balanceService = BalanceService.getInstance()
export { BalanceService }
