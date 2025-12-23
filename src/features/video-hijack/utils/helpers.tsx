// Video Hijack Helper Functions

import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import {
  EvergreenIcon,
  SeasonalIcon,
  BoltIcon,
  ChartIcon,
} from "@/components/icons/platform-icons"

/**
 * Format view count to human readable format
 */
export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

/**
 * Get competition badge color classes
 */
export function getCompetitionColor(competition: string): string {
  switch (competition) {
    case "low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/30"
    case "high": return "text-red-500 bg-red-500/10 border-red-500/30"
    default: return "text-muted-foreground"
  }
}

/**
 * Get hijack score text color
 */
export function getHijackScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-amber-500"
  return "text-red-500"
}

/**
 * Get hijack score background color
 */
export function getHijackScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

/**
 * Get viral potential badge classes
 */
export function getViralPotentialColor(potential: string): string {
  switch (potential) {
    case "high": return "text-emerald-500 bg-emerald-500/10"
    case "medium": return "text-amber-500 bg-amber-500/10"
    case "low": return "text-slate-500 bg-slate-500/10"
    default: return "text-muted-foreground"
  }
}

/**
 * Get content age text color
 */
export function getContentAgeColor(age: string): string {
  switch (age) {
    case "fresh": return "text-emerald-500"
    case "aging": return "text-amber-500"
    case "outdated": return "text-red-500"
    default: return "text-muted-foreground"
  }
}

/**
 * Get seasonality icon component
 */
export function getSeasonalityIcon(seasonality: string): React.ReactNode {
  switch (seasonality) {
    case "evergreen": return <EvergreenIcon size={24} className="text-emerald-500" />
    case "seasonal": return <SeasonalIcon size={24} className="text-blue-500" />
    case "trending": return <BoltIcon size={24} className="text-orange-500" />
    default: return <ChartIcon size={24} className="text-muted-foreground" />
  }
}

/**
 * Get volume trend icon and color
 */
export function getVolumeTrendIcon(trend: string): { icon: typeof ArrowUp; color: string } {
  switch (trend) {
    case "up": return { icon: ArrowUp, color: "text-emerald-500" }
    case "down": return { icon: ArrowDown, color: "text-red-500" }
    default: return { icon: Minus, color: "text-muted-foreground" }
  }
}

// Items per page constant
export const ITEMS_PER_PAGE = 10
