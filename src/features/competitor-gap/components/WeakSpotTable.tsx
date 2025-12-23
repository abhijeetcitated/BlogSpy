"use client"

import Link from "next/link"
import { 
  Search, 
  ExternalLink,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Zap,
  TrendingUp,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KDRing } from "@/components/charts"
import { cn } from "@/lib/utils"
import { WeakSpotKeyword, SortField, SortDirection } from "../types/weak-spot.types"
import { getWeakSpotIcon, getOpportunityStyle, getIntentStyle } from "../utils/weak-spot.utils"

interface WeakSpotTableProps {
  keywords: WeakSpotKeyword[]
  sortField: SortField
  sortDirection: SortDirection
  addedKeywords: Set<string>
  onSort: (field: SortField) => void
  onAddKeyword: (keyword: WeakSpotKeyword) => void
}

export function WeakSpotTable({
  keywords,
  sortField,
  sortDirection,
  addedKeywords,
  onSort,
  onAddKeyword,
}: WeakSpotTableProps) {
  // Sort Icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 text-cyan-400" />
      : <ArrowDown className="h-3 w-3 text-cyan-400" />
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card/30">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Weak Spot
              </th>
              <th 
                className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => onSort("weakSpotRank")}
              >
                <div className="flex items-center justify-center gap-1">
                  Position
                  <SortIcon field="weakSpotRank" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => onSort("volume")}
              >
                <div className="flex items-center justify-end gap-1">
                  Volume
                  <SortIcon field="volume" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => onSort("kd")}
              >
                <div className="flex items-center justify-center gap-1">
                  KD
                  <SortIcon field="kd" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Opportunity
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                onClick={() => onSort("trafficPotential")}
              >
                <div className="flex items-center justify-end gap-1">
                  Traffic Potential
                  <SortIcon field="trafficPotential" />
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keywords.map((kw) => {
              const { icon: SourceIcon, color, bg } = getWeakSpotIcon(kw.weakSpotType)
              return (
                <tr key={kw.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <Link 
                        href={`/dashboard/research/overview/${encodeURIComponent(kw.keyword)}`}
                        className="text-sm font-medium text-foreground hover:text-cyan-400 transition-colors"
                      >
                        {kw.keyword}
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] capitalize", getIntentStyle(kw.intent))}
                        >
                          {kw.intent}
                        </Badge>
                        {kw.yourRank && (
                          <span className="text-[10px] text-muted-foreground">
                            Your rank: #{kw.yourRank}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <a 
                      href={kw.weakSpotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link block space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", bg)}>
                          <SourceIcon className={cn("h-3 w-3", color)} />
                        </div>
                        <span className={cn("text-xs font-medium capitalize", color)}>
                          {kw.weakSpotType}
                        </span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] group-hover/link:text-foreground transition-colors">
                        {kw.weakSpotTitle}
                      </p>
                    </a>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn(
                      "inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold",
                      kw.weakSpotRank <= 3 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      #{kw.weakSpotRank}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-mono text-foreground">{kw.volume.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <KDRing value={kw.kd} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] capitalize", getOpportunityStyle(kw.opportunity))}
                    >
                      {kw.opportunity}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="font-mono text-emerald-400 font-medium">
                        +{kw.trafficPotential.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {addedKeywords.has(kw.id) ? (
                      <Button
                        size="sm"
                        disabled
                        className="h-7 px-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs cursor-default"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Queued
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        asChild
                        className="h-7 px-3 bg-cyan-500 hover:bg-cyan-600 text-cyan-950 font-semibold text-xs"
                        onClick={() => onAddKeyword(kw)}
                      >
                        <Link href={`/dashboard/creation/ai-writer?source=competitor-gap&keyword=${encodeURIComponent(kw.keyword)}&volume=${kw.volume}&difficulty=${kw.kd}&intent=${kw.intent || 'informational'}`}>
                          <Zap className="h-3 w-3 mr-1" />
                          Write Article
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {keywords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground">No weak spots found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
