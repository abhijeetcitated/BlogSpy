"use client"

import { Target, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CalendarFooter() {
  return (
    <div className="px-6 py-3 border-t border-border/50 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">📅 Seasonal</span>
        <span className="flex items-center gap-1">📈 Trends</span>
        <span className="flex items-center gap-1">🏢 Industry</span>
        <span className="flex items-center gap-1">🏆 Winners</span>
        <span className="flex items-center gap-1">
          <Target className="h-2.5 w-2.5 text-red-400" />High Impact
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 text-[10px]">
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
        <Button 
          size="sm" 
          className="h-7 text-[10px] bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Event
        </Button>
      </div>
    </div>
  )
}
