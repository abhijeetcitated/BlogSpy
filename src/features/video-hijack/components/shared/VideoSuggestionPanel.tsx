// Video Suggestion Panel Component

"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ZapIcon,
  LightbulbIcon,
  TagIcon,
  HashtagIcon,
  DurationIcon,
  TrendingIcon,
  TargetIcon,
  CopyIcon,
} from "@/components/icons/platform-icons"
import type { VideoSuggestion } from "../../types/common.types"
import { getCompetitionColor } from "../../utils/common.utils"

interface VideoSuggestionPanelProps {
  videoSuggestion: VideoSuggestion
  onCopy: (text: string) => void
}

export function VideoSuggestionPanel({ videoSuggestion, onCopy }: VideoSuggestionPanelProps) {
  const [showSuggestions, setShowSuggestions] = useState(true)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-linear-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30">
            <ZapIcon size={16} className="text-violet-500 sm:w-5 sm:h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm sm:text-base text-foreground">Video Creation Insights</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Based on top videos</p>
          </div>
        </div>
        {showSuggestions ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        )}
      </button>

      {showSuggestions && (
        <div className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
          {/* Title Suggestions */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground">
              <LightbulbIcon size={14} className="text-amber-500 sm:w-4 sm:h-4" />
              Recommended Title Formats
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {videoSuggestion.titleFormats.slice(0, 3).map((title, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 border border-border group gap-2"
                >
                  <p className="text-xs sm:text-sm text-foreground line-clamp-2">{title}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={() => onCopy(title)}
                  >
                    <CopyIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags & Hashtags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* YouTube Tags */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground">
                <TagIcon size={14} className="text-red-500 sm:w-4 sm:h-4" />
                YouTube Tags
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {videoSuggestion.recommendedTags.slice(0, 6).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] sm:text-xs bg-red-500/10 text-red-500 cursor-pointer hover:bg-red-500/20"
                    onClick={() => onCopy(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1.5 sm:mt-2 h-8 text-xs"
                onClick={() => onCopy(videoSuggestion.recommendedTags.join(", "))}
              >
                <CopyIcon size={12} className="mr-1.5 sm:mr-2" />
                Copy All
              </Button>
            </div>

            {/* TikTok Hashtags */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground">
                <HashtagIcon size={14} className="text-cyan-500 sm:w-4 sm:h-4" />
                TikTok Hashtags
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {videoSuggestion.recommendedHashtags.slice(0, 6).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] sm:text-xs bg-cyan-500/10 text-cyan-500 cursor-pointer hover:bg-cyan-500/20"
                    onClick={() => onCopy(`#${tag}`)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1.5 sm:mt-2 h-8 text-xs"
                onClick={() => onCopy(videoSuggestion.recommendedHashtags.map(t => `#${t}`).join(" "))}
              >
                <CopyIcon size={12} className="mr-1.5 sm:mr-2" />
                Copy All
              </Button>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                <DurationIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="text-[10px] sm:text-xs">YT Len</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{videoSuggestion.optimalLength.youtube}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                <DurationIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="text-[10px] sm:text-xs">TT Len</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{videoSuggestion.optimalLength.tiktok}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                <TrendingIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="text-[10px] sm:text-xs">Time</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{videoSuggestion.bestTimeToPost}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground mb-0.5 sm:mb-1">
                <TargetIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="text-[10px] sm:text-xs">Diff</span>
              </div>
              <Badge className={cn("capitalize text-[10px] sm:text-xs", getCompetitionColor(videoSuggestion.difficulty))}>
                {videoSuggestion.difficulty}
              </Badge>
            </div>
          </div>

          {/* Content Gaps */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground">
              <TargetIcon size={14} className="text-emerald-500 sm:w-4 sm:h-4" />
              Content Gaps & Opportunities
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {videoSuggestion.contentGaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
                >
                  <ZapIcon size={14} className="text-emerald-500 shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                  <p className="text-xs sm:text-sm text-foreground line-clamp-2">{gap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
