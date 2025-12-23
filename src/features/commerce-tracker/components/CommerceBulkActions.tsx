"use client"

/**
 * CommerceBulkActions - Bulk actions bar for selected keywords
 * 
 * Extracted from commerce-tracker-content.tsx for better maintainability
 */

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Trash2, X } from "lucide-react"

// ============================================
// Types
// ============================================

export interface CommerceBulkActionsProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onExport: () => void
  onDelete: () => void
  onClear: () => void
}

// ============================================
// Component
// ============================================

export function CommerceBulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onExport,
  onDelete,
  onClear,
}: CommerceBulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Checkbox 
          checked={selectedCount === totalCount}
          onCheckedChange={onSelectAll}
          className="h-4 w-4 border-2"
        />
        <span className="text-xs sm:text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="outline" size="sm" onClick={onExport} className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs">
          <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
          Export
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs">
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
          Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default CommerceBulkActions
