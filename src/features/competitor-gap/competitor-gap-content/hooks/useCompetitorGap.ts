"use client"

import { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
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
import { useKeywordStore } from "@/features/keyword-research/store"
import {
  runGapAnalysisAction,
  verifyGapKeywordsAction,
} from "@/app/dashboard/research/gap-analysis/actions"

export type MainView = "gap-analysis" | "forum-intel"

interface UseCompetitorGapProps {
  initialGapData: GapKeyword[]
  initialForumData: ForumIntelPost[]
  selectedCountryCode?: string
}

type ActionResultEnvelope = {
  data?: {
    success?: boolean
    error?: string
    code?: string
    retryAfterSeconds?: number
  }
  serverError?: string
}

function extractActionError(result: ActionResultEnvelope): string | null {
  if (typeof result.serverError === "string" && result.serverError.length > 0) {
    return result.serverError
  }

  if (result.data?.success === false) {
    return result.data.error ?? "Request failed"
  }

  return null
}

export function useCompetitorGap({
  initialGapData,
  initialForumData,
  selectedCountryCode,
}: UseCompetitorGapProps) {
  const [gapData, setGapData] = useState<GapKeyword[]>(initialGapData)
  const [forumData, setForumData] = useState<ForumIntelPost[]>(initialForumData)
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const credits = useKeywordStore((state) => state.credits)

  const {
    executeAsync: executeRunGap,
    status: runGapStatus,
  } = useAction(runGapAnalysisAction)
  const {
    executeAsync: executeVerifyKeywords,
    status: verifyKeywordsStatus,
  } = useAction(verifyGapKeywordsAction)

  // Main View
  const [mainView, setMainView] = useState<MainView>("gap-analysis")

  // Form State
  const [yourDomain, setYourDomain] = useState("")
  const [competitor1, setCompetitor1] = useState("")
  const [competitor2, setCompetitor2] = useState("")
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const isLoading = runGapStatus === "executing" || verifyKeywordsStatus === "executing"

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
    highOpp: forumData.filter((post) => post.opportunityLevel === "high").length,
    totalEngagement: forumData.reduce((sum, post) => sum + post.upvotes + post.comments, 0),
  }), [forumData])

  const applyGapReport = useCallback((items: GapKeyword[]) => {
    setGapData(items)
    setHasAnalyzed(true)
    setSelectedGapRows(new Set())
    setAddedKeywords(new Set())
  }, [])

  const handleAnalyze = async (overrideCountryCode?: string) => {
    if (!yourDomain.trim() || !competitor1.trim()) {
      return
    }

    if (credits !== null && credits < 10) {
      toast.error("Insufficient credits", {
        description: "Gap analysis requires 10 credits.",
      })
      return
    }

    void selectedCountryCode
    void overrideCountryCode

    const result = await executeRunGap({
      yourDomain,
      competitor1,
      competitor2,
      // Keep full-gap as default for existing table parity (missing/weak/strong/shared).
      mode: "full-gap",
      forceRefresh: false,
    })

    const actionError = extractActionError(result)
    if (actionError) {
      toast.error("Analysis failed", { description: actionError })
      return
    }

    const payload = result.data
    if (!payload?.success || !payload.data) {
      if (payload?.code === "GAP_QUEUED") {
        toast.info("Analysis queued", {
          description: payload.error ?? "High traffic detected. Please retry shortly.",
        })
        return
      }

      if (payload?.code === "GAP_IN_PROGRESS") {
        toast.info("Analysis in progress", {
          description: payload.error ?? "Same request is already being processed.",
        })
        return
      }

      toast.error("Analysis failed", {
        description: payload?.error ?? "Could not run gap analysis.",
      })
      return
    }

    setGapData(payload.data.keywords)
    setActiveRunId(payload.data.runId)
    setHasAnalyzed(true)
    setSelectedGapRows(new Set())
    setAddedKeywords(new Set())

    if (payload.data.source === "cache") {
      toast.success("Loaded from cache", {
        description: `${payload.data.summary.total} keywords`,
      })
    } else {
      toast.success("Analysis complete", {
        description: `${payload.data.summary.total} keywords found`,
      })
    }
  }

  const handleVerifyTopKeywords = useCallback(async (topN: number = 5) => {
    if (!activeRunId) {
      toast.error("Run not found", { description: "Please analyze first." })
      return
    }

    const result = await executeVerifyKeywords({
      runId: activeRunId,
      topN,
    })

    const actionError = extractActionError(result)
    if (actionError) {
      toast.error("Verification failed", { description: actionError })
      return
    }

    if (!result.data?.success || !result.data.data) {
      toast.error("Verification failed", {
        description: result.data?.error ?? "Could not verify keyword ranks.",
      })
      return
    }

    setGapData(result.data.data.updatedKeywords)
    toast.success("Verification complete", {
      description: `${Math.min(topN, result.data.data.updatedKeywords.length)} keywords refreshed.`,
    })
  }, [activeRunId, executeVerifyKeywords])

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
      setSelectedGapRows(new Set(filteredGapKeywords.map((keyword) => keyword.id)))
    } else {
      setSelectedGapRows(new Set())
    }
  }, [filteredGapKeywords])

  const handleGapSelectRow = (id: string, checked: boolean) => {
    setSelectedGapRows((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleForumSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedForumRows(new Set(filteredForumPosts.map((post) => post.id)))
    } else {
      setSelectedForumRows(new Set())
    }
  }, [filteredForumPosts])

  const handleForumSelectRow = (id: string, checked: boolean) => {
    setSelectedForumRows((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
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
    activeRunId,
    handleVerifyTopKeywords,

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
