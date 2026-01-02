"use client"

// ============================================
// SERP COLUMN - SERP features display
// ============================================

import { cn } from "@/lib/utils"
import { 
  Image, 
  Video, 
  MapPin, 
  ShoppingBag, 
  Star,
  MessageSquare,
  Newspaper,
  HelpCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SerpFeature = 
  | "featured_snippet"
  | "image_pack"
  | "video"
  | "local_pack"
  | "shopping"
  | "reviews"
  | "people_also_ask"
  | "news"
  | "knowledge_panel"

interface SerpColumnProps {
  features: SerpFeature[]
  maxDisplay?: number
  className?: string
}

const serpConfig: Record<SerpFeature, {
  label: string
  icon: typeof Image
  color: string
}> = {
  featured_snippet: {
    label: "Featured Snippet",
    icon: Star,
    color: "text-yellow-500",
  },
  image_pack: {
    label: "Image Pack",
    icon: Image,
    color: "text-blue-500",
  },
  video: {
    label: "Video",
    icon: Video,
    color: "text-red-500",
  },
  local_pack: {
    label: "Local Pack",
    icon: MapPin,
    color: "text-green-500",
  },
  shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    color: "text-purple-500",
  },
  reviews: {
    label: "Reviews",
    icon: Star,
    color: "text-orange-500",
  },
  people_also_ask: {
    label: "People Also Ask",
    icon: HelpCircle,
    color: "text-cyan-500",
  },
  news: {
    label: "News",
    icon: Newspaper,
    color: "text-indigo-500",
  },
  knowledge_panel: {
    label: "Knowledge Panel",
    icon: MessageSquare,
    color: "text-emerald-500",
  },
}

export function SerpColumn({
  features,
  maxDisplay = 4,
  className,
}: SerpColumnProps) {
  if (!features || features.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  const displayFeatures = features.slice(0, maxDisplay)
  const remaining = features.length - maxDisplay

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {displayFeatures.map((feature) => {
        const config = serpConfig[feature]
        if (!config) return null
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
            {features.slice(maxDisplay).map(f => serpConfig[f]?.label).join(", ")}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
