"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { ALL_PRESENCES, ALL_OPPORTUNITY_LEVELS } from "../constants"
import { getPresenceLabel, getSortLabel } from "../utils/video-utils"
import type { VideoPresence, VideoOpportunityLevel, SortByOption, SortOrder } from "../types"

interface VideoFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  presenceFilter: VideoPresence[]
  onPresenceChange: (value: VideoPresence[]) => void
  opportunityFilter: VideoOpportunityLevel[]
  onOpportunityChange: (value: VideoOpportunityLevel[]) => void
  sortBy: SortByOption
  onSortByChange: (value: SortByOption) => void
  sortOrder: SortOrder
  onSortOrderChange: (value: SortOrder) => void
}

export function VideoFilters({
  searchQuery,
  onSearchChange,
  presenceFilter,
  onPresenceChange,
  opportunityFilter,
  onOpportunityChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: VideoFiltersProps) {
  const togglePresence = (presence: VideoPresence) => {
    if (presenceFilter.includes(presence)) {
      onPresenceChange(presenceFilter.filter((p) => p !== presence))
    } else {
      onPresenceChange([...presenceFilter, presence])
    }
  }

  const toggleOpportunity = (level: VideoOpportunityLevel) => {
    if (opportunityFilter.includes(level)) {
      onOpportunityChange(opportunityFilter.filter((l) => l !== level))
    } else {
      onOpportunityChange([...opportunityFilter, level])
    }
  }

  const sortOptions: SortByOption[] = ["hijackScore", "opportunityScore", "volume", "clicksLost"]

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Presence Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Presence
            {presenceFilter.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {presenceFilter.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {ALL_PRESENCES.map((presence) => (
            <DropdownMenuCheckboxItem
              key={presence}
              checked={presenceFilter.includes(presence)}
              onCheckedChange={() => togglePresence(presence)}
            >
              {getPresenceLabel(presence)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Opportunity Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Opportunity
            {opportunityFilter.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {opportunityFilter.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {ALL_OPPORTUNITY_LEVELS.map((level) => (
            <DropdownMenuCheckboxItem
              key={level}
              checked={opportunityFilter.includes(level)}
              onCheckedChange={() => toggleOpportunity(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort: {getSortLabel(sortBy)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {sortOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={sortBy === option}
              onCheckedChange={() => onSortByChange(option)}
            >
              {getSortLabel(option)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Order Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onSortOrderChange(sortOrder === "desc" ? "asc" : "desc")}
      >
        {sortOrder === "desc" ? (
          <ArrowDown className="w-4 h-4" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}
