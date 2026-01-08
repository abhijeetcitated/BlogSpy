"use client"

// ============================================
// Roadmap Header Component
// ============================================

import { Zap, LayoutGrid, List, Search, FileText, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ViewMode } from "../types"

interface RoadmapHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onAutoPrioritize: () => void
  plannedCount: number
  inProgressCount: number
  totalPotential: string
}

export function RoadmapHeader({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onAutoPrioritize,
  plannedCount,
  inProgressCount,
  totalPotential,
}: RoadmapHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800 p-4">
      <div className="flex flex-col gap-4">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Content Roadmap</h1>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-9 w-64 bg-slate-800/50 border-slate-700 focus:border-purple-500 placeholder:text-slate-500"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 gap-1.5 text-xs",
                  viewMode === "board" && "bg-background shadow-sm"
                )}
                onClick={() => onViewModeChange("board")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Board
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 gap-1.5 text-xs",
                  viewMode === "list" && "bg-background shadow-sm"
                )}
                onClick={() => onViewModeChange("list")}
              >
                <List className="h-3.5 w-3.5" />
                List
              </Button>
            </div>

            {/* Auto-Prioritize Button */}
            <Button
              onClick={onAutoPrioritize}
              className="gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
            >
              <Zap className="h-4 w-4" />
              Auto-Prioritize
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Planned:</span>
            <span className="text-sm font-semibold text-foreground">{plannedCount} Articles</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-muted-foreground">In Progress:</span>
            <span className="text-sm font-semibold text-foreground">{inProgressCount}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <span className="text-sm text-muted-foreground">Traffic Potential:</span>
            <span className="text-sm font-semibold text-emerald-400">+{totalPotential}/mo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
