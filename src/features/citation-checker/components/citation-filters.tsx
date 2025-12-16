"use client"

import { SearchIcon, FilterIcon } from "@/components/icons/platform-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getStatusLabel, getSortLabel } from "../utils/citation-utils"
import type { CitationStatus, SortByOption, SortOrder } from "../types"

const ALL_STATUSES: CitationStatus[] = ["cited", "partial", "not-cited", "unknown"]

interface CitationFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: CitationStatus[]
  onStatusFilterChange: (status: CitationStatus[]) => void
  showOnlyWithAI: boolean
  onShowOnlyWithAIChange: (value: boolean) => void
  sortBy: SortByOption
  onSortByChange: (value: SortByOption) => void
  sortOrder: SortOrder
  onSortOrderChange: () => void
}

export function CitationFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  showOnlyWithAI,
  onShowOnlyWithAIChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: CitationFiltersProps) {
  const handleStatusToggle = (status: CitationStatus, checked: boolean) => {
    if (checked) {
      onStatusFilterChange([...statusFilter, status])
    } else {
      onStatusFilterChange(statusFilter.filter((s) => s !== status))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filter
            {(statusFilter.length > 0 || showOnlyWithAI) && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5">
                {statusFilter.length + (showOnlyWithAI ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Citation Status</DropdownMenuLabel>
          {ALL_STATUSES.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={statusFilter.includes(status)}
              onCheckedChange={(checked) => handleStatusToggle(status, checked)}
            >
              {getStatusLabel(status)}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showOnlyWithAI}
            onCheckedChange={onShowOnlyWithAIChange}
          >
            Only With AI Overview
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Sort: {getSortLabel(sortBy)}
            {sortOrder === "desc" ? " ↓" : " ↑"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem checked={sortBy === "volume"} onCheckedChange={() => onSortByChange("volume")}>
            Search Volume
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={sortBy === "status"} onCheckedChange={() => onSortByChange("status")}>
            Status
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={sortBy === "position"} onCheckedChange={() => onSortByChange("position")}>
            Position
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={sortBy === "traffic"} onCheckedChange={() => onSortByChange("traffic")}>
            Est. Traffic
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortOrder === "desc"}
            onCheckedChange={onSortOrderChange}
          >
            Descending
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
