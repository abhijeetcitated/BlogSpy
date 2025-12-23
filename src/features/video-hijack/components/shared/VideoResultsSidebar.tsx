// Video Results Sidebar Component

"use client"

import { Badge } from "@/components/ui/badge"
import {
  UsersIcon,
  LightbulbIcon,
  TrendingIcon,
  BarChartIcon,
} from "@/components/icons/platform-icons"
import type { KeywordStats, Platform } from "../../types/common.types"
import type { YouTubeVideoResult } from "../../types/youtube.types"
import type { TikTokVideoResult } from "../../types/tiktok.types"
import { formatViews } from "../../utils/common.utils"

interface VideoResultsSidebarProps {
  keywordStats: KeywordStats | null
  platform: Platform
  youtubeResults: YouTubeVideoResult[]
  tiktokResults: TikTokVideoResult[]
  searchedQuery: string
  setSearchInput: (input: string) => void
  onCopy: (text: string) => void
}

export function VideoResultsSidebar({
  keywordStats,
  platform,
  youtubeResults,
  tiktokResults,
  searchedQuery,
  setSearchInput,
  onCopy,
}: VideoResultsSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-3 sm:space-y-4">
      {/* Top Creators/Channels */}
      {keywordStats && (
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <div className="p-1 sm:p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <UsersIcon size={14} className="text-purple-500 sm:w-4 sm:h-4" />
            </div>
            {platform === "youtube" ? "Top Channels" : "Top Creators"}
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {keywordStats.topChannels.slice(0, 5).map((channel, i) => (
              <div key={channel.name} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] sm:text-xs font-bold text-purple-500">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-foreground truncate">{channel.name}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    {channel.videos} videos
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video SEO Tips - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block rounded-xl border border-border bg-card p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <div className="p-1 sm:p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <LightbulbIcon size={14} className="text-amber-500 sm:w-4 sm:h-4" />
          </div>
          Video SEO Tips
        </h3>
        <div className="space-y-1.5 sm:space-y-2">
          {[
            "Focus on high views, low engagement keywords",
            "Longer videos (10-15 min) rank better",
            "Add timestamps for better CTR",
            "Create \"how to\" content",
            "First 24-48h engagement is crucial",
          ].map((tip, i) => (
            <div key={i} className="text-[10px] sm:text-xs text-muted-foreground flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-muted/30">
              <span className="text-amber-500 mt-0.5">💡</span>
              <span className="line-clamp-2">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related Keywords */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <div className="p-1 sm:p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <TrendingIcon size={14} className="text-cyan-500 sm:w-4 sm:h-4" />
          </div>
          Related Topics
        </h3>
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {[
            `${searchedQuery} tutorial`,
            `${searchedQuery} for beginners`,
            `best ${searchedQuery}`,
            `${searchedQuery} tips`,
            `${searchedQuery} 2024`,
            `how to ${searchedQuery}`,
          ].map((topic) => (
            <Badge
              key={topic}
              variant="secondary"
              className="text-[10px] sm:text-xs cursor-pointer hover:bg-muted"
              onClick={() => {
                setSearchInput(topic)
                onCopy(topic)
              }}
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <BarChartIcon size={14} className="text-emerald-500 sm:w-4 sm:h-4" />
          </div>
          Quick Stats
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-muted/30">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Avg Views</span>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {keywordStats ? formatViews(keywordStats.avgViews) : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-muted/30">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Best</span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-500">
              {platform === "youtube" && youtubeResults[0] 
                ? formatViews(youtubeResults[0].views)
                : platform === "tiktok" && tiktokResults[0]
                ? formatViews(tiktokResults[0].views)
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-muted/30">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Engage</span>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {keywordStats ? `${keywordStats.avgEngagement.toFixed(1)}%` : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-muted/30">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Analyzed</span>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {platform === "youtube" ? youtubeResults.length : tiktokResults.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
