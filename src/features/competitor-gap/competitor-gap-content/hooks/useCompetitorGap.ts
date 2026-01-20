"use client"

import { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
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
import { analyzeGapAction } from "../../actions/analyze-gap"
import { useKeywordStore } from "@/src/features/keyword-research/store"

export type MainView = "gap-analysis" | "forum-intel"

interface UseCompetitorGapProps {
  initialGapData: GapKeyword[]
  initialForumData: ForumIntelPost[]
  selectedCountryCode?: string
}

export function useCompetitorGap({
  initialGapData,
  initialForumData,
  selectedCountryCode,
}: UseCompetitorGapProps) {
  const [gapData, setGapData] = useState<GapKeyword[]>(initialGapData)
  const [forumData, setForumData] = useState<ForumIntelPost[]>(initialForumData)
  const credits = useKeywordStore((state) => state.credits)
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
  const mapGapItems = useCallback((items: any[]): GapKeyword[] => {
    return items.map((item: any, index: number) => {
      const comp1Rank = item.compRanks?.[0] ?? null
      const comp2Rank = item.compRanks?.[1] ?? null
      const source =
        comp1Rank !== null && comp2Rank !== null
          ? "both"
          : comp1Rank !== null
            ? "comp1"
            : "comp2"

      return {
        id: `${item.keyword}-${index}`,
        keyword: item.keyword,
        intent: "informational",
        gapType: item.gapType,
        hasZeroClickRisk: item.hasZeroClickRisk,
        yourRank: item.myRank ?? null,
        comp1Rank,
        comp2Rank,
        volume: item.volume ?? 0,
        kd: item.kd ?? 0,
        cpc: item.cpc ?? 0,
        trend: "stable",
        source,
      }
    })
  }, [])

  const applyGapReport = useCallback((items: any[]) => {
    const mapped = mapGapItems(items)
    setGapData(mapped)
    setHasAnalyzed(true)
    setSelectedGapRows(new Set())
    setAddedKeywords(new Set())
  }, [mapGapItems])

  const handleAnalyze = async (overrideCountryCode?: string) => {
    if (!yourDomain.trim() || !competitor1.trim()) return
    if (credits !== null && credits < 10) {
      toast.error("Insufficient credits", {
        description: "Gap analysis requires 10 credits.",
      })
      return
    }
    setIsLoading(true)
    try {
      const targets = [yourDomain, competitor1, competitor2].filter(Boolean) as string[]
      const result = await analyzeGapAction({
        targets,
        countryCode: overrideCountryCode ?? selectedCountryCode ?? "US",
      })

      if (result?.data?.success && result.data.data?.items) {
        const mapped = mapGapItems(result.data.data.items)
        setGapData(mapped)
        setHasAnalyzed(true)
        setSelectedGapRows(new Set())
        setAddedKeywords(new Set())
        toast.success("Gap analysis complete", {
          description: `${mapped.length} keywords found.`,
        })
      } else {
        const serverError = result?.serverError
        const dataError = result?.data?.error
        const errorMessage = dataError || serverError || "Failed to run gap analysis"
        toast.error(errorMessage)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to run gap analysis")
    } finally {
      setIsLoading(false)
    }
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
    setGapData,
    setForumData,
    applyGapReport,
    
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
