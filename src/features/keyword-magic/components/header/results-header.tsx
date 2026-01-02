"use client"

// ============================================
// RESULTS HEADER - Results count and actions
// ============================================

import { Download, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResultsHeaderProps {
  totalCount: number
  filteredCount: number
  selectedCount: number
  onExport?: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

export function ResultsHeader({
  totalCount,
  filteredCount,
  selectedCount,
  onExport,
  onRefresh,
  isLoading = false,
}: ResultsHeaderProps) {
  const hasFilters = filteredCount !== totalCount

  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {filteredCount.toLocaleString()}
        </span>
        <span>keywords</span>
        
        {hasFilters && (
          <>
            <span className="text-muted-foreground/50">•</span>
            <span className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              filtered from {totalCount.toLocaleString()}
            </span>
          </>
        )}
        
        {selectedCount > 0 && (
          <>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-primary font-medium">
              {selectedCount} selected
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}
        
        {onExport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            disabled={filteredCount === 0}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}
      </div>
    </div>
  )
}
