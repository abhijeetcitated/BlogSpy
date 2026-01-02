"use client"

// ============================================
// KEYWORD COLUMN - Keyword text display
// ============================================

import { cn } from "@/lib/utils"
import { Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KeywordColumnProps {
  keyword: string
  onClick?: () => void
  onCopy?: () => void
  onSearch?: () => void
  className?: string
}

export function KeywordColumn({
  keyword,
  onClick,
  onCopy,
  onSearch,
  className,
}: KeywordColumnProps) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(keyword)
    onCopy?.()
  }

  const handleSearch = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`, "_blank")
    onSearch?.()
  }

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <button
        onClick={onClick}
        className="text-left font-medium text-foreground hover:text-primary transition-colors truncate"
      >
        {keyword}
      </button>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy keyword</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleSearch}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search on Google</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
