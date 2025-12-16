"use client"

import { Scissors, TrendingUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SNIPPET_TYPE_ICONS, SNIPPET_TYPE_LABELS } from "../constants"
import { formatVolume } from "../utils/snippet-utils"
import type { SnippetOpportunity, FilterType } from "../types"

interface OpportunityListProps {
  opportunities: SnippetOpportunity[]
  selectedId: string
  savedIds: Set<string>
  filterType: FilterType
  onFilterChange: (filter: FilterType) => void
  onSelect: (opportunity: SnippetOpportunity) => void
}

export function OpportunityList({
  opportunities,
  selectedId,
  savedIds,
  filterType,
  onFilterChange,
  onSelect,
}: OpportunityListProps) {
  const filteredOpportunities = opportunities.filter(
    (opp) => filterType === "all" || opp.snippetType === filterType
  )

  return (
    <div className="w-[30%] min-w-[300px] border-r border-border bg-card/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold text-foreground">Snippet Opportunities</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredOpportunities.length}
            </Badge>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {(["all", "paragraph", "list", "table"] as const).map((type) => {
            const Icon = type !== "all" ? SNIPPET_TYPE_ICONS[type] : null
            const label = type === "all" ? "All" : SNIPPET_TYPE_LABELS[type]
            
            return (
              <Button
                key={type}
                variant={filterType === type ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => onFilterChange(type)}
              >
                {Icon && <Icon className="h-3 w-3" />}
                {label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredOpportunities.map((opp) => {
          const TypeIcon = SNIPPET_TYPE_ICONS[opp.snippetType]
          const isSelected = selectedId === opp.id
          const isSaved = savedIds.has(opp.id)
          
          return (
            <div
              key={opp.id}
              onClick={() => onSelect(opp)}
              className={cn(
                "p-4 border-b border-border cursor-pointer transition-all",
                isSelected 
                  ? "bg-accent border-l-2 border-l-emerald-500" 
                  : "hover:bg-muted/50 border-l-2 border-l-transparent",
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {isSaved && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  )}
                  <h3 className={cn(
                    "font-medium text-sm line-clamp-1",
                    isSelected ? "text-emerald-400" : "text-foreground"
                  )}>
                    {opp.keyword}
                  </h3>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs shrink-0",
                    opp.status === "unclaimed"
                      ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                      : "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
                  )}
                >
                  {opp.status === "unclaimed" ? "Unclaimed" : `#${opp.currentRank}`}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  <span>{SNIPPET_TYPE_LABELS[opp.snippetType]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{formatVolume(opp.volume)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
