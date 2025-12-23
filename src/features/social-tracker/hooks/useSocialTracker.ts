/**
 * Social Tracker Main Hook
 * 
 * @description Composes useSocialKeywords and useSocialFilters to provide
 * a complete API for managing social media keyword tracking. This hook
 * follows the composition pattern for better maintainability.
 * 
 * @example
 * ```tsx
 * const {
 *   keywords,
 *   isLoading,
 *   searchQuery,
 *   setSearchQuery,
 *   activePlatform,
 *   setActivePlatform,
 *   filteredKeywords,
 *   addKeyword,
 *   deleteKeyword
 * } = useSocialTracker({ defaultPlatform: 'pinterest' })
 * ```
 * 
 * @module hooks/useSocialTracker
 */

"use client"

import { useMemo } from "react"
import { useSocialKeywords, type UseSocialKeywordsOptions } from "./useSocialKeywords"
import { useSocialFilters, type UseSocialFiltersOptions } from "./useSocialFilters"
import type { SocialKeyword, SocialSummary, SocialPlatform } from "../types"

/**
 * Options for configuring the social tracker hook
 */
export interface UseSocialTrackerOptions extends UseSocialKeywordsOptions, UseSocialFiltersOptions {}

/**
 * Return type for useSocialTracker hook
 */
export interface UseSocialTrackerReturn {
  /** All keywords tracked by the user */
  keywords: SocialKeyword[]
  /** Summary statistics across all platforms */
  summary: SocialSummary | null
  
  /** True during initial data fetch */
  isLoading: boolean
  /** True during background data refresh */
  isRefreshing: boolean
  /** True while adding a new keyword */
  isAddingKeyword: boolean
  /** True while deleting a keyword */
  isDeletingKeyword: boolean
  
  /** Error message if any operation failed */
  error: string | null
  
  /** Fetch all keywords from the API */
  fetchKeywords: () => Promise<void>
  /** Refresh all keyword data in the background */
  refreshData: () => Promise<void>
  /** Add a new keyword to track on specified platforms */
  addKeyword: (keyword: string, platforms: SocialPlatform[]) => Promise<boolean>
  /** Delete a tracked keyword */
  deleteKeyword: (keywordId: string) => Promise<boolean>
  /** Update keyword data */
  updateKeyword: (keywordId: string, data: Partial<SocialKeyword>) => Promise<boolean>
  
  /** Current search query */
  searchQuery: string
  /** Update the search query */
  setSearchQuery: (query: string) => void
  /** Currently selected platform tab */
  activePlatform: SocialPlatform
  /** Switch to a different platform tab */
  setActivePlatform: (platform: SocialPlatform) => void
  
  /** Keywords filtered by search and platform (memoized) */
  filteredKeywords: SocialKeyword[]
  /** Count of keywords per platform (memoized) */
  platformStats: Record<SocialPlatform, { count: number }>
}

/**
 * Main hook for Social Tracker feature
 * 
 * @param options - Configuration options
 * @returns Complete API for managing social keyword tracking
 */
export function useSocialTracker(options: UseSocialTrackerOptions = {}): UseSocialTrackerReturn {
  // Compose keyword management
  const {
    keywords,
    summary,
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
  } = useSocialKeywords({ autoFetch: options.autoFetch })

  // Compose filtering
  const {
    searchQuery,
    setSearchQuery,
    activePlatform,
    setActivePlatform,
    filterKeywords,
    getPlatformStats,
  } = useSocialFilters({ defaultPlatform: options.defaultPlatform })

  // Memoize computed values
  const filteredKeywords = useMemo(() => 
    filterKeywords(keywords), 
    [filterKeywords, keywords]
  )

  const platformStats = useMemo(() => 
    getPlatformStats(keywords), 
    [getPlatformStats, keywords]
  )

  return {
    // Data
    keywords,
    summary,
    
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

// Re-export individual hooks for granular usage
export { useSocialKeywords } from "./useSocialKeywords"
export { useSocialFilters } from "./useSocialFilters"
