"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Clock } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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
import { STACK_SPACING } from "@/src/styles"
import type { Country } from "@/src/features/keyword-research/types"
import { CountrySelector } from "@/src/features/keyword-research/components"
import { CreditBalance } from "@/src/features/keyword-research/components/header"
import { ALL_COUNTRIES, POPULAR_COUNTRIES } from "@/src/features/keyword-research/constants"
import { createBrowserClient } from "@/src/lib/supabase/client"

type RecentGapReport = {
  id: string
  target_domain?: string
  country_code: string
  created_at: string
  report_data: {
    items: any[]
    targets?: string[]
    countryCode?: string
    generatedAt?: string
  }
}

export function CompetitorGapContent() {
  const router = useRouter()
  const DEFAULT_COUNTRY =
    POPULAR_COUNTRIES.find((country) => country.code === "US") ??
    ALL_COUNTRIES.find((country) => country.code === "US") ??
    null
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(DEFAULT_COUNTRY)
  const [countryOpen, setCountryOpen] = useState(false)
  const [recentReports, setRecentReports] = useState<RecentGapReport[]>([])
  const [recentReportsOpen, setRecentReportsOpen] = useState(false)
  
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
    applyGapReport,
    handleGapSelectAll,
    handleGapSelectRow,
    handleForumSelectAll,
    handleForumSelectRow,
    formatNumber,
  } = useCompetitorGap({
    initialGapData: MOCK_GAP_DATA,
    initialForumData: MOCK_FORUM_INTEL_DATA,
    selectedCountryCode: selectedCountry?.code,
  })

  const isGapAnalysis = mainView === "gap-analysis"
  const countriesByCode = useMemo(
    () => new Map(ALL_COUNTRIES.map((country) => [country.code, country])),
    []
  )

  useEffect(() => {
    let isMounted = true
    const loadRecentReports = async () => {
      try {
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
          if (isMounted) {
            setRecentReports([
              {
                id: "1",
                target_domain: "myblog.com",
                country_code: "US",
                created_at: new Date().toISOString(),
                report_data: { items: [] },
              },
              {
                id: "2",
                target_domain: "competitor.com",
                country_code: "US",
                created_at: new Date().toISOString(),
                report_data: { items: [] },
              },
            ])
          }
          return
        }

        const supabase = createBrowserClient()
        const { data: authData } = await supabase.auth.getUser()
        const gapReports = (supabase as unknown as { from: (table: string) => any }).from("gap_reports")
        let query = gapReports
          .select("id, target_domain, country_code, created_at, report_data")
          .order("created_at", { ascending: false })
          .limit(5)

        if (authData?.user?.id) {
          query = query.eq("user_id", authData.user.id)
        }

        const { data, error } = await query
        if (error) {
          throw new Error(error.message)
        }

        if (isMounted) {
          setRecentReports((data ?? []) as RecentGapReport[])
        }
      } catch (error) {
        if (isMounted) {
          console.error("[competitor-gap] Failed to load recent reports", error)
        }
      }
    }

    loadRecentReports()
    return () => {
      isMounted = false
    }
  }, [])

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

  const handleCopySelected = useCallback(() => {
    const selectedKeywords = filteredGapKeywords.filter((kw) => selectedGapRows.has(kw.id))
    if (selectedKeywords.length === 0) {
      toast.info("No keywords selected")
      return
    }

    const header = "Keyword\tGap Status\tYour Rank\tComp1 Rank\tComp2 Rank\tVolume\tCPC\tDifficulty\tIntent\tTrend"
    const rows = selectedKeywords.map((kw) => {
      const cpc = kw.cpc ?? 0
      const safeKeyword = kw.keyword.replace(/\t/g, " ").replace(/\r?\n/g, " ")
      return [
        safeKeyword,
        kw.gapType,
        kw.yourRank ?? "-",
        kw.comp1Rank ?? "-",
        kw.comp2Rank ?? "-",
        kw.volume,
        `$${cpc.toFixed(2)}`,
        kw.kd,
        kw.intent ?? "-",
        kw.trend,
      ].join("\t")
    })

    const text = [header, ...rows].join("\n")
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard", {
        description: `${selectedKeywords.length} keywords copied`,
      })
    })
  }, [filteredGapKeywords, selectedGapRows])

  const handleExport = useCallback(() => {
    const data = isGapAnalysis ? filteredGapKeywords : filteredForumPosts
    const count = data.length
    
    if (isGapAnalysis) {
      const csv = [
        ["Keyword", "Gap Type", "Your Rank", "Comp1 Rank", "Volume", "KD", "Intent", "Trend"].join(","),
        ...filteredGapKeywords.map(kw => [
          `"${kw.keyword}"`,
          kw.gapType,
          kw.yourRank ?? "-",
          kw.comp1Rank ?? "-",
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
      const getCTR = (rank: number) => {
        if (rank <= 1) return 0.32
        if (rank === 2) return 0.18
        if (rank === 3) return 0.12
        if (rank <= 10) return 0.06
        if (rank <= 20) return 0.03
        return 0.01
      }
      const csv = [
        ["Topic", "Source", "SERP Rank", "Monthly Volume", "Est. Traffic", "Last Active", "Upvotes", "Comments", "Opportunity Score"].join(","),
        ...filteredForumPosts.map(post => [
          `"${post.topic}"`,
          post.source,
          post.serpRank,
          post.monthlyVolume,
          Math.round(post.monthlyVolume * getCTR(post.serpRank)),
          (typeof post.lastActive === "string"
            ? new Date(post.lastActive)
            : post.lastActive
          ).toISOString().split("T")[0],
          post.upvotes,
          post.comments,
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
      <div className={`flex flex-col h-full bg-background ${STACK_SPACING.default}`}>
        <Header mainView={mainView} onViewChange={setMainView}>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <DropdownMenu open={recentReportsOpen} onOpenChange={setRecentReportsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300"
                >
                  <Clock className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                  Recent Analyses
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {recentReports.length === 0 ? (
                  <DropdownMenuItem disabled>No recent reports</DropdownMenuItem>
                ) : (
                  recentReports.map((report) => {
                    const fallbackTargets = report.target_domain
                      ? report.target_domain.split("|")
                      : []
                    const targets = report.report_data?.targets ?? fallbackTargets
                    const label = targets.length > 0
                      ? targets.join(" vs ")
                      : "Saved analysis"
                    const dateLabel = new Date(report.created_at).toLocaleDateString()
                    return (
                      <DropdownMenuItem
                        key={report.id}
                        onClick={() => {
                          const reportData = report.report_data
                          applyGapReport(reportData?.items ?? [])
                          setMainView("gap-analysis")
                          const fallbackTargets = report.target_domain
                            ? report.target_domain.split("|")
                            : []
                          const targets = reportData?.targets ?? fallbackTargets
                          setYourDomain(targets?.[0] ?? "")
                          setCompetitor1(targets?.[1] ?? "")
                          setCompetitor2(targets?.[2] ?? "")
                          const country =
                            countriesByCode.get(report.country_code) ??
                            countriesByCode.get(reportData?.countryCode ?? "")
                          if (country) {
                            setSelectedCountry(country)
                          }
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-slate-700 dark:text-zinc-200">{label}</span>
                          <span className="text-xs text-slate-500 dark:text-zinc-500">
                            {report.country_code} - {dateLabel}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    )
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <CountrySelector
              selectedCountry={selectedCountry}
              open={countryOpen}
              onOpenChange={setCountryOpen}
              onSelect={setSelectedCountry}
              popularCountries={POPULAR_COUNTRIES}
              allCountries={ALL_COUNTRIES}
            />
            <CreditBalance />
          </div>
        </Header>

        {isGapAnalysis && (
          <AnalysisForm
            yourDomain={yourDomain}
            competitor1={competitor1}
            competitor2={competitor2}
            isLoading={isLoading}
            selectedCountryCode={selectedCountry?.code}
            onYourDomainChange={setYourDomain}
            onCompetitor1Change={setCompetitor1}
            onCompetitor2Change={setCompetitor2}
            onAnalyze={handleAnalyze}
          />
        )}

        {!isGapAnalysis && <ForumSearchBar />}

        {(hasAnalyzed || !isGapAnalysis) && (
          <>
            <div className="py-2 sm:py-3 md:py-4 border-b border-border overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
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
              onBulkAddToRoadmap={handleBulkAddToRoadmap}
              onCopySelected={handleCopySelected}
              selectedCount={selectedGapRows.size}
              isGapAnalysis={isGapAnalysis}
            />

            {isGapAnalysis ? (
              hasAnalyzed && !isLoading && filteredGapKeywords.length === 0 ? (
                <EmptyState
                  title="No keyword gaps found between these domains."
                  description="Try a closer competitor."
                />
              ) : (
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
                  onWriteArticle={handleWriteArticle}
                  selectedCountryCode={selectedCountry?.code}
                />
              )
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
