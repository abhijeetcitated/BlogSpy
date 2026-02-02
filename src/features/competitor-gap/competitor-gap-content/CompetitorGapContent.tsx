"use client"

import { useCallback, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PAGE_PADDING, STACK_SPACING } from "@/styles/responsive"
import { AnalysisForm } from "../components/analysis-form"
import { GapAnalysisTable } from "../components/gap-analysis-table"
import { ForumIntelTable } from "../components/forum-intel-table"
import { MOCK_GAP_DATA, MOCK_FORUM_INTEL_DATA } from "../__mocks__/gap-data"
import { FilterBar } from "./components/FilterBar"
import { ForumSearchBar } from "./components/ForumSearchBar"
import { Header } from "./components/Header"
import { GapStatsBar, ForumStatsBar } from "./components/StatsBar"
import { useCompetitorGap } from "./hooks/useCompetitorGap"
import { EmptyState, LoadingState } from "../components/state-displays"
import type { GapKeyword, ForumIntelPost } from "../types"

const escapeCsvValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return ""
  return `"${String(value).replace(/"/g, '""')}"`
}

export const CompetitorGapContent = () => {
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
    selectedForumRows,
    addedKeywords,
    setAddedKeywords,
    setAddedForumPosts,
    gapSortField,
    gapSortDirection,
    handleGapSort,
    forumSortField,
    forumSortDirection,
    handleForumSort,
    gapStats,
    filteredGapKeywords: baseGapKeywords,
    filteredForumPosts,
    forumStats,
    handleGapSelectAll,
    handleGapSelectRow,
    handleForumSelectAll,
    handleForumSelectRow,
    formatNumber,
  } = useCompetitorGap({
    initialGapData: MOCK_GAP_DATA,
    initialForumData: MOCK_FORUM_INTEL_DATA,
  })

  const filteredGapKeywords = useMemo(() => {
    return baseGapKeywords.filter((keyword) => {
      if (showHighVolume && keyword.volume <= 1000) return false
      if (showLowKD && keyword.kd >= 30) return false
      if (showTrending && !["rising", "growing"].includes(keyword.trend)) return false
      return true
    })
  }, [baseGapKeywords, showHighVolume, showLowKD, showTrending])

  const handleAddToRoadmap = useCallback((keyword: GapKeyword) => {
    setAddedKeywords((prev) => new Set(prev).add(keyword.id))
    toast.success("Added to roadmap", { description: keyword.keyword })
  }, [setAddedKeywords])

  const handleAddForumToRoadmap = useCallback((post: ForumIntelPost) => {
    setAddedForumPosts((prev) => new Set(prev).add(post.id))
    toast.success("Added to roadmap", { description: post.topic })
  }, [setAddedForumPosts])

  const handleCopySelected = useCallback(() => {
    const selected = filteredGapKeywords.filter((keyword) => selectedGapRows.has(keyword.id))
    if (!selected.length) return
    if (!navigator?.clipboard) {
      toast.error("Clipboard not available")
      return
    }
    navigator.clipboard
      .writeText(selected.map((item) => item.keyword).join("\n"))
      .then(() => toast.success("Copied", { description: `${selected.length} keywords` }))
      .catch(() => toast.error("Copy failed"))
  }, [filteredGapKeywords, selectedGapRows])

  const handleBulkAddToRoadmap = useCallback(() => {
    if (!selectedGapRows.size) return
    setAddedKeywords((prev) => {
      const next = new Set(prev)
      filteredGapKeywords.forEach((keyword) => {
        if (selectedGapRows.has(keyword.id)) {
          next.add(keyword.id)
        }
      })
      return next
    })
    toast.success("Added to roadmap", { description: `${selectedGapRows.size} keywords` })
  }, [filteredGapKeywords, selectedGapRows, setAddedKeywords])

  const handleExport = useCallback(() => {
    const isGapAnalysis = mainView === "gap-analysis"
    if (isGapAnalysis) {
      if (!filteredGapKeywords.length) {
        toast.error("No keywords to export")
        return
      }
      const header = [
        "Keyword",
        "Gap Type",
        "Your Rank",
        "Competitor 1",
        "Competitor 2",
        "Volume",
        "KD",
      ]
      const rows = filteredGapKeywords.map((keyword) => [
        escapeCsvValue(keyword.keyword),
        escapeCsvValue(keyword.gapType),
        escapeCsvValue(keyword.yourRank ?? "-"),
        escapeCsvValue(keyword.comp1Rank ?? "-"),
        escapeCsvValue(keyword.comp2Rank ?? "-"),
        escapeCsvValue(keyword.volume),
        escapeCsvValue(keyword.kd),
      ])
      const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `competitor-gap-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Exported", { description: `${filteredGapKeywords.length} rows` })
      return
    }

    if (!filteredForumPosts.length) {
      toast.error("No discussions to export")
      return
    }
    const header = ["Topic", "Source", "SERP Rank", "Monthly Volume", "Opportunity"]
    const rows = filteredForumPosts.map((post) => [
      escapeCsvValue(post.topic),
      escapeCsvValue(post.source),
      escapeCsvValue(post.serpRank),
      escapeCsvValue(post.monthlyVolume),
      escapeCsvValue(post.opportunityLevel),
    ])
    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `forum-intel-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Exported", { description: `${filteredForumPosts.length} rows` })
  }, [filteredGapKeywords, filteredForumPosts, mainView])

  const isGapAnalysis = mainView === "gap-analysis"

  return (
    <section className={cn(PAGE_PADDING.default, STACK_SPACING.default)}>
      {/* Header without stats - stats will show after analysis */}
      <Header mainView={mainView} onViewChange={setMainView} />

      {isGapAnalysis ? (
        <>
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

          {isLoading ? (
            <LoadingState />
          ) : hasAnalyzed ? (
            <>
              {/* Stats bar shows AFTER analysis, above filter/table */}
              <GapStatsBar gapFilter={gapFilter} onFilterChange={setGapFilter} stats={gapStats} />
              
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
                onBulkAddToRoadmap={handleBulkAddToRoadmap}
                onCopySelected={handleCopySelected}
                selectedCount={selectedGapRows.size}
                isGapAnalysis
              />
              
              <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
                <div className="px-3 sm:px-4 md:px-6 lg:px-8">
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
                  />
                </div>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </>
      ) : (
        <>
          <ForumSearchBar />
          
          {/* Forum stats bar shows above filter */}
          <ForumStatsBar stats={forumStats} formatNumber={formatNumber} />
          
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
            selectedCount={selectedForumRows.size}
            isGapAnalysis={false}
          />
          <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
            <div className="px-3 sm:px-4 md:px-6 lg:px-8">
              <ForumIntelTable
                posts={filteredForumPosts}
                selectedRows={selectedForumRows}
                sortField={forumSortField}
                sortDirection={forumSortDirection}
                onSort={handleForumSort}
                onSelectAll={handleForumSelectAll}
                onSelectRow={handleForumSelectRow}
                onAddToCalendar={handleAddForumToRoadmap}
              />
            </div>
          </div>
        </>
      )}
    </section>
  )
}
