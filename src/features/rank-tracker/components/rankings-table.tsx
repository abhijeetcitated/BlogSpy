// ============================================
// RANK TRACKER - Rankings Table Component
// ============================================

"use client"

import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react"
import { Sparkline } from "@/components/charts/sparkline"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RankBadge } from "./rank-badge"
import { SerpFeaturesList } from "./serp-feature-icon"
import { AIOverviewBadge } from "./ai-overview-badge"
import { formatTraffic, getRankChangeColor, getRankChangeIcon } from "../utils"
import type { RankData, SortField, SortDirection } from "../types"

interface SortIconProps {
  field: SortField
  currentField: SortField
  direction: SortDirection
}

function SortIcon({ field, currentField, direction }: SortIconProps) {
  if (field !== currentField) {
    return <ChevronUp className="w-3 h-3 text-muted-foreground/60" />
  }
  return direction === "asc" ? (
    <ChevronUp className="w-3 h-3 text-foreground" />
  ) : (
    <ChevronDown className="w-3 h-3 text-foreground" />
  )
}

interface RankingsTableProps {
  data: RankData[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

/**
 * Main rankings data table
 */
export function RankingsTable({
  data,
  sortField,
  sortDirection,
  onSort,
}: RankingsTableProps) {
  const handleSort = (field: SortField) => {
    onSort(field)
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead
              onClick={() => handleSort("keyword")}
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                Keyword
                <SortIcon
                  field="keyword"
                  currentField={sortField}
                  direction={sortDirection}
                />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("rank")}
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                Rank
                <SortIcon
                  field="rank"
                  currentField={sortField}
                  direction={sortDirection}
                />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("change")}
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                Change
                <SortIcon
                  field="change"
                  currentField={sortField}
                  direction={sortDirection}
                />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">Pixel Rank</TableHead>
            <TableHead className="text-muted-foreground">AI Overview</TableHead>
            <TableHead className="text-muted-foreground">SERP Features</TableHead>
            <TableHead
              onClick={() => handleSort("volume")}
              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1">
                Volume
                <SortIcon
                  field="volume"
                  currentField={sortField}
                  direction={sortDirection}
                />
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground">Trend</TableHead>
            <TableHead className="text-muted-foreground">URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id}
              className="border-border hover:bg-muted/30 transition-colors"
            >
              {/* Keyword */}
              <TableCell className="font-medium text-foreground">
                {row.keyword}
              </TableCell>

              {/* Rank */}
              <TableCell>
                <RankBadge rank={row.rank} />
              </TableCell>

              {/* Change */}
              <TableCell>
                <span className={`font-medium ${getRankChangeColor(row.change)}`}>
                  {getRankChangeIcon(row.change)} {Math.abs(row.change)}
                </span>
              </TableCell>

              {/* Pixel Rank */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      style={{ width: `${Math.max(5, 100 - row.rank * 3)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    #{Math.round(row.rank * 47)}px
                  </span>
                </div>
              </TableCell>

              {/* AI Overview */}
              <TableCell>
                <AIOverviewBadge status={row.aiOverview} />
              </TableCell>

              {/* SERP Features */}
              <TableCell>
                <SerpFeaturesList features={row.serpFeatures} />
              </TableCell>

              {/* Volume */}
              <TableCell className="text-muted-foreground">
                {formatTraffic(row.volume)}
              </TableCell>

              {/* Trend */}
              <TableCell>
                <div className="w-20">
                  <Sparkline
                    data={row.trendHistory}
                    width={60}
                    height={24}
                  />
                </div>
              </TableCell>

              {/* URL */}
              <TableCell>
                <a
                  href={row.url}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
                >
                  <span className="max-w-36 truncate">{row.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No keywords found matching your criteria.
        </div>
      )}
    </div>
  )
}
