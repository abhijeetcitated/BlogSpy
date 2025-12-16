"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search, ArrowUp, ArrowDown, Filter, SlidersHorizontal } from "lucide-react"
import { ALL_SEVERITIES, SORT_OPTIONS } from "../constants"
import type { FilterSeverity, SortField, SortDirection, CannibalizationAnalysis } from "../types"

interface FiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterSeverity: FilterSeverity
  onFilterChange: (value: FilterSeverity) => void
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  analysis: CannibalizationAnalysis
}

// Severity filter button styles
const getSeverityStyles = (severity: string, isActive: boolean) => {
  if (!isActive) {
    return "text-muted-foreground hover:text-foreground hover:bg-muted/50"
  }
  
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
    case "high":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    case "medium":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"
    case "low":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    default:
      return "bg-primary text-primary-foreground"
  }
}

export function Filters({
  searchQuery,
  onSearchChange,
  filterSeverity,
  onFilterChange,
  sortField,
  sortDirection,
  onSort,
  analysis
}: FiltersProps) {
  return (
    <div className="space-y-3">
      {/* Severity Filter & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Filter:</span>
          </div>
          {ALL_SEVERITIES.map((sev) => {
            const isActive = filterSeverity === sev
            const count = sev !== "all" ? analysis.issuesBySeverity[sev as keyof typeof analysis.issuesBySeverity] : null
            
            return (
              <button
                key={sev}
                onClick={() => onFilterChange(sev as FilterSeverity)}
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-all duration-200",
                  "border border-transparent",
                  getSeverityStyles(sev, isActive),
                  isActive && "shadow-sm"
                )}
              >
                <span className="capitalize">
                  {sev === "all" ? "All Issues" : sev}
                </span>
                {count !== null && (
                  <span className={cn(
                    "ml-1 tabular-nums",
                    isActive ? "opacity-80" : "opacity-60"
                  )}>
                    ({count})
                  </span>
                )}
              </button>
            )
          })}
        </div>
        
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search keywords or URLs..."
            className={cn(
              "pl-9 h-8 sm:h-9",
              "bg-muted/30 dark:bg-muted/20",
              "border-border/50 dark:border-border/30",
              "text-foreground placeholder:text-muted-foreground",
              "focus:bg-background focus:border-primary/50",
              "transition-colors"
            )}
          />
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 mr-1 shrink-0">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="font-medium hidden sm:inline">Sort by:</span>
        </div>
        {SORT_OPTIONS.map(({ field, label }) => {
          const isActive = sortField === field
          return (
            <button
              key={field}
              onClick={() => onSort(field)}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md transition-all duration-200 shrink-0",
                isActive 
                  ? "bg-primary/10 text-primary dark:bg-primary/20 font-medium" 
                  : "hover:bg-muted/50"
              )}
            >
              {label}
              {isActive && (
                sortDirection === "asc" 
                  ? <ArrowUp className="h-3 w-3" />
                  : <ArrowDown className="h-3 w-3" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
