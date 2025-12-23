"use client"

import { useCallback } from "react"
import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { GapKeyword, SortField, SortDirection } from "../types"
import {
  IntentBadge,
  GapBadge,
  TrendIndicator,
  RanksDisplay,
  KDBar,
  SortHeader,
  AITipButton,
  ActionsDropdown,
  BulkActionsBar,
} from "./gap-analysis-table/index"

interface GapAnalysisTableProps {
  keywords: GapKeyword[]
  selectedRows: Set<string>
  addedKeywords: Set<string>
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  onAddToRoadmap: (keyword: GapKeyword) => void
  onBulkAddToRoadmap: () => void
  onClearSelection: () => void
  onWriteArticle?: (keyword: GapKeyword) => void
}

export function GapAnalysisTable({
  keywords,
  selectedRows,
  addedKeywords,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onAddToRoadmap,
  onBulkAddToRoadmap,
  onClearSelection,
  onWriteArticle,
}: GapAnalysisTableProps) {
  
  const allSelected = keywords.length > 0 && selectedRows.size === keywords.length

  const handleWrite = useCallback((keyword: GapKeyword) => {
    if (onWriteArticle) {
      onWriteArticle(keyword)
    } else {
      console.log("Write article for:", keyword.keyword)
    }
  }, [onWriteArticle])

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
    return vol.toString()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden -mx-3 sm:-mx-4 md:-mx-6">
      <BulkActionsBar
        selectedCount={selectedRows.size}
        onBulkAddToRoadmap={onBulkAddToRoadmap}
        onClearSelection={onClearSelection}
      />

      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-background border-b border-border">
              <th className="w-12 pl-3 sm:pl-4 md:pl-6 pr-2 py-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  className="border-amber-500/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <SortHeader
                  label="Keyword"
                  field="keyword"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </th>
              <th className="w-28 px-4 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Gap Status</span>
              </th>
              <th className="w-36 px-4 py-4 text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-semibold text-muted-foreground cursor-help border-b border-dashed border-muted-foreground/50">
                      Rankings
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <div className="space-y-1">
                      <p><span className="text-emerald-600 dark:text-emerald-400">You</span> / <span className="text-red-600 dark:text-red-400">C1</span> / <span className="text-orange-600 dark:text-orange-400">C2</span></p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="w-24 px-4 py-4">
                <SortHeader
                  label="Volume"
                  field="volume"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-32 px-4 py-4">
                <SortHeader
                  label="Difficulty"
                  field="kd"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-20 px-4 py-4">
                <SortHeader
                  label="Trend"
                  field="trend"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-28 pl-4 pr-3 sm:pr-4 md:pr-6 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {keywords.map((keyword) => (
              <tr
                key={keyword.id}
                className={cn(
                  "group transition-all duration-150",
                  selectedRows.has(keyword.id) 
                    ? "bg-amber-500/5 dark:bg-amber-500/10" 
                    : "hover:bg-muted/50"
                )}
              >
                <td className="pl-3 sm:pl-4 md:pl-6 pr-2 py-4">
                  <Checkbox
                    checked={selectedRows.has(keyword.id)}
                    onCheckedChange={(checked) => onSelectRow(keyword.id, !!checked)}
                    className="border-amber-500/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                </td>

                <td className="px-4 py-4">
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {keyword.keyword}
                    </span>
                    <div>
                      <IntentBadge intent={keyword.intent} />
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <GapBadge gapType={keyword.gapType} />
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <RanksDisplay
                      yourRank={keyword.yourRank}
                      comp1Rank={keyword.comp1Rank}
                      comp2Rank={keyword.comp2Rank}
                    />
                  </div>
                </td>

                <td className="px-4 py-4 text-center">
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {formatVolume(keyword.volume)}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <KDBar kd={keyword.kd} />
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <TrendIndicator trend={keyword.trend} />
                  </div>
                </td>

                <td className="pl-4 pr-3 sm:pr-4 md:pr-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <AITipButton 
                      tip={keyword.aiTip} 
                      onWrite={() => handleWrite(keyword)}
                    />
                    <ActionsDropdown
                      keyword={keyword}
                      isAdded={addedKeywords.has(keyword.id)}
                      onWrite={() => handleWrite(keyword)}
                      onAddToCalendar={() => onAddToRoadmap(keyword)}
                      onViewSerp={() => window.open(`https://google.com/search?q=${encodeURIComponent(keyword.keyword)}`, "_blank")}
                      onCopy={() => navigator.clipboard.writeText(keyword.keyword)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {keywords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted border border-border mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">No keywords found</p>
            <p className="text-muted-foreground text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
