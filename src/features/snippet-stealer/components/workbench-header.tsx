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
    <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-lg text-foreground">{snippet.keyword}</h2>
        <Badge variant="secondary" className="text-xs">
          <Search className="h-3 w-3 mr-1" />
          {formatVolume(snippet.volume)} volume
        </Badge>
        {isSaved && (
          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Saved
          </Badge>
        )}
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => onViewModeChange("editor")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            viewMode === "editor"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PenLine className="h-3.5 w-3.5" />
          Editor
        </button>
        <button
          onClick={() => onViewModeChange("preview")}
          disabled={!hasContent}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            viewMode === "preview"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
            !hasContent && "opacity-50 cursor-not-allowed"
          )}
        >
          <Monitor className="h-3.5 w-3.5" />
          Google Preview
        </button>
      </div>
    </div>
  )
}
