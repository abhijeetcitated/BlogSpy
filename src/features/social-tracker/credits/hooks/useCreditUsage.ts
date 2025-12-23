/**
 * Credit Usage Hook
 * Manages credit consumption for platform actions
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { creditService } from "../services/credit.service"
import { PLATFORM_CREDIT_COSTS } from "../config/pricing.config"
import type { CreditUsageStats } from "../types/credit.types"

export interface UseCreditUsageReturn {
  isLoading: boolean
  error: string | null
  useCredits: (platform: string, action: string, keyword?: string) => Promise<boolean>
  usageStats: CreditUsageStats | null
  refreshStats: () => Promise<void>
}

export function useCreditUsage(userId: string | null): UseCreditUsageReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usageStats, setUsageStats] = useState<CreditUsageStats | null>(null)

  const useCredits = useCallback(async (
    platform: string,
    action: string,
    keyword?: string
  ): Promise<boolean> => {
    if (!userId) {
      setError("User not authenticated")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const platformConfig = PLATFORM_CREDIT_COSTS[platform]
      if (!platformConfig) {
        setError(`Invalid platform: ${platform}`)
        return false
      }

      let credits = 0
      switch (action) {
        case "track_keyword":
          credits = platformConfig.creditsPerKeyword
          break
        case "refresh":
          credits = platformConfig.creditsPerRefresh
          break
        case "competitor_analysis":
          credits = platformConfig.creditsPerCompetitor
          break
        default:
          credits = platformConfig.creditsPerKeyword
      }

      const response = await creditService.useCredits({
        userId,
        platform,
        action: action as "track_keyword" | "refresh" | "competitor_analysis",
        keyword,
        credits,
      })

      if (response.success && response.data?.success) {
        return true
      } else {
        setError(response.error?.message || "Failed to use credits")
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const refreshStats = useCallback(async () => {
    if (!userId) return

    try {
      const response = await creditService.getUsageStats(userId)
      if (response.success && response.data) {
        setUsageStats(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch usage stats:", err)
    }
  }, [userId])

  // Initial load with cleanup
  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (!userId) return

      try {
        const response = await creditService.getUsageStats(userId)
        if (isMounted && response.success && response.data) {
          setUsageStats(response.data)
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch usage stats:", err)
        }
      }
    }

    load()
    
    return () => {
      isMounted = false
    }
  }, [userId])

  return { isLoading, error, useCredits, usageStats, refreshStats }
}
