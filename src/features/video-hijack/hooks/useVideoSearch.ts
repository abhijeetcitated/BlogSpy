"use client"

// Video Search Hook - Handles search state and logic

import { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import type {
  Platform,
  SortOption,
  VideoResult,
  TikTokResult,
  KeywordStats,
  VideoSuggestion,
} from "../types/video-search.types"
import {
  generateMockYouTubeResults,
  generateMockTikTokResults,
  generateKeywordStats,
  generateVideoSuggestion,
} from "../utils/mock-generators"
import { ITEMS_PER_PAGE } from "../utils/helpers"
import { escapeCsvValue, getPublishTimestamp } from "../utils/common.utils"

export interface UseVideoSearchResult {
  // Search state
  searchInput: string
  setSearchInput: (input: string) => void
  searchedQuery: string
  platform: Platform
  setPlatform: (platform: Platform) => void
  
  // Loading state
  isLoading: boolean
  hasSearched: boolean
  
  // Results
  youtubeResults: VideoResult[]
  tiktokResults: TikTokResult[]
  keywordStats: KeywordStats | null
  videoSuggestion: VideoSuggestion | null
  
  // Sorting & Pagination
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  paginatedResults: VideoResult[] | TikTokResult[]
  currentResults: VideoResult[] | TikTokResult[]
  
  // Actions
  handleSearch: () => void
  handleExport: () => void
  handleCopy: (text: string) => void
}

export function useVideoSearch(): UseVideoSearchResult {
  // Search state
  const [searchInput, setSearchInput] = useState("")
  const [searchedQuery, setSearchedQuery] = useState("")
  
  // Platform state
  const [platform, setPlatformState] = useState<Platform>("youtube")
  
  // Results state
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [youtubeResults, setYoutubeResults] = useState<VideoResult[]>([])
  const [tiktokResults, setTiktokResults] = useState<TikTokResult[]>([])
  const [keywordStats, setKeywordStats] = useState<KeywordStats | null>(null)
  const [videoSuggestion, setVideoSuggestion] = useState<VideoSuggestion | null>(null)
  
  // Sort & Filter
  const [sortBy, setSortBy] = useState<SortOption>("hijackScore")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Set platform with page reset
  const setPlatform = useCallback((p: Platform) => {
    setPlatformState(p)
    setCurrentPage(1)
  }, [])
  
  // Sorted results
  const sortedYoutubeResults = useMemo(() => {
    const sorted = [...youtubeResults]
    switch (sortBy) {
      case "hijackScore": return sorted.sort((a, b) => b.hijackScore - a.hijackScore)
      case "views": return sorted.sort((a, b) => b.views - a.views)
      case "engagement": return sorted.sort((a, b) => b.engagement - a.engagement)
      case "recent":
        return sorted.sort(
          (a, b) => getPublishTimestamp(b.publishedAt) - getPublishTimestamp(a.publishedAt)
        )
      default: return sorted
    }
  }, [youtubeResults, sortBy])
  
  const sortedTiktokResults = useMemo(() => {
    const sorted = [...tiktokResults]
    switch (sortBy) {
      case "hijackScore": return sorted.sort((a, b) => b.hijackScore - a.hijackScore)
      case "views": return sorted.sort((a, b) => b.views - a.views)
      case "engagement": return sorted.sort((a, b) => b.engagement - a.engagement)
      case "recent":
        return sorted.sort(
          (a, b) => getPublishTimestamp(b.publishedAt) - getPublishTimestamp(a.publishedAt)
        )
      default: return sorted
    }
  }, [tiktokResults, sortBy])
  
  // Current results based on platform
  const currentResults = platform === "youtube" ? sortedYoutubeResults : sortedTiktokResults
  
  // Pagination
  const totalPages = Math.ceil(currentResults.length / ITEMS_PER_PAGE)
  const paginatedResults = currentResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  
  // Search handler
  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) {
      toast.error("Enter a keyword", {
        description: "Enter a topic to find video opportunities",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(false)

    const query = searchInput.trim()
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

    try {
      if (useMockData) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        const ytMock = generateMockYouTubeResults(query)
        const ttMock = generateMockTikTokResults(query)
        setSearchedQuery(query)
        setYoutubeResults(ytMock)
        setTiktokResults(ttMock)
        setKeywordStats(generateKeywordStats(query, platform))
        setVideoSuggestion(generateVideoSuggestion(query))
        setHasSearched(true)
        setCurrentPage(1)
        toast.success("Search Complete!", {
          description: `Found video results for "${query}" (mock mode)`,
        })
        return
      }

      // Call YouTube API (real data with credit deduction)
      const response = await fetch(`/api/video-hijack/youtube?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 402) {
          toast.error("Insufficient Credits", {
            description: "You need at least 1 credit to perform a video search. Please upgrade your plan.",
          })
          setIsLoading(false)
          return
        }
        if (response.status === 401) {
          if (!useMockData) {
            toast.error("Authentication Required", {
              description: "Please sign in to use this feature.",
            })
          }
          setIsLoading(false)
          return
        }
        throw new Error(`Search failed: ${response.statusText}`)
      }
      
      const responseData = await response.json()
      
      // API returns wrapped response: { success: true, data: { results, stats, ... } }
      const data = responseData.success ? responseData.data : responseData
      
      setSearchedQuery(query)
      setYoutubeResults(data.results || [])
      setTiktokResults(generateMockTikTokResults(query)) // TikTok is Coming Soon
      setKeywordStats(data.stats || generateKeywordStats(query, platform))
      setVideoSuggestion(data.suggestion || generateVideoSuggestion(query))
      setHasSearched(true)
      setCurrentPage(1)
      
      const creditsUsed = data.creditsUsed || 1
      toast.success("Search Complete!", {
        description: `Found ${data.results?.length || 0} video results for "${query}" (${creditsUsed} credit used)`,
      })
    } catch (error) {
      console.error("Video search error:", error)
      toast.error("Search Failed", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchInput, platform])
  
  // Export handler
  const handleExport = useCallback(() => {
    const results = platform === "youtube" ? youtubeResults : tiktokResults
    if (results.length === 0) {
      toast.error("No data to export")
      return
    }
    
    const csv = platform === "youtube"
      ? [
          ["Title", "Channel", "Views", "Likes", "Comments", "Engagement %", "Duration", "URL"].join(","),
          ...youtubeResults.map(v => [
            escapeCsvValue(v.title),
            escapeCsvValue(v.channel),
            escapeCsvValue(v.views),
            escapeCsvValue(v.likes),
            escapeCsvValue(v.comments),
            escapeCsvValue(v.engagement.toFixed(2)),
            escapeCsvValue(v.duration),
            escapeCsvValue(v.videoUrl),
          ].join(",")),
        ].join("\n")
      : [
          ["Description", "Creator", "Views", "Likes", "Shares", "Engagement %", "URL"].join(","),
          ...tiktokResults.map(v => [
            escapeCsvValue(`${v.description.slice(0, 50)}...`),
            escapeCsvValue(v.creator),
            escapeCsvValue(v.views),
            escapeCsvValue(v.likes),
            escapeCsvValue(v.shares),
            escapeCsvValue(v.engagement.toFixed(2)),
            escapeCsvValue(v.videoUrl),
          ].join(",")),
        ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${platform}-${searchedQuery}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Exported!", { description: `${results.length} videos exported` })
  }, [platform, youtubeResults, tiktokResults, searchedQuery])
  
  // Copy handler
  const handleCopy = useCallback((text: string) => {
    if (!navigator?.clipboard) {
      toast.error("Clipboard not available")
      return
    }

    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied!"))
      .catch(() => toast.error("Copy failed"))
  }, [])
  
  return {
    searchInput,
    setSearchInput,
    searchedQuery,
    platform,
    setPlatform,
    isLoading,
    hasSearched,
    youtubeResults,
    tiktokResults,
    keywordStats,
    videoSuggestion,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedResults,
    currentResults,
    handleSearch,
    handleExport,
    handleCopy,
  }
}
