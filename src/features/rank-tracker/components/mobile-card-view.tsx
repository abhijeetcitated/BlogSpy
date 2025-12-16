// ============================================
// RANK TRACKER - Mobile Card View Component
// ============================================

"use client"

import { ExternalLink, TrendingUp, TrendingDown, Minus, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sparkline } from "@/components/charts"
import { PixelRankBadge } from "@/components/ui/pixel-rank-badge"
import { generateMockPixelRank } from "@/lib/pixel-calculator"
import { RankBadge, SerpFeatureIcon } from "./index"
import type { RankData } from "../types"

interface MobileCardViewProps {
  data: RankData[]
}

/**
 * Get change indicator icon and color
 */
function getChangeInfo(change: number) {
  if (change > 0) {
    return {
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      label: `+${change}`,
    }
  }
  if (change < 0) {
    return {
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      label: `${change}`,
    }
  }
  return {
    icon: Minus,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "0",
  }
}

/**
 * Get AI Overview badge style
 */
function getAIOverviewStyle(position: string) {
  switch (position) {
    case "cited":
      return "bg-emerald-500/20 text-emerald-400"
    case "mentioned":
      return "bg-amber-500/20 text-amber-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/**
 * Mobile-friendly card view for keyword rankings
 */
export function MobileCardView({ data }: MobileCardViewProps) {
  return (
    <div className="space-y-3 lg:hidden">
      {data.map((row) => {
        const changeInfo = getChangeInfo(row.change)
        const ChangeIcon = changeInfo.icon

        return (
          <div
            key={row.id}
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            {/* Header - Keyword & Rank */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {row.keyword}
                </h3>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-emerald-400 truncate flex items-center gap-1 mt-0.5"
                >
                  <span className="truncate max-w-48">{row.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <RankBadge rank={row.rank} />
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Change */}
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                  changeInfo.bgColor,
                  changeInfo.color
                )}
              >
                <ChangeIcon className="w-3 h-3" />
                {changeInfo.label}
              </div>

              {/* Volume */}
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground/80 font-medium">
                  {row.volume.toLocaleString()}
                </span>{" "}
                searches
              </div>

              {/* AI Overview */}
              {row.aiOverview?.inOverview && (
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                    getAIOverviewStyle(row.aiOverview.position)
                  )}
                >
                  <Eye className="w-3 h-3" />
                  {row.aiOverview.position === "cited"
                    ? "Cited"
                    : row.aiOverview.position === "mentioned"
                    ? "Mentioned"
                    : "Not in AI"}
                </div>
              )}
            </div>

            {/* Bottom Row - Pixel Rank, SERP Features, Trend */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-3">
                {/* Pixel Rank */}
                <PixelRankBadge
                  score={row.pixelRank || generateMockPixelRank(row.rank)}
                  size="sm"
                />

                {/* SERP Features */}
                {row.serpFeatures.length > 0 && (
                  <div className="flex items-center gap-1">
                    {row.serpFeatures.slice(0, 3).map((feature) => (
                      <SerpFeatureIcon key={feature} feature={feature} />
                    ))}
                    {row.serpFeatures.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{row.serpFeatures.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Trend Sparkline */}
              <div className="w-16 h-6">
                <Sparkline data={row.trendHistory} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
