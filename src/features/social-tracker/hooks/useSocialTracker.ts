"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import type { SocialKeyword, SocialSummary, SocialPlatform } from "../types"
import { socialTrackerService } from "../../../../services/social-tracker.service"

export interface UseSocialTrackerOptions {
  platform?: SocialPlatform
  autoFetch?: boolean
}

export interface UseSocialTrackerReturn {
  // Data
  keywords: SocialKeyword[]
  summary: SocialSummary | null
  
  // Loading states
  isLoading: boolean
  isRefreshing: boolean
  isAddingKeyword: boolean
  isDeletingKeyword: boolean
  
  // Error state
  error: string | null
  
  // Actions
  fetchKeywords: () => Promise<void>
  refreshData: () => Promise<void>
  addKeyword: (keyword: string, platforms: SocialPlatform[]) => Promise<boolean>
  deleteKeyword: (keywordId: string) => Promise<boolean>
  updateKeyword: (keywordId: string, data: Partial<SocialKeyword>) => Promise<boolean>
  
  // Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  activePlatform: SocialPlatform
  setActivePlatform: (platform: SocialPlatform) => void
  
  // Computed
  filteredKeywords: SocialKeyword[]
  platformStats: Record<SocialPlatform, { count: number }>
}

const DEFAULT_SUMMARY: SocialSummary = {
  totalKeywords: 0,
  pinterestRanking: 0,
  twitterRanking: 0,
  instagramRanking: 0,
  totalImpressions: 0,
  avgEngagement: 0,
  trendingCount: 0,
}

export function useSocialTracker(options: UseSocialTrackerOptions = {}): UseSocialTrackerReturn {
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
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>("pinterest")

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
        toast.success("Data refreshed successfully")
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
        toast.success(`Keyword "${keyword}" added successfully`)
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
        toast.success("Keyword deleted successfully")
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
        toast.success("Keyword updated successfully")
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

  // Filtered keywords based on search and platform
  const filteredKeywords = keywords.filter(k => {
    const matchesSearch = searchQuery === "" || 
      k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = k.platforms[activePlatform] !== undefined
    return matchesSearch && matchesPlatform
  })

  // Platform stats
  const platformStats: Record<SocialPlatform, { count: number }> = {
    pinterest: { count: keywords.filter(k => k.platforms.pinterest).length },
    twitter: { count: keywords.filter(k => k.platforms.twitter).length },
    instagram: { count: keywords.filter(k => k.platforms.instagram).length },
  }

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchKeywords()
    }
  }, [autoFetch, fetchKeywords])

  return {
    // Data
    keywords,
    summary: summary || DEFAULT_SUMMARY,
    
    // Loading states
    isLoading,
    isRefreshing,
    isAddingKeyword,
    isDeletingKeyword,
    
    // Error state
    error,
    
    // Actions
    fetchKeywords,
    refreshData,
    addKeyword,
    deleteKeyword,
    updateKeyword,
    
    // Filters
    searchQuery,
    setSearchQuery,
    activePlatform,
    setActivePlatform,
    
    // Computed
    filteredKeywords,
    platformStats,
  }
}
