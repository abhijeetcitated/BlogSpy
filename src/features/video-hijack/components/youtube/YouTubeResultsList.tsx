// YouTube Results List Component

"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  YouTubeIcon,
  SortIcon,
  GridIcon,
  ListIcon,
  DownloadIcon,
} from "@/components/icons/platform-icons"
import { YouTubeResultCard } from "./YouTubeResultCard"
import type { YouTubeVideoResult } from "../../types/youtube.types"
import type { SortOption } from "../../types/common.types"
import { youtubeService } from "../../services"
import { getPublishTimestamp } from "../../utils/common.utils"

interface YouTubeResultsListProps {
  results: YouTubeVideoResult[]
  isLoading?: boolean
  searchQuery: string
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "opportunity", label: "Opportunity Score" },
  { value: "views", label: "Most Views" },
  { value: "engagement", label: "Highest Engagement" },
  { value: "recent", label: "Most Recent" },
  { value: "likes", label: "Most Likes" },
]

export function YouTubeResultsList({ results, isLoading, searchQuery }: YouTubeResultsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("opportunity")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoResult | null>(null)

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "opportunity":
        return b.opportunityScore - a.opportunityScore
      case "views":
        return b.views - a.views
      case "engagement":
        return b.engagementRate - a.engagementRate
      case "recent":
        return getPublishTimestamp(b.publishedAt) - getPublishTimestamp(a.publishedAt)
      case "likes":
        return b.likes - a.likes
      default:
        return 0
    }
  })

  // Export to CSV
  const handleExport = () => {
    youtubeService.exportToCSV(sortedResults, `youtube-${searchQuery}-${Date.now()}`)
  }

  if (results.length === 0 && !isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 sm:p-12 text-center">
        <YouTubeIcon size={32} className="mx-auto text-red-500/50 sm:w-12 sm:h-12" />
        <h3 className="mt-4 text-sm sm:text-base font-semibold text-foreground">No YouTube Results</h3>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Search for a keyword to discover YouTube video opportunities
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <YouTubeIcon size={16} className="text-red-500 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-sm sm:text-base text-foreground">YouTube Results</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{results.length} videos found</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[130px] sm:w-[160px] h-8 sm:h-9 text-xs sm:text-sm">
              <SortIcon size={14} className="mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode - Hidden on mobile */}
          <div className="hidden sm:flex rounded-lg border border-border p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GridIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListIcon size={16} />
            </button>
          </div>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm"
            onClick={handleExport}
          >
            <DownloadIcon size={14} className="mr-1.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          : "space-y-3"
      )}>
        {sortedResults.map((video) => (
          <YouTubeResultCard
            key={video.id}
            video={video}
            isSelected={selectedVideo?.id === video.id}
            onSelect={setSelectedVideo}
          />
        ))}
      </div>

      {/* Load More Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      )}
    </div>
  )
}
