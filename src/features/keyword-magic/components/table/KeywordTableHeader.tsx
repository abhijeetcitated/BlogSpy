"use client"

// ============================================
// KEYWORD TABLE - Header Component
// ============================================

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Sparkles, Brain, Flame, Video, ShoppingCart, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SortField, SortDirection } from "../../constants/table-config"

interface KeywordTableHeaderProps {
  selectAll: boolean
  onSelectAll: () => void
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onExport: () => void
  isExporting: boolean
  selectedCount: number
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
  onExport,
  isExporting,
  selectedCount,
}: KeywordTableHeaderProps) {
  return (
    <thead className="sticky top-0 z-30 bg-muted/95 backdrop-blur">
      <tr className="border-b border-border">
        <th className="w-8 sm:w-10 p-1.5 sm:p-2 text-left font-medium bg-muted/95">
          <Checkbox 
            checked={selectAll} 
            onCheckedChange={onSelectAll} 
            aria-label="Select all" 
          />
        </th>
        <th className="w-[180px] p-2 text-left font-medium bg-muted/95">Keyword</th>
        <th className="w-14 p-2 text-center font-medium">Intent</th>
        <th className="w-20 p-2 text-right font-medium">
          <button onClick={() => onSort("volume")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            Volume <SortIcon field="volume" sortField={sortField} sortDirection={sortDirection} />
          </button>
        </th>
        <th className="w-16 p-2 text-right font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("rtv")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                RTV <SortIcon field="rtv" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">Realizable Traffic Volume</p>
              <p className="text-xs text-muted-foreground mt-1">Actual traffic potential after accounting for AI Overview, Featured Snippets, Ads stealing clicks.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        <th className="w-16 p-2 text-center font-medium">
          <button onClick={() => onSort("trend")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            Trend <SortIcon field="trend" sortField={sortField} sortDirection={sortDirection} />
          </button>
        </th>
        <th className="w-24 p-2 text-center font-medium">Weak Spot</th>
        <th className="w-16 p-2 text-center font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("geoScore")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Sparkles className="h-3 w-3 text-cyan-400" /> GEO <SortIcon field="geoScore" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">GEO Score (0-100)</p>
              <p className="text-xs text-muted-foreground mt-1">Generative Engine Optimization score. Higher = easier to get cited by AI Overview.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        <th className="w-14 p-2 text-center font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("aioScore")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Brain className="h-3 w-3 text-purple-400" /> AIO <SortIcon field="aioScore" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">AI Overview Citation</p>
              <p className="text-xs text-muted-foreground mt-1">Your citation position in AI Overview. Shows opportunity % if not cited.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        <th className="w-14 p-2 text-center font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("decayScore")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Flame className="h-3 w-3 text-orange-400" /> Decay <SortIcon field="decayScore" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">Community Decay Score</p>
              <p className="text-xs text-muted-foreground mt-1">How old is Reddit/Quora content in SERP? Higher = easier to outrank aging content.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        <th className="w-14 p-2 text-center font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("videoOpp")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Video className="h-3 w-3 text-red-400" /> Video <SortIcon field="videoOpp" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">Video Opportunity</p>
              <p className="text-xs text-muted-foreground mt-1">YouTube + TikTok ranking opportunity. Higher = easier to rank with video content.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        <th className="w-14 p-2 text-center font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("commerceOpp")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <ShoppingCart className="h-3 w-3 text-amber-400" /> Comm <SortIcon field="commerceOpp" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">Commerce Opportunity</p>
              <p className="text-xs text-muted-foreground mt-1">Amazon ranking opportunity. Shows potential for e-commerce/affiliate content.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        <th className="w-14 p-2 text-center font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => onSort("socialOpp")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Share2 className="h-3 w-3 text-pink-400" /> Social <SortIcon field="socialOpp" sortField={sortField} sortDirection={sortDirection} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-medium">Social Opportunity</p>
              <p className="text-xs text-muted-foreground mt-1">Pinterest + Twitter/X + Instagram combined opportunity score.</p>
            </TooltipContent>
          </Tooltip>
        </th>
        <th className="w-14 p-2 text-center font-medium">
          <button onClick={() => onSort("kd")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            KD <SortIcon field="kd" sortField={sortField} sortDirection={sortDirection} />
          </button>
        </th>
        <th className="w-14 p-2 text-right font-medium">
          <button onClick={() => onSort("cpc")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            CPC <SortIcon field="cpc" sortField={sortField} sortDirection={sortDirection} />
          </button>
        </th>
        <th className="w-20 p-2 text-left font-medium">SERP</th>
        <th className="w-24 p-2 text-right font-medium">
          <div className="flex items-center justify-end gap-2">
            Actions
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onExport} disabled={isExporting}>
                  <Download className={cn("h-3.5 w-3.5", isExporting && "animate-pulse")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{selectedCount > 0 ? `Export ${selectedCount} selected` : 'Export all to CSV'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </th>
      </tr>
    </thead>
  )
}
