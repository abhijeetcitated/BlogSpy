// ============================================
// FILTER BAR - Advanced filtering controls (Refactored)
// ============================================

"use client"

import { Search, Check, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { VOLUME_PRESETS, KD_PRESETS, QUICK_FILTERS } from "../constants"
import { RangeFilterPopover } from "./range-filter-popover"

interface FilterBarProps {
  // Competitor source filters
  hasCompetitor2: boolean
  showComp1: boolean
  showComp2: boolean
  competitor1: string
  competitor2: string
  onShowComp1Change: (checked: boolean) => void
  onShowComp2Change: (checked: boolean) => void
  
  // Quick filters
  activeQuickFilters: string[]
  onToggleQuickFilter: (filterId: string) => void
  
  // Volume filter
  volumeOpen: boolean
  onVolumeOpenChange: (open: boolean) => void
  tempVolumeRange: [number, number]
  onTempVolumeRangeChange: (range: [number, number]) => void
  volumePreset: string
  onVolumePresetChange: (preset: string) => void
  onApplyVolumeFilter: () => void
  
  // KD filter
  kdOpen: boolean
  onKdOpenChange: (open: boolean) => void
  tempKdRange: [number, number]
  onTempKdRangeChange: (range: [number, number]) => void
  kdPreset: string
  onKdPresetChange: (preset: string) => void
  onApplyKdFilter: () => void
  
  // Search
  searchQuery: string
  onSearchChange: (query: string) => void
  
  // Results count
  resultsCount: number
  
  // Export
  onExport: () => void
}

export function FilterBar({
  hasCompetitor2,
  showComp1,
  showComp2,
  competitor1,
  competitor2,
  onShowComp1Change,
  onShowComp2Change,
  activeQuickFilters,
  onToggleQuickFilter,
  volumeOpen,
  onVolumeOpenChange,
  tempVolumeRange,
  onTempVolumeRangeChange,
  volumePreset,
  onVolumePresetChange,
  onApplyVolumeFilter,
  kdOpen,
  onKdOpenChange,
  tempKdRange,
  onTempKdRangeChange,
  kdPreset,
  onKdPresetChange,
  onApplyKdFilter,
  searchQuery,
  onSearchChange,
  resultsCount,
  onExport,
}: FilterBarProps) {
  return (
    <div className="px-6 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Competitor Source Toggle */}
        {hasCompetitor2 && (
          <CompetitorSourceToggle
            showComp1={showComp1}
            showComp2={showComp2}
            competitor1={competitor1}
            competitor2={competitor2}
            onShowComp1Change={onShowComp1Change}
            onShowComp2Change={onShowComp2Change}
          />
        )}

        {/* Quick Filters */}
        <QuickFiltersSection
          activeQuickFilters={activeQuickFilters}
          onToggleQuickFilter={onToggleQuickFilter}
        />

        {/* Volume Filter */}
        <RangeFilterPopover
          label="Volume"
          presets={VOLUME_PRESETS}
          open={volumeOpen}
          onOpenChange={onVolumeOpenChange}
          tempRange={tempVolumeRange}
          onTempRangeChange={onTempVolumeRangeChange}
          presetLabel={volumePreset}
          onPresetChange={onVolumePresetChange}
          onApply={onApplyVolumeFilter}
          minPlaceholder="From"
          maxPlaceholder="To"
          defaultMin={0}
          defaultMax={500000}
        />

        {/* KD Filter */}
        <RangeFilterPopover
          label="KD %"
          presets={KD_PRESETS}
          open={kdOpen}
          onOpenChange={onKdOpenChange}
          tempRange={tempKdRange}
          onTempRangeChange={onTempKdRangeChange}
          presetLabel={kdPreset}
          onPresetChange={onKdPresetChange}
          onApply={onApplyKdFilter}
          minPlaceholder="Min"
          maxPlaceholder="Max"
          defaultMin={0}
          defaultMax={100}
        />

        {/* Search & Export */}
        <SearchExportSection
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          resultsCount={resultsCount}
          onExport={onExport}
        />
      </div>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface CompetitorSourceToggleProps {
  showComp1: boolean
  showComp2: boolean
  competitor1: string
  competitor2: string
  onShowComp1Change: (checked: boolean) => void
  onShowComp2Change: (checked: boolean) => void
}

function CompetitorSourceToggle({
  showComp1,
  showComp2,
  competitor1,
  competitor2,
  onShowComp1Change,
  onShowComp2Change,
}: CompetitorSourceToggleProps) {
  return (
    <div className="flex items-center gap-3 pr-3 border-r border-border">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Source:
      </span>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <Checkbox
          checked={showComp1}
          onCheckedChange={(checked) => onShowComp1Change(!!checked)}
          className="h-4 w-4"
        />
        <span className="text-xs text-foreground">
          {competitor1 || "Comp 1"}
        </span>
      </label>
      <label className="flex items-center gap-1.5 cursor-pointer">
        <Checkbox
          checked={showComp2}
          onCheckedChange={(checked) => onShowComp2Change(!!checked)}
          className="h-4 w-4"
        />
        <span className="text-xs text-foreground">
          {competitor2 || "Comp 2"}
        </span>
      </label>
    </div>
  )
}

interface QuickFiltersSectionProps {
  activeQuickFilters: string[]
  onToggleQuickFilter: (filterId: string) => void
}

function QuickFiltersSection({
  activeQuickFilters,
  onToggleQuickFilter,
}: QuickFiltersSectionProps) {
  return (
    <>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Quick:
      </span>
      <div className="flex items-center gap-2">
        {QUICK_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onToggleQuickFilter(filter.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeQuickFilters.includes(filter.id)
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary"
            )}
          >
            {activeQuickFilters.includes(filter.id) && (
              <Check className="h-3 w-3" />
            )}
            {filter.label}
          </button>
        ))}
      </div>
    </>
  )
}

interface SearchExportSectionProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  resultsCount: number
  onExport: () => void
}

function SearchExportSection({
  searchQuery,
  onSearchChange,
  resultsCount,
  onExport,
}: SearchExportSectionProps) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-8 w-64 bg-secondary/50 border-border text-sm"
        />
      </div>
      <Badge variant="outline" className="text-xs">
        {resultsCount} results
      </Badge>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8 gap-1.5 bg-secondary/50 border-border"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download filtered keywords as CSV</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
