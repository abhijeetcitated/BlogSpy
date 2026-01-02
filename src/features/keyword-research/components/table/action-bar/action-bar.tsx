"use client"

// ============================================
// ACTION BAR - Selection action bar container
// ============================================

import { cn } from "@/lib/utils"
import { SelectionInfo } from "./selection-info"
import { BulkActions } from "./bulk-actions"

interface ActionBarProps {
  selectedCount: number
  totalCount: number
  onExport: () => void
  onAddToList?: () => void
  onDelete?: () => void
  onClearSelection: () => void
  className?: string
}

export function ActionBar({
  selectedCount,
  totalCount,
  onExport,
  onAddToList,
  onDelete,
  onClearSelection,
  className,
}: ActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg",
        className
      )}
    >
      <SelectionInfo
        selectedCount={selectedCount}
        totalCount={totalCount}
        onClearSelection={onClearSelection}
      />
      <BulkActions
        onExport={onExport}
        onAddToList={onAddToList}
        onDelete={onDelete}
        selectedCount={selectedCount}
      />
    </div>
  )
}
