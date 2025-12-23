/**
 * Social Keyword Card - Action Menu Component
 * Dropdown menu with copy, view, delete actions
 */

"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreVertical,
  ExternalLink,
  Copy,
  Check,
  Hash,
  Trash2
} from "lucide-react"

interface KeywordCardActionMenuProps {
  copiedKeyword: boolean
  copiedHashtags: boolean
  showHashtagsOption: boolean
  onCopyKeyword: () => void
  onCopyHashtags: () => void
  onViewDetails: () => void
  onDelete: () => void
}

export const KeywordCardActionMenu = memo(function KeywordCardActionMenu({
  copiedKeyword,
  copiedHashtags,
  showHashtagsOption,
  onCopyKeyword,
  onCopyHashtags,
  onViewDetails,
  onDelete,
}: KeywordCardActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCopyKeyword}>
          {copiedKeyword ? (
            <Check className="h-4 w-4 mr-2 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Copy Keyword
        </DropdownMenuItem>
        {showHashtagsOption && (
          <DropdownMenuItem onClick={onCopyHashtags}>
            {copiedHashtags ? (
              <Check className="h-4 w-4 mr-2 text-emerald-500" />
            ) : (
              <Hash className="h-4 w-4 mr-2" />
            )}
            Copy Hashtags
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onViewDetails}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-red-500 focus:text-red-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
