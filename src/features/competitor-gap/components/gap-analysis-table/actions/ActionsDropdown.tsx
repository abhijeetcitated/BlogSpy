"use client"

import { MoreHorizontal, Pencil, CalendarPlus, ExternalLink, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GapKeyword } from "../../../types"

interface ActionsDropdownProps {
  keyword: GapKeyword
  isAdded: boolean
  onWrite: () => void
  onAddToCalendar: () => void
  onViewSerp: () => void
  onCopy: () => void
}

export function ActionsDropdown({ 
  keyword, 
  isAdded,
  onWrite,
  onAddToCalendar,
  onViewSerp,
  onCopy 
}: ActionsDropdownProps) {
  const handleCopy = () => {
    onCopy()
    toast.success("✓ Copied to Clipboard", {
      description: `"${keyword.keyword}"`,
      duration: 2000,
    })
  }

  const handleAddToCalendar = () => {
    if (!isAdded) {
      onAddToCalendar()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onWrite} className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400">
          <Pencil className="w-4 h-4 mr-2.5" />
          Write Article
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddToCalendar} disabled={isAdded}>
          {isAdded ? (
            <>
              <Check className="w-4 h-4 mr-2.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Added to Calendar</span>
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4 mr-2.5" />
              Add to Calendar
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onViewSerp}>
          <ExternalLink className="w-4 h-4 mr-2.5" />
          View in Google
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2.5" />
          Copy Keyword
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
