// ============================================
// VIDEO HIJACK - Combined/Shared Hook
// ============================================
// This hook manages both platforms together
// Used by the main video-hijack page
// ============================================

"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import type {
  SearchMode,
  Platform,
  SortOption,
  KeywordStats,
  VideoSuggestion,
} from "../types/common.types"
import type { YouTubeVideoResult } from "../types/youtube.types"
import type { TikTokVideoResult } from "../types/tiktok.types"
import {
  generateMockYouTubeResults,
  generateMockTikTokResults,
  generateKeywordStats,
  generateVideoSuggestion,
} from "../utils/mock-generators"
import { ITEMS_PER_PAGE, escapeCsvValue, getPublishTimestamp } from "../utils/common.utils"

export interface UseVideoHijackResult {
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
  youtubeResults: YouTubeVideoResult[]
  tiktokResults: TikTokVideoResult[]
  keywordStats: KeywordStats | null
  videoSuggestion: VideoSuggestion | null
  
  // Sorting & Pagination
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  paginatedResults: YouTubeVideoResult[] | TikTokVideoResult[]
  currentResults: YouTubeVideoResult[] | TikTokVideoResult[]
  
  // Actions
  handleSearch: () => void
  handleExport: () => void
  handleCopy: (text: string) => void
  reset: () => void
}

export function useVideoHijack(): UseVideoHijackResult {
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Search state
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword")
  const [searchInput, setSearchInput] = useState("")
  const [searchedQuery, setSearchedQuery] = useState("")
  
  // Platform state
  const [platform, setPlatformState] = useState<Platform>("youtube")
  
  // Results state
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideoResult[]>([])
  const [tiktokResults, setTiktokResults] = useState<TikTokVideoResult[]>([])
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
  
  // Sorted YouTube results
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
  
  // Sorted TikTok results
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
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // TODO: Replace with actual API calls
    // import { youtubeService, tiktokService } from "../services"
    // const [ytResults, ttResults] = await Promise.all([
    //   youtubeService.searchVideos(query),
    //   tiktokService.searchVideos(query)
    // ])
    
    searchTimeoutRef.current = setTimeout(() => {
      const query = searchInput.trim()
      
      // Generate mock results
      const ytMock = generateMockYouTubeResults(query)
      const ttMock = generateMockTikTokResults(query)
      
      // Transform YouTube results
      const ytTransformed: YouTubeVideoResult[] = ytMock.map(r => ({
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
      
      // Transform TikTok results
      const ttTransformed: TikTokVideoResult[] = ttMock.map(r => ({
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
      setYoutubeResults(ytTransformed)
      setTiktokResults(ttTransformed)
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
  
  // Reset handler
  const reset = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    setSearchInput("")
    setSearchedQuery("")
    setYoutubeResults([])
    setTiktokResults([])
    setKeywordStats(null)
    setVideoSuggestion(null)
    setHasSearched(false)
    setCurrentPage(1)
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
    reset,
  }
}

// Re-export for backward compatibility
export { useVideoHijack as useVideoSearch }
