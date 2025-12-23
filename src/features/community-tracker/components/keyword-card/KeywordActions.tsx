/**
 * Keyword Actions Component
 * Dropdown menu with actions for keywords
 */

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Copy, Hash, Users, ExternalLink, Trash2 } from "lucide-react"

interface KeywordActionsProps {
  keyword: string
  keywordId: string
  platform: "reddit" | "quora"
  subreddits?: string[]
  onCopyKeyword: () => void
  onCopyHashtag: () => void
  onCopySubreddits?: () => void
  onOpenPlatform: () => void
  onDelete?: (keywordId: string) => void
}

export function KeywordActions({
  keyword,
  keywordId,
  platform,
  subreddits,
  onCopyKeyword,
  onCopyHashtag,
  onCopySubreddits,
  onOpenPlatform,
  onDelete,
}: KeywordActionsProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(keywordId)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCopyKeyword}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Keyword
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopyHashtag}>
          <Hash className="w-4 h-4 mr-2" />
          Copy as Hashtag
        </DropdownMenuItem>
        {subreddits && subreddits.length > 0 && onCopySubreddits && (
          <DropdownMenuItem onClick={onCopySubreddits}>
            <Users className="w-4 h-4 mr-2" />
            Copy Subreddits
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onOpenPlatform}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Search on {platform === "reddit" ? "Reddit" : "Quora"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Keyword
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
