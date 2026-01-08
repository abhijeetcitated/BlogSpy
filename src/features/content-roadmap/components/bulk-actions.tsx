"use client"

// ============================================
// Bulk Actions Component
// ============================================

import {
  Trash2,
  MoveRight,
  CheckSquare,
  Square,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "../types"

interface BulkActionsProps {
  selectedCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkMove: (status: TaskStatus) => void
  onBulkDelete: () => void
  totalCount: number
  allSelected: boolean
}

export function BulkActions({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkMove,
  onBulkDelete,
  totalCount,
  allSelected,
}: BulkActionsProps) {
  // Don't show anything when nothing selected - handled by parent
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md">
      {/* Selection info */}
      <Button
        variant="ghost"
        size="icon"
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="h-5 w-5"
      >
        {allSelected ? (
          <CheckSquare className="h-3.5 w-3.5 text-purple-400" />
        ) : (
          <Square className="h-3.5 w-3.5" />
        )}
      </Button>
      <span className="text-xs">
        <span className="font-medium text-purple-400">{selectedCount}</span>
      </span>

      <div className="h-3 w-px bg-slate-700 mx-1" />

      {/* Bulk Move */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-xs text-slate-300 hover:text-white"
          >
            <MoveRight className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-900 border border-slate-800 shadow-2xl rounded-lg">
          <DropdownMenuItem
            onClick={() => onBulkMove("backlog")}
            className="cursor-pointer text-sm text-slate-300 focus:bg-slate-800 focus:text-white"
          >
            💡 Backlog
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onBulkMove("ready")}
            className="cursor-pointer text-sm text-slate-300 focus:bg-slate-800 focus:text-white"
          >
            ✏️ Ready
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onBulkMove("progress")}
            className="cursor-pointer text-sm text-slate-300 focus:bg-slate-800 focus:text-white"
          >
            🔥 In Progress
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onBulkMove("published")}
            className="cursor-pointer text-sm text-slate-300 focus:bg-slate-800 focus:text-white"
          >
            ✅ Published
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bulk Delete */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBulkDelete}
        className="h-6 px-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      {/* Clear selection */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDeselectAll}
        className="h-5 w-5 text-slate-400 hover:text-white"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
