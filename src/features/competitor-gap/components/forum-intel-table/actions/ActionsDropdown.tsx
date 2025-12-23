"use client"

import { MoreHorizontal, Pencil, CalendarPlus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ForumIntelPost } from "../../../types"

interface ActionsDropdownProps {
  post: ForumIntelPost
  onWrite: () => void
  onAddToCalendar: () => void
  onViewSource: () => void
}

export function ActionsDropdown({ 
  post,
  onWrite,
  onAddToCalendar,
  onViewSource,
}: ActionsDropdownProps) {
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onWrite} className="text-emerald-600 dark:text-emerald-400">
          <Pencil className="w-4 h-4 mr-2.5" />
          Write Article
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddToCalendar}>
          <CalendarPlus className="w-4 h-4 mr-2.5" />
          Add to Content Calendar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onViewSource}>
          <ExternalLink className="w-4 h-4 mr-2.5" />
          View Original Discussion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
