"use client"

import Link from "next/link"
import {
  Swords,
  ExternalLink,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { KDRing } from "@/components/charts"
import { cn } from "@/lib/utils"
import type { GapKeyword, SortField, SortDirection } from "../types"
import { getIntentStyle } from "../utils"
import { SOURCE_STYLES } from "../constants"
import { BulkActionBar, KeywordsEmptyState } from "./keywords-table-parts"

// ============================================
// KEYWORDS TABLE - Main data table
// ============================================

interface KeywordsTableProps {
  keywords: GapKeyword[]
  selectedRows: Set<string>
  addedKeywords: Set<string>
  hasCompetitor2: boolean
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  onAddToRoadmap: (keyword: GapKeyword) => void
  onBulkAddToRoadmap: () => void
  onClearSelection: () => void
}

/**
 * Sort Icon Component
 */
function SortIcon({
  field,
  currentField,
  direction,
}: {
  field: SortField
  currentField: SortField
  direction: SortDirection
}) {
  if (currentField !== field) {
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 text-amber-400" />
  ) : (
    <ArrowDown className="h-3 w-3 text-amber-400" />
  )
}

export function KeywordsTable({
  keywords,
  selectedRows,
  addedKeywords,
  hasCompetitor2,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onAddToRoadmap,
  onBulkAddToRoadmap,
  onClearSelection,
}: KeywordsTableProps) {
  const isAllSelected =
    keywords.length > 0 && keywords.every((kw) => selectedRows.has(kw.id))

  return (
    <>
      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRows.size}
        onBulkAdd={onBulkAddToRoadmap}
        onClearSelection={onClearSelection}
      />

      {/* Keywords Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/30 sticky top-0">
            <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  className="h-4 w-4"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3">Keyword</th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => onSort("competitorRank")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Competitor Rank
                  <SortIcon
                    field="competitorRank"
                    currentField={sortField}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => onSort("yourRank")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Your Rank
                  <SortIcon
                    field="yourRank"
                    currentField={sortField}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => onSort("volume")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Volume
                  <SortIcon
                    field="volume"
                    currentField={sortField}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => onSort("kd")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  KD
                  <SortIcon
                    field="kd"
                    currentField={sortField}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-center">Intent</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keywords.map((kw) => (
              <tr
                key={kw.id}
                className={cn(
                  "hover:bg-secondary/20 transition-colors group",
                  selectedRows.has(kw.id) && "bg-amber-500/5"
                )}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedRows.has(kw.id)}
                    onCheckedChange={(checked) => onSelectRow(kw.id, !!checked)}
                    className="h-4 w-4"
                    aria-label={`Select ${kw.keyword}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/research/overview/${encodeURIComponent(kw.keyword)}`}
                    className="font-medium text-foreground hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group/link"
                  >
                    {kw.keyword}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </Link>
                  {hasCompetitor2 && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-2 text-[9px] px-1.5",
                        SOURCE_STYLES[kw.source]
                      )}
                    >
                      {kw.source === "both"
                        ? "Both"
                        : kw.source === "comp1"
                          ? "C1"
                          : "C2"}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {kw.competitorRank && kw.competitorUrl ? (
                    <a
                      href={kw.competitorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={kw.competitorUrl}
                      className="inline-flex items-center justify-center gap-1 w-auto min-w-[2rem] h-6 px-2 rounded bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 hover:text-red-300 transition-all group/rank"
                    >
                      #{kw.competitorRank}
                      <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/rank:opacity-100 transition-opacity" />
                    </a>
                  ) : kw.competitorRank ? (
                    <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-red-500/20 text-red-400 text-xs font-bold">
                      #{kw.competitorRank}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                  {hasCompetitor2 && kw.competitor2Rank && kw.competitor2Url && (
                    <a
                      href={kw.competitor2Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={kw.competitor2Url}
                      className="inline-flex items-center justify-center gap-1 w-auto min-w-[2rem] h-6 px-2 rounded bg-orange-500/20 text-orange-400 text-xs font-bold hover:bg-orange-500/30 hover:text-orange-300 transition-all ml-1 group/rank2"
                    >
                      #{kw.competitor2Rank}
                      <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/rank2:opacity-100 transition-opacity" />
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {kw.yourRank === null ? (
                    <Badge
                      variant="outline"
                      className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]"
                    >
                      Not Ranking
                    </Badge>
                  ) : kw.gapType === "strong" ? (
                    <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      #{kw.yourRank}
                    </span>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]"
                    >
                      #{kw.yourRank}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-foreground">
                    {kw.volume.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <KDRing value={kw.kd} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] capitalize",
                      getIntentStyle(kw.intent)
                    )}
                  >
                    {kw.intent}
                  </Badge>
                </td>
                <td className="px-6 py-3 text-right">
                  {addedKeywords.has(kw.id) ? (
                    <Button
                      size="sm"
                      disabled
                      className="h-7 px-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs cursor-default"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Added to Roadmap
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onAddToRoadmap(kw)}
                      className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-xs"
                    >
                      <Swords className="h-3 w-3 mr-1" />
                      Steal This
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {keywords.length === 0 && <KeywordsEmptyState />}
      </div>
    </>
  )
}
