"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type ScoreStatus = "good" | "medium" | "warning" | "info"

export type GEOAEOPanelProps = {
  geoScore?: number
  aeoScore?: number
  status?: ScoreStatus
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function statusBadgeClass(status: ScoreStatus): string {
  switch (status) {
    case "good":
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
    case "medium":
      return "bg-amber-500/10 border-amber-500/30 text-amber-400"
    case "warning":
      return "bg-red-500/10 border-red-500/30 text-red-400"
    case "info":
    default:
      return "bg-muted/40 border-border text-muted-foreground"
  }
}

export function GEOAEOPanel({ geoScore = 0, aeoScore = 0, status = "info" }: GEOAEOPanelProps) {
  const geo = clampScore(geoScore)
  const aeo = clampScore(aeoScore)

  return (
    <Card className="p-3 bg-card/30 border border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground">GEO / AEO</div>
        <Badge variant="outline" className={"text-[10px] " + statusBadgeClass(status)}>
          {status.toUpperCase()}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-card/40 p-2">
          <div className="text-[11px] text-muted-foreground">GEO</div>
          <div className="text-lg font-bold text-foreground">{geo}</div>
        </div>
        <div className="rounded-lg border border-border bg-card/40 p-2">
          <div className="text-[11px] text-muted-foreground">AEO</div>
          <div className="text-lg font-bold text-foreground">{aeo}</div>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground">
        Stub panel (scores not wired).
      </div>
    </Card>
  )
}
