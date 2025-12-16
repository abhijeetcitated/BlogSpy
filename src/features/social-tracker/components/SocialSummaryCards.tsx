"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Eye, Zap } from "lucide-react"
import { PinterestIcon, XIcon, InstagramIcon } from "./SocialPlatformTabs"
import type { SocialSummary } from "../types"

interface SocialSummaryCardsProps {
  summary: SocialSummary
}

export function SocialSummaryCards({ summary }: SocialSummaryCardsProps) {
  const stats = [
    {
      label: "Pinterest",
      value: summary.pinterestRanking,
      icon: PinterestIcon,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "X",
      value: summary.twitterRanking,
      icon: XIcon,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Instagram",
      value: summary.instagramRanking,
      icon: InstagramIcon,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      label: "Impressions",
      value: summary.totalImpressions > 1000 
        ? `${(summary.totalImpressions / 1000).toFixed(0)}K` 
        : summary.totalImpressions,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Avg Engagement",
      value: `${summary.avgEngagement}%`,
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Trending",
      value: summary.trendingCount,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-3 sm:p-3 md:p-4">
            {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
            <div className="flex sm:block items-center gap-3 sm:gap-0">
              <div className={`p-1.5 sm:p-1.5 rounded-lg ${stat.bgColor} shrink-0 sm:mb-2 w-fit`}>
                <stat.icon className={`w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${stat.color}`} />
              </div>
              <div className="flex-1 sm:flex-none">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
