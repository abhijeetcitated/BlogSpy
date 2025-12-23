"use client"

import { Search, PenLine, Monitor, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatVolume } from "../utils/snippet-utils"
import type { SnippetOpportunity, ViewMode } from "../types"

interface WorkbenchHeaderProps {
  snippet: SnippetOpportunity
  viewMode: ViewMode
  isSaved: boolean
  hasContent: boolean
  onViewModeChange: (mode: ViewMode) => void
}

export function WorkbenchHeader({
  snippet,
  viewMode,
  isSaved,
  hasContent,
  onViewModeChange,
}: WorkbenchHeaderProps) {
  return (
    <div className="p-2 sm:p-3 md:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 bg-card/50">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
        <h2 className="font-semibold text-lg sm:text-xl text-foreground">{snippet.keyword}</h2>
        <Badge variant="secondary" className="text-xs sm:text-sm">
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
          {formatVolume(snippet.volume)} volume
        </Badge>
        {isSaved && (
          <Badge className="text-xs sm:text-sm bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Saved
          </Badge>
        )}
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex items-center gap-0.5 sm:gap-1 bg-muted rounded-lg p-0.5 sm:p-1">
        <button
          onClick={() => onViewModeChange("editor")}
          className={cn(
            "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all touch-manipulation min-h-[40px] sm:min-h-0",
            viewMode === "editor"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PenLine className="h-4 w-4" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => onViewModeChange("preview")}
          disabled={!hasContent}
          className={cn(
            "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all touch-manipulation min-h-[40px] sm:min-h-0",
            viewMode === "preview"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
            !hasContent && "opacity-50 cursor-not-allowed"
          )}
        >
          <Monitor className="h-4 w-4" />
          <span>Preview</span>
        </button>
      </div>
    </div>
  )
}
