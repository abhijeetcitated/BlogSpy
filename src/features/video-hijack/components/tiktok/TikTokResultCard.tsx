// TikTok Video Result Card Component

"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TikTokIcon,
  ViewsIcon,
  LikeIcon,
  CommentIcon,
  ShareIcon,
  MusicIcon,
  ExternalLinkIcon,
  VerifiedIcon,
  ZapIcon,
  PlayIcon,
} from "@/components/icons/platform-icons"
import type { TikTokVideoResult } from "../../types/tiktok.types"
import { formatViews, formatDate, getEngagementColor, getOpportunityColor } from "../../utils/common.utils"
import { formatDuration } from "../../utils/tiktok.utils"

interface TikTokResultCardProps {
  video: TikTokVideoResult
  isSelected?: boolean
  onSelect?: (video: TikTokVideoResult) => void
}

export function TikTokResultCard({ video, isSelected, onSelect }: TikTokResultCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card overflow-hidden transition-all duration-200",
        "hover:border-[#00f2ea]/50 hover:shadow-lg hover:shadow-[#00f2ea]/5",
        isSelected ? "border-[#ff0050] ring-2 ring-[#ff0050]/20" : "border-border"
      )}
      onClick={() => onSelect?.(video)}
    >
      {/* Thumbnail Section - TikTok style (9:16 aspect for preview) */}
      <div className="relative aspect-[9/12] overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.caption}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <PlayIcon size={24} className="text-white ml-1 sm:w-7 sm:h-7" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium">
          {formatDuration(typeof video.duration === "string" ? parseInt(video.duration) || 0 : video.duration)}
        </div>

        {/* Opportunity Score */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
          <Badge className={cn("text-[10px] sm:text-xs backdrop-blur-sm", getOpportunityColor(video.opportunityScore))}>
            <ZapIcon size={10} className="mr-0.5 sm:mr-1 sm:w-3 sm:h-3" />
            {video.opportunityScore}%
          </Badge>
        </div>

        {/* Platform Icon */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 p-1 sm:p-1.5 rounded-lg bg-gradient-to-r from-[#ff0050] to-[#00f2ea] text-white">
          <TikTokIcon size={14} className="sm:w-4 sm:h-4" />
        </div>

        {/* Bottom Stats Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
          <div className="flex items-center gap-2 sm:gap-3 text-white">
            <div className="flex items-center gap-1">
              <ViewsIcon size={12} className="sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-medium">{formatViews(video.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <LikeIcon size={12} className="sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-medium">{formatViews(video.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <CommentIcon size={12} className="sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-medium">{formatViews(video.comments)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
        {/* Caption */}
        <p className="text-xs sm:text-sm text-foreground line-clamp-2 leading-snug">
          {video.caption}
        </p>

        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border">
            <Image
              src={video.creatorAvatar}
              alt={video.creatorName}
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-medium text-foreground truncate">@{video.creatorUsername}</span>
            {video.creatorVerified && (
              <VerifiedIcon size={10} className="text-[#00f2ea] flex-shrink-0 sm:w-3 sm:h-3" />
            )}
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto flex-shrink-0">
            {formatViews(video.creatorFollowers)} fans
          </span>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
          <div className="text-center p-1 sm:p-1.5 rounded-lg bg-muted/50">
            <ShareIcon size={12} className="mx-auto text-muted-foreground sm:w-4 sm:h-4" />
            <p className="text-[10px] sm:text-xs font-semibold mt-0.5">{formatViews(video.shares)}</p>
          </div>
          <div className="text-center p-1 sm:p-1.5 rounded-lg bg-muted/50">
            <PlayIcon size={12} className="mx-auto text-muted-foreground sm:w-4 sm:h-4" />
            <p className="text-[10px] sm:text-xs font-semibold mt-0.5">{formatViews(video.plays)}</p>
          </div>
          <div className={cn(
            "text-center p-1 sm:p-1.5 rounded-lg col-span-3 sm:col-span-2",
            getEngagementColor(video.engagement).replace("text-", "bg-").replace("500", "500/10")
          )}>
            <p className={cn("text-[10px] sm:text-xs font-bold", getEngagementColor(video.engagement))}>
              {video.engagement.toFixed(1)}% Engagement
            </p>
          </div>
        </div>

        {/* Sound/Music */}
        {video.soundName && (
          <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-[#ff0050]/5 to-[#00f2ea]/5 border border-[#ff0050]/10">
            <MusicIcon size={12} className="text-[#ff0050] shrink-0 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {video.soundName}
            </span>
          </div>
        )}

        {/* Hashtags */}
        {video.hashtags && video.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.hashtags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-[#00f2ea]/10 text-[#00f2ea]"
              >
                #{tag}
              </Badge>
            ))}
            {video.hashtags.length > 4 && (
              <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                +{video.hashtags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-border">
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {formatDate(video.publishedAt)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 sm:h-7 px-2 text-[10px] sm:text-xs hover:bg-[#ff0050]/10 hover:text-[#ff0050]"
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
