"use client"

import { TrendingDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type BreakdownItem = {
  label: string
  value: number
}

type RtvBreakdownProps = {
  volume: number
  rtv: number
  loss: number
  breakdown: BreakdownItem[]
}

type LossMeta = {
  label: string
  badge: string
  icon: string
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function formatInt(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0
  )
}

function normalizeLoss(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  const normalized = value > 1 ? value / 100 : value
  return clamp01(normalized)
}

function lossMeta(label: string): LossMeta {
  const normalized = label.toLowerCase()

  if (normalized.includes("ai")) {
    return {
      label: "AI Overview",
      badge: "border-rose-500/30 bg-rose-500/10 text-rose-300",
      icon: "text-rose-400",
    }
  }

  if (normalized.includes("local") || normalized.includes("map")) {
    return {
      label: "Local Pack",
      badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
      icon: "text-orange-400",
    }
  }

  if (normalized.includes("snippet")) {
    return {
      label: "Featured Snippet",
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      icon: "text-amber-400",
    }
  }

  if (normalized.includes("video")) {
    return {
      label: "Video Carousel",
      badge: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      icon: "text-yellow-400",
    }
  }

  if (normalized.includes("ads") || normalized.includes("paid") || normalized.includes("shopping")) {
    return {
      label: "Paid Ads",
      badge: "border-pink-500/30 bg-pink-500/10 text-pink-300",
      icon: "text-pink-400",
    }
  }

  return {
    label,
    badge: "border-border/60 bg-muted/40 text-muted-foreground",
    icon: "text-muted-foreground",
  }
}

function normalizeBreakdownValue(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value > 0 && value < 1) return Math.round(value * 100)
  return Math.round(value)
}

export function RtvBreakdown({ volume, rtv, loss, breakdown }: RtvBreakdownProps) {
  const safeVolume = Math.max(0, Number(volume) || 0)
  const safeRtv = Math.max(0, Number(rtv) || 0)
  const items = Array.isArray(breakdown) ? breakdown : []

  const breakdownLossPct = items.reduce((acc, item) => acc + normalizeBreakdownValue(item.value), 0)
  const fallbackLoss =
    safeVolume > 0 ? clamp01(1 - safeRtv / safeVolume) : clamp01(breakdownLossPct / 100)
  const lossFraction = normalizeLoss(loss, fallbackLoss)
  const realPct = Math.max(0, Math.min(100, Math.round((1 - lossFraction) * 100)))
  const lossPct = Math.max(0, Math.min(100, 100 - realPct))
  const lostClicks = Math.max(0, safeVolume - safeRtv)

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-foreground">
              Realizable Traffic Potential
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Actual clicks left after SERP modules and ads.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-300">
            {realPct}% real
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Realizable clicks
            </div>
            <div className="text-4xl font-semibold text-emerald-400 tabular-nums">
              {formatInt(safeRtv)}
              <span className="ml-2 text-base font-medium text-muted-foreground/60">
                / {formatInt(safeVolume)}
              </span>
            </div>
          </div>

          <div className="grid min-w-[160px] grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5 text-emerald-300">
              <div className="text-[10px] uppercase tracking-wide text-emerald-200/70">Real</div>
              <div className="font-semibold tabular-nums">{realPct}%</div>
            </div>
            <div className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1.5 text-rose-300">
              <div className="text-[10px] uppercase tracking-wide text-rose-200/70">Lost</div>
              <div className="font-semibold tabular-nums">{lossPct}%</div>
            </div>
            <div className="col-span-2 rounded-md border border-border/60 bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">
                {formatInt(lostClicks)}
              </span>{" "}
              clicks siphoned
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">{realPct}% real</span>
            <span className="text-rose-400 font-medium">{lossPct}% lost</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-border bg-background/50">
            <div className="flex h-full">
              <div className="h-full bg-emerald-500/80" style={{ width: `${realPct}%` }} />
              <div className="h-full bg-rose-500/80" style={{ width: `${lossPct}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {items.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No major SERP suppressors detected.
            </div>
          ) : (
            items.map((item) => {
              const meta = lossMeta(item.label)
              const pct = normalizeBreakdownValue(item.value)
              return (
                <Badge
                  key={`${item.label}-${pct}`}
                  variant="outline"
                  className={cn("gap-1.5 text-[11px] font-medium", meta.badge)}
                >
                  <TrendingDown className={cn("h-3 w-3", meta.icon)} />
                  <span>Lost to {meta.label}</span>
                  <span className="tabular-nums">-{pct}%</span>
                </Badge>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RtvBreakdown
