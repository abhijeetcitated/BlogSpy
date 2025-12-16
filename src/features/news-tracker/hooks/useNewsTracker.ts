/**
 * ============================================
 * NEWS TRACKER - useNewsTracker Hook
 * ============================================
 * 
 * Custom hook for News/Discover tracking functionality
 * Handles keyword tracking, batch operations, and results
 * 
 * @version 1.0.0
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { newsTrackerService, creditService } from "../services"
import { useCredits } from "./useCredits"
import type { NewsPlatform, NewsKeyword } from "../types"
import type {
  NormalizedNewsResult,
  BatchStatus,
} from "../types/api.types"

// ============================================
// HOOK INTERFACE
// ============================================

interface UseNewsTrackerOptions {
  userId: string
  platform?: NewsPlatform
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseNewsTrackerReturn {
  // State
  keywords: NewsKeyword[]
  results: Map<string, NormalizedNewsResult>
  activeBatch: BatchStatus | null
  isTracking: boolean
  error: string | null

  // Actions
  trackKeyword: (keyword: string, platform?: NewsPlatform) => Promise<NormalizedNewsResult | null>
  trackMultiple: (keywords: string[], platform?: NewsPlatform | "both") => Promise<string> // Returns batchId
  getBatchStatus: (batchId: string) => Promise<BatchStatus | null>
  refreshKeyword: (keywordId: string) => Promise<void>
  removeKeyword: (keywordId: string) => void
  clearResults: () => void

  // Computed
  totalKeywords: number
  creditsNeeded: (count: number, platform?: NewsPlatform | "both") => number
  canTrack: (count: number, platform?: NewsPlatform | "both") => boolean
}

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  keywords: "news-tracker-keywords",
  results: "news-tracker-results",
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useNewsTracker(options: UseNewsTrackerOptions): UseNewsTrackerReturn {
  const { userId, platform: defaultPlatform = "google-news" } = options

  // State
  const [keywords, setKeywords] = useState<NewsKeyword[]>([])
  const [results, setResults] = useState<Map<string, NormalizedNewsResult>>(new Map())
  const [activeBatch, setActiveBatch] = useState<BatchStatus | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Credits hook
  const { balance, deductCredits, validateCredits } = useCredits({ userId })

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const creditsNeeded = useCallback((count: number, platform?: NewsPlatform | "both"): number => {
    const multiplier = platform === "both" ? 2 : 1
    return count * multiplier
  }, [])

  const canTrack = useCallback((count: number, platform?: NewsPlatform | "both"): boolean => {
    const needed = creditsNeeded(count, platform)
    return (balance?.availableCredits || 0) >= needed
  }, [balance, creditsNeeded])

  // ============================================
  // TRACKING METHODS
  // ============================================

  const trackKeyword = useCallback(async (
    keyword: string,
    platform: NewsPlatform = defaultPlatform
  ): Promise<NormalizedNewsResult | null> => {
    if (!userId) {
      toast.error("Please login to track keywords")
      return null
    }

    // Validate credits
    const validation = await validateCredits(1)
    if (!validation.canProceed) {
      toast.error("Insufficient credits", {
        description: validation.message,
      })
      return null
    }

    try {
      setIsTracking(true)
      setError(null)

      // Track keyword
      const response = await newsTrackerService.trackKeyword({
        keyword,
        platform,
        userId,
        deductCredits: true,
      })

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Tracking failed")
      }

      // Deduct credit
      await deductCredits(1, `Tracked: ${keyword}`, platform)

      // Store result
      const resultId = `${keyword}-${platform}`
      setResults(prev => new Map(prev).set(resultId, response.data!))

      // Add to keywords list if not exists
      setKeywords(prev => {
        const exists = prev.some(k => k.keyword === keyword)
        if (exists) return prev

        const newKeyword: NewsKeyword = {
          id: `kw_${Date.now()}`,
          keyword,
          searchVolume: 0,
          platforms: {
            "google-news": platform === "google-news" ? {
              position: response.data!.items[0]?.position || null,
              previousPosition: null,
              change: 0,
              isTopStory: response.data!.items[0]?.isTopStory || false,
              category: "general",
              articles: [],
            } : null,
            "google-discover": platform === "google-discover" ? {
              impressions: 0,
              clicks: 0,
              ctr: 0,
              avgPosition: response.data!.items[0]?.position || 0,
              trend: "stable",
              cards: [],
            } : null,
          },
          newsIntent: "trending",
          lastUpdated: new Date().toISOString(),
        }

        return [...prev, newKeyword]
      })

      toast.success(`Tracked: ${keyword}`, {
        description: `Found ${response.data.totalResults} results`,
      })

      return response.data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tracking failed"
      setError(message)
      toast.error("Tracking failed", { description: message })
      return null
    } finally {
      setIsTracking(false)
    }
  }, [userId, defaultPlatform, validateCredits, deductCredits])

  const trackMultiple = useCallback(async (
    keywordList: string[],
    platform: NewsPlatform | "both" = defaultPlatform
  ): Promise<string> => {
    if (!userId) {
      toast.error("Please login to track keywords")
      return ""
    }

    // Validate credits
    const creditsRequired = creditsNeeded(keywordList.length, platform)
    const validation = await validateCredits(creditsRequired)
    
    if (!validation.canProceed) {
      toast.error("Insufficient credits", {
        description: `Need ${creditsRequired} credits, have ${validation.availableCredits}`,
      })
      return ""
    }

    try {
      setIsTracking(true)
      setError(null)

      // Start batch
      const response = await newsTrackerService.trackBatch({
        userId,
        keywords: keywordList,
        platform: platform as "google-news" | "google-discover" | "both",
      })

      if (!response.success) {
        throw new Error(response.error?.message || "Batch tracking failed")
      }

      setActiveBatch({
        batchId: response.batchId,
        status: "queued",
        progress: 0,
        processedCount: 0,
        totalCount: response.totalKeywords,
        successCount: 0,
        failedCount: 0,
        creditsUsed: 0,
        startedAt: new Date().toISOString(),
      })

      toast.info("Batch tracking started", {
        description: `Tracking ${keywordList.length} keywords...`,
      })

      return response.batchId
    } catch (err) {
      const message = err instanceof Error ? err.message : "Batch tracking failed"
      setError(message)
      toast.error("Batch tracking failed", { description: message })
      return ""
    } finally {
      setIsTracking(false)
    }
  }, [userId, defaultPlatform, creditsNeeded, validateCredits])

  const getBatchStatus = useCallback(async (batchId: string): Promise<BatchStatus | null> => {
    try {
      const status = await newsTrackerService.getBatchStatus(batchId)
      
      if (status) {
        setActiveBatch(status)

        // If completed, process results
        if (status.status === "completed" && status.results) {
          status.results.forEach(result => {
            const resultId = `${result.keyword}-${result.platform}`
            setResults(prev => new Map(prev).set(resultId, result))
          })

          // Deduct credits
          await deductCredits(
            status.creditsUsed,
            `Batch tracking: ${status.totalCount} keywords`,
            "google-news"
          )

          toast.success("Batch tracking completed", {
            description: `Processed ${status.successCount} keywords`,
          })
        }
      }

      return status
    } catch {
      return null
    }
  }, [deductCredits])

  const refreshKeyword = useCallback(async (keywordId: string): Promise<void> => {
    const keyword = keywords.find(k => k.id === keywordId)
    if (!keyword) return

    // Track on the platform that has data
    const platform = keyword.platforms["google-news"] ? "google-news" : "google-discover"
    await trackKeyword(keyword.keyword, platform)
  }, [keywords, trackKeyword])

  const removeKeyword = useCallback((keywordId: string): void => {
    setKeywords(prev => prev.filter(k => k.id !== keywordId))
    
    // Also remove results
    const keyword = keywords.find(k => k.id === keywordId)
    if (keyword) {
      setResults(prev => {
        const newMap = new Map(prev)
        newMap.delete(`${keyword.keyword}-google-news`)
        newMap.delete(`${keyword.keyword}-google-discover`)
        return newMap
      })
    }

    toast.success("Keyword removed")
  }, [keywords])

  const clearResults = useCallback((): void => {
    setResults(new Map())
    toast.success("Results cleared")
  }, [])

  // ============================================
  // PERSISTENCE
  // ============================================

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const savedKeywords = localStorage.getItem(`${STORAGE_KEYS.keywords}-${userId}`)
      if (savedKeywords) {
        setKeywords(JSON.parse(savedKeywords))
      }
    } catch {
      // Ignore parse errors
    }
  }, [userId])

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined" || !userId) return

    try {
      localStorage.setItem(`${STORAGE_KEYS.keywords}-${userId}`, JSON.stringify(keywords))
    } catch {
      // Ignore storage errors
    }
  }, [keywords, userId])

  // ============================================
  // COMPUTED
  // ============================================

  const totalKeywords = useMemo(() => keywords.length, [keywords])

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    keywords,
    results,
    activeBatch,
    isTracking,
    error,

    // Actions
    trackKeyword,
    trackMultiple,
    getBatchStatus,
    refreshKeyword,
    removeKeyword,
    clearResults,

    // Computed
    totalKeywords,
    creditsNeeded,
    canTrack,
  }
}
