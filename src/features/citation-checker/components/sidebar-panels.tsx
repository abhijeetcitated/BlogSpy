"use client"

import { ZapIcon, TargetIcon, AwardIcon, BarChartIcon } from "@/components/icons/platform-icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Citation, CompetitorComparison, CitationTrendPoint } from "../types"

interface RecommendationsPanelProps {
  recommendations: string[]
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ZapIcon className="h-4 w-4 text-yellow-500" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.map((rec, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            {rec}
          </p>
        ))}
      </CardContent>
    </Card>
  )
}

interface MissedOpportunitiesPanelProps {
  opportunities: Citation[]
}

export function MissedOpportunitiesPanel({ opportunities }: MissedOpportunitiesPanelProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TargetIcon className="h-4 w-4 text-orange-500" />
          Missed Opportunities
        </CardTitle>
        <CardDescription>High-volume keywords where you&apos;re not cited</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.slice(0, 5).map((kw) => (
          <div key={kw.id} className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{kw.keyword}</p>
              <p className="text-xs text-muted-foreground">
                {kw.searchVolume.toLocaleString()} vol
              </p>
            </div>
            <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-0">
              Not Cited
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface TopCompetitorsPanelProps {
  competitors: CompetitorComparison[]
}

export function TopCompetitorsPanel({ competitors }: TopCompetitorsPanelProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AwardIcon className="h-4 w-4 text-blue-500" />
          Top Competitors
        </CardTitle>
        <CardDescription>Domains cited most often for your keywords</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {competitors.slice(0, 5).map((comp, i) => (
          <div key={comp.domain} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                {comp.domain}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{comp.citationRate}%</div>
              <div className="text-xs text-muted-foreground">{comp.citedCount} keywords</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface CitationTrendPanelProps {
  trendData: CitationTrendPoint[]
}

export function CitationTrendPanel({ trendData }: CitationTrendPanelProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChartIcon className="h-4 w-4 text-purple-500" />
          Citation Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-20">
          {trendData.map((point) => (
            <TooltipProvider key={point.date}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex-1 bg-purple-500/70 rounded-t hover:bg-purple-500 transition-colors cursor-pointer"
                    style={{ height: `${(point.citationRate / 100) * 80 + 10}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{point.citationRate}% citation rate</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(point.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{new Date(trendData[0]?.date).toLocaleDateString("en-US", { month: "short" })}</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  )
}
