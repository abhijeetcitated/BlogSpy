/**
 * VIDEO HIJACK - Refactored Main Component
 * 
 * Original: 1653 lines -> Refactored: ~350 lines
 * 
 * Components Used:
 * - VideoSearchBox: Search input with mode toggle
 * - YouTubeResultCard: YouTube video result display
 * - TikTokResultCard: TikTok video result display
 * - VideoStatsPanel: Stats dashboard
 * - VideoSuggestionPanel: Video creation suggestions
 * - VideoResultsSidebar: Sidebar with tips and related topics
 * 
 * Hooks Used:
 * - useVideoSearch: All search state and handlers
 */

"use client"

import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  YouTubeIcon,
  TikTokIcon,
  VideoIcon,
  DownloadIcon,
  ViewsIcon,
  ChartIcon,
  TargetIcon,
  SortIcon,
  RecentIcon,
} from "@/components/icons/platform-icons"
import { CreditBalance } from "@/src/features/keyword-research/components/header"

// Hooks
import { useVideoSearch } from "./hooks"

// Components
import {
  VideoSearchBox,
  YouTubeResultCard,
  TikTokResultCard,
  VideoStatsPanel,
  TikTokComingSoon,
} from "./components"

// Types
import type { VideoResult, TikTokResult, SortOption, KeywordStats } from "./types/video-search.types"

// Constants
import { ITEMS_PER_PAGE } from "./utils/helpers"
import { getPublishTimestamp } from "./utils/common.utils"
import { PLATFORM_AVAILABILITY } from "./constants"

const VideoResultsSidebar = dynamic(
  () => import("./components/VideoResultsSidebar").then((mod) => mod.VideoResultsSidebar)
)
const VideoSuggestionPanel = dynamic(
  () => import("./components/VideoSuggestionPanel").then((mod) => mod.VideoSuggestionPanel)
)

