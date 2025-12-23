// ============================================
// RANK TRACKER - Auto Refresh Menu Component
// ============================================

"use client"

import { memo } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AutoRefreshMenuProps {
  interval: number | null
  onStart: (minutes: number) => void
  onStop: () => void
  className?: string
}

/**
 * Auto-refresh dropdown menu for automatic data updates
 * @description Used in both mobile and desktop views
 */
export const AutoRefreshMenu = memo(function AutoRefreshMenu({
  interval,
  onStart,
  onStop,
  className,
}: AutoRefreshMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-7 text-xs bg-background border-border text-foreground hover:bg-muted ${className}`}
          aria-label={interval ? `Auto refresh every ${interval} minutes` : "Configure auto refresh"}
        >
          <Clock className="w-3 h-3 mr-1" />
          {interval ? `${interval}m` : "Auto"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border">
        <DropdownMenuItem 
          className="text-foreground focus:bg-muted" 
          onClick={() => onStart(1)}
        >
          Every 1 min
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground focus:bg-muted" 
          onClick={() => onStart(5)}
        >
          Every 5 mins
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground focus:bg-muted" 
          onClick={() => onStart(15)}
        >
          Every 15 mins
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-foreground focus:bg-muted" 
          onClick={() => onStart(30)}
        >
          Every 30 mins
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          className="text-foreground focus:bg-muted" 
          onClick={onStop} 
          disabled={!interval}
        >
          Disable Auto-refresh
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
