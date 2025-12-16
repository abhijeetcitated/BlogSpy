// ============================================
// RANK TRACKER - Filter Bar Component
// ============================================

"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FILTER_TABS } from "../constants"
import type { FilterTab, RankStats } from "../types"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  activeTab: FilterTab
  searchQuery: string
  onTabChange: (tab: FilterTab) => void
  onSearchChange: (query: string) => void
  stats: RankStats
}

/**
 * Filter tabs and search bar for rankings
 */
export function FilterBar({
  activeTab,
  searchQuery,
  onTabChange,
  onSearchChange,
  stats,
}: FilterBarProps) {
  const getTabCount = (tab: FilterTab): string | null => {
    switch (tab) {
      case "Top 3":
        return `(${stats.top3Count})`
      case "Improved":
        return `(${stats.improvedCount})`
      case "Declined":
        return `(${stats.declinedCount})`
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab}
            {getTabCount(tab) && ` ${getTabCount(tab)}`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search keywords..."
          className="pl-9 h-8 bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
