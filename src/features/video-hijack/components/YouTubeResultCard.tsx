// YouTube Result Card Component

"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyIcon, ExternalLinkIcon } from "@/components/icons/platform-icons"
import type { VideoResult } from "../types/video-search.types"
import { formatViews, getHijackScoreColor, getViralPotentialColor } from "../utils/helpers"
import { formatDate } from "../utils/common.utils"
import { handleFeatureAccess } from "@/lib/feature-guard"
import { VideoPreviewModal } from "./modals/video-preview-modal"

interface YouTubeResultCardProps {
  video: VideoResult
  rank: number
  onCopy: (text: string) => void
}

export function YouTubeResultCard({ video, rank, onCopy }: YouTubeResultCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  const difficulty =
    video.hijackScore >= 70 ? "Easy" : video.hijackScore >= 50 ? "Medium" : "Hard"
  const difficultyClass =
    difficulty === "Easy"
      ? "bg-emerald-500/10 text-emerald-500"
      : difficulty === "Medium"
      ? "bg-amber-500/10 text-amber-500"
      : "bg-red-500/10 text-red-500"
  const thumbnailSrc =
    video.thumbnailUrl || "https://placehold.co/600x400/000000/FFF?text=Video"

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-red-500/30 transition-colors overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className="group relative w-full sm:w-[180px] aspect-video shrink-0 overflow-hidden rounded-md bg-muted cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          <img
            src={thumbnailSrc}
            alt={video.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
            {video.duration}
          </div>
          <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            #{rank}
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
                {video.title}
              </h3>
              <div className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{video.channel}</span>
                <span className="mx-1 text-muted-foreground">•</span>
                <span>{video.subscribers} Subs</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Published {formatDate(video.publishedAt)}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  "h-12 w-12 rounded-full border-2 bg-muted/30 text-xs font-bold flex items-center justify-center",
                  getHijackScoreColor(video.hijackScore)
                )}
              >
                {video.hijackScore}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn("text-[10px] sm:text-xs capitalize", getViralPotentialColor(video.viralPotential))}
            >
              {video.viralPotential}
            </Badge>
            <Badge className={cn("text-[10px] sm:text-xs", difficultyClass)}>
              {difficulty}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center sm:max-w-sm">
            <div className="rounded-md bg-muted/30 p-2">
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                {formatViews(video.views)}
              </p>
              <p className="text-[10px] text-muted-foreground">Views</p>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                {formatViews(video.likes)}
              </p>
              <p className="text-[10px] text-muted-foreground">Likes</p>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                {formatViews(video.comments)}
              </p>
              <p className="text-[10px] text-muted-foreground">Comments</p>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col gap-2 sm:items-end sm:justify-between">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onCopy(video.title)}
            >
              <CopyIcon size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(video.videoUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLinkIcon size={14} />
            </Button>
          </div>
          <Button
            size="sm"
            className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
            onClick={() => handleFeatureAccess("AI_WRITER", () => {})}
          >
            Generate Script 📜
          </Button>
        </div>
      </div>

      <VideoPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        videoUrl={video.videoUrl}
        title={video.title}
      />
    </div>
  )
}
