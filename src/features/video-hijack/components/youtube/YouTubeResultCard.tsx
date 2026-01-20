// YouTube Video Result Card Component

"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ViewsIcon,
  LikeIcon,
  CommentIcon,
} from "@/components/icons/platform-icons"
import type { YouTubeVideoResult } from "../../types/youtube.types"
import { formatViews, getOpportunityColor } from "../../utils/common.utils"
import { formatDuration } from "../../utils/youtube.utils"
import { handleFeatureAccess } from "@/lib/feature-guard"

interface YouTubeResultCardProps {
  video: YouTubeVideoResult
  isSelected?: boolean
  onSelect?: (video: YouTubeVideoResult) => void
}

export function YouTubeResultCard({ video, isSelected, onSelect }: YouTubeResultCardProps) {
  const thumbnail =
    video.thumbnailUrl ||
    video.thumbnail ||
    `https://picsum.photos/seed/${encodeURIComponent(video.id)}/640/360`
  const subscribers =
    video.subscribers ||
    (Number.isFinite(video.channelSubs) ? `${formatViews(video.channelSubs)} Subs` : "Subs N/A")

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card overflow-hidden transition-all duration-200",
        "hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5",
        isSelected ? "border-red-500 ring-2 ring-red-500/20" : "border-border"
      )}
      onClick={() => onSelect?.(video)}
    >
      <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-[180px] aspect-video rounded-md overflow-hidden shrink-0">
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-1.5 right-1.5 rounded bg-black/80 text-white text-[10px] px-1.5 py-0.5">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
            {video.title}
          </h3>
          <div className="text-xs text-muted-foreground">
            <span className="truncate">{video.channelName}</span>
            <span className="mx-1">·</span>
            <span>{subscribers}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge className={cn("text-[10px] px-1.5 py-0.5", getOpportunityColor(video.opportunityScore))}>
              Hijack {video.opportunityScore}%
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 capitalize">
              {video.viralPotential}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 capitalize">
              {video.contentAge}
            </Badge>
          </div>
          {video.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        {/* Right */}
        <div className="flex sm:flex-col justify-between sm:items-end gap-2 sm:gap-3">
          <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ViewsIcon size={14} />
              <span className="font-semibold text-foreground">{formatViews(video.views)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <LikeIcon size={14} />
              <span className="font-semibold text-foreground">{formatViews(video.likes)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <CommentIcon size={14} />
              <span className="font-semibold text-foreground">{formatViews(video.comments)}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              handleFeatureAccess("AI_WRITER", () => {})
            }}
          >
            Generate Script 📜
          </Button>
        </div>
      </div>
    </div>
  )
}
