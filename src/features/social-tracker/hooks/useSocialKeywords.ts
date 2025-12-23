/**
 * Social Keywords Hook
 * 
 * @description Manages CRUD operations for social media keywords.
 * Includes proper cleanup via isMounted pattern to prevent memory leaks.
 * 
 * @example
 * ```tsx
 * const { 
 *   keywords, 
 *   addKeyword, 
 *   deleteKeyword,
 *   isLoading 
 * } = useSocialKeywords({ autoFetch: true })
 * 
 * await addKeyword('seo tips', ['pinterest', 'twitter'])
 * ```
 * 
 * @module hooks/useSocialKeywords
 */

"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { socialTrackerService } from "../../../../services/social-tracker.service"
import type { SocialKeyword, SocialSummary, SocialPlatform } from "../types"

/**
 * Configuration options for useSocialKeywords hook
 */
export interface UseSocialKeywordsOptions {
  /** Whether to automatically fetch keywords on mount (default: true) */
  autoFetch?: boolean
}

/**
 * Return type for useSocialKeywords hook
 */
export interface UseSocialKeywordsReturn {
  /** All tracked keywords */
  keywords: SocialKeyword[]
  /** Summary statistics */
  summary: SocialSummary | null
  
  /** True during initial data fetch */
  isLoading: boolean
  /** True during background refresh */
  isRefreshing: boolean
  /** True while adding keyword */
  isAddingKeyword: boolean
  /** True while deleting keyword */
  isDeletingKeyword: boolean
  
  /** Error message if operation failed */
  error: string | null
  
  /** Fetch all keywords */
  fetchKeywords: () => Promise<void>
  /** Refresh keyword data */
  refreshData: () => Promise<void>
  /** Add new keyword to track */
  addKeyword: (keyword: string, platforms: SocialPlatform[]) => Promise<boolean>
  /** Delete a keyword */
  deleteKeyword: (keywordId: string) => Promise<boolean>
  /** Update keyword data */
  updateKeyword: (keywordId: string, data: Partial<SocialKeyword>) => Promise<boolean>
}

/** Default summary for initial state */
const DEFAULT_SUMMARY: SocialSummary = {
  totalKeywords: 0,
  pinterestRanking: 0,
  twitterRanking: 0,
  instagramRanking: 0,
  totalImpressions: 0,
  avgEngagement: 0,
  trendingCount: 0,
}

/**
 * Hook for managing social keyword CRUD operations
 * 
 * @param options - Configuration options
 * @returns Keywords data and mutation functions
 */
export function useSocialKeywords(options: UseSocialKeywordsOptions = {}): UseSocialKeywordsReturn {
  const { autoFetch = true } = options

  // Data state
  const [keywords, setKeywords] = useState<SocialKeyword[]>([])
  const [summary, setSummary] = useState<SocialSummary | null>(null)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAddingKeyword, setIsAddingKeyword] = useState(false)
  const [isDeletingKeyword, setIsDeletingKeyword] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  // Fetch keywords from API
  const fetchKeywords = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await socialTrackerService.getKeywords()
      
      if (response.success && response.data) {
        setKeywords(response.data.keywords)
        setSummary(response.data.summary)
      } else {
        throw new Error(response.error || "Failed to fetch keywords")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch keywords"
      setError(message)
      console.error("Fetch keywords error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh data (with loading indicator)
  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)
    
    try {
      const response = await socialTrackerService.refreshKeywords()
      
      if (response.success && response.data) {
        setKeywords(response.data.keywords)
        setSummary(response.data.summary)
      } else {
        throw new Error(response.error || "Failed to refresh data")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to refresh data"
      setError(message)
      toast.error(message)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Add new keyword
  const addKeyword = useCallback(async (keyword: string, platforms: SocialPlatform[]): Promise<boolean> => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword")
      return false
    }
    
    if (platforms.length === 0) {
      toast.error("Please select at least one platform")
      return false
    }
    
    setIsAddingKeyword(true)
    
    try {
      const response = await socialTrackerService.addKeyword(keyword, platforms)
      
      if (response.success && response.data) {
        setKeywords(prev => [response.data!, ...prev])
        // Update summary
        setSummary(prev => prev ? {
          ...prev,
          pinterestRanking: platforms.includes("pinterest") ? prev.pinterestRanking + 1 : prev.pinterestRanking,
          twitterRanking: platforms.includes("twitter") ? prev.twitterRanking + 1 : prev.twitterRanking,
          instagramRanking: platforms.includes("instagram") ? prev.instagramRanking + 1 : prev.instagramRanking,
        } : prev)
        return true
      } else {
        throw new Error(response.error || "Failed to add keyword")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add keyword"
      toast.error(message)
      return false
    } finally {
      setIsAddingKeyword(false)
    }
  }, [])

  // Delete keyword
  const deleteKeyword = useCallback(async (keywordId: string): Promise<boolean> => {
    setIsDeletingKeyword(true)
    
    try {
      const response = await socialTrackerService.deleteKeyword(keywordId)
      
      if (response.success) {
        setKeywords(prev => prev.filter(k => k.id !== keywordId))
        return true
      } else {
        throw new Error(response.error || "Failed to delete keyword")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete keyword"
      toast.error(message)
      return false
    } finally {
      setIsDeletingKeyword(false)
    }
  }, [])

  // Update keyword
  const updateKeyword = useCallback(async (keywordId: string, data: Partial<SocialKeyword>): Promise<boolean> => {
    try {
      const response = await socialTrackerService.updateKeyword(keywordId, data)
      
      if (response.success && response.data) {
        setKeywords(prev => prev.map(k => k.id === keywordId ? { ...k, ...response.data } : k))
        return true
      } else {
        throw new Error(response.error || "Failed to update keyword")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update keyword"
      toast.error(message)
      return false
    }
  }, [])

  // Auto-fetch on mount with cleanup
  useEffect(() => {
    let isMounted = true
    
    const load = async () => {
      if (!autoFetch) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await socialTrackerService.getKeywords()
        
        if (isMounted) {
          if (response.success && response.data) {
            setKeywords(response.data.keywords)
            setSummary(response.data.summary)
          } else {
            throw new Error(response.error || "Failed to fetch keywords")
          }
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Failed to fetch keywords"
          setError(message)
          console.error("Fetch keywords error:", err)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()
    
    return () => {
      isMounted = false
    }
  }, [autoFetch])

  return {
    keywords,
    summary: summary || DEFAULT_SUMMARY,
    isLoading,
    isRefreshing,
    isAddingKeyword,
    isDeletingKeyword,
    error,
    fetchKeywords,
    refreshData,
    addKeyword,
    deleteKeyword,
    updateKeyword,
  }
}
