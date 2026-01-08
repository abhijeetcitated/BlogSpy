/**
 * ============================================
 * CENTRALIZED CREDIT SERVICE
 * ============================================
 * 
 * Single source of truth for all credit operations.
 * Uses Supabase database - NOT in-memory stores.
 * 
 * All features must use this service:
 * - News Tracker
 * - Social Tracker
 * - AI Writer
 * - Keyword Magic
 * - All other credit-consuming features
 * 
 * @version 1.0.0
 */

import "server-only"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

// ============================================
// TYPES
// ============================================

export interface CreditBalance {
  userId: string
  creditsTotal: number
  creditsUsed: number
  creditsAvailable: number
  plan: "FREE" | "PRO" | "ENTERPRISE"
  resetDate: Date
  lastResetAt: Date | null
}

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: "usage" | "refund" | "purchase" | "reset" | "bonus"
  feature: string | null
  description: string | null
  creditsBefore: number
  creditsAfter: number
  createdAt: Date
}

export interface UseCreditsResult {
  success: boolean
  remaining: number
  message: string
}

export interface CreditCosts {
  keyword_magic: number
  ai_writer: number
  rank_tracker: number
  news_tracker: number
  social_tracker: number
  video_hijack: number
  competitor_gap: number
  content_decay: number
  topic_clusters: number
  ai_visibility: number
}

// Feature credit costs - centralized configuration
export const CREDIT_COSTS: CreditCosts = {
  keyword_magic: 1,
  ai_writer: 5,
  rank_tracker: 1,
  news_tracker: 2,
  social_tracker: 2,
  video_hijack: 3,
  competitor_gap: 2,
  content_decay: 1,
  topic_clusters: 3,
  ai_visibility: 2,
}

// Plan limits
export const PLAN_LIMITS = {
  FREE: { monthlyCredits: 100, maxProjects: 1, maxKeywords: 50 },
  PRO: { monthlyCredits: 2000, maxProjects: 5, maxKeywords: 500 },
  ENTERPRISE: { monthlyCredits: 10000, maxProjects: 999, maxKeywords: 10000 },
} as const