export function VideoHijackContentRefactored() {
  const [recentSearches, setRecentSearches] = useState<Array<{ keyword: string; created_at?: string }>>([])

  const {
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
  } = useVideoSearch()

  const handleSearchWithHistory = useCallback(() => {
    const trimmed = searchInput.trim()
    if (trimmed) {
      setRecentSearches((prev) => {
        const next = [{ keyword: trimmed }, ...prev.filter((item) => item.keyword !== trimmed)]
        return next.slice(0, 5)
      })
    }
    handleSearch()
  }, [handleSearch, searchInput])

  useEffect(() => {
    let isMounted = true

    const loadRecentSearches = async () => {
      try {
        const response = await fetch("/api/video-hijack/search", { method: "GET" })
        if (!response.ok) return
        const payload = await response.json()
        const history = Array.isArray(payload?.history) ? payload.history : []
        if (isMounted) {
          setRecentSearches(history.map((keyword: string) => ({ keyword })))
        }
      } catch (error) {
        console.error("[Video Hijack] Failed to load history:", error)
      }
    }

    loadRecentSearches()
    return () => {
      isMounted = false
    }
  }, [])

  const derivedKeywordStats = useMemo<KeywordStats | null>(() => {
    if (!youtubeResults.length || !searchedQuery) return null

    const totalVideos = youtubeResults.length
    const totalViews = youtubeResults.reduce((sum, video) => sum + (video.views || 0), 0)
    const avgViews = totalViews / totalVideos
    const avgEngagement =
      youtubeResults.reduce((sum, video) => {
        if (!video.views) return sum
        return sum + ((video.likes + video.comments) / video.views) * 100
      }, 0) / totalVideos
    const avgHijackScore =
      youtubeResults.reduce((sum, video) => sum + video.hijackScore, 0) / totalVideos

    const competition =
      avgHijackScore >= 70 ? "low" : avgHijackScore >= 50 ? "medium" : "high"

    const channelTotals = new Map<string, { views: number; videos: number }>()
    youtubeResults.forEach((video) => {
      const entry = channelTotals.get(video.channel) || { views: 0, videos: 0 }
      channelTotals.set(video.channel, {
        views: entry.views + (video.views || 0),
        videos: entry.videos + 1,
      })
    })

    const topChannels = Array.from(channelTotals.entries())
      .map(([name, data]) => ({ name, videos: data.videos, views: data.views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(({ name, videos }) => ({ name, videos }))

    const topByViews = [...youtubeResults].sort((a, b) => b.views - a.views).slice(0, 10)
    const dayCounts: Record<string, number> = {}
    topByViews.forEach((video) => {
      const timestamp = getPublishTimestamp(video.publishedAt)
      if (!timestamp) return
      const day = new Date(timestamp).toLocaleDateString("en-US", { weekday: "long" })
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })

    const bestUploadDay =
      Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Thursday"

    const parseDuration = (value: string): number => {
      const parts = value.split(":").map((part) => Number(part))
      if (parts.some((part) => Number.isNaN(part))) return 0
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
      if (parts.length === 2) return parts[0] * 60 + parts[1]
      if (parts.length === 1) return parts[0]
      return 0
    }

    const formatDuration = (seconds: number): string => {
      const rounded = Math.max(0, Math.round(seconds))
      const hours = Math.floor(rounded / 3600)
      const minutes = Math.floor((rounded % 3600) / 60)
      const secs = rounded % 60
      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      }
      return `${minutes}:${String(secs).padStart(2, "0")}`
    }

    const avgLengthSeconds =
      youtubeResults.reduce((sum, video) => sum + parseDuration(video.duration), 0) /
      totalVideos

    const tutorialCount = youtubeResults.filter((video) =>
      /how to|guide|tutorial/i.test(video.title)
    ).length
    const reviewCount = youtubeResults.filter((video) =>
      /review|test/i.test(video.title)
    ).length
    const comparisonCount = youtubeResults.filter((video) =>
      /vs|compare/i.test(video.title)
    ).length
    const tutorialPercent = Math.round((tutorialCount / totalVideos) * 100)
    const reviewPercent = Math.round((reviewCount / totalVideos) * 100)
    const comparisonPercent = Math.round((comparisonCount / totalVideos) * 100)
    const otherPercent = Math.max(0, 100 - tutorialPercent - reviewPercent - comparisonPercent)

    return {
      keyword: searchedQuery,
      platform: "youtube",
      totalVideos,
      totalViews,
      avgViews,
      avgEngagement,
      topChannels,
      trendScore: Math.min(100, Math.round(avgEngagement * 12)),
      competition,
      hijackOpportunity: Math.round(avgHijackScore),
      monetizationScore: Math.min(100, Math.round(avgEngagement * 10)),
      seasonality: "evergreen",
      avgVideoLength: formatDuration(avgLengthSeconds),
      bestUploadDay,
      bestUploadTime: "2 PM - 6 PM",
      searchVolume: Math.round(totalViews / 12),
      volumeTrend: "stable",
      contentTypes: [
        { type: "Tutorial", percentage: tutorialPercent },
        { type: "Review", percentage: reviewPercent },
        { type: "Comparison", percentage: comparisonPercent },
        { type: "Other", percentage: otherPercent },
      ],
      audienceAge: [
        { range: "18-24", percentage: 20 },
        { range: "25-34", percentage: 35 },
        { range: "35-44", percentage: 20 },
        { range: "45-54", percentage: 15 },
        { range: "55+", percentage: 10 },
      ],
    }
  }, [searchedQuery, youtubeResults])

  const statsForPanel = platform === "youtube" ? derivedKeywordStats : keywordStats

  return (
    <TooltipProvider>
      <div className="space-y-3 sm:space-y-4 md:space-y-6 overflow-x-hidden">
        {/* ==================== HEADER ==================== */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                <VideoIcon size={16} className="text-red-500" />
              </div>
              <span className="truncate">Video Research</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 hidden sm:block">
              Find trending video opportunities
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <CreditBalance />
            {hasSearched && (
              <Button
                onClick={handleExport}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white shrink-0 text-xs px-2 sm:px-3"
              >
                <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
        </div>

        {/* ==================== SEARCH BOX ==================== */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs sm:text-sm"
                  disabled={recentSearches.length === 0}
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Recent Searches
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {recentSearches.map((item) => (
                  <DropdownMenuItem
                    key={item.keyword}
                    onClick={() => {
                      setSearchInput(item.keyword)
                      setTimeout(() => handleSearchWithHistory(), 0)
                    }}
                  >
                    {item.keyword}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <VideoSearchBox
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            isLoading={isLoading}
            onSearch={handleSearchWithHistory}
          />
        </div>

        {/* ==================== LOADING STATE ==================== */}
        {isLoading && (
          <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
              <VideoIcon size={24} className="text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-foreground font-medium mt-4">Searching videos...</p>
            <p className="text-muted-foreground text-sm mt-1">
              Fetching data from YouTube & TikTok
            </p>
          </div>
        )}

        {/* ==================== EMPTY STATE ==================== */}
        {!isLoading && !hasSearched && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="flex gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20">
                <YouTubeIcon size={24} className="text-red-500 md:w-8 md:h-8" />
              </div>
              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <TikTokIcon size={24} className="md:w-8 md:h-8" />
              </div>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">Video Keyword Research</h3>
            <p className="text-muted-foreground text-xs md:text-sm mt-2 max-w-md px-2">
              Search any keyword to discover video opportunities on YouTube & TikTok.
              See views, engagement, top creators, and trend scores.
            </p>

            {/* What APIs provide */}
            <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-xl w-full">
              <div className="p-4 rounded-xl bg-background border border-border text-left">
                <div className="flex items-center gap-2 mb-2">
                  <YouTubeIcon size={20} className="text-red-500" />
                  <span className="font-medium text-foreground">YouTube Data</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>- Video views, likes, comments</li>
                  <li>- Channel subscribers</li>
                  <li>- Video duration & publish date</li>
                  <li>- Search volume indicators</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border text-left">
                <div className="flex items-center gap-2 mb-2">
                  <TikTokIcon size={20} />
                  <span className="font-medium text-foreground">TikTok Data</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>- Video views, likes, shares</li>
                  <li>- Creator followers</li>
                  <li>- Trending hashtags</li>
                  <li>- Engagement rates</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ==================== RESULTS ==================== */}
        {!isLoading && hasSearched && (
          <>
            {/* Platform Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-muted/50 border border-border w-full sm:w-auto">
                <button
                  onClick={() => setPlatform("youtube")}
                  className={cn(
                    "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all",
                    platform === "youtube"
                      ? "bg-linear-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <YouTubeIcon size={16} className={cn("sm:w-[18px] sm:h-[18px]", platform === "youtube" ? "text-white" : "text-red-500")} />
                  <span className="hidden xs:inline">YouTube</span>
                  <span className="xs:hidden">YT</span>
                  <Badge variant={platform === "youtube" ? "outline" : "secondary"} className={cn("ml-0.5 sm:ml-1 text-[10px] sm:text-xs", platform === "youtube" && "border-white/30 text-white")}>
                    {youtubeResults.length}
                  </Badge>
                </button>
                <button
                  onClick={() => setPlatform("tiktok")}
                  className={cn(
                    "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all",
                    platform === "tiktok"
                      ? "bg-linear-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <TikTokIcon size={16} className={cn("sm:w-[18px] sm:h-[18px]", platform === "tiktok" ? "text-white" : "text-foreground")} />
                  <span className="hidden xs:inline">TikTok</span>
                  <span className="xs:hidden">TT</span>
                  {!PLATFORM_AVAILABILITY.tiktok.enabled ? (
                    <Badge variant="outline" className="ml-0.5 sm:ml-1 text-[10px] sm:text-xs bg-pink-500/10 border-pink-500/30 text-pink-500">
                      Soon
                    </Badge>
                  ) : (
                    <Badge variant={platform === "tiktok" ? "outline" : "secondary"} className={cn("ml-0.5 sm:ml-1 text-[10px] sm:text-xs", platform === "tiktok" && "border-white/30 text-white")}>
                      {tiktokResults.length}
                    </Badge>
                  )}
                </button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                  <SortIcon size={16} className="mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hijackScore">
                    <span className="flex items-center gap-2">
                      <TargetIcon size={14} className="text-emerald-500" />
                      Hijack Score
                    </span>
                  </SelectItem>
                  <SelectItem value="views">
                    <span className="flex items-center gap-2">
                      <ViewsIcon size={14} className="text-blue-500" />
                      Most Views
                    </span>
                  </SelectItem>
                  <SelectItem value="engagement">
                    <span className="flex items-center gap-2">
                      <ChartIcon size={14} className="text-purple-500" />
                      Highest Engagement
                    </span>
                  </SelectItem>
                  <SelectItem value="recent">
                    <span className="flex items-center gap-2">
                      <RecentIcon size={14} className="text-amber-500" />
                      Most Recent
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Dashboard */}
            {statsForPanel && <VideoStatsPanel keywordStats={statsForPanel} />}

            {/* Main Content Grid with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Left: Results List */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="truncate">
                    Showing {paginatedResults.length} of {currentResults.length} for &quot;{searchedQuery}&quot;
                  </span>
                  {totalPages > 1 && <span className="shrink-0">Page {currentPage}/{totalPages}</span>}
                </div>

                {/* YouTube Results */}
                {platform === "youtube" && (
                  <div className="space-y-3">
                    {(paginatedResults as VideoResult[]).map((video, i) => (
                      <YouTubeResultCard
                        key={video.id}
                        video={video}
                        rank={(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                        onCopy={handleCopy}
                      />
                    ))}
                  </div>
                )}

                {/* TikTok Results */}
                {platform === "tiktok" && (
                  <div className="space-y-3">
                    {/* Show Coming Soon if TikTok is not enabled */}
                    {!PLATFORM_AVAILABILITY.tiktok.enabled ? (
                      <TikTokComingSoon />
                    ) : (
                      (paginatedResults as TikTokResult[]).map((video, i) => (
                        <TikTokResultCard
                          key={video.id}
                          video={video}
                          rank={(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                          onCopy={handleCopy}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-2 sm:px-3"
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "ghost"}
                            size="sm"
                            className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <VideoResultsSidebar
                keywordStats={statsForPanel}
                platform={platform}
                youtubeResults={youtubeResults}
                tiktokResults={tiktokResults}
                searchedQuery={searchedQuery}
                setSearchInput={setSearchInput}
                onCopy={handleCopy}
              />
            </div>

            {/* Video Suggestions */}
            {videoSuggestion && (
              <VideoSuggestionPanel
                videoSuggestion={videoSuggestion}
                onCopy={handleCopy}
              />
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

export default VideoHijackContentRefactored
