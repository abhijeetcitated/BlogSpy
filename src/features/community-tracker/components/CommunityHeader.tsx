/**
 * Community Tracker Header Component
 * Displays title, badge, and action buttons (Refresh, Add Keywords)
 */

import { Button } from "@/components/ui/button"
import { RefreshCw, Plus, Loader2 } from "lucide-react"

// Custom Community Icon
function CommunityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

interface CommunityHeaderProps {
  isRefreshing: boolean
  onRefresh: () => void
  onAddKeyword: () => void
}

export function CommunityHeader({ isRefreshing, onRefresh, onAddKeyword }: CommunityHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
          <CommunityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Community Tracker</h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              2 Platforms
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Track visibility on Reddit & Quora
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-1.5" />
          )}
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={onAddKeyword}
          className="h-9 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Keywords
        </Button>
      </div>
    </div>
  )
}
