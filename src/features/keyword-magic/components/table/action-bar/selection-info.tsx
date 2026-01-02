"use client"

// ============================================
// SELECTION INFO - Selection count display
// ============================================

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SelectionInfoProps {
  selectedCount: number
  totalCount: number
  onClearSelection: () => void
}

export function SelectionInfo({
  selectedCount,
  totalCount,
  onClearSelection,
}: SelectionInfoProps) {
  const percentage = totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onClearSelection}
        title="Clear selection"
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="text-sm">
        <span className="font-medium text-foreground">{selectedCount.toLocaleString()}</span>
        <span className="text-muted-foreground"> of </span>
        <span className="text-foreground">{totalCount.toLocaleString()}</span>
        <span className="text-muted-foreground"> selected</span>
        {percentage > 0 && (
          <span className="text-muted-foreground ml-1">({percentage}%)</span>
        )}
      </div>
    </div>
  )
}
