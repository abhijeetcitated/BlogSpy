/**
 * Social Filters Hook
 * 
 * @description Manages search query and platform filtering with debounced search
 * for optimal performance. Uses useDebounce to prevent excessive filtering operations.
 * 
 * @example
 * ```tsx
 * const { 
 *   searchQuery, 
 *   setSearchQuery,
 *   activePlatform,
 *   setActivePlatform,
 *   filterKeywords 
 * } = useSocialFilters({ searchDebounceMs: 300 })
 * 
 * const filtered = filterKeywords(allKeywords)
 * ```
 * 
 * @module hooks/useSocialFilters
 */

"use client"

import { useState, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { SOCIAL_TRACKER_DEFAULTS, DEFAULT_SOCIAL_PLATFORM } from "../constants"
import type { SocialKeyword, SocialPlatform } from "../types"

/**
 * Configuration options for useSocialFilters hook
 */
export interface UseSocialFiltersOptions {
  /** Default platform to select (default: pinterest) */
  defaultPlatform?: SocialPlatform
  /** Debounce delay for search in ms (default: 300) */
  searchDebounceMs?: number
}

/**
 * Return type for useSocialFilters hook
 */
export interface UseSocialFiltersReturn {
  /** Current search query (raw, not debounced) */
  searchQuery: string
  /** Update the search query */
  setSearchQuery: (query: string) => void
  /** Debounced search query for filtering */
  debouncedSearchQuery: string
  /** Currently active platform tab */
  activePlatform: SocialPlatform
  /** Switch to a different platform */
  setActivePlatform: (platform: SocialPlatform) => void
  
  /** Filter keywords by search and platform */
  filterKeywords: (keywords: SocialKeyword[]) => SocialKeyword[]
  /** Get keyword count per platform */
  getPlatformStats: (keywords: SocialKeyword[]) => Record<SocialPlatform, { count: number }>
}

/**
 * Hook for managing keyword filtering with debounced search
 * 
 * @param options - Configuration options
 * @returns Filter state and functions
 */
export function useSocialFilters(options: UseSocialFiltersOptions = {}): UseSocialFiltersReturn {
  const { 
    defaultPlatform = DEFAULT_SOCIAL_PLATFORM,
    searchDebounceMs = SOCIAL_TRACKER_DEFAULTS.searchDebounceMs
  } = options

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>(defaultPlatform)

  // Debounced search query for performance
  const debouncedSearchQuery = useDebounce(searchQuery, searchDebounceMs)

  // Filter keywords based on debounced search and platform
  const filterKeywords = useCallback((keywords: SocialKeyword[]): SocialKeyword[] => {
    return keywords.filter(k => {
      const matchesSearch = debouncedSearchQuery === "" || 
        k.keyword.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      const matchesPlatform = k.platforms[activePlatform] !== undefined
      return matchesSearch && matchesPlatform
    })
  }, [debouncedSearchQuery, activePlatform])

  // Calculate platform stats
  const getPlatformStats = useCallback((keywords: SocialKeyword[]): Record<SocialPlatform, { count: number }> => {
    return {
      pinterest: { count: keywords.filter(k => k.platforms.pinterest).length },
      twitter: { count: keywords.filter(k => k.platforms.twitter).length },
      instagram: { count: keywords.filter(k => k.platforms.instagram).length },
    }
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    activePlatform,
    setActivePlatform,
    filterKeywords,
    getPlatformStats,
  }
}
