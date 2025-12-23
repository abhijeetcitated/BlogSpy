/**
 * Usage Service
 * Handles credit usage/deduction operations
 */

import { generateId, getCurrentTimestamp, delay } from "../__mocks__/credit-mock-store"
import { balanceService } from "./balance.service"
import { transactionService } from "./transaction.service"
import { PLATFORM_CREDIT_COSTS } from "../config/pricing.config"
import type { 
  CreditUsageRequest, 
  UsageResponse,
  CreditUsageStats,
  CreditApiResponse
} from "../types/credit.types"

class UsageService {
  private static instance: UsageService
  
  private constructor() {}

  static getInstance(): UsageService {
    if (!UsageService.instance) {
      UsageService.instance = new UsageService()
    }
    return UsageService.instance
  }

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
      const result = await balanceService.deductCredits(request.userId, creditsNeeded)

      if (!result.success) {
        return {
          success: false,
          error: {
            code: "INSUFFICIENT_CREDITS",
            message: result.error || "Insufficient credits",
          },
        }
      }

      // Create usage transaction
      await transactionService.createTransaction(
        request.userId,
        "usage",
        -creditsNeeded,
        result.balance!.availableCredits,
        {
          platform: request.platform,
          action: request.action,
          keyword: request.keyword,
        }
      )

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
   * Get credit usage stats
   */
  async getUsageStats(userId: string): Promise<CreditApiResponse<CreditUsageStats>> {
    try {
      await delay(100)

      const transactions = await transactionService.getTransactionsByType(userId, "usage")

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

      transactions.forEach(t => {
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
}

export const usageService = UsageService.getInstance()
export { UsageService }
