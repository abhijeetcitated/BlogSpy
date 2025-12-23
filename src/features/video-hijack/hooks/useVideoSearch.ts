"use client"

// Video Search Hook - Handles search state and logic

import { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import type {
  SearchMode,
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

export interface UseVideoSearchResult {
  // Search state
  searchMode: SearchMode
  setSearchMode: (mode: SearchMode) => void
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
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword")
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
      case "recent": return sorted
      default: return sorted
    }
  }, [youtubeResults, sortBy])
  
  const sortedTiktokResults = useMemo(() => {
    const sorted = [...tiktokResults]
    switch (sortBy) {
      case "hijackScore": return sorted.sort((a, b) => b.hijackScore - a.hijackScore)
      case "views": return sorted.sort((a, b) => b.views - a.views)
      case "engagement": return sorted.sort((a, b) => b.engagement - a.engagement)
      case "recent": return sorted
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
  const handleSearch = useCallback(() => {
    if (!searchInput.trim()) {
      toast.error("Enter a keyword or domain", {
        description: searchMode === "keyword"
          ? "Enter a keyword to find video opportunities"
          : "Enter your domain to find keywords with video results",
      })
      return
    }
    
    setIsLoading(true)
    setHasSearched(false)
    
    // TODO: Replace with actual API calls
    setTimeout(() => {
      const query = searchInput.trim()
      setSearchedQuery(query)
      setYoutubeResults(generateMockYouTubeResults(query))
      setTiktokResults(generateMockTikTokResults(query))
      setKeywordStats(generateKeywordStats(query, platform))
      setVideoSuggestion(generateVideoSuggestion(query))
      setIsLoading(false)
      setHasSearched(true)
      setCurrentPage(1)
      
      toast.success("Search Complete!", {
        description: `Found video results for "${query}"`,
      })
    }, 2000)
  }, [searchInput, searchMode, platform])
  
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
            `"${v.title}"`,
            v.channel,
            v.views,
            v.likes,
            v.comments,
            v.engagement.toFixed(2),
            v.duration,
            v.videoUrl,
          ].join(",")),
        ].join("\n")
      : [
          ["Description", "Creator", "Views", "Likes", "Shares", "Engagement %", "URL"].join(","),
          ...tiktokResults.map(v => [
            `"${v.description.slice(0, 50)}..."`,
            v.creator,
            v.views,
            v.likes,
            v.shares,
            v.engagement.toFixed(2),
            v.videoUrl,
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
    navigator.clipboard.writeText(text)
    toast.success("Copied!")
  }, [])
  
  return {
    searchMode,
    setSearchMode,
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
