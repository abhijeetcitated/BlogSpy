/**
 * User Service
 * Handles user-related business logic
 */

import { supabaseService, type UserRecord } from "./supabase.service"
import { stripeService } from "./stripe.service"

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar: string | null
  plan: "FREE" | "PRO" | "ENTERPRISE"
  credits: number
  subscription?: {
    status: string
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
  }
}

export interface PlanLimits {
  keywords: number
  projects: number
  aiCredits: number
  rankTracking: number
  historyDays: number
}

class UserService {
  /**
   * Plan limits configuration
   */
  readonly planLimits: Record<string, PlanLimits> = {
    FREE: {
      keywords: 100,
      projects: 1,
      aiCredits: 10,
      rankTracking: 10,
      historyDays: 7,
    },
    PRO: {
      keywords: 5000,
      projects: 10,
      aiCredits: 500,
      rankTracking: 500,
      historyDays: 365,
    },
    ENTERPRISE: {
      keywords: -1, // unlimited
      projects: -1,
      aiCredits: 5000,
      rankTracking: -1,
      historyDays: -1,
    },
  }

  /**
   * Get user profile with subscription info
   */
  async getProfile(clerkId: string): Promise<UserProfile | null> {
    const user = await supabaseService.getUserByClerkId(clerkId)
    
    if (!user) {
      return null
    }

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      plan: user.plan,
      credits: user.credits,
    }

    // Get subscription info if customer exists
    if (user.stripeCustomerId) {
      try {
        const subscription = await stripeService.getSubscription(user.stripeCustomerId)
        if (subscription) {
          profile.subscription = {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        }
      } catch (error) {
        console.error("Failed to get subscription:", error)
      }
    }

    return profile
  }

  /**
   * Get limits for user's plan
   */
  getLimits(plan: string): PlanLimits {
    return this.planLimits[plan] || this.planLimits.FREE
  }

  /**
   * Check if user can perform an action based on credits
   */
  async canUseCredits(userId: string, amount: number): Promise<boolean> {
    const user = await supabaseService.getUserByClerkId(userId)
    return user ? user.credits >= amount : false
  }

  /**
   * Use credits for an action
   */
  async useCredits(userId: string, amount: number, endpoint: string): Promise<boolean> {
    const user = await supabaseService.getUserByClerkId(userId)
    
    if (!user) {
      return false
    }

    const success = await supabaseService.decrementCredits(user.id, amount)
    
    if (success) {
      await supabaseService.trackApiUsage(user.id, endpoint, amount)
    }

    return success
  }

  /**
   * Check if user has reached a limit
   */
  async checkLimit(
    clerkId: string, 
    limitType: keyof PlanLimits, 
    currentCount: number
  ): Promise<{ allowed: boolean; limit: number }> {
    const user = await supabaseService.getUserByClerkId(clerkId)
    
    if (!user) {
      return { allowed: false, limit: 0 }
    }

    const limits = this.getLimits(user.plan)
    const limit = limits[limitType]

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, limit: -1 }
    }

    return { 
      allowed: currentCount < limit, 
      limit 
    }
  }

  /**
   * Sync user from Clerk webhook
   */
  async syncFromClerk(clerkUser: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    imageUrl?: string | null
  }): Promise<UserRecord> {
    const name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ") || null

    return supabaseService.upsertUser({
      clerkId: clerkUser.id,
      email: clerkUser.email,
      name,
      avatar: clerkUser.imageUrl || null,
    })
  }

  /**
   * Update user's plan after subscription change
   */
  async updatePlan(
    clerkId: string, 
    plan: "FREE" | "PRO" | "ENTERPRISE",
    stripeCustomerId?: string
  ): Promise<void> {
    const user = await supabaseService.getUserByClerkId(clerkId)
    
    if (!user) {
      throw new Error("User not found")
    }

    // Reset credits based on new plan
    const limits = this.getLimits(plan)

    await supabaseService.upsertUser({
      clerkId,
      plan,
      credits: limits.aiCredits,
      ...(stripeCustomerId && { stripeCustomerId }),
    })
  }
}

// Export singleton instance
export const userService = new UserService()
