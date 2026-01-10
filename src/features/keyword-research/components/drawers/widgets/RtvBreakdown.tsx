"use client"

import { Bot, Map, Sparkles, DollarSign, Video, TrendingDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { RtvFormulaButton } from "./RtvFormulaButton"

// ============================================================
// RTV Breakdown Card - Clean UI for Traffic Loss Analysis
// ============================================================

type RtvBreakdownItem = {
  label: string
  value: number // Can be negative (e.g. -50) or positive (e.g. 50)
  icon?: "bot" | "map" | "snippet" | "ad" | "video"
  color?: string
}

type RtvBreakdownProps = {
  volume: number
  rtv: number
  loss?: number
  breakdown: RtvBreakdownItem[]
  serpFeatures?: string[]
}

// Icon mapping for SERP features
const ICON_MAP = {
  bot: Bot,
  map: Map,
  snippet: Sparkles,
  ad: DollarSign,
  video: Video,
} as const

// Color classes for each feature type
const FEATURE_STYLES: Record<string, { badge: string; icon: string }> = {
  ai: {
    badge: "border-red-500/30 bg-red-500/10 text-red-300",
    icon: "text-red-400",
  },
  local: {
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    icon: "text-orange-400",
  },
  map: {
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    icon: "text-orange-400",
  },
  snippet: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    icon: "text-amber-400",
  },
  video: {
    badge: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    icon: "text-yellow-400",
  },
  ad: {
    badge: "border-pink-500/30 bg-pink-500/10 text-pink-300",
    icon: "text-pink-400",
  },
  paid: {
    badge: "border-pink-500/30 bg-pink-500/10 text-pink-300",
    icon: "text-pink-400",
  },
  shopping: {
    badge: "border-pink-500/30 bg-pink-500/10 text-pink-300",
    icon: "text-pink-400",
  },
  default: {
    badge: "border-border/60 bg-muted/40 text-muted-foreground",
    icon: "text-muted-foreground",
  },
}

// Helper functions
function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function formatInt(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0
  )
}

/**
 * Normalize breakdown value to positive percentage
 * Handles: -50 -> 50, 50 -> 50, 0.5 -> 50
 */
function normalizeBreakdownValue(value: number): number {
  if (!Number.isFinite(value)) return 0
  const abs = Math.abs(value)
  // Convert fractions (0-1) to percentage
  if (abs > 0 && abs < 1) return Math.round(abs * 100)
  return Math.round(abs)
}

/**
 * Get styling for a breakdown item
 */
function getFeatureStyle(item: RtvBreakdownItem): { badge: string; icon: string } {
  // Use explicit icon if provided
  if (item.icon) {
    const iconKey = item.icon
    if (iconKey === "bot") return FEATURE_STYLES.ai
    if (iconKey === "map") return FEATURE_STYLES.local
    if (iconKey === "snippet") return FEATURE_STYLES.snippet
    if (iconKey === "ad") return FEATURE_STYLES.ad
    if (iconKey === "video") return FEATURE_STYLES.video
  }

  // Fallback to label-based detection
  const label = item.label.toLowerCase()
  if (label.includes("ai")) return FEATURE_STYLES.ai
  if (label.includes("local") || label.includes("map")) return FEATURE_STYLES.local
  if (label.includes("snippet")) return FEATURE_STYLES.snippet
  if (label.includes("video")) return FEATURE_STYLES.video
  if (label.includes("ad") || label.includes("paid") || label.includes("shopping")) return FEATURE_STYLES.ad

  return FEATURE_STYLES.default
}

/**
 * Get icon component for a breakdown item
 */
function getFeatureIcon(item: RtvBreakdownItem) {
  if (item.icon && ICON_MAP[item.icon]) {
    return ICON_MAP[item.icon]
  }
  // Fallback to TrendingDown
  return TrendingDown
}

export function RtvBreakdown({ volume, rtv, loss, breakdown }: RtvBreakdownProps) {
  const safeVolume = Math.max(0, Number(volume) || 0)
  const safeRtv = Math.max(0, Number(rtv) || 0)

  // Use provided breakdown
  const items = Array.isArray(breakdown) ? breakdown : []

  // Calculate total loss from breakdown
  const breakdownLossPct = items.reduce((acc, item) => acc + normalizeBreakdownValue(item.value), 0)

  // Calculate loss fraction
  const lossFraction = loss != null && Number.isFinite(loss)
    ? (loss > 1 ? loss / 100 : loss)
    : (safeVolume > 0 ? clamp01(1 - safeRtv / safeVolume) : clamp01(breakdownLossPct / 100))

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
          <div className="flex items-center gap-2">
            <RtvFormulaButton
              volume={safeVolume}
              rtv={safeRtv}
              lossPercentage={lossPct}
              breakdown={items.map(item => ({ label: item.label, value: normalizeBreakdownValue(item.value) }))}
            />
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-300">
              {realPct}% real
            </div>
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

          <div className="grid min-w-40 grid-cols-2 gap-2 text-xs">
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

        {/* Progress bar */}
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

        {/* Loss breakdown badges */}
        <div className="flex flex-wrap gap-2">
          {items.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No major SERP suppressors detected.
            </div>
          ) : (
            items.map((item) => {
              const style = getFeatureStyle(item)
              const IconComponent = getFeatureIcon(item)
              const pct = normalizeBreakdownValue(item.value)
              return (
                <Badge
                  key={`${item.label}-${pct}`}
                  variant="outline"
                  className={cn("gap-1.5 text-[11px] font-medium", style.badge)}
                >
                  <IconComponent className={cn("h-3 w-3", style.icon)} />
                  <span>{item.label}</span>
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
