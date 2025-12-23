"use client"

/**
 * CommerceFilterBar - Filter controls for Commerce Tracker
 * 
 * Extracted from commerce-tracker-content.tsx for better maintainability
 * Includes: Stats pills, search, sort, and advanced filters
 */

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ShoppingCart,
  Search,
  Target,
  Package,
  Filter,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react"
import { AMAZON_CATEGORIES } from "../constants"
import type { CommerceFilters, OpportunityFilter, PositionFilter, SortField, SortOrder } from "../hooks"
import type { CommerceIntent } from "../types"

// ============================================
// Types
// ============================================

export interface CommerceFilterBarProps {
  filters: CommerceFilters
  sortField: SortField
  sortOrder: SortOrder
  showFilters: boolean
  hasActiveFilters: boolean
  stats: {
    totalKeywords: number
    highOpportunity: number
    ourProducts: number
  }
  onFilterChange: <K extends keyof CommerceFilters>(key: K, value: CommerceFilters[K]) => void
  onResetFilters: () => void
  onSortChange: (field: SortField) => void
  onToggleFilters: () => void
}

// ============================================
// Sort Options
// ============================================

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "searchVolume", label: "Search Volume" },
  { value: "position", label: "Position" },
  { value: "cpc", label: "CPC" },
  { value: "opportunity", label: "Opportunity" },
  { value: "keyword", label: "Keyword A-Z" },
  { value: "lastUpdated", label: "Last Updated" },
]

// ============================================
// Component
// ============================================

export function CommerceFilterBar({
  filters,
  sortField,
  sortOrder,
  showFilters,
  hasActiveFilters,
  stats,
  onFilterChange,
  onResetFilters,
  onSortChange,
  onToggleFilters,
}: CommerceFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Main Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        {/* Stats Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 flex-wrap">
          <Badge 
            variant="outline" 
            className="text-[10px] sm:text-[11px] md:text-xs px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 border-amber-500/30 text-amber-400 bg-amber-500/10 font-medium cursor-pointer"
            onClick={() => onResetFilters()}
          >
            <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            {stats.totalKeywords}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-[10px] sm:text-[11px] md:text-xs px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-medium cursor-pointer ${filters.opportunity === "high" ? "ring-1 ring-emerald-500" : ""}`}
            onClick={() => onFilterChange("opportunity", filters.opportunity === "high" ? "all" : "high")}
          >
            <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            {stats.highOpportunity} High
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-[10px] sm:text-[11px] md:text-xs px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 border-blue-500/30 text-blue-400 bg-blue-500/10 font-medium cursor-pointer ${filters.hasOurProduct === true ? "ring-1 ring-blue-500" : ""}`}
            onClick={() => onFilterChange("hasOurProduct", filters.hasOurProduct === true ? null : true)}
          >
            <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            {stats.ourProducts} Ours
          </Badge>
        </div>
        
        {/* Search, Sort & Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Toggle Filters */}
          <Button 
            variant={showFilters ? "secondary" : "outline"} 
            size="sm" 
            onClick={onToggleFilters}
            className="h-7 sm:h-7 md:h-8 px-2 sm:px-2.5 md:px-3 text-xs"
          >
            <Filter className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
            <span className="ml-1 sm:ml-1.5">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </Button>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 sm:h-7 md:h-8 px-2 sm:px-2.5 md:px-3">
                {sortOrder === "asc" ? <SortAsc className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" /> : <SortDesc className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />}
                <span className="ml-1 sm:ml-1.5">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem 
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`text-xs ${sortField === option.value ? "bg-muted" : ""}`}
                >
                  {option.label}
                  {sortField === option.value && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Search */}
          <div className="relative flex-1 sm:flex-1 md:w-48 lg:w-56">
            <Search className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              placeholder="Search..."
              className="pl-7 sm:pl-8 md:pl-9 h-7 sm:h-7 md:h-8 text-xs sm:text-xs md:text-sm bg-card border-border"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onFilterChange("search", "")}
              >
                <X className="w-2.5 h-2.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters (Collapsible) */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 p-2 sm:p-2.5 md:p-3 bg-muted/30 rounded-lg border border-border">
          {/* Category Filter */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">Category:</span>
            <Select value={filters.category} onValueChange={(v) => onFilterChange("category", v)}>
              <SelectTrigger className="h-7 sm:h-7 md:h-8 text-[11px] sm:text-xs w-[100px] sm:w-[110px] md:w-[130px] bg-card">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                {AMAZON_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opportunity Filter */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">Opp:</span>
            <Select value={filters.opportunity} onValueChange={(v) => onFilterChange("opportunity", v as OpportunityFilter)}>
              <SelectTrigger className="h-7 sm:h-7 md:h-8 text-[11px] sm:text-xs w-[70px] sm:w-[80px] md:w-[90px] bg-card">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                <SelectItem value="high" className="text-xs">High</SelectItem>
                <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                <SelectItem value="low" className="text-xs">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">Pos:</span>
            <Select value={filters.position} onValueChange={(v) => onFilterChange("position", v as PositionFilter)}>
              <SelectTrigger className="h-7 sm:h-7 md:h-8 text-[11px] sm:text-xs w-[70px] sm:w-[75px] md:w-[80px] bg-card">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                <SelectItem value="top3" className="text-xs">Top 3</SelectItem>
                <SelectItem value="top10" className="text-xs">Top 10</SelectItem>
                <SelectItem value="top20" className="text-xs">Top 20</SelectItem>
                <SelectItem value="unranked" className="text-xs">Unranked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Intent Filter */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">Intent:</span>
            <Select value={filters.intent} onValueChange={(v) => onFilterChange("intent", v as CommerceIntent | "all")}>
              <SelectTrigger className="h-7 sm:h-7 md:h-8 text-[11px] sm:text-xs w-[85px] sm:w-[90px] md:w-[100px] bg-card">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                <SelectItem value="transactional" className="text-xs">Transactional</SelectItem>
                <SelectItem value="comparison" className="text-xs">Comparison</SelectItem>
                <SelectItem value="informational" className="text-xs">Info</SelectItem>
                <SelectItem value="branded" className="text-xs">Branded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onResetFilters} className="h-7 sm:h-7 md:h-8 px-2 text-amber-400 hover:text-amber-300 text-[11px] sm:text-xs">
              <X className="w-2.5 h-2.5 mr-0.5" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default CommerceFilterBar
