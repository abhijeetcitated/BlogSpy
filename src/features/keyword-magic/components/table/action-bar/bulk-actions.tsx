"use client"

// ============================================
// BULK ACTIONS - Bulk operation buttons
// ============================================

import { Download, ListPlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BulkActionsProps {
  selectedCount: number
  onExport: () => void
  onAddToList?: () => void
  onDelete?: () => void
}

export function BulkActions({
  selectedCount,
  onExport,
  onAddToList,
  onDelete,
}: BulkActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
        <Download className="h-4 w-4" />
        Export ({selectedCount})
      </Button>

      {onAddToList && (
        <Button variant="outline" size="sm" onClick={onAddToList} className="gap-2">
          <ListPlus className="h-4 w-4" />
          Add to List
        </Button>
      )}

      {onDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive gap-2">
              <Trash2 className="h-4 w-4" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
