"use client"

// ============================================
// SERP COLUMN - SERP features display
// ============================================

import { cn } from "@/lib/utils"
import { Video, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SerpFeature = "featured_snippet" | "video"

interface SerpColumnProps {
  features: string[]
  maxDisplay?: number
  className?: string
}

const serpConfig: Record<SerpFeature, {
  label: string
  icon: typeof Video
  color: string
}> = {
  featured_snippet: {
    label: "Featured Snippet",
    icon: Star,
    color: "text-yellow-500",
  },
  video: {
    label: "Video",
    icon: Video,
    color: "text-red-500",
  },
}

export function SerpColumn({
  features,
  maxDisplay = 4,
  className,
}: SerpColumnProps) {
  const normalized = (features || [])
    .map((feature) => {
      const value = feature.toLowerCase()
      if (value === "snippet") return "featured_snippet"
      if (value === "video_carousel") return "video"
      return value
    })
    .filter((feature): feature is SerpFeature => feature === "featured_snippet" || feature === "video")

  if (normalized.length === 0) {
    return <span className="text-muted-foreground">-</span>
  }

  const displayFeatures = normalized.slice(0, maxDisplay)
  const remaining = normalized.length - maxDisplay

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {displayFeatures.map((feature) => {
        const config = serpConfig[feature]
        const Icon = config.icon

        return (
          <Tooltip key={feature}>
            <TooltipTrigger asChild>
              <div className={cn("p-1 rounded", config.color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>{config.label}</TooltipContent>
          </Tooltip>
        )
      })}
      {remaining > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              +{remaining}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {normalized.slice(maxDisplay).map((f) => serpConfig[f]?.label).join(", ")}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
