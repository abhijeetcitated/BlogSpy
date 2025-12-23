"use client"

import { useState, useMemo, useCallback } from "react"
import type { GapKeyword, ForumIntelPost, SortField, SortDirection } from "../../types"
import type { GapFilter } from "../utils/gap-utils"
import {
  calculateGapStats,
  filterGapKeywords,
  filterForumPosts,
  sortGapKeywords,
  sortForumPosts,
  formatNumber,
} from "../utils/gap-utils"

export type MainView = "gap-analysis" | "forum-intel"

interface UseCompetitorGapProps {
  gapData: GapKeyword[]
  forumData: ForumIntelPost[]
}

export function useCompetitorGap({ gapData, forumData }: UseCompetitorGapProps) {
  // Main View
  const [mainView, setMainView] = useState<MainView>("gap-analysis")
  
  // Form State
  const [yourDomain, setYourDomain] = useState("")
  const [competitor1, setCompetitor1] = useState("")
  const [competitor2, setCompetitor2] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  // Filters
  const [gapFilter, setGapFilter] = useState<GapFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showHighVolume, setShowHighVolume] = useState(false)
  const [showLowKD, setShowLowKD] = useState(false)
  const [showTrending, setShowTrending] = useState(false)

  // Selection
  const [selectedGapRows, setSelectedGapRows] = useState<Set<string>>(new Set())
  const [selectedForumRows, setSelectedForumRows] = useState<Set<string>>(new Set())
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set())
  const [addedForumPosts, setAddedForumPosts] = useState<Set<string>>(new Set())

  // Sorting
  const [gapSortField, setGapSortField] = useState<SortField>(null)
  const [gapSortDirection, setGapSortDirection] = useState<SortDirection>("desc")
  const [forumSortField, setForumSortField] = useState<SortField>("opportunity")
  const [forumSortDirection, setForumSortDirection] = useState<SortDirection>("desc")

  // Computed Values
  const gapStats = useMemo(() => calculateGapStats(gapData), [gapData])

  const filteredGapKeywords = useMemo(() => {
    const filtered = filterGapKeywords(gapData, gapFilter, searchQuery)
    return sortGapKeywords(filtered, gapSortField, gapSortDirection)
  }, [gapData, gapFilter, searchQuery, gapSortField, gapSortDirection])

  const filteredForumPosts = useMemo(() => {
    const filtered = filterForumPosts(forumData, searchQuery)
    return sortForumPosts(filtered, forumSortField, forumSortDirection)
  }, [forumData, searchQuery, forumSortField, forumSortDirection])

  const forumStats = useMemo(() => ({
    total: forumData.length,
    highOpp: forumData.filter(p => p.opportunityLevel === "high").length,
    totalEngagement: forumData.reduce((sum, p) => sum + p.upvotes + p.comments, 0),
  }), [forumData])

  // Handlers
  const handleAnalyze = async () => {
    if (!yourDomain.trim() || !competitor1.trim()) return
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setHasAnalyzed(true)
  }

  const handleGapSort = (field: SortField) => {
    if (gapSortField === field) {
      setGapSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setGapSortField(field)
      setGapSortDirection("desc")
    }
  }

  const handleForumSort = (field: SortField) => {
    if (forumSortField === field) {
      setForumSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setForumSortField(field)
      setForumSortDirection("desc")
    }
  }

  const handleGapSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedGapRows(new Set(filteredGapKeywords.map((kw) => kw.id)))
    } else {
      setSelectedGapRows(new Set())
    }
  }, [filteredGapKeywords])

  const handleGapSelectRow = (id: string, checked: boolean) => {
    setSelectedGapRows((prev) => {
      const newSet = new Set(prev)
      if (checked) newSet.add(id)
      else newSet.delete(id)
      return newSet
    })
  }

  const handleForumSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedForumRows(new Set(filteredForumPosts.map((p) => p.id)))
    } else {
      setSelectedForumRows(new Set())
    }
  }, [filteredForumPosts])

  const handleForumSelectRow = (id: string, checked: boolean) => {
    setSelectedForumRows((prev) => {
      const newSet = new Set(prev)
      if (checked) newSet.add(id)
      else newSet.delete(id)
      return newSet
    })
  }

  return {
    // View State
    mainView,
    setMainView,
    
    // Form State
    yourDomain,
    setYourDomain,
    competitor1,
    setCompetitor1,
    competitor2,
    setCompetitor2,
    isLoading,
    hasAnalyzed,
    handleAnalyze,
    
    // Filters
    gapFilter,
    setGapFilter,
    searchQuery,
    setSearchQuery,
    showHighVolume,
    setShowHighVolume,
    showLowKD,
    setShowLowKD,
    showTrending,
    setShowTrending,
    
    // Selection
    selectedGapRows,
    setSelectedGapRows,
    selectedForumRows,
    setSelectedForumRows,
    addedKeywords,
    setAddedKeywords,
    addedForumPosts,
    setAddedForumPosts,
    
    // Sorting
    gapSortField,
    gapSortDirection,
    handleGapSort,
    forumSortField,
    forumSortDirection,
    handleForumSort,
    
    // Computed
    gapStats,
    filteredGapKeywords,
    filteredForumPosts,
    forumStats,
    
    // Handlers
    handleGapSelectAll,
    handleGapSelectRow,
    handleForumSelectAll,
    handleForumSelectRow,
    
    // Utils
    formatNumber,
  }
}
