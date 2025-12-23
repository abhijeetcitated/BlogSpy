/**
 * VIDEO HIJACK - Refactored Main Component
 * 
 * Original: 1653 lines → Refactored: ~350 lines
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

import { ChevronLeft, ChevronRight } from "lucide-react"
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

// Hooks
import { useVideoSearch } from "./hooks"

// Components
import {
  VideoSearchBox,
  YouTubeResultCard,
  TikTokResultCard,
  VideoStatsPanel,
  VideoSuggestionPanel,
  VideoResultsSidebar,
} from "./components"

// Types
import type { VideoResult, TikTokResult, SortOption } from "./types/video-search.types"

// Constants
import { ITEMS_PER_PAGE } from "./utils/helpers"

export function VideoHijackContentRefactored() {
  const {
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
  } = useVideoSearch()

  return (
    <TooltipProvider>
      <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-x-hidden">
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

        {/* ==================== SEARCH BOX ==================== */}
        <VideoSearchBox
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          isLoading={isLoading}
          onSearch={handleSearch}
        />

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
                  <li>• Video views, likes, comments</li>
                  <li>• Channel subscribers</li>
                  <li>• Video duration & publish date</li>
                  <li>• Search volume indicators</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border text-left">
                <div className="flex items-center gap-2 mb-2">
                  <TikTokIcon size={20} />
                  <span className="font-medium text-foreground">TikTok Data</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Video views, likes, shares</li>
                  <li>• Creator followers</li>
                  <li>• Trending hashtags</li>
                  <li>• Engagement rates</li>
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
                  <Badge variant={platform === "tiktok" ? "outline" : "secondary"} className={cn("ml-0.5 sm:ml-1 text-[10px] sm:text-xs", platform === "tiktok" && "border-white/30 text-white")}>
                    {tiktokResults.length}
                  </Badge>
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
            {keywordStats && <VideoStatsPanel keywordStats={keywordStats} />}

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
                    {(paginatedResults as TikTokResult[]).map((video, i) => (
                      <TikTokResultCard
                        key={video.id}
                        video={video}
                        rank={(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                        onCopy={handleCopy}
                      />
                    ))}
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
                keywordStats={keywordStats}
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
