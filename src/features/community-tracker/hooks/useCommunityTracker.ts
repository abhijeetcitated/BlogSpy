/**
 * Custom hook for Community Tracker state management
 * Extracted from community-tracker-content.tsx for better organization
 */

import { useState, useMemo, useCallback, useRef } from "react"
import { toast } from "sonner"
import { MOCK_COMMUNITY_KEYWORDS, MOCK_COMMUNITY_SUMMARY } from "../__mocks__"
import { DEFAULT_COMMUNITY_PLATFORM } from "../constants"
import type { CommunityPlatform, CommunityKeyword } from "../types"

// Rate limiting constants
const REFRESH_COOLDOWN_MS = 30000 // 30 seconds

export function useCommunityTracker() {
  // Data state
  const [keywords, setKeywords] = useState<CommunityKeyword[]>(MOCK_COMMUNITY_KEYWORDS)
  const [summary, setSummary] = useState(MOCK_COMMUNITY_SUMMARY)
  
  // Platform state
  const [activePlatform, setActivePlatform] = useState<CommunityPlatform>(DEFAULT_COMMUNITY_PLATFORM)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  
  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<CommunityPlatform[]>(["reddit", "quora"])
  const [isAddingKeyword, setIsAddingKeyword] = useState(false)

  // Rate limiting ref
  const lastRefreshRef = useRef<number>(0)
  const refreshCountRef = useRef<number>(0)

  // Platform stats
  const platformStats = useMemo(() => ({
    reddit: { count: keywords.filter(k => k.platforms.reddit?.position).length },
    quora: { count: keywords.filter(k => k.platforms.quora?.position).length },
  }), [keywords])

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    let filtered = keywords
    
    // Filter by platform availability
    if (activePlatform === "reddit") {
      filtered = filtered.filter(k => k.platforms.reddit?.position)
    } else {
      filtered = filtered.filter(k => k.platforms.quora?.position)
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [keywords, activePlatform, searchQuery])

  // Handle refresh with rate limiting
  const handleRefresh = useCallback(async () => {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshRef.current
    
    // Rate limiting: 30 second cooldown
    if (timeSinceLastRefresh < REFRESH_COOLDOWN_MS && lastRefreshRef.current > 0) {
      const remainingSeconds = Math.ceil((REFRESH_COOLDOWN_MS - timeSinceLastRefresh) / 1000)
      toast.error(`Please wait ${remainingSeconds}s before refreshing again`, {
        description: "Rate limit to prevent excessive API calls"
      })
      return
    }
    
    lastRefreshRef.current = now
    refreshCountRef.current += 1
    setIsRefreshing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update summary with deterministic increments based on refresh count
    setSummary(prev => ({
      ...prev,
      totalMentions: prev.totalMentions + (refreshCountRef.current % 10) + 5,
      opportunityScore: Math.min(100, prev.opportunityScore + (refreshCountRef.current % 3) + 1),
    }))
    
    setIsRefreshing(false)
    toast.success("Data refreshed successfully", {
      description: "All community rankings have been updated"
    })
  }, [])

  // Validate and sanitize keyword input
  const validateKeyword = useCallback((input: string): { valid: boolean; sanitized: string; error?: string } => {
    // Trim and limit length
    const trimmed = input.trim().slice(0, 100)
    
    if (!trimmed) {
      return { valid: false, sanitized: "", error: "Please enter a keyword" }
    }
    
    if (trimmed.length < 2) {
      return { valid: false, sanitized: trimmed, error: "Keyword must be at least 2 characters" }
    }
    
    // Remove HTML tags (XSS prevention)
    const noHtml = trimmed.replace(/<[^>]*>/g, "")
    
    // Allow only alphanumeric, spaces, hyphens, and common punctuation
    const sanitized = noHtml.replace(/[^\w\s\-.,!?']/g, "")
    
    if (sanitized.length < 2) {
      return { valid: false, sanitized, error: "Keyword contains too many invalid characters" }
    }
    
    // Check for duplicate keywords
    const isDuplicate = keywords.some(
      k => k.keyword.toLowerCase() === sanitized.toLowerCase()
    )
    if (isDuplicate) {
      return { valid: false, sanitized, error: "This keyword is already being tracked" }
    }
    
    return { valid: true, sanitized }
  }, [keywords])

  // Handle add keyword with validation
  const handleAddKeyword = useCallback(async () => {
    const validation = validateKeyword(newKeyword)
    
    if (!validation.valid) {
      toast.error(validation.error || "Invalid keyword")
      return
    }
    
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform")
      return
    }
    
    setIsAddingKeyword(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Deterministic values based on keyword length for consistency
    const keywordHash = validation.sanitized.length + validation.sanitized.charCodeAt(0)
    const intents: CommunityKeyword["communityIntent"][] = ["discussion", "question", "recommendation", "comparison"]
    
    // Create new keyword with sanitized input
    const newKw: CommunityKeyword = {
      id: `community-kw-${Date.now()}`,
      keyword: validation.sanitized,
      searchVolume: 5000 + (keywordHash * 100),
      communityIntent: intents[keywordHash % 4],
      platforms: {
        reddit: selectedPlatforms.includes("reddit") ? {
          position: (keywordHash % 15) + 1,
          avgUpvotes: 150 + (keywordHash % 200),
          totalMentions: 20 + (keywordHash % 50),
          subreddits: ["r/SEO", "r/marketing", "r/blogging"].slice(0, (keywordHash % 3) + 1),
          hasOurContent: false,
          topPosts: [],
        } : null,
        quora: selectedPlatforms.includes("quora") ? {
          position: (keywordHash % 12) + 1,
          avgViews: 15000 + (keywordHash * 500),
          totalQuestions: 8 + (keywordHash % 20),
          hasOurContent: false,
          topAnswers: [],
        } : null,
      },
      lastUpdated: new Date().toISOString(),
    }
    
    setKeywords(prev => [newKw, ...prev])
    setIsAddingKeyword(false)
    setIsAddModalOpen(false)
    setNewKeyword("")
    setSelectedPlatforms(["reddit", "quora"])
    
    toast.success(`Keyword "${newKeyword}" added successfully`, {
      description: `Tracking on ${selectedPlatforms.join(" & ")}`
    })
  }, [newKeyword, selectedPlatforms])

  // Handle platform toggle in modal
  const handlePlatformToggle = useCallback((platform: CommunityPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }, [])

  // Handle delete keyword
  const handleDeleteKeyword = useCallback((keywordId: string) => {
    const keywordToDelete = keywords.find(k => k.id === keywordId)
    
    if (!keywordToDelete) {
      toast.error("Keyword not found")
      return
    }
    
    setKeywords(prev => prev.filter(k => k.id !== keywordId))
    
    // Update summary stats
    setSummary(prev => ({
      ...prev,
      totalKeywords: prev.totalKeywords - 1,
      redditRanking: keywordToDelete.platforms.reddit?.position 
        ? prev.redditRanking - 1 
        : prev.redditRanking,
      quoraRanking: keywordToDelete.platforms.quora?.position 
        ? prev.quoraRanking - 1 
        : prev.quoraRanking,
      totalMentions: prev.totalMentions - (keywordToDelete.platforms.reddit?.totalMentions || 0),
    }))
    
    toast.success(`Keyword "${keywordToDelete.keyword}" deleted`, {
      description: "Removed from tracking"
    })
  }, [keywords])

  return {
    // State
    summary,
    activePlatform,
    searchQuery,
    isRefreshing,
    isAddModalOpen,
    newKeyword,
    selectedPlatforms,
    isAddingKeyword,
    platformStats,
    filteredKeywords,
    
    // Setters
    setActivePlatform,
    setSearchQuery,
    setIsAddModalOpen,
    setNewKeyword,
    
    // Handlers
    handleRefresh,
    handleAddKeyword,
    handlePlatformToggle,
    handleDeleteKeyword,
  }
}
