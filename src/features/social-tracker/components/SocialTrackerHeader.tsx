/**
 * Social Tracker Header Component
 * Page header with refresh and add buttons
 */

"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Plus } from "lucide-react"
import { SocialTrackerIcon } from "./SocialPlatformTabs"

interface SocialTrackerHeaderProps {
  isRefreshing: boolean
  onRefresh: () => void
  onAddKeyword: () => void
}

export const SocialTrackerHeader = memo(function SocialTrackerHeader({
  isRefreshing,
  onRefresh,
  onAddKeyword,
}: SocialTrackerHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-pink-500/10 shrink-0">
          <SocialTrackerIcon className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Social Tracker</h1>
            <Badge variant="outline" className="border-pink-500/30 text-pink-500 dark:text-pink-400">
              3 Platforms
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 line-clamp-1 sm:line-clamp-none">
            Track keyword visibility across Pinterest, X & Instagram
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-xs sm:text-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
          <span className="sm:hidden">Sync</span>
        </Button>
        <Button 
          size="sm"
          className="bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm"
          onClick={onAddKeyword}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Add Keywords
        </Button>
      </div>
    </div>
  )
})
