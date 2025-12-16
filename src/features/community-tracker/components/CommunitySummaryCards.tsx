"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, HelpCircle, TrendingUp, Users, Target, Zap } from "lucide-react"
import type { CommunitySummary } from "../types"

interface CommunitySummaryCardsProps {
  summary: CommunitySummary
}

export function CommunitySummaryCards({ summary }: CommunitySummaryCardsProps) {
  const stats = [
    {
      label: "Keywords Tracked",
      value: summary.totalKeywords,
      icon: Target,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Reddit Rankings",
      value: summary.redditRanking,
      icon: MessageSquare,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Quora Rankings",
      value: summary.quoraRanking,
      icon: HelpCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Total Mentions",
      value: summary.totalMentions,
      icon: Users,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Avg Position",
      value: `#${summary.avgPosition}`,
      icon: TrendingUp,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Opportunity",
      value: `${summary.opportunityScore}%`,
      icon: Zap,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border hover:border-border/80 transition-colors">
          <CardContent className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} shrink-0`}>
              <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-bold text-foreground leading-tight">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
