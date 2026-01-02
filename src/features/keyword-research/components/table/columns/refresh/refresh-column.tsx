"use client"

// ============================================
// REFRESH COLUMN - Data refresh/action column
// ============================================

import { cn } from "@/lib/utils"
import { RefreshCw, MoreVertical, Trash2, Star, Copy } from "lucide-react"
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
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RefreshColumnProps {
  id: string
  lastUpdated?: Date
  isRefreshing?: boolean
  onRefresh?: () => void
  onFavorite?: () => void
  onCopy?: () => void
  onDelete?: () => void
  className?: string
}

export function RefreshColumn({
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  onFavorite,
  onCopy,
  onDelete,
  className,
}: RefreshColumnProps) {
  const formatLastUpdated = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return "Just now"
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {onRefresh && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isRefreshing ? "Refreshing..." : "Refresh data"}
            {lastUpdated && !isRefreshing && (
              <span className="text-muted-foreground ml-1">
                • {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onFavorite && (
            <DropdownMenuItem onClick={onFavorite}>
              <Star className="mr-2 h-4 w-4" />
              Add to favorites
            </DropdownMenuItem>
          )}
          {onCopy && (
            <DropdownMenuItem onClick={onCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy keyword
            </DropdownMenuItem>
          )}
          {(onFavorite || onCopy) && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
