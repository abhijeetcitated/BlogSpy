"use client"

import { cn } from "@/lib/utils"
import type { GapType, GapStats } from "../types"
import { GAP_TYPE_COLORS, GAP_TYPE_INFO } from "../constants"

// ============================================
// GAP STATS CARDS - Filter buttons with stats
// ============================================

interface GapStatsCardsProps {
  stats: GapStats
  selectedGapType: GapType
  onSelect: (type: GapType) => void
}

const GAP_TYPES: GapType[] = ["missing", "weak", "strong", "shared"]

/**
 * Interactive stat cards for filtering by gap type
 */
export function GapStatsCards({ stats, selectedGapType, onSelect }: GapStatsCardsProps) {
  return (
    <div className="flex-1 grid grid-cols-4 gap-3">
      {GAP_TYPES.map((type) => {
        const colors = GAP_TYPE_COLORS[type]
        const info = GAP_TYPE_INFO[type]
        const isSelected = selectedGapType === type
        const count = stats[type]

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              "p-3 rounded-lg border transition-all text-left",
              isSelected
                ? `${colors.bg} ${colors.border}`
                : "bg-secondary/30 border-border hover:border-opacity-30",
              isSelected ? "" : `hover:border-${type === "missing" ? "amber" : type === "weak" ? "orange" : type === "strong" ? "emerald" : "purple"}-500/30`
            )}
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isSelected ? `${colors.dot} animate-pulse` : `${colors.dot}/50`
                )}
              />
              <span className={isSelected ? colors.text : "text-muted-foreground"}>
                {info.label}
              </span>
            </div>
            <div
              className={cn(
                "mt-1 text-xl font-bold font-mono",
                isSelected ? colors.text : "text-foreground"
              )}
            >
              {count}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {info.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