// ============================================
// CREDIT SERVICE CLASS
// ============================================

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

  /**
   * Get user's credit balance from Supabase
   */
  async getBalance(userId: string): Promise<CreditBalance | null> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error) {
        // If no record, create one with defaults
        if (error.code === "PGRST116") {
          return await this.initializeUserCredits(userId)
        }
        logger.error("Failed to get credit balance", { error, userId })
        return null
      }

      return {
        userId: data.user_id,
        creditsTotal: data.credits_total,
        creditsUsed: data.credits_used,
        creditsAvailable: data.credits_total - data.credits_used,
        plan: data.plan as CreditBalance["plan"],
        resetDate: new Date(data.reset_date),
        lastResetAt: data.last_reset_at ? new Date(data.last_reset_at) : null,
      }
    } catch (error) {
      logger.error("Error getting credit balance", { error, userId })
      return null
    }
  }

  /**
   * Initialize credits for a new user
   */
  private async initializeUserCredits(userId: string): Promise<CreditBalance> {
    const supabase = await createClient()

    const resetDate = new Date()
    resetDate.setDate(resetDate.getDate() + 30)

    const defaultCredits = PLAN_LIMITS.FREE.monthlyCredits

    const { data, error } = await supabase
      .from("user_credits")
      .insert({
        user_id: userId,
        credits_total: defaultCredits,
        credits_used: 0,
        plan: "FREE",
        reset_date: resetDate.toISOString(),
        last_reset_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      logger.error("Failed to initialize user credits", { error, userId })
      // Return default balance on error
      return {
        userId,
        creditsTotal: defaultCredits,
        creditsUsed: 0,
        creditsAvailable: defaultCredits,
        plan: "FREE",
        resetDate,
        lastResetAt: new Date(),
      }
    }

    return {
      userId: data.user_id,
      creditsTotal: data.credits_total,
      creditsUsed: data.credits_used,
      creditsAvailable: data.credits_total - data.credits_used,
      plan: data.plan as CreditBalance["plan"],
      resetDate: new Date(data.reset_date),
      lastResetAt: data.last_reset_at ? new Date(data.last_reset_at) : null,
    }
  }

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId)
    if (!balance) return false
    return balance.creditsAvailable >= amount
  }

  // ============================================
  // CREDIT OPERATIONS
  // ============================================

  /**
   * Use credits - calls Supabase RPC function for atomic operation
   */
  async useCredits(
    userId: string,
    amount: number,
    feature: keyof CreditCosts | string,
    description?: string
  ): Promise<UseCreditsResult> {
    try {
      const supabase = await createClient()

      // Call the use_credits RPC function for atomic deduction
      const { data, error } = await supabase.rpc("use_credits", {
        p_user_id: userId,
        p_amount: amount,
        p_feature: feature,
        p_description: description || `Used ${amount} credits for ${feature}`,
      })

      if (error) {
        logger.error("Failed to use credits", { error, userId, amount, feature })
        return {
          success: false,
          remaining: 0,
          message: "Failed to deduct credits",
        }
      }

      // RPC returns array with single row
      const result = Array.isArray(data) ? data[0] : data

      logger.info("Credits used successfully", {
        userId,
        amount,
        feature,
        remaining: result.remaining,
      })

      return {
        success: result.success,
        remaining: result.remaining,
        message: result.message,
      }
    } catch (error) {
      logger.error("Error using credits", { error, userId, amount, feature })
      return {
        success: false,
        remaining: 0,
        message: "An error occurred while using credits",
      }
    }
  }

  /**
   * Use credits for a specific feature (convenience method)
   */
  async useFeatureCredits(
    userId: string,
    feature: keyof CreditCosts,
    description?: string
  ): Promise<UseCreditsResult> {
    const cost = CREDIT_COSTS[feature]
    return this.useCredits(userId, cost, feature, description)
  }

  /**
   * Add credits (for purchases, bonuses, etc.)
   */
  async addCredits(
    userId: string,
    amount: number,
    type: "purchase" | "bonus" | "refund",
    description?: string
  ): Promise<boolean> {
    try {
      const supabase = await createClient()

      // First get current balance
      const balance = await this.getBalance(userId)
      if (!balance) return false

      const creditsBefore = balance.creditsAvailable
      const creditsAfter = creditsBefore + amount

      // Update credits
      const { error: updateError } = await supabase
        .from("user_credits")
        .update({
          credits_total: balance.creditsTotal + amount,
        })
        .eq("user_id", userId)

      if (updateError) {
        logger.error("Failed to add credits", { error: updateError, userId, amount })
        return false
      }

      // Log transaction
      await supabase.from("credit_usage_history").insert({
        user_id: userId,
        credits_amount: amount,
        transaction_type: type,
        credits_before: creditsBefore,
        credits_after: creditsAfter,
        description: description || `${type}: Added ${amount} credits`,
      })

      logger.info("Credits added successfully", { userId, amount, type })
      return true
    } catch (error) {
      logger.error("Error adding credits", { error, userId, amount, type })
      return false
    }
  }

  // ============================================
  // TRANSACTION HISTORY
  // ============================================

  /**
   * Get user's credit transaction history
   */
  async getTransactionHistory(
    userId: string,
    options: { limit?: number; offset?: number; type?: string } = {}
  ): Promise<CreditTransaction[]> {
    try {
      const supabase = await createClient()

      let query = supabase
        .from("credit_usage_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (options.type) {
        query = query.eq("transaction_type", options.type)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        logger.error("Failed to get transaction history", { error, userId })
        return []
      }

      return data.map((t) => ({
        id: t.id,
        userId: t.user_id,
        amount: t.credits_amount,
        type: t.transaction_type as CreditTransaction["type"],
        feature: t.feature_used,
        description: t.description,
        creditsBefore: t.credits_before,
        creditsAfter: t.credits_after,
        createdAt: new Date(t.created_at),
      }))
    } catch (error) {
      logger.error("Error getting transaction history", { error, userId })
      return []
    }
  }

  // ============================================
  // PLAN OPERATIONS
  // ============================================

  /**
   * Upgrade user's plan
   */
  async upgradePlan(
    userId: string,
    newPlan: CreditBalance["plan"],
    stripeSubscriptionId?: string
  ): Promise<boolean> {
    try {
      const supabase = await createClient()

      const planLimits = PLAN_LIMITS[newPlan]

      const { error } = await supabase
        .from("user_credits")
        .update({
          plan: newPlan,
          credits_total: planLimits.monthlyCredits,
          credits_used: 0,
          stripe_subscription_id: stripeSubscriptionId,
          reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_reset_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) {
        logger.error("Failed to upgrade plan", { error, userId, newPlan })
        return false
      }

      // Log the upgrade
      await supabase.from("credit_usage_history").insert({
        user_id: userId,
        credits_amount: planLimits.monthlyCredits,
        transaction_type: "purchase",
        credits_before: 0,
        credits_after: planLimits.monthlyCredits,
        description: `Plan upgraded to ${newPlan}`,
      })

      logger.info("Plan upgraded successfully", { userId, newPlan })
      return true
    } catch (error) {
      logger.error("Error upgrading plan", { error, userId, newPlan })
      return false
    }
  }

  /**
   * Reset monthly credits (for cron job)
   */
  async resetMonthlyCredits(userId: string): Promise<boolean> {
    try {
      const supabase = await createClient()

      const { error } = await supabase.rpc("reset_monthly_credits", {
        p_user_id: userId,
      })

      if (error) {
        logger.error("Failed to reset monthly credits", { error, userId })
        return false
      }

      logger.info("Monthly credits reset successfully", { userId })
      return true
    } catch (error) {
      logger.error("Error resetting monthly credits", { error, userId })
      return false
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get credit cost for a feature
   */
  getCreditCost(feature: keyof CreditCosts): number {
    return CREDIT_COSTS[feature]
  }

  /**
   * Get plan limits
   */
  getPlanLimits(plan: CreditBalance["plan"]) {
    return PLAN_LIMITS[plan]
  }

  /**
   * Check if feature is available for plan
   */
  async canUseFeature(
    userId: string,
    feature: keyof CreditCosts
  ): Promise<{ allowed: boolean; reason?: string }> {
    const balance = await this.getBalance(userId)

    if (!balance) {
      return { allowed: false, reason: "Unable to verify credits" }
    }

    const cost = CREDIT_COSTS[feature]

    if (balance.creditsAvailable < cost) {
      return {
        allowed: false,
        reason: `Insufficient credits. Need ${cost}, have ${balance.creditsAvailable}`,
      }
    }

    return { allowed: true }
  }
}

// ============================================
// EXPORTS
// ============================================

// Singleton instance
export const creditService = CreditService.getInstance()

// Export class for testing
export { CreditService }

// Helper function for quick credit check
export async function checkCredits(
  userId: string,
  feature: keyof CreditCosts
): Promise<boolean> {
  return creditService.hasEnoughCredits(userId, CREDIT_COSTS[feature])
}

// Helper function for using credits
export async function useCredits(
  userId: string,
  feature: keyof CreditCosts,
  description?: string
): Promise<UseCreditsResult> {
  return creditService.useFeatureCredits(userId, feature, description)
}
