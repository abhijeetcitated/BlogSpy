// Video Stats Dashboard Component

"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ZapIcon,
  DollarIcon,
  SearchIcon,
  VideoIcon,
  ViewsIcon,
  LikeIcon,
  TargetIcon,
  CalendarIcon,
  ClockIcon,
  TimerIcon,
  FlameIcon,
  PlayIcon,
  UsersIcon,
} from "@/components/icons/platform-icons"
import type { KeywordStats } from "../types/video-search.types"
import {
  formatViews,
  getCompetitionColor,
  getSeasonalityIcon,
  getVolumeTrendIcon,
} from "../utils/helpers"

interface VideoStatsPanelProps {
  keywordStats: KeywordStats
}

export function VideoStatsPanel({ keywordStats }: VideoStatsPanelProps) {
  return (
    <div className="space-y-2 sm:space-y-4 overflow-hidden">
      {/* Row 1: Main Metrics */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-8 sm:gap-3">
        {/* Hijack Opportunity - MAIN SCORE */}
        <div className="col-span-2 rounded-lg sm:rounded-xl border-2 border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 p-2 sm:p-4">
          <div className="flex items-center gap-1 sm:gap-2 text-emerald-500 mb-1 sm:mb-2">
            <ZapIcon size={14} className="text-emerald-500 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-sm font-semibold">Hijack Score</span>
          </div>
          <div className="flex items-end gap-1 sm:gap-2">
            <p className="text-xl sm:text-4xl font-bold text-emerald-500">{keywordStats.hijackOpportunity}</p>
            <span className="text-[10px] sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">/100</span>
          </div>
          <Progress value={keywordStats.hijackOpportunity} className="h-1 sm:h-2 mt-1 sm:mt-2" />
        </div>

        {/* Monetization Score */}
        <div className="rounded-xl border border-border bg-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-amber-500 mb-0.5 sm:mb-1">
            <DollarIcon size={14} className="text-amber-500 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">CPM</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-foreground">{keywordStats.monetizationScore}</p>
          <span className="text-[10px] sm:text-xs text-muted-foreground">/100</span>
        </div>

        {/* Search Volume */}
        <div className="rounded-xl border border-border bg-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
            <SearchIcon size={14} className="sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">Volume</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <p className="text-lg sm:text-2xl font-bold text-foreground">{formatViews(keywordStats.searchVolume)}</p>
            {(() => {
              const trend = getVolumeTrendIcon(keywordStats.volumeTrend)
              const TrendIcon = trend.icon
              return <TrendIcon className={cn("w-3 h-3 sm:w-4 sm:h-4", trend.color)} />
            })()}
          </div>
        </div>

        {/* Total Videos */}
        <div className="rounded-xl border border-border bg-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
            <VideoIcon size={14} className="sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">Videos</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-foreground">
            {formatViews(keywordStats.totalVideos)}
          </p>
        </div>

        {/* Total Views */}
        <div className="rounded-xl border border-border bg-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
            <ViewsIcon size={14} className="sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">Views</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-foreground">
            {formatViews(keywordStats.totalViews)}
          </p>
        </div>

        {/* Avg Engagement */}
        <div className="rounded-xl border border-border bg-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
            <LikeIcon size={14} className="sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">Engage</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-foreground">
            {keywordStats.avgEngagement.toFixed(1)}%
          </p>
        </div>

        {/* Competition */}
        <div className="rounded-xl border border-border bg-card p-2.5 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
            <TargetIcon size={14} className="sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">Compete</span>
          </div>
          <Badge className={cn("mt-0.5 sm:mt-1 capitalize text-[10px] sm:text-xs", getCompetitionColor(keywordStats.competition))}>
            {keywordStats.competition}
          </Badge>
        </div>
      </div>

      {/* Row 2: Insights Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Seasonality */}
        <div className="rounded-xl border border-border bg-card p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
          <div className="shrink-0 scale-75 sm:scale-100 origin-left">{getSeasonalityIcon(keywordStats.seasonality)}</div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Type</p>
            <p className="text-xs sm:text-sm font-semibold capitalize truncate">{keywordStats.seasonality}</p>
          </div>
        </div>

        {/* Best Upload Day */}
        <div className="rounded-xl border border-border bg-card p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
          <CalendarIcon size={16} className="text-blue-500 shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Best Day</p>
            <p className="text-xs sm:text-sm font-semibold truncate">{keywordStats.bestUploadDay}</p>
          </div>
        </div>

        {/* Best Upload Time */}
        <div className="rounded-xl border border-border bg-card p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
          <ClockIcon size={16} className="text-purple-500 shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Best Time</p>
            <p className="text-xs sm:text-sm font-semibold truncate">{keywordStats.bestUploadTime}</p>
          </div>
        </div>

        {/* Avg Video Length */}
        <div className="rounded-xl border border-border bg-card p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
          <TimerIcon size={16} className="text-cyan-500 shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Len</p>
            <p className="text-xs sm:text-sm font-semibold truncate">{keywordStats.avgVideoLength}</p>
          </div>
        </div>

        {/* Trend Score */}
        <div className="rounded-xl border border-border bg-card p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
          <FlameIcon size={16} className="text-orange-500 shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Trend</p>
            <p className="text-xs sm:text-sm font-semibold text-orange-500">{keywordStats.trendScore}/100</p>
          </div>
        </div>

        {/* Avg Views */}
        <div className="rounded-xl border border-border bg-card p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
          <PlayIcon size={16} className="text-red-500 shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Views</p>
            <p className="text-xs sm:text-sm font-semibold truncate">{formatViews(keywordStats.avgViews)}</p>
          </div>
        </div>
      </div>

      {/* Row 3: Content Type & Audience Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Content Type Distribution */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <VideoIcon size={14} className="text-purple-500 sm:w-4 sm:h-4" />
            Content Types
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {keywordStats.contentTypes.map((ct) => (
              <div key={ct.type} className="flex items-center gap-2 sm:gap-3">
                <span className="text-[10px] sm:text-xs text-muted-foreground w-16 sm:w-20 truncate">{ct.type}</span>
                <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${ct.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-medium w-8 sm:w-10 text-right">{ct.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Age Distribution */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <UsersIcon size={14} className="text-blue-500 sm:w-4 sm:h-4" />
            Audience Ages
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {keywordStats.audienceAge.map((age) => (
              <div key={age.range} className="flex items-center gap-2 sm:gap-3">
                <span className="text-[10px] sm:text-xs text-muted-foreground w-10 sm:w-12">{age.range}</span>
                <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${age.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-medium w-8 sm:w-10 text-right">{age.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
