// YouTube Video Result Card Component

"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  YouTubeIcon,
  ViewsIcon,
  LikeIcon,
  CommentIcon,
  CalendarIcon,
  TimerIcon,
  ExternalLinkIcon,
  VerifiedIcon,
  ZapIcon,
} from "@/components/icons/platform-icons"
import type { YouTubeVideoResult } from "../../types/youtube.types"
import { formatViews, formatDate, getEngagementColor, getOpportunityColor } from "../../utils/common.utils"
import { formatDuration } from "../../utils/youtube.utils"

interface YouTubeResultCardProps {
  video: YouTubeVideoResult
  isSelected?: boolean
  onSelect?: (video: YouTubeVideoResult) => void
}

export function YouTubeResultCard({ video, isSelected, onSelect }: YouTubeResultCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card overflow-hidden transition-all duration-200",
        "hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5",
        isSelected ? "border-red-500 ring-2 ring-red-500/20" : "border-border"
      )}
      onClick={() => onSelect?.(video)}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Duration Badge */}
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-black/80 text-white text-[10px] sm:text-xs font-medium flex items-center gap-1">
          <TimerIcon size={10} className="sm:w-3 sm:h-3" />
          {formatDuration(video.duration)}
        </div>

        {/* Opportunity Score Overlay */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
          <Badge className={cn("text-[10px] sm:text-xs", getOpportunityColor(video.opportunityScore))}>
            <ZapIcon size={10} className="mr-0.5 sm:mr-1 sm:w-3 sm:h-3" />
            {video.opportunityScore}%
          </Badge>
        </div>

        {/* Platform Icon */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 p-1 sm:p-1.5 rounded-lg bg-red-600/90 text-white">
          <YouTubeIcon size={14} className="sm:w-4 sm:h-4" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug sm:leading-tight">
          {video.title}
        </h3>

        {/* Channel Info */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-muted shrink-0">
            <Image
              src={video.channelThumbnail}
              alt={video.channelName}
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{video.channelName}</span>
            {video.channelVerified && (
              <VerifiedIcon size={10} className="text-blue-500 shrink-0 sm:w-3 sm:h-3" />
            )}
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto shrink-0">
            {formatViews(video.channelSubs)} subs
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          <div className="text-center p-1 sm:p-1.5 rounded-lg bg-muted/50">
            <ViewsIcon size={12} className="mx-auto text-muted-foreground sm:w-4 sm:h-4" />
            <p className="text-[10px] sm:text-xs font-semibold mt-0.5">{formatViews(video.views)}</p>
          </div>
          <div className="text-center p-1 sm:p-1.5 rounded-lg bg-muted/50">
            <LikeIcon size={12} className="mx-auto text-muted-foreground sm:w-4 sm:h-4" />
            <p className="text-[10px] sm:text-xs font-semibold mt-0.5">{formatViews(video.likes)}</p>
          </div>
          <div className="text-center p-1 sm:p-1.5 rounded-lg bg-muted/50">
            <CommentIcon size={12} className="mx-auto text-muted-foreground sm:w-4 sm:h-4" />
            <p className="text-[10px] sm:text-xs font-semibold mt-0.5">{formatViews(video.comments)}</p>
          </div>
          <div className={cn(
            "text-center p-1 sm:p-1.5 rounded-lg",
            getEngagementColor(video.engagementRate).replace("text-", "bg-").replace("500", "500/10")
          )}>
            <p className={cn("text-[10px] sm:text-xs font-bold", getEngagementColor(video.engagementRate))}>
              {video.engagementRate.toFixed(1)}%
            </p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">Eng</p>
          </div>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {video.tags.length > 3 && (
              <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                +{video.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarIcon size={10} className="sm:w-3 sm:h-3" />
            <span className="text-[10px] sm:text-xs">{formatDate(video.publishedAt)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 sm:h-7 px-2 text-[10px] sm:text-xs"
            onClick={(e) => {
              e.stopPropagation()
              window.open(video.url, "_blank", "noopener,noreferrer")
            }}
          >
            <ExternalLinkIcon size={10} className="mr-1 sm:w-3 sm:h-3" />
            View
          </Button>
        </div>
      </div>
    </div>
  )
}
