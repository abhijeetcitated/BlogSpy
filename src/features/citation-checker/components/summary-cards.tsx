"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CitationScoreRing } from "./citation-score-ring"
import { getCitationRateColor } from "../utils/citation-utils"
import type { CitationSummary } from "../types"

interface SummaryCardsProps {
  summary: CitationSummary
  domain: string
  citationScore: number
}

export function SummaryCards({ summary, domain, citationScore }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Citation Score */}
      <Card className="bg-linear-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <CitationScoreRing score={citationScore} />
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Citation Score for <span className="font-medium text-foreground">{domain}</span>
          </p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-foreground">{summary.totalKeywordsChecked}</div>
            <div className="text-sm text-muted-foreground">Keywords Checked</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{summary.keywordsWithAIOverview}</div>
            <div className="text-sm text-muted-foreground">With AI Overview</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-500">{summary.keywordsCited}</div>
            <div className="text-sm text-muted-foreground">You&apos;re Cited</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className={`text-3xl font-bold ${getCitationRateColor(summary.citationRate)}`}>
              {summary.citationRate}%
            </div>
            <div className="text-sm text-muted-foreground">Citation Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">{summary.keywordsPartialCited}</div>
            <div className="text-sm text-muted-foreground">Partial Citations</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{summary.keywordsNotCited}</div>
            <div className="text-sm text-muted-foreground">Not Cited</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">
              {summary.avgPosition > 0 ? `#${summary.avgPosition}` : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">Avg Position</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-500">{summary.opportunityKeywords}</div>
            <div className="text-sm text-muted-foreground">Opportunities</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
