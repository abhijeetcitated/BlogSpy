// Video Hijack Helper Functions

import {
  EvergreenIcon,
  SeasonalIcon,
  BoltIcon,
  ChartIcon,
} from "@/components/icons/platform-icons"
import {
  formatViews,
  getCompetitionColor,
  getHijackScoreColor,
  getHijackScoreBg,
  getVolumeTrendIcon,
  ITEMS_PER_PAGE,
} from "./common.utils"

/**
 * Shared helpers re-exported for backward compatibility
 */
export {
  formatViews,
  getCompetitionColor,
  getHijackScoreColor,
  getHijackScoreBg,
  getVolumeTrendIcon,
  ITEMS_PER_PAGE,
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
