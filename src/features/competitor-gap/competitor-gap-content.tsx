"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  Swords, 
  Search, 
  Download,
  Filter,
  MessageSquare,
  TrendingUp,
  LayoutGrid,
  AlertTriangle,
  Target,
  Trophy,
  Zap,
  Users,
  Flame,
  Check,
  SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Types
import type { 
  GapType, 
  GapKeyword, 
  ForumIntelPost,
  SortField, 
  SortDirection,
} from "./types"

// Mock Data
import { MOCK_GAP_DATA, MOCK_FORUM_INTEL_DATA } from "./__mocks__"

// Components
import {
  GapAnalysisTable,
  ForumIntelTable,
  AnalysisForm,
  EmptyState,
  LoadingState,
} from "./components"

// ============================================
// Types
// ============================================

type MainView = "gap-analysis" | "forum-intel"
type GapFilter = GapType | "all"

// ============================================
// Helper Functions
// ============================================

function calculateGapStats(keywords: GapKeyword[]) {
  return {
    all: keywords.length,
    missing: keywords.filter(k => k.gapType === "missing").length,
    weak: keywords.filter(k => k.gapType === "weak").length,
    strong: keywords.filter(k => k.gapType === "strong").length,
    shared: keywords.filter(k => k.gapType === "shared").length,
    totalVolume: keywords.reduce((sum, k) => sum + k.volume, 0),
    avgKD: Math.round(keywords.reduce((sum, k) => sum + k.kd, 0) / keywords.length) || 0,
  }
}

