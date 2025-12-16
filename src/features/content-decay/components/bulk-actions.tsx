"use client"

// ============================================
// CONTENT DECAY - Bulk Actions Component
// ============================================
// Bulk selection and actions for articles

import { useCallback } from "react"
import {
  CheckSquare,
  Square,
  MinusSquare,
  CheckCircle,
  EyeOff,
  X,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { DecayArticle } from "../types"

interface BulkActionsProps {
  articles: DecayArticle[]
  selectedIds: Set<string>
  onSelectAll: () => void
  onDeselectAll: () => void
  onToggleSelect: (id: string) => void
  onBulkMarkFixed: (ids: string[]) => void
  onBulkIgnore: (ids: string[]) => void
  className?: string
}

export function BulkActions({
  articles,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onToggleSelect,
  onBulkMarkFixed,
  onBulkIgnore,
  className,
}: BulkActionsProps) {
  const selectedCount = selectedIds.size
  const totalCount = articles.length
  const isAllSelected = selectedCount > 0 && selectedCount === totalCount
  const isSomeSelected = selectedCount > 0 && selectedCount < totalCount

  const handleMarkFixedSelected = useCallback(() => {
    onBulkMarkFixed(Array.from(selectedIds))
    onDeselectAll()
  }, [selectedIds, onBulkMarkFixed, onDeselectAll])

  const handleIgnoreSelected = useCallback(() => {
    onBulkIgnore(Array.from(selectedIds))
    onDeselectAll()
  }, [selectedIds, onBulkIgnore, onDeselectAll])

  if (totalCount === 0) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2 flex-wrap", className)}>
      {/* Select All Checkbox */}
      <Button
        variant="ghost"
        size="sm"
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
        className="h-7 sm:h-8 gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground px-2 sm:px-3"
      >
        {isAllSelected ? (
          <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        ) : isSomeSelected ? (
          <MinusSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
        ) : (
          <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
        <span className="text-[10px] sm:text-xs">
          {isAllSelected ? "Deselect" : "Select all"}
        </span>
      </Button>

      {/* Selection Count */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted/50 rounded-md">
            {selectedCount} selected
          </span>

          {/* Bulk Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 sm:h-8 gap-1.5 sm:gap-2 border-primary/30 text-primary hover:bg-primary/10 text-[10px] sm:text-xs px-2 sm:px-3"
              >
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36 sm:w-44">
              <DropdownMenuItem onClick={handleMarkFixedSelected} className="text-xs sm:text-sm">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-600 dark:text-emerald-400" />
                <span>Mark as Fixed</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleIgnoreSelected} className="text-xs sm:text-sm">
                <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-muted-foreground" />
                <span>Ignore Selected</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDeselectAll} className="text-xs sm:text-sm">
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span>Clear Selection</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

// Selection checkbox component for individual articles
interface SelectionCheckboxProps {
  isSelected: boolean
  onToggle: () => void
  className?: string
}

export function SelectionCheckbox({
  isSelected,
  onToggle,
  className,
}: SelectionCheckboxProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        "flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded border transition-all",
        isSelected
          ? "bg-primary border-primary text-primary-foreground"
          : "border-muted-foreground/30 hover:border-primary/50 bg-transparent",
        className
      )}
    >
      {isSelected && <CheckSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
    </button>
  )
}
