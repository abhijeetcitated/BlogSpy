// ============================================
// RANK TRACKER - Pagination Component
// ============================================

"use client"

import { memo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  /** Compact mode for mobile */
  compact?: boolean
  className?: string
}

/**
 * Reusable pagination component
 * @description Supports both compact (mobile) and full (desktop) modes
 */
export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  compact = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Compact mode for mobile
  if (compact) {
    return (
      <div className={cn("flex items-center justify-between px-2 py-3", className)}>
        <span className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Full mode for desktop
  return (
    <div className={cn("flex items-center justify-between px-2", className)}>
      <span className="text-xs text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
          aria-label="First page"
        >
          <ChevronLeft className="w-4 h-4" />
          <ChevronLeft className="w-4 h-4 -ml-2" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  currentPage === pageNum && "bg-emerald-500 hover:bg-emerald-600"
                )}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
          aria-label="Last page"
        >
          <ChevronRight className="w-4 h-4" />
          <ChevronRight className="w-4 h-4 -ml-2" />
        </Button>
      </div>
    </div>
  )
})
