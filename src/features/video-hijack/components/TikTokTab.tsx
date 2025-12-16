"use client"

import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { 
  Music, 
  Eye, 
  Heart, 
  TrendingUp, 
  Sparkles,
  Target,
  Copy,
  ExternalLink,
} from "lucide-react"
import type { TikTokHijackKeyword } from "../__mocks__/tiktok-data"

interface TikTokKeywordCardProps {
  keyword: TikTokHijackKeyword
}

export function TikTokKeywordCard({ keyword }: TikTokKeywordCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(keyword.keyword)
    toast.success("Copied!", {
      description: `"${keyword.keyword}" copied to clipboard`,
    })
  }

  const handleViewOnTikTok = () => {
    window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(keyword.keyword)}`, "_blank")
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border bg-card hover:border-cyan-500/30 transition-all overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{keyword.keyword}</h3>
                {keyword.trending && (
                  <Badge className="bg-cyan-500/20 text-cyan-500 text-[10px] border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {keyword.searchVolume.toLocaleString()} monthly searches
              </p>
            </div>
            
            {/* Hijack Score Ring */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${keyword.hijackScore * 1.26} 126`}
                  className={cn(
                    keyword.hijackScore >= 70 ? "text-red-500" :
                    keyword.hijackScore >= 50 ? "text-amber-500" : "text-emerald-500"
                  )}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {keyword.hijackScore}
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg border border-border bg-background/50">
              <Eye className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
              <span className="text-xs font-medium text-foreground">
                {(keyword.totalViews / 1000000).toFixed(1)}M
              </span>
              <span className="text-[10px] text-muted-foreground block">Total Views</span>
            </div>
            <div className="text-center p-2 rounded-lg border border-border bg-background/50">
              <Heart className="w-3.5 h-3.5 mx-auto text-red-500 mb-1" />
              <span className="text-xs font-medium text-foreground">
                {(keyword.avgEngagement * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-muted-foreground block">Avg Engage</span>
            </div>
            <div className="text-center p-2 rounded-lg border border-border bg-background/50">
              <Target className="w-3.5 h-3.5 mx-auto text-cyan-500 mb-1" />
              <span className={cn(
                "text-xs font-medium capitalize",
                keyword.difficulty === "easy" ? "text-emerald-500" :
                keyword.difficulty === "medium" ? "text-amber-500" : "text-red-500"
              )}>
                {keyword.difficulty}
              </span>
              <span className="text-[10px] text-muted-foreground block">Difficulty</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-3">
            <Button 
              onClick={handleViewOnTikTok}
              size="sm"
              variant="outline"
              className="flex-1 border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              View on TikTok
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 border-border"
                  onClick={handleCopy}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy keyword</TooltipContent>
            </Tooltip>
          </div>

          {/* Top Videos Preview */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Top Videos:</span>
            {keyword.topVideos.slice(0, 2).map((video, i) => (
              <div 
                key={video.id} 
                className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:border-border"
                onClick={() => window.open(`https://www.tiktok.com/@${video.creator}`, "_blank")}
              >
                <span className="text-xs text-muted-foreground w-4 font-medium">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{video.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>@{video.creator}</span>
                    <span>•</span>
                    <span>{(video.views / 1000).toFixed(0)}K views</span>
                    <span>•</span>
                    <span>{(video.likes / 1000).toFixed(0)}K likes</span>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

// TikTok Summary Cards
export function TikTokSummaryCards({ summary }: { 
  summary: {
    totalKeywords: number
    avgHijackScore: number
    trendingCount: number
    highOpportunity: number
    totalViews: number
    avgEngagement: number
  }
}) {
  const cards = [
    {
      label: "TikTok Keywords",
      value: summary.totalKeywords,
      icon: Music,
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      iconColor: "text-cyan-500",
    },
    {
      label: "Avg Hijack Score",
      value: `${summary.avgHijackScore}%`,
      icon: Target,
      iconBg: "bg-amber-500/10 border-amber-500/20",
      iconColor: "text-amber-500",
      valueColor: summary.avgHijackScore >= 70 ? "text-red-500" : summary.avgHijackScore >= 50 ? "text-amber-500" : "text-emerald-500",
    },
    {
      label: "Trending Now",
      value: summary.trendingCount,
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      iconColor: "text-emerald-500",
    },
    {
      label: "High Opportunity",
      value: summary.highOpportunity,
      icon: Sparkles,
      iconBg: "bg-red-500/10 border-red-500/20",
      iconColor: "text-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div 
          key={card.label}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <p className={cn("text-3xl font-bold", card.valueColor || "text-foreground")}>
                {card.value}
              </p>
            </div>
            <div className={cn(
              "p-2.5 rounded-xl border",
              card.iconBg
            )}>
              <card.icon className={cn("w-5 h-5", card.iconColor)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// TikTok Keyword List
export function TikTokKeywordList({ keywords }: { keywords: TikTokHijackKeyword[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {keywords.map((keyword) => (
        <TikTokKeywordCard key={keyword.id} keyword={keyword} />
      ))}
    </div>
  )
}
