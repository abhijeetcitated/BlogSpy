// ============================================
// VIDEO HIJACK - TikTok Search Hook
// ============================================

"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import type { TikTokVideoResult } from "../types/tiktok.types"
import type { SortOption, KeywordStats } from "../types/common.types"
import {
  generateMockTikTokResults,
  generateKeywordStats,
} from "../utils/mock-generators"
import { ITEMS_PER_PAGE, escapeCsvValue, getPublishTimestamp } from "../utils/common.utils"

export interface UseTikTokSearchResult {
  // State
  searchInput: string
  setSearchInput: (input: string) => void
  searchedQuery: string
  isLoading: boolean
  hasSearched: boolean
  
  // Results
  results: TikTokVideoResult[]
  keywordStats: KeywordStats | null
  
  // Sorting & Pagination
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  paginatedResults: TikTokVideoResult[]
  
  // Actions
  handleSearch: (query: string) => void
  handleExport: () => void
  handleCopy: (text: string) => void
  reset: () => void
}

export function useTikTokSearch(): UseTikTokSearchResult {
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
  const [results, setResults] = useState<TikTokVideoResult[]>([])
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
        description: "Enter a keyword to find TikTok video opportunities",
      })
      return
    }
    
    setIsLoading(true)
    setHasSearched(false)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // TODO: Replace with actual TikTok API call
    // import { tiktokService } from "../services"
    // const videos = await tiktokService.searchVideos(query)
    
    searchTimeoutRef.current = setTimeout(() => {
      const mockResults = generateMockTikTokResults(query)
      const mockStats = generateKeywordStats(query, "tiktok")
      
      // Transform to TikTokVideoResult format
      const transformed: TikTokVideoResult[] = mockResults.map(r => ({
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
        
        // Video info
        caption: r.description,
        description: r.description,
        thumbnail: `https://picsum.photos/seed/${r.id}/400/300`,
        videoUrl: r.videoUrl,
        
        // Creator info
        creator: r.creator,
        creatorId: r.creator,
        creatorUsername: r.creator,
        creatorName: r.creator,
        creatorUrl: r.creatorUrl,
        creatorAvatar: `https://ui-avatars.com/api/?name=${r.creator}&background=random`,
        creatorFollowers: parseInt(r.followers.replace(/[KMB]/g, "")) * (r.followers.includes("M") ? 1000000 : r.followers.includes("K") ? 1000 : 1),
        creatorVerified: Math.random() > 0.5,
        followers: r.followers,
        
        // Stats
        shares: r.shares,
        plays: r.views,
        
        // Metadata
        hashtags: r.hashtags,
        soundName: "Original Sound",
        soundAuthor: r.creator,
        soundTrending: r.soundTrending,
        
        // Scores
        opportunityScore: r.hijackScore,
      }))
      
      setSearchedQuery(query)
      setResults(transformed)
      setKeywordStats(mockStats)
      setIsLoading(false)
      setHasSearched(true)
      setCurrentPage(1)
      
      toast.success("TikTok Search Complete!", {
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
      ["Description", "Creator", "Views", "Likes", "Shares", "Engagement %", "Hijack Score", "Duration", "URL"].join(","),
      ...results.map(v => [
        escapeCsvValue(`${v.description.slice(0, 50)}...`),
        escapeCsvValue(v.creator),
        escapeCsvValue(v.views),
        escapeCsvValue(v.likes),
        escapeCsvValue(v.shares),
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
    a.download = `tiktok-${searchedQuery}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Exported!", { description: `${results.length} TikTok videos exported` })
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
