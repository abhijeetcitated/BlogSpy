"use client"

import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
}

export function BulkActionsBar({ selectedCount, onClearSelection }: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="py-2.5 sm:py-3 bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-emerald-500/20 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">{selectedCount}</span>
        </div>
        <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
          topic{selectedCount > 1 ? "s" : ""} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-1 xs:flex-none"
        >
          <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
          <span className="hidden xs:inline">Add to Calendar</span>
          <span className="xs:hidden">Add</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={onClearSelection}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
