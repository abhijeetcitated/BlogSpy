/**
 * Community Filter Bar Component
 * Search input for filtering keywords
 */

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface CommunityFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  resultCount: number
}

export function CommunityFilterBar({ searchQuery, onSearchChange, resultCount }: CommunityFilterBarProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 sm:h-10 text-sm"
        />
      </div>
      <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
        {resultCount} keywords
      </span>
    </div>
  )
}
