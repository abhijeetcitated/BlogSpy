"use client"

import { useState, useMemo } from "react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  SparklesIcon,
  QuoteIcon,
  GlobeIcon,
  TargetIcon,
} from "@/components/icons/platform-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusBadge } from "./status-badge"
import { getTrendColor, getPositionColor, getPositionLabel, calculateCitationValue } from "../utils/citation-utils"
import type { Citation } from "../types"

interface CitationCardProps {
  citation: Citation
  domain: string
}

export function CitationCard({ citation, domain }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const trafficValue = useMemo(() => calculateCitationValue(citation), [citation])

  const TrendIcon = citation.trend === "improving" ? TrendingUpIcon 
    : citation.trend === "declining" ? TrendingDownIcon 
    : citation.trend === "new" ? SparklesIcon 
    : MinusIcon
  const trendColor = getTrendColor(citation.trend)

  return (
    <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{citation.keyword}</h3>
              <TrendIcon className={`h-4 w-4 ${trendColor} shrink-0`} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {citation.searchVolume.toLocaleString()} vol
              </span>
              {citation.aiOverviewPresent ? (
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-0">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  AI Overview
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-500/10 text-gray-400 border-0">
                  No AI Overview
                </Badge>
              )}
              <StatusBadge status={citation.citationStatus} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Position indicator */}
            {citation.yourPosition && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPositionColor(citation.position)}`}>
                        #{citation.yourPosition}
                      </div>
                      <div className="text-xs text-muted-foreground">Position</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getPositionLabel(citation.position)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Traffic Value */}
            {trafficValue > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-500">
                        {trafficValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Est. Traffic</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimated monthly traffic from this citation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground"
            >
              {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        {citation.aiOverviewPresent && (
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <QuoteIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {citation.totalCitations} total citations
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GlobeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {citation.competitorsCited.length} competitors cited
              </span>
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {expanded && citation.aiOverviewPresent && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
            {/* AI Overview Preview */}
            {citation.snippetPreview && (
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">AI Overview Snippet</span>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  &quot;{citation.snippetPreview}&quot;
                </p>
              </div>
            )}

            {/* Cited Domains */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                All Cited Domains ({citation.citedDomains.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {citation.citedDomains.map((d, i) => (
                  <Badge
                    key={d}
                    variant="secondary"
                    className={d === domain 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-muted text-muted-foreground"
                    }
                  >
                    {i + 1}. {d}
                    {d === domain && <CheckCircleIcon className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Items */}
            {citation.citationStatus === "not-cited" && (
              <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TargetIcon className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-500">Opportunity</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This keyword has AI Overview but you&apos;re not cited. Consider:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Create comprehensive content answering the query directly</li>
                  <li>• Add FAQ section with structured data</li>
                  <li>• Study what {citation.citedDomains[0]} is doing differently</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
