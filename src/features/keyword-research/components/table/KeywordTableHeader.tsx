"use client"

// ============================================
// KEYWORD TABLE - Header Component (Streamlined 10 Columns)
// ============================================

import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { SortField, SortDirection } from "../../constants/table-config"

interface KeywordTableHeaderProps {
  selectAll: boolean
  onSelectAll: () => void
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

function SortIcon({ field, sortField, sortDirection }: { field: SortField; sortField: SortField; sortDirection: SortDirection }) {
  if (sortField !== field) {
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
  }
  return sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3 text-primary" />
  ) : (
    <ArrowDown className="h-3 w-3 text-primary" />
  )
}

export function KeywordTableHeader({
  selectAll,
  onSelectAll,
  sortField,
  sortDirection,
  onSort,
}: KeywordTableHeaderProps) {
  return (
    <thead className="sticky top-0 z-10 bg-muted">
      {/* Column Headers */}
      <tr className="border-b border-border">
        {/* 1. Checkbox */}
        <th className="px-2 py-3 text-left font-medium bg-muted">
          <Checkbox 
            checked={selectAll} 
            onCheckedChange={onSelectAll} 
            aria-label="Select all" 
          />
        </th>
        {/* 2. Keyword */}
        <th className="pl-2 py-3 text-left font-medium bg-muted">Keyword</th>
        {/* 3. Intent */}
        <th className="p-2 text-center font-medium bg-muted">Intent</th>
        {/* 4. Volume */}
        <th className="p-2 text-center font-medium bg-muted">
          <button onClick={() => onSort("volume")} className="inline-flex items-center justify-center gap-1 hover:text-foreground transition-colors w-full">
            Volume <SortIcon field="volume" sortField={sortField} sortDirection={sortDirection} />
          </button>
        </th>
        {/* 5. Trend */}
        <th className="p-2 text-center font-medium bg-muted">
          <button onClick={() => onSort("trend")} className="inline-flex items-center justify-center gap-1 hover:text-foreground transition-colors w-full">
            Trend <SortIcon field="trend" sortField={sortField} sortDirection={sortDirection} />
          </button>
        </th>
        {/* 6. KD % */}
        <th className="p-2 text-center font-medium bg-muted">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("kd")} className="inline-flex items-center justify-center gap-1 hover:text-foreground transition-colors w-full">
                KD % <SortIcon field="kd" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">Keyword Difficulty (0-100)</p>
              <p className="text-xs text-muted-foreground mt-1">Higher = harder to rank. Based on backlink profile of top 10 results.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        {/* 7. CPC */}
        <th className="p-2 text-center font-medium bg-muted">
          <button onClick={() => onSort("cpc")} className="inline-flex items-center justify-center gap-1 hover:text-foreground transition-colors w-full">
            CPC <SortIcon field="cpc" sortField={sortField} sortDirection={sortDirection} />
          </button>
        </th>
        {/* 8. Weak Spot */}
        <th className="p-2 text-center font-medium bg-muted">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">Weak Spot</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">Forum Ranking Opportunity</p>
              <p className="text-xs text-muted-foreground mt-1">Shows if Reddit/Quora ranks in top 10. Easy to outrank!</p>
            </TooltipContent>
          </Tooltip>
        </th>
        {/* 9. GEO Score */}
        <th className="p-2 text-center font-medium bg-muted">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("geoScore")} className="inline-flex items-center justify-center gap-1 hover:text-foreground transition-colors w-full">
                GEO <SortIcon field="geoScore" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">GEO Score (0-100)</p>
              <p className="text-xs text-muted-foreground mt-1">Generative Engine Optimization score. Higher = better chance to appear in AI answers.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        {/* 10. SERP Features */}
        <th className="p-2 text-center font-medium bg-muted">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">SERP</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">SERP Features</p>
              <p className="text-xs text-muted-foreground mt-1">Special features appearing in search results like Featured Snippets, PAA, Videos, etc.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        {/* 11. Refresh */}
        <th className="p-2 text-center font-medium bg-muted">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">Refresh</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">Refresh Data</p>
              <p className="text-xs text-muted-foreground mt-1">Click to fetch latest metrics for this keyword. Uses 1 credit per refresh.</p>
            </TooltipContent>
          </Tooltip>
        </th>
      </tr>
    </thead>
  )
}
