// YouTube Result Card Component

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CopyIcon,
  ExternalLinkIcon,
} from "@/components/icons/platform-icons"
import type { VideoResult } from "../types/video-search.types"
import {
  formatViews,
  getHijackScoreColor,
  getViralPotentialColor,
  getContentAgeColor,
} from "../utils/helpers"

interface YouTubeResultCardProps {
  video: VideoResult
  rank: number
  onCopy: (text: string) => void
}

export function YouTubeResultCard({ video, rank, onCopy }: YouTubeResultCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-2.5 sm:p-4 hover:border-red-500/30 transition-colors group overflow-hidden">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-2">
        {/* Row 1: Rank + Title + Badges */}
        <div className="flex items-start gap-2">
          {/* Rank */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-[10px] sm:text-sm font-bold text-red-500">
              {rank}
            </div>
            <div className={cn(
              "w-7 h-7 sm:w-9 sm:h-9 rounded-full flex flex-col items-center justify-center border-2",
              video.hijackScore >= 80 
                ? "border-emerald-500 bg-emerald-500/10" 
                : video.hijackScore >= 60 
                ? "border-amber-500 bg-amber-500/10"
                : "border-red-500 bg-red-500/10"
            )}>
              <span className={cn("text-[9px] sm:text-xs font-bold", getHijackScoreColor(video.hijackScore))}>
                {video.hijackScore}
              </span>
            </div>
          </div>

          {/* Title + Meta */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-xs sm:text-sm text-foreground line-clamp-2">{video.title}</h3>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
              <span className="truncate max-w-[80px] sm:max-w-[120px]">{video.channel}</span>
              <span>|</span>
              <span>{video.duration}</span>
            </div>
            {/* Badges */}
            <div className="flex gap-1 mt-1">
              <Badge className={cn("text-[9px] sm:text-[10px] px-1 py-0 capitalize", getViralPotentialColor(video.viralPotential))}>
                {video.viralPotential}
              </Badge>
              <Badge variant="outline" className={cn("text-[9px] sm:text-[10px] px-1 py-0", getContentAgeColor(video.contentAge))}>
                {video.contentAge}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7"
              onClick={() => onCopy(video.title)}
            >
              <CopyIcon size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7"
              onClick={() => window.open(video.videoUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLinkIcon size={12} />
            </Button>
          </div>
        </div>

        {/* Row 2: Stats - 4 column grid that fits */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          <div className="text-center p-1 sm:p-1.5 rounded-md bg-muted/30">
            <p className="font-bold text-foreground text-[10px] sm:text-xs">{formatViews(video.views)}</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">views</p>
          </div>
          <div className="text-center p-1 sm:p-1.5 rounded-md bg-muted/30">
            <p className="font-bold text-foreground text-[10px] sm:text-xs">{formatViews(video.likes)}</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">likes</p>
          </div>
          <div className="text-center p-1 sm:p-1.5 rounded-md bg-muted/30">
            <p className="font-bold text-foreground text-[10px] sm:text-xs">{formatViews(video.comments)}</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">cmts</p>
          </div>
          <div className="text-center p-1 sm:p-1.5 rounded-md bg-emerald-500/10">
            <p className="font-bold text-emerald-500 text-[10px] sm:text-xs">{video.engagement.toFixed(1)}%</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">eng</p>
          </div>
        </div>

        {/* Row 3: Tags */}
        <div className="flex gap-1 flex-wrap">
          {video.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[9px] sm:text-[10px] px-1.5 py-0 bg-red-500/10 text-red-500 cursor-pointer"
              onClick={() => onCopy(tag)}
            >
              {tag}
            </Badge>
          ))}
          {video.tags.length > 3 && (
            <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0">
              +{video.tags.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