function filterGapKeywords(
  keywords: GapKeyword[],
  gapType: GapFilter,
  searchQuery: string
): GapKeyword[] {
  return keywords.filter(kw => {
    if (gapType !== "all" && kw.gapType !== gapType) return false
    if (searchQuery && !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })
}

function filterForumPosts(
  posts: ForumIntelPost[],
  searchQuery: string
): ForumIntelPost[] {
  if (!searchQuery) return posts
  return posts.filter(post => 
    post.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.subSource.toLowerCase().includes(searchQuery.toLowerCase())
  )
}

function sortGapKeywords(
  keywords: GapKeyword[],
  field: SortField,
  direction: SortDirection
): GapKeyword[] {
  if (!field) return keywords
  
  return [...keywords].sort((a, b) => {
    let comparison = 0
    switch (field) {
      case "keyword":
        comparison = a.keyword.localeCompare(b.keyword)
        break
      case "volume":
        comparison = a.volume - b.volume
        break
      case "kd":
        comparison = a.kd - b.kd
        break
      case "yourRank":
        comparison = (a.yourRank ?? 999) - (b.yourRank ?? 999)
        break
      case "trend":
        const trendOrder = { rising: 5, growing: 4, stable: 3, declining: 2, falling: 1 }
        comparison = trendOrder[a.trend] - trendOrder[b.trend]
        break
    }
    return direction === "asc" ? comparison : -comparison
  })
}

function sortForumPosts(
  posts: ForumIntelPost[],
  field: SortField,
  direction: SortDirection
): ForumIntelPost[] {
  if (!field) return posts
  
  return [...posts].sort((a, b) => {
    let comparison = 0
    switch (field) {
      case "engagement":
        comparison = (a.upvotes + a.comments) - (b.upvotes + b.comments)
        break
      case "opportunity":
        comparison = a.opportunityScore - b.opportunityScore
        break
    }
    return direction === "asc" ? comparison : -comparison
  })
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CompetitorGapContent() {
  const router = useRouter()
  
  // Main View Switch
  const [mainView, setMainView] = useState<MainView>("gap-analysis")
  
  // Form State
  const [yourDomain, setYourDomain] = useState("")
  const [competitor1, setCompetitor1] = useState("")
  const [competitor2, setCompetitor2] = useState("")

  // Analysis State
  const [isLoading, setIsLoading] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  // Gap Filter (All, Missing, Weak, Strong)
  const [gapFilter, setGapFilter] = useState<GapFilter>("all")

  // Search
  const [searchQuery, setSearchQuery] = useState("")

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
  const gapStats = useMemo(() => calculateGapStats(MOCK_GAP_DATA), [])

  const filteredGapKeywords = useMemo(() => {
    const filtered = filterGapKeywords(MOCK_GAP_DATA, gapFilter, searchQuery)
    return sortGapKeywords(filtered, gapSortField, gapSortDirection)
  }, [gapFilter, searchQuery, gapSortField, gapSortDirection])

  const filteredForumPosts = useMemo(() => {
    const filtered = filterForumPosts(MOCK_FORUM_INTEL_DATA, searchQuery)
    return sortForumPosts(filtered, forumSortField, forumSortDirection)
  }, [searchQuery, forumSortField, forumSortDirection])

  const forumStats = useMemo(() => ({
    total: MOCK_FORUM_INTEL_DATA.length,
    highOpp: MOCK_FORUM_INTEL_DATA.filter(p => p.opportunityLevel === "high").length,
    totalEngagement: MOCK_FORUM_INTEL_DATA.reduce((sum, p) => sum + p.upvotes + p.comments, 0),
  }), [])

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

  // ============================================
  // WRITE ARTICLE HANDLERS
  // ============================================
  
  const handleWriteArticle = useCallback((keyword: GapKeyword) => {
    toast.success("Opening AI Writer", {
      description: `Creating article for "${keyword.keyword}"`,
    })
    router.push(`/dashboard/creation/ai-writer?topic=${encodeURIComponent(keyword.keyword)}`)
  }, [router])

  const handleWriteForumPost = useCallback((post: ForumIntelPost) => {
    toast.success("Opening AI Writer", {
      description: `Creating article for "${post.topic.slice(0, 40)}..."`,
    })
    router.push(`/dashboard/creation/ai-writer?topic=${encodeURIComponent(post.topic)}`)
  }, [router])

  // ============================================
  // ADD TO CALENDAR HANDLERS
  // ============================================

  const handleAddToRoadmap = (keyword: GapKeyword) => {
    setAddedKeywords((prev) => new Set([...prev, keyword.id]))
    toast.success("Added to Content Calendar", {
      description: `"${keyword.keyword}" has been added to your calendar.`,
      action: {
        label: "View Calendar",
        onClick: () => router.push("/dashboard/research/content-calendar"),
      },
    })
  }

  const handleAddForumToCalendar = useCallback((post: ForumIntelPost) => {
    setAddedForumPosts((prev) => new Set([...prev, post.id]))
    toast.success("Added to Content Calendar", {
      description: `"${post.topic.slice(0, 40)}..." has been added to your calendar.`,
      action: {
        label: "View Calendar",
        onClick: () => router.push("/dashboard/research/content-calendar"),
      },
    })
  }, [router])

  const handleBulkAddToRoadmap = () => {
    const count = selectedGapRows.size
    setAddedKeywords((prev) => new Set([...prev, ...selectedGapRows]))
    setSelectedGapRows(new Set())
    toast.success(`${count} Keywords Added`, {
      description: `${count} keywords have been added to your content calendar.`,
      action: {
        label: "View Calendar",
        onClick: () => router.push("/dashboard/research/content-calendar"),
      },
    })
  }

  // Filter state
  const [showHighVolume, setShowHighVolume] = useState(false)
  const [showLowKD, setShowLowKD] = useState(false)
  const [showTrending, setShowTrending] = useState(false)

  const handleExport = useCallback(() => {
    const isGap = mainView === "gap-analysis"
    const data = isGap ? filteredGapKeywords : filteredForumPosts
    const count = data.length
    
    // Create CSV content
    if (isGap) {
      const csv = [
        ["Keyword", "Gap Type", "Your Rank", "Comp1 Rank", "Volume", "KD", "Intent", "Trend"].join(","),
        ...filteredGapKeywords.map(kw => [
          `"${kw.keyword}"`,
          kw.gapType,
          kw.yourRank ?? "—",
          kw.comp1Rank ?? "—",
          kw.volume,
          kw.kd,
          kw.intent,
          kw.trend
        ].join(","))
      ].join("\n")
      
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `gap-analysis-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const csv = [
        ["Topic", "Source", "Upvotes", "Comments", "Competition", "Opportunity Score"].join(","),
        ...filteredForumPosts.map(post => [
          `"${post.topic}"`,
          post.source,
          post.upvotes,
          post.comments,
          post.competitionLevel,
          post.opportunityScore
        ].join(","))
      ].join("\n")
      
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `forum-intel-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    toast.success("Export Complete", {
      description: `${count} ${mainView === "gap-analysis" ? "keywords" : "topics"} exported to CSV.`,
    })
  }, [mainView, filteredGapKeywords, filteredForumPosts])

  const isGapAnalysis = mainView === "gap-analysis"

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-background">
        
        {/* ==================== HEADER ==================== */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20">
                <Swords className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              
              {/* Title */}
              <div>
                <h1 className="text-xl font-semibold text-foreground">Gap Analysis</h1>
                <p className="text-sm text-muted-foreground">
                  Discover competitor keywords & community opportunities
                </p>
              </div>
            </div>

            {/* ===== MAIN VIEW SWITCH ===== */}
            <div className="flex items-center p-1 rounded-xl border border-border bg-card">
              <button
                onClick={() => setMainView("gap-analysis")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border",
                  isGapAnalysis 
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40" 
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <Swords className={cn("h-4 w-4", isGapAnalysis && "text-amber-600 dark:text-amber-400")} />
                <span>Competitor Gap</span>
              </button>
              <button
                onClick={() => setMainView("forum-intel")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border",
                  !isGapAnalysis 
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40" 
                    : "text-muted-foreground hover:text-foreground border-transparent"
                )}
              >
                <MessageSquare className={cn("h-4 w-4", !isGapAnalysis && "text-emerald-600 dark:text-emerald-400")} />
                <span>Forum Intel</span>
                <Badge 
                  variant="outline" 
                  className="ml-1 text-[10px] px-1.5 py-0 font-bold border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                >
                  PRO
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== ANALYSIS FORM (Gap Analysis only) ==================== */}
        {isGapAnalysis && (
          <AnalysisForm
            yourDomain={yourDomain}
            competitor1={competitor1}
            competitor2={competitor2}
            isLoading={isLoading}
            onYourDomainChange={setYourDomain}
            onCompetitor1Change={setCompetitor1}
            onCompetitor2Change={setCompetitor2}
            onAnalyze={handleAnalyze}
          />
        )}

        {/* ==================== FORUM INTEL SEARCH (Forum Intel only) ==================== */}
        {!isGapAnalysis && (
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter your niche or topic..."
                  className="pl-10 h-10 bg-background border-border"
                />
              </div>
              <Button className="h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Find Opportunities
              </Button>
            </div>
          </div>
        )}

        {/* ==================== CONTENT AREA ==================== */}
        {(hasAnalyzed || !isGapAnalysis) && (
          <>
            {/* ===== STATS PILLS (Like Trend Spotter) ===== */}
            <div className="px-6 py-4 border-b border-border">
              {isGapAnalysis ? (
                <div className="inline-flex items-center rounded-xl border border-border bg-card p-1.5 shadow-sm">
                  {/* All */}
                  <button
                    onClick={() => setGapFilter("all")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      gapFilter === "all"
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>All</span>
                    <span className={cn("text-sm font-bold tabular-nums px-2 py-0.5 rounded-md", 
                      gapFilter === "all" ? "bg-white/20 text-white" : "bg-muted text-foreground"
                    )}>
                      {gapStats.all}
                    </span>
                  </button>
                  {/* Missing */}
                  <button
                    onClick={() => setGapFilter("missing")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      gapFilter === "missing"
                        ? "bg-red-500 text-white shadow-md shadow-red-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Missing</span>
                    <span className={cn("text-sm font-bold tabular-nums px-2 py-0.5 rounded-md", 
                      gapFilter === "missing" ? "bg-white/20 text-white" : "bg-muted text-foreground"
                    )}>
                      {gapStats.missing}
                    </span>
                  </button>
                  {/* Weak */}
                  <button
                    onClick={() => setGapFilter("weak")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      gapFilter === "weak"
                        ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Target className="h-4 w-4" />
                    <span>Weak</span>
                    <span className={cn("text-sm font-bold tabular-nums px-2 py-0.5 rounded-md", 
                      gapFilter === "weak" ? "bg-white/20 text-white" : "bg-muted text-foreground"
                    )}>
                      {gapStats.weak}
                    </span>
                  </button>
                  {/* Strong */}
                  <button
                    onClick={() => setGapFilter("strong")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      gapFilter === "strong"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Strong</span>
                    <span className={cn("text-sm font-bold tabular-nums px-2 py-0.5 rounded-md", 
                      gapFilter === "strong" ? "bg-white/20 text-white" : "bg-muted text-foreground"
                    )}>
                      {gapStats.strong}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center rounded-xl border border-border bg-card p-1.5 shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted/50">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-md bg-muted text-foreground">
                      {forumStats.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
                    <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">High Opportunity</span>
                    <span className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {forumStats.highOpp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
                    <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-orange-600 dark:text-orange-400">Engagement</span>
                    <span className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400">
                      {formatNumber(forumStats.totalEngagement)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ===== FILTER BAR ===== */}
            <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={isGapAnalysis ? "Search keywords..." : "Search discussions..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm bg-background border-border"
                  />
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 text-sm font-medium border-border hover:bg-muted">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                      {(showHighVolume || showLowKD || showTrending) && (
                        <span className="ml-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                          {[showHighVolume, showLowKD, showTrending].filter(Boolean).length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={showHighVolume}
                      onCheckedChange={setShowHighVolume}
                    >
                      High Volume (&gt;1K)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={showLowKD}
                      onCheckedChange={setShowLowKD}
                    >
                      Low Difficulty (&lt;30)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={showTrending}
                      onCheckedChange={setShowTrending}
                    >
                      Trending Keywords
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        setShowHighVolume(false)
                        setShowLowKD(false)
                        setShowTrending(false)
                        toast.info("Filters cleared")
                      }}
                      className="text-muted-foreground"
                    >
                      Clear All Filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Export Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 text-sm font-medium border-border hover:bg-muted" 
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* ===== TABLES ===== */}
            {isGapAnalysis ? (
              <GapAnalysisTable
                keywords={filteredGapKeywords}
                selectedRows={selectedGapRows}
                addedKeywords={addedKeywords}
                sortField={gapSortField}
                sortDirection={gapSortDirection}
                onSort={handleGapSort}
                onSelectAll={handleGapSelectAll}
                onSelectRow={handleGapSelectRow}
                onAddToRoadmap={handleAddToRoadmap}
                onBulkAddToRoadmap={handleBulkAddToRoadmap}
                onClearSelection={() => setSelectedGapRows(new Set())}
                onWriteArticle={handleWriteArticle}
              />
            ) : (
              <ForumIntelTable
                posts={filteredForumPosts}
                selectedRows={selectedForumRows}
                sortField={forumSortField}
                sortDirection={forumSortDirection}
                onSort={handleForumSort}
                onSelectAll={handleForumSelectAll}
                onSelectRow={handleForumSelectRow}
                onWriteArticle={handleWriteForumPost}
                onAddToCalendar={handleAddForumToCalendar}
              />
            )}
          </>
        )}

        {/* Empty State (Gap Analysis - before analysis) */}
        {isGapAnalysis && !hasAnalyzed && !isLoading && <EmptyState />}

        {/* Loading State */}
        {isLoading && <LoadingState />}
      </div>
    </TooltipProvider>
  )
}
