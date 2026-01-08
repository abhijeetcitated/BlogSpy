// ============================================
// AI WRITER - Competitors Tab Content
// ============================================

"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { EditorStats, CompetitorData } from "../types"
import { COMPETITOR_DATA } from "../constants"

interface CompetitorsTabProps {
  editorStats: EditorStats
}

export function CompetitorsTab({ editorStats }: CompetitorsTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 m-0">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Top Ranking Competitors
        </h3>
        {COMPETITOR_DATA.map((competitor) => (
          <Card key={competitor.rank} className="p-3 bg-slate-800/50 border-slate-700">
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-muted-foreground">
                #{competitor.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {competitor.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {competitor.domain}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-muted-foreground">
                    Words: <span className="text-foreground">{competitor.wordCount}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Headers: <span className="text-foreground">{competitor.headerCount}</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Comparison Card */}
        <Card className="p-4 bg-linear-to-br from-cyan-500/10 to-emerald-500/10 border-cyan-500/30 mt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Your Content vs Top 3
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Word Count</span>
              <span
                className={cn(
                  "font-medium",
                  editorStats.wordCount >= 1500 ? "text-emerald-400" : "text-amber-400"
                )}
              >
                {editorStats.wordCount} / 2,000 avg
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Headings</span>
              <span className="font-medium text-foreground">
                {editorStats.headingCount.h1 +
                  editorStats.headingCount.h2 +
                  editorStats.headingCount.h3}{" "}
                / 10 avg
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Images</span>
              <span
                className={cn(
                  "font-medium",
                  editorStats.imageCount >= 3 ? "text-emerald-400" : "text-amber-400"
                )}
              >
                {editorStats.imageCount} / 5 avg
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
