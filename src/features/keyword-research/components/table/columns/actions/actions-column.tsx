// ============================================
// TABLE COLUMNS - Actions Column
// ============================================
// Contains "Write" and "Analyze" action buttons
// ============================================

"use client"

import * as React from "react"
import { Pencil, Search, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { Keyword } from "../../../../types"

// ============================================
// TYPES
// ============================================

interface ActionsColumnProps {
  keyword: Keyword
  onWriteClick?: (keyword: Keyword) => void
  onAnalyzeClick?: (keyword: Keyword) => void
  onViewDetails?: (keyword: Keyword) => void
  onAddToList?: (keyword: Keyword) => void
  onExport?: (keyword: Keyword) => void
  compact?: boolean
  className?: string
}

// ============================================
// COMPONENT
// ============================================

export function ActionsColumn({
  keyword,
  onWriteClick,
  onAnalyzeClick,
  onViewDetails,
  onAddToList,
  onExport,
  compact = false,
  className,
}: ActionsColumnProps) {
  const handleWriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onWriteClick?.(keyword)
  }

  const handleAnalyzeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAnalyzeClick?.(keyword)
  }

  // Compact mode - show dropdown menu
  if (compact) {
    return (
      <div className={cn("flex items-center justify-end", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleWriteClick}>
              <Pencil className="h-4 w-4 mr-2" />
              Write Content
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAnalyzeClick}>
              <Search className="h-4 w-4 mr-2" />
              Analyze SERP
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(keyword)}>
                View Details
              </DropdownMenuItem>
            )}
            {onAddToList && (
              <DropdownMenuItem onClick={() => onAddToList(keyword)}>
                Add to List
              </DropdownMenuItem>
            )}
            {onExport && (
              <DropdownMenuItem onClick={() => onExport(keyword)}>
                Export Keyword
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Full mode - show both buttons
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
              onClick={handleWriteClick}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Write</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Create content for this keyword
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-blue-500/10 hover:text-blue-500"
              onClick={handleAnalyzeClick}
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Analyze</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Analyze SERP for this keyword
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* More options dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {onViewDetails && (
            <DropdownMenuItem onClick={() => onViewDetails(keyword)}>
              View Details
            </DropdownMenuItem>
          )}
          {onAddToList && (
            <DropdownMenuItem onClick={() => onAddToList(keyword)}>
              Add to List
            </DropdownMenuItem>
          )}
          {onExport && (
            <DropdownMenuItem onClick={() => onExport(keyword)}>
              Export
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ActionsColumn
