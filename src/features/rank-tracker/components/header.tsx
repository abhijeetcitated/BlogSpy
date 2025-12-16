// ============================================
// RANK TRACKER - Header Component
// ============================================

"use client"

import { RefreshCw, Plus, Bell, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RankTrackerHeaderProps {
  lastUpdated: string
  onRefresh: () => void
  onAddKeywords: () => void
  onOpenNotifications: () => void
  onExport: () => void
  isRefreshing?: boolean
}

/**
 * Header with title and action buttons
 */
export function RankTrackerHeader({
  lastUpdated,
  onRefresh,
  onAddKeywords,
  onOpenNotifications,
  onExport,
  isRefreshing = false,
}: RankTrackerHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rank Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        {/* Notifications */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenNotifications}
          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Bell className="w-4 h-4" />
        </Button>

        {/* Add Keywords */}
        <Button
          size="sm"
          onClick={onAddKeywords}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Keywords
        </Button>
      </div>
    </div>
  )
}
