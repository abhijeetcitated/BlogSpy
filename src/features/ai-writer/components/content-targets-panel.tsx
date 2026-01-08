"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export type ContentTargets = {
  wordTarget: number
  headingTarget: number
}

export type CurrentContentStats = {
  wordCount: number
  headingCount: number
}

export type ContentTargetsPanelProps = {
  targets?: Partial<ContentTargets>
  stats?: Partial<CurrentContentStats>
}

function safeInt(n: unknown, fallback: number): number {
  const v = typeof n === "number" ? n : Number(n)
  return Number.isFinite(v) ? Math.max(0, Math.floor(v)) : fallback
}

export function ContentTargetsPanel({ targets, stats }: ContentTargetsPanelProps) {
  const wordTarget = safeInt(targets?.wordTarget, 1500)
  const headingTarget = safeInt(targets?.headingTarget, 8)

  const wordCount = safeInt(stats?.wordCount, 0)
  const headingCount = safeInt(stats?.headingCount, 0)

  const wordPct = wordTarget === 0 ? 0 : Math.min(100, Math.round((wordCount / wordTarget) * 100))
  const headingPct = headingTarget === 0 ? 0 : Math.min(100, Math.round((headingCount / headingTarget) * 100))

  return (
    <Card className="p-3 bg-card/30 border border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">Content Targets</div>
        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          Stub
        </Badge>
      </div>

      <div className="mt-3 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Words</span>
            <span className="text-foreground">
              {wordCount.toLocaleString()}/{wordTarget.toLocaleString()}
            </span>
          </div>
          <Progress value={wordPct} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Headings</span>
            <span className="text-foreground">
              {headingCount}/{headingTarget}
            </span>
          </div>
          <Progress value={headingPct} />
        </div>
      </div>
    </Card>
  )
}
