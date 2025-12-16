"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { 
  ChevronDown, 
  ChevronUp, 
  Video, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle,
  Target,
  DollarSign,
  Copy,
  ExternalLink,
  Youtube,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { VideoHijackKeyword } from "../types"
import { HijackScoreRing } from "./HijackScoreRing"
import { OpportunityBadge, PresenceBadge } from "./StatusBadges"
import { 
  formatViews, 
  getTrendColor, 
  getPlatformColor,
  calculateVideoROI 
} from "../utils/video-utils"

interface KeywordCardProps {
  keyword: VideoHijackKeyword
}

export function KeywordCard({ keyword }: KeywordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const roi = calculateVideoROI(keyword)

  const TrendIcon = keyword.trend === "up" ? TrendingUp : keyword.trend === "down" ? TrendingDown : Minus

  const handleCopy = () => {
    navigator.clipboard.writeText(keyword.keyword)
    toast.success("Copied!", {
      description: `"${keyword.keyword}" copied to clipboard`,
    })
  }

  const handleViewSERP = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword.keyword)}`, "_blank")
  }

  const handleViewVideo = (videoUrl?: string) => {
    if (videoUrl) {
      window.open(videoUrl, "_blank")
    } else {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword.keyword)}`, "_blank")
    }
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-red-500/30">
        <div className="p-4">
          {/* Main Row */}
          <div className="flex items-center gap-4">
            {/* Hijack Score */}
            <HijackScoreRing score={keyword.hijackScore} />

            {/* Keyword Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">{keyword.keyword}</h3>
                <PresenceBadge presence={keyword.videoPresence} />
                <OpportunityBadge level={keyword.opportunityLevel} />
                {keyword.hasOwnVideo && (
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    You have video
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {keyword.searchVolume.toLocaleString()}/mo
                </span>
                <span className="flex items-center gap-1">
                  Your rank: <strong className="text-foreground">{keyword.serpPosition.position || "Not ranking"}</strong>
                </span>
                {keyword.serpPosition.carouselSize > 0 && (
                  <span className="flex items-center gap-1">
                    Video carousel: <strong className="text-red-400">{keyword.serpPosition.carouselSize} videos</strong>
                  </span>
                )}
                <span className={cn("flex items-center gap-1", getTrendColor(keyword.trend))}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  {keyword.trend}
                </span>
              </div>
            </div>

            {/* Clicks Lost */}
            <div className="text-right px-4 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
              <div className="text-lg font-bold text-red-500">
                -{keyword.estimatedClicksLost.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">clicks lost/mo</div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleCopy}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy keyword</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleViewSERP}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View in Google</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={() => handleViewVideo()}
                  >
                    <Youtube className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View on YouTube</TooltipContent>
              </Tooltip>
            </div>

            {/* Expand Button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border">
              {/* Opportunity Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="rounded-xl border border-border bg-background/50 p-3 text-center">
                  <Target className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <div className="text-lg font-bold text-foreground">{formatViews(roi.potentialViews)}</div>
                  <div className="text-xs text-muted-foreground">Potential views/yr</div>
                </div>
                <div className="rounded-xl border border-border bg-background/50 p-3 text-center">
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                  <div className="text-lg font-bold text-foreground">${roi.estimatedValue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Est. traffic value/yr</div>
                </div>
                <div className="rounded-xl border border-border bg-background/50 p-3 text-center">
                  <Video className="w-4 h-4 mx-auto mb-1 text-red-500" />
                  <div className="text-lg font-bold text-foreground">{keyword.competingVideos.length}</div>
                  <div className="text-xs text-muted-foreground">Competing videos</div>
                </div>
              </div>

              {/* Competing Videos */}
              {keyword.competingVideos.length > 0 && (
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    Videos Ranking for "{keyword.keyword}"
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {keyword.competingVideos.slice(0, 5).map((video) => (
                      <div 
                        key={video.id} 
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-background border border-border/50 hover:border-border transition-colors cursor-pointer"
                        onClick={() => handleViewVideo(video.videoUrl)}
                      >
                        <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-500">
                          #{video.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{video.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className={getPlatformColor(video.platform)}>{video.channel}</span>
                            <span>•</span>
                            <span>{formatViews(video.views)} views</span>
                            <span>•</span>
                            <span>{video.duration}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
