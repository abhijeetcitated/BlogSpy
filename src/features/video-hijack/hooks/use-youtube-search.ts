// ============================================
// VIDEO HIJACK - YouTube Search Hook
// ============================================

"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import type { YouTubeVideoResult } from "../types/youtube.types"
import type { SortOption, KeywordStats } from "../types/common.types"
import {
  generateMockYouTubeResults,
  generateKeywordStats,
} from "../utils/mock-generators"
import { ITEMS_PER_PAGE, escapeCsvValue, getPublishTimestamp } from "../utils/common.utils"

export interface UseYouTubeSearchResult {
  // State
  searchInput: string
  setSearchInput: (input: string) => void
  searchedQuery: string
  isLoading: boolean
  hasSearched: boolean
  
  // Results
  results: YouTubeVideoResult[]
  keywordStats: KeywordStats | null
  
  // Sorting & Pagination
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  paginatedResults: YouTubeVideoResult[]
  
  // Actions
  handleSearch: (query: string) => void
  handleExport: () => void
  handleCopy: (text: string) => void
  reset: () => void
}

export function useYouTubeSearch(): UseYouTubeSearchResult {
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Search state
  const [searchInput, setSearchInput] = useState("")
  const [searchedQuery, setSearchedQuery] = useState("")
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Results state
  const [results, setResults] = useState<YouTubeVideoResult[]>([])
  const [keywordStats, setKeywordStats] = useState<KeywordStats | null>(null)
  
  // Sort & Pagination
  const [sortBy, setSortBy] = useState<SortOption>("hijackScore")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Sorted results
  const sortedResults = useMemo(() => {
    const sorted = [...results]
    switch (sortBy) {
      case "hijackScore":
        return sorted.sort((a, b) => b.hijackScore - a.hijackScore)
      case "views":
        return sorted.sort((a, b) => b.views - a.views)
      case "engagement":
        return sorted.sort((a, b) => b.engagement - a.engagement)
      case "recent":
        return sorted.sort(
          (a, b) => getPublishTimestamp(b.publishedAt) - getPublishTimestamp(a.publishedAt)
        )
      default:
        return sorted
    }
  }, [results, sortBy])
  
  // Pagination
  const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE)
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  
  // Search handler
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      toast.error("Enter a keyword", {
        description: "Enter a keyword to find YouTube video opportunities",
      })
      return
    }
    
    setIsLoading(true)
    setHasSearched(false)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // TODO: Replace with actual YouTube API call
    // import { youtubeService } from "../services"
    // const videos = await youtubeService.searchVideos(query)
    
    searchTimeoutRef.current = setTimeout(() => {
      const mockResults = generateMockYouTubeResults(query)
      const mockStats = generateKeywordStats(query, "youtube")
      
      // Transform to YouTubeVideoResult format
      const transformed: YouTubeVideoResult[] = mockResults.map(r => ({
        // Base fields
        id: r.id,
        url: r.videoUrl,
        views: r.views,
        likes: r.likes,
        comments: r.comments,
        publishedAt: r.publishedAt,
        duration: r.duration,
        engagement: r.engagement,
        engagementRate: r.engagement,
        hijackScore: r.hijackScore,
        viralPotential: r.viralPotential,
        
        // YouTube specific
        title: r.title,
        channel: r.channel,
        channelName: r.channel,
        channelUrl: r.channelUrl,
        channelThumbnail: `https://ui-avatars.com/api/?name=${r.channel}&background=random`,
        channelVerified: Math.random() > 0.3,
        channelSubs: parseInt(r.subscribers.replace(/[KMB]/g, "")) * (r.subscribers.includes("M") ? 1000000 : r.subscribers.includes("K") ? 1000 : 1),
        subscribers: r.subscribers,
        thumbnail: r.thumbnailUrl,
        thumbnailUrl: r.thumbnailUrl,
        videoUrl: r.videoUrl,
        tags: r.tags,
        contentAge: r.contentAge,
        opportunityScore: r.hijackScore,
      }))
      
      setSearchedQuery(query)
      setResults(transformed)
      setKeywordStats(mockStats)
      setIsLoading(false)
      setHasSearched(true)
      setCurrentPage(1)
      
      toast.success("YouTube Search Complete!", {
        description: `Found ${transformed.length} videos for "${query}"`,
      })
    }, 1500)
  }, [])
  
  // Export handler
  const handleExport = useCallback(() => {
    if (results.length === 0) {
      toast.error("No data to export")
      return
    }
    
    const csv = [
      ["Title", "Channel", "Views", "Likes", "Comments", "Engagement %", "Hijack Score", "Duration", "URL"].join(","),
      ...results.map(v => [
        escapeCsvValue(v.title),
        escapeCsvValue(v.channel),
        escapeCsvValue(v.views),
        escapeCsvValue(v.likes),
        escapeCsvValue(v.comments),
        escapeCsvValue(v.engagement.toFixed(2)),
        escapeCsvValue(v.hijackScore),
        escapeCsvValue(v.duration),
        escapeCsvValue(v.videoUrl),
      ].join(",")),
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `youtube-${searchedQuery}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Exported!", { description: `${results.length} YouTube videos exported` })
  }, [results, searchedQuery])
  
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
  
  // Reset handler
  const reset = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    setSearchInput("")
    setSearchedQuery("")
    setResults([])
    setKeywordStats(null)
    setHasSearched(false)
    setCurrentPage(1)
  }, [])
  
  return {
    searchInput,
    setSearchInput,
    searchedQuery,
    isLoading,
    hasSearched,
    results,
    keywordStats,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedResults,
    handleSearch,
    handleExport,
    handleCopy,
    reset,
  }
}
