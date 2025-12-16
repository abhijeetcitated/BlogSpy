// ============================================
// RANK TRACKER - Rank Badge Component
// ============================================

"use client"

import { RANK_BADGE_STYLES } from "../constants"

interface RankBadgeProps {
  rank: number
  size?: "sm" | "md" | "lg"
}

/**
 * Displays rank position with color-coded styling
 */
export function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  const getStyle = () => {
    if (rank <= 3) return RANK_BADGE_STYLES.top3
    if (rank <= 10) return RANK_BADGE_STYLES.top10
    return RANK_BADGE_STYLES.default
  }

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-8 h-6 text-xs"
      case "lg":
        return "w-12 h-8 text-base"
      case "md":
      default:
        return "w-10 h-7 text-sm"
    }
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md ${getSizeClass()} ${getStyle()}`}
    >
      #{rank}
    </span>
  )
}
