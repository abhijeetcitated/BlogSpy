"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MOCK_GAP_DATA, MOCK_FORUM_INTEL_DATA } from "./__mocks__"
import {
  GapAnalysisTable,
  ForumIntelTable,
  AnalysisForm,
  EmptyState,
  LoadingState,
} from "./components"
import {
  Header,
  GapStatsBar,
  ForumStatsBar,
  FilterBar,
  ForumSearchBar,
  useCompetitorGap,
} from "./competitor-gap-content/index"
import type { GapKeyword, ForumIntelPost, RelatedKeyword } from "./types"

export function CompetitorGapContent() {
  const router = useRouter()
  
  const {
    mainView,
    setMainView,
    yourDomain,
    setYourDomain,
    competitor1,
    setCompetitor1,
    competitor2,
    setCompetitor2,
    isLoading,
    hasAnalyzed,
    handleAnalyze,
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
    selectedGapRows,
    setSelectedGapRows,
    selectedForumRows,
    addedKeywords,
    setAddedKeywords,
    addedForumPosts,
    setAddedForumPosts,
    gapSortField,
    gapSortDirection,
    handleGapSort,
    forumSortField,
    forumSortDirection,
    handleForumSort,
    gapStats,
    filteredGapKeywords,
    filteredForumPosts,
    forumStats,
    handleGapSelectAll,
    handleGapSelectRow,
    handleForumSelectAll,
    handleForumSelectRow,
    formatNumber,
  } = useCompetitorGap({ gapData: MOCK_GAP_DATA, forumData: MOCK_FORUM_INTEL_DATA })

  const isGapAnalysis = mainView === "gap-analysis"

  // Write Article Handlers
  const handleWriteArticle = useCallback((keyword: GapKeyword) => {
    toast.success("Opening AI Writer", {
      description: `Creating article for "${keyword.keyword}"`,
    })
    const params = new URLSearchParams({
      source: "competitor-gap",
      keyword: keyword.keyword,
      volume: keyword.volume.toString(),
      difficulty: keyword.kd.toString(),
      intent: keyword.intent || "informational",
      cpc: keyword.cpc?.toString() || "0",
    })
    router.push(`/dashboard/creation/ai-writer?${params.toString()}`)
  }, [router])

  const handleWriteForumPost = useCallback((post: ForumIntelPost) => {
    toast.success("Opening AI Writer", {
      description: `Creating article for "${post.topic.slice(0, 40)}..."`,
    })
    const params = new URLSearchParams({
      source: "competitor-gap",
      keyword: post.topic,
      intent: "informational",
    })
    router.push(`/dashboard/creation/ai-writer?${params.toString()}`)
  }, [router])

  // Add to Calendar Handlers
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

  const handleExport = useCallback(() => {
    const data = isGapAnalysis ? filteredGapKeywords : filteredForumPosts
    const count = data.length
    
    if (isGapAnalysis) {
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
      description: `${count} ${isGapAnalysis ? "keywords" : "topics"} exported to CSV.`,
    })
  }, [isGapAnalysis, filteredGapKeywords, filteredForumPosts])

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-background">
        <Header mainView={mainView} onViewChange={setMainView} />

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

        {!isGapAnalysis && <ForumSearchBar />}

        {(hasAnalyzed || !isGapAnalysis) && (
          <>
            <div className="py-3 sm:py-4 border-b border-border overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
              {isGapAnalysis ? (
                <GapStatsBar
                  gapFilter={gapFilter}
                  onFilterChange={setGapFilter}
                  stats={gapStats}
                />
              ) : (
                <ForumStatsBar stats={forumStats} formatNumber={formatNumber} />
              )}
            </div>

            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              showHighVolume={showHighVolume}
              showLowKD={showLowKD}
              showTrending={showTrending}
              onHighVolumeChange={setShowHighVolume}
              onLowKDChange={setShowLowKD}
              onTrendingChange={setShowTrending}
              onExport={handleExport}
              isGapAnalysis={isGapAnalysis}
            />

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

        {isGapAnalysis && !hasAnalyzed && !isLoading && <EmptyState />}
        {isLoading && <LoadingState />}
      </div>
    </TooltipProvider>
  )
}
