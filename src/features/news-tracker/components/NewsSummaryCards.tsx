"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Eye, MousePointer, Star, Zap, Flame } from "lucide-react"
import type { NewsSummary } from "../types"

interface NewsSummaryCardsProps {
  summary: NewsSummary
}

// Google News Icon for stats
const NewsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
    <rect x="7" y="8" width="10" height="2" rx="1" fill="currentColor"/>
    <rect x="7" y="11" width="7" height="2" rx="1" fill="currentColor"/>
    <rect x="7" y="14" width="10" height="2" rx="1" fill="currentColor"/>
  </svg>
)

// Discover Sparkle Icon
const DiscoverIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
    <path d="M12 6l1.5 3.5 3.5 1.5-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5L12 6z" fill="currentColor"/>
  </svg>
)

export function NewsSummaryCards({ summary }: NewsSummaryCardsProps) {
  const stats = [
    {
      label: "Keywords Tracked",
      value: summary.totalKeywords,
      icon: NewsIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      label: "News Rankings",
      value: summary.newsRanking,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      label: "Discover Impressions",
      value: summary.discoverImpressions > 1000 
        ? `${(summary.discoverImpressions / 1000).toFixed(0)}K` 
        : summary.discoverImpressions,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      label: "Top Stories",
      value: summary.topStories,
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      label: "Avg CTR",
      value: `${summary.avgCTR}%`,
      icon: MousePointer,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10 dark:bg-cyan-500/20",
    },
    {
      label: "Trending",
      value: summary.trendingCount,
      icon: Flame,
      color: "text-red-500",
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border hover:border-primary/30 transition-all">
          <CardContent className="p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} shrink-0`}>
              <stat.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-foreground truncate">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
