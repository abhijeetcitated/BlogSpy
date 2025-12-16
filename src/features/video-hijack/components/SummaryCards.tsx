"use client"

import { cn } from "@/lib/utils"
import { 
  Video, 
  AlertTriangle, 
  TrendingDown, 
  Target, 
} from "lucide-react"
import type { VideoHijackSummary } from "../types"

interface SummaryCardsProps {
  summary: VideoHijackSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: "Keywords With Video",
      value: summary.keywordsWithVideo,
      icon: Video,
      iconBg: "bg-purple-500/10 border-purple-500/20",
      iconColor: "text-purple-500",
      subText: `${Math.round((summary.keywordsWithVideo / summary.totalKeywords) * 100)}% of ${summary.totalKeywords}`,
    },
    {
      label: "High Hijack Risk",
      value: summary.highHijackCount,
      icon: AlertTriangle,
      iconBg: "bg-red-500/10 border-red-500/20",
      iconColor: "text-red-500",
      subText: "Immediate action needed",
    },
    {
      label: "Est. Clicks Lost",
      value: summary.totalClicksLost.toLocaleString(),
      icon: TrendingDown,
      iconBg: "bg-orange-500/10 border-orange-500/20",
      iconColor: "text-orange-500",
      subText: "Per month",
    },
    {
      label: "Top Opportunities",
      value: summary.topOpportunities,
      icon: Target,
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      iconColor: "text-emerald-500",
      subText: "Easy video wins",
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
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.subText}</p>
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
