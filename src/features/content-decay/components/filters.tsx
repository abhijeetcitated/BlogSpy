// ============================================
// CONTENT DECAY - Filters Component
// ============================================
// Search, Filter, and Sort controls for decay articles

import { Search, Filter, ArrowUpDown, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DecayReason, DecayStatus } from "../types"

export type SortField = "trafficLoss" | "rankDrop" | "decayRate" | "title"
export type SortDirection = "asc" | "desc"

interface FiltersProps {
  searchQuery: string
  filterReason: DecayReason | "all"
  filterStatus: DecayStatus | "all"
  sortField: SortField
  sortDirection: SortDirection
  onSearchChange: (query: string) => void
  onFilterReasonChange: (reason: DecayReason | "all") => void
  onFilterStatusChange: (status: DecayStatus | "all") => void
  onSortChange: (field: SortField) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  resultCount: number
  totalCount: number
}

const DECAY_REASONS: { value: DecayReason | "all"; label: string }[] = [
  { value: "all", label: "All Reasons" },
  { value: "Competitor", label: "Competitor Updated" },
  { value: "Outdated", label: "Content Outdated" },
  { value: "Missing Keywords", label: "Missing LSI Keywords" },
  { value: "Schema Issues", label: "Schema Issues" },
  { value: "Slow Load", label: "Slow Page Load" },
]

const DECAY_STATUSES: { value: DecayStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "critical", label: "Critical" },
  { value: "watch", label: "Watch" },
  { value: "fixed", label: "Fixed" },
  { value: "ignored", label: "Ignored" },
]

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "trafficLoss", label: "Traffic Loss" },
  { value: "rankDrop", label: "Rank Drop" },
  { value: "decayRate", label: "Decay Rate" },
  { value: "title", label: "Title A-Z" },
]

export function Filters({
  searchQuery,
  filterReason,
  filterStatus,
  sortField,
  sortDirection,
  onSearchChange,
  onFilterReasonChange,
  onFilterStatusChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  resultCount,
  totalCount,
}: FiltersProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 lg:p-5">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Search - Full width on mobile */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title or URL..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 sm:pl-10 bg-background border-border h-9 sm:h-10 lg:h-11 text-sm lg:text-base"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filter by Reason */}
          <div className="flex items-center gap-2 flex-1 min-w-[140px] sm:flex-none">
            <Filter className="w-4 h-4 text-muted-foreground hidden md:block" />
            <Select value={filterReason} onValueChange={(v) => onFilterReasonChange(v as DecayReason | "all")}>
              <SelectTrigger className="w-full sm:w-[160px] lg:w-[200px] bg-background border-border h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base">
                <SelectValue placeholder="Decay Reason" />
              </SelectTrigger>
              <SelectContent>
                {DECAY_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value} className="text-xs sm:text-sm">
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Status */}
          <div className="flex-1 min-w-[120px] sm:flex-none">
            <Select value={filterStatus} onValueChange={(v) => onFilterStatusChange(v as DecayStatus | "all")}>
              <SelectTrigger className="w-full sm:w-[130px] lg:w-[160px] bg-background border-border h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {DECAY_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-xs sm:text-sm">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-[140px] sm:flex-none">
            <Select value={sortField} onValueChange={(v) => onSortChange(v as SortField)}>
              <SelectTrigger className="w-full sm:w-[130px] lg:w-[170px] bg-background border-border h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSortChange(sortField)}
              className="h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0"
              title={sortDirection === "asc" ? "Ascending" : "Descending"}
            >
              <ArrowUpDown className={`w-4 h-4 lg:w-5 lg:h-5 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground gap-1 h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Result Count */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
            Showing <span className="font-medium text-foreground">{resultCount}</span> of{" "}
            <span className="font-medium text-foreground">{totalCount}</span> articles
          </p>
        </div>
      )}
    </div>
  )
}
