"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { FILTER_TABS } from "../constants"
import type { FilterTab, RankStats } from "../types"

interface SearchFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
  stats: RankStats
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  stats,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {FILTER_TABS.map((filter) => (
          <button
            key={filter}
            onClick={() => onTabChange(filter)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              activeTab === filter
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {filter}
            {filter === "Top 3" && ` (${stats.top3Count})`}
            {filter === "Improved" && ` (${stats.improvedCount})`}
            {filter === "Declined" && ` (${stats.declinedCount})`}
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
          className="pl-9 h-8 bg-muted border-border text-foreground placeholder:text-muted-foreground/50"
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
