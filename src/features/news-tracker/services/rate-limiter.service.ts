/**
 * ============================================
 * NEWS TRACKER - RATE LIMITER SERVICE
 * ============================================
 * 
 * Rate limiting for API endpoints to prevent abuse
 * and ensure fair usage across all users.
 * 
 * Uses sliding window algorithm for accurate limiting.
 * 
 * @version 1.0.0
 */

import type { RateLimitInfo } from "../types/api.types"

// ============================================
// RATE LIMIT CONFIGURATION
// ============================================

interface RateLimitConfig {
  limit: number      // Max requests
  windowMs: number   // Time window in milliseconds
  blockDurationMs?: number // How long to block after exceeding limit
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Per-endpoint limits
  trackKeyword: {
    limit: 60,           // 60 requests
    windowMs: 60 * 1000, // per minute
    blockDurationMs: 60 * 1000,
  },
  trackBatch: {
    limit: 10,           // 10 batch requests
    windowMs: 60 * 1000, // per minute
    blockDurationMs: 120 * 1000,
  },
  purchaseCredits: {
    limit: 5,            // 5 purchases
    windowMs: 60 * 60 * 1000, // per hour
    blockDurationMs: 60 * 60 * 1000,
  },
  getBalance: {
    limit: 100,          // 100 requests
    windowMs: 60 * 1000, // per minute
  },
  
  // Global user limit
  global: {
    limit: 1000,         // 1000 total requests
    windowMs: 60 * 60 * 1000, // per hour
    blockDurationMs: 60 * 60 * 1000,
  },
  
  // Anonymous/unauthenticated limit
  anonymous: {
    limit: 10,           // 10 requests
    windowMs: 60 * 1000, // per minute
    blockDurationMs: 300 * 1000,
  },
}

// ============================================
// SLIDING WINDOW STORAGE
// ============================================

interface WindowData {
  timestamps: number[]
  blockedUntil?: number
}

// In-memory storage (use Redis in production)
const windows: Map<string, WindowData> = new Map()

// ============================================
// RATE LIMITER CLASS
// ============================================

class RateLimiter {
  /**
   * Check if request is allowed
   */
  async checkLimit(
    userId: string,
    endpoint: string
  ): Promise<{
    allowed: boolean
    retryAfter?: number
    info: RateLimitInfo
  }> {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.global
    const key = this.getKey(userId, endpoint)
    const now = Date.now()

    // Get or create window data
    let window = windows.get(key)
    if (!window) {
      window = { timestamps: [] }
      windows.set(key, window)
    }

    // Check if blocked
    if (window.blockedUntil && window.blockedUntil > now) {
      const retryAfter = Math.ceil((window.blockedUntil - now) / 1000)
      return {
        allowed: false,
        retryAfter,
        info: this.createLimitInfo(userId, endpoint, 0, config.limit, window.blockedUntil),
      }
    }

    // Clean old timestamps outside the window
    const windowStart = now - config.windowMs
    window.timestamps = window.timestamps.filter(ts => ts > windowStart)

    // Check limit
    if (window.timestamps.length >= config.limit) {
      // Block user if configured
      if (config.blockDurationMs) {
        window.blockedUntil = now + config.blockDurationMs
      }

      const oldestInWindow = window.timestamps[0]
      const retryAfter = Math.ceil((oldestInWindow + config.windowMs - now) / 1000)

      return {
        allowed: false,
        retryAfter,
        info: this.createLimitInfo(userId, endpoint, 0, config.limit, oldestInWindow + config.windowMs),
      }
    }

    // Allow request
    window.timestamps.push(now)
    const remaining = config.limit - window.timestamps.length
    const resetAt = now + config.windowMs

    return {
      allowed: true,
      info: this.createLimitInfo(userId, endpoint, remaining, config.limit, resetAt),
    }
  }

  /**
   * Record a request (manual tracking)
   */
  async recordRequest(userId: string, endpoint: string): Promise<void> {
    const key = this.getKey(userId, endpoint)
    const now = Date.now()

    let window = windows.get(key)
    if (!window) {
      window = { timestamps: [] }
      windows.set(key, window)
    }

    window.timestamps.push(now)
  }

  /**
   * Get current rate limit status
   */
  async getStatus(userId: string, endpoint: string): Promise<RateLimitInfo> {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.global
    const key = this.getKey(userId, endpoint)
    const now = Date.now()

    const window = windows.get(key)
    if (!window) {
      return this.createLimitInfo(userId, endpoint, config.limit, config.limit, now + config.windowMs)
    }

    // Clean old timestamps
    const windowStart = now - config.windowMs
    const validTimestamps = window.timestamps.filter(ts => ts > windowStart)
    const remaining = Math.max(0, config.limit - validTimestamps.length)
    const resetAt = validTimestamps.length > 0 
      ? validTimestamps[0] + config.windowMs 
      : now + config.windowMs

    return this.createLimitInfo(userId, endpoint, remaining, config.limit, resetAt)
  }

  /**
   * Reset rate limit for a user (admin function)
   */
  async resetLimit(userId: string, endpoint?: string): Promise<void> {
    if (endpoint) {
      const key = this.getKey(userId, endpoint)
      windows.delete(key)
    } else {
      // Reset all limits for user
      const prefix = `${userId}:`
      for (const key of windows.keys()) {
        if (key.startsWith(prefix)) {
          windows.delete(key)
        }
      }
    }
  }

  /**
   * Check global limit for user
   */
  async checkGlobalLimit(userId: string): Promise<boolean> {
    const result = await this.checkLimit(userId, "global")
    return result.allowed
  }

  /**
   * Get all active limits for a user
   */
  async getUserLimits(userId: string): Promise<Record<string, RateLimitInfo>> {
    const limits: Record<string, RateLimitInfo> = {}
    
    for (const endpoint of Object.keys(RATE_LIMITS)) {
      limits[endpoint] = await this.getStatus(userId, endpoint)
    }

    return limits
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getKey(userId: string, endpoint: string): string {
    return `${userId}:${endpoint}`
  }

  private createLimitInfo(
    userId: string,
    endpoint: string,
    remaining: number,
    limit: number,
    resetAt: number
  ): RateLimitInfo {
    return {
      userId,
      endpoint,
      limit,
      remaining,
      resetAt: new Date(resetAt).toISOString(),
      isLimited: remaining <= 0,
    }
  }

  /**
   * Clean up expired windows (call periodically)
   */
  cleanup(): void {
    const now = Date.now()
    const maxAge = 2 * 60 * 60 * 1000 // 2 hours

    for (const [key, window] of windows.entries()) {
      // Remove if all timestamps are old and not blocked
      const latestTimestamp = Math.max(...window.timestamps, 0)
      const blockedUntil = window.blockedUntil || 0

      if (now - latestTimestamp > maxAge && now > blockedUntil) {
        windows.delete(key)
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()

// Export class for testing
export { RateLimiter }

// Cleanup interval (run every 10 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    rateLimiter.cleanup()
  }, 10 * 60 * 1000)
}
