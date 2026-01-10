// ============================================
// KEYWORD DETAILS DRAWER - Overview Tab
// ============================================
// Premium dark mode UI focused on RTV (Realizable Traffic Value)
// and actionable SERP/competition signals.
// ============================================

"use client"

import * as React from "react"

import { Bot, Eye, TrendingDown, TrendingUp, DollarSign, Info, ShoppingCart, Navigation } from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { generateMockGEOScore } from "@/lib/geo-calculator"
import type { Keyword } from "../../types"
import { RtvBreakdown } from "./widgets/RtvBreakdown"

interface OverviewTabProps {
  keyword: Keyword
}

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  )
}

function titleCase(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function KdGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))

  // Semi-circle gauge (180deg). We render a circle but clip via viewBox.
  const r = 44
  const cx = 50
  const cy = 50
  const circumference = 2 * Math.PI * r

  // Half circumference for semi arc.
  const semi = circumference / 2
  const filled = (semi * v) / 100
  const dashArray = `${filled} ${Math.max(0, semi - filled)}`

  const color =
    v <= 29
      ? "text-emerald-400"
      : v <= 49
      ? "text-amber-400"
      : v <= 69
      ? "text-orange-400"
      : "text-rose-400"

  return (
    <div className="relative h-[72px] w-[120px]">
      <svg viewBox="0 0 100 60" className="h-full w-full">
        <path
          d="M 6 50 A 44 44 0 0 1 94 50"
          className="stroke-border"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />

        <path
          d="M 6 50 A 44 44 0 0 1 94 50"
          className={cn("stroke-current", color)}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashArray}
        />
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
        <div className={cn("text-2xl font-semibold tabular-nums", color)}>{Math.round(v)}</div>
      </div>
    </div>
  )
}

export function OverviewTab({ keyword }: OverviewTabProps) {
  if (!keyword) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        No keyword data available
      </div>
    )
  }

  const volume = Math.max(0, Number(keyword.volume ?? 0) || 0)
  const trend = (keyword.trend ?? []).map((n) => Math.max(0, Number(n) || 0))
  const kd = Math.max(0, Math.min(100, Number(keyword.kd ?? 0) || 0))

  // Back-compat: weakSpot (deprecated) + new weakSpots
  const weakSpotLegacy = keyword.weakSpot ?? { type: null }
  const weakSpots = keyword.weakSpots ?? { reddit: null, quora: null, pinterest: null }

  const geoScore = Math.max(0, Math.min(100, Number(keyword.geoScore ?? generateMockGEOScore(keyword.id)) || 0))

  const aioActive =
    Boolean(keyword.hasAio) ||
    (keyword.serpFeatures ?? []).some((f) => String(f).toLowerCase().includes("ai_overview"))

  const rtvValue = Math.max(0, Number(keyword.rtv ?? 0) || 0)
  const rtvBreakdown = Array.isArray(keyword.rtvBreakdown) ? keyword.rtvBreakdown : []
  const breakdownLoss = rtvBreakdown.reduce((acc, item) => {
    const raw = Math.max(0, Number(item.value) || 0)
    if (raw > 0 && raw < 1) return acc + raw
    return acc + raw / 100
  }, 0)
  const hasRtv = typeof keyword.rtv === "number" && Number.isFinite(keyword.rtv)
  const loss = Math.max(
    0,
    Math.min(1, hasRtv && volume > 0 ? 1 - rtvValue / volume : breakdownLoss)
  )

  const trendGrowth =
    trend.length >= 2
      ? ((trend[trend.length - 1] - trend[0]) / Math.max(trend[0], 1)) * 100
      : 0
  const trendIcon = trendGrowth > 0 ? TrendingUp : trendGrowth < 0 ? TrendingDown : TrendingUp

  const trendData = trend.map((v, i) => ({ i, v }))

  // Weak spot analysis: prefer new object; fallback to legacy if present.
  const weakSignals: Array<{ platform: "reddit" | "quora" | "pinterest"; rank: number; url?: string | null }> = []
  ;(["reddit", "quora", "pinterest"] as const).forEach((p) => {
    const rank = weakSpots[p]
    if (typeof rank === "number" && rank > 0 && rank <= 10) weakSignals.push({ platform: p, rank })
  })
  weakSignals.sort((a, b) => a.rank - b.rank)

  if (weakSignals.length === 0 && weakSpotLegacy.type && typeof weakSpotLegacy.rank === "number") {
    weakSignals.push({ platform: weakSpotLegacy.type, rank: weakSpotLegacy.rank })
  }

  const googleSearchUrlFor = (platform: string): string => {
    const site = platform === "reddit" ? "site:reddit.com" : platform === "quora" ? "site:quora.com" : "site:pinterest.com"
    return `https://www.google.com/search?q=${encodeURIComponent(`${site} ${keyword.keyword}`)}`
  }

  // Intent configuration matching table column colors
  type IntentCode = "I" | "C" | "T" | "N"
  const intentConfig: Record<IntentCode, {
    label: string
    icon: typeof Info
    color: string
    bgColor: string
    borderColor: string
  }> = {
    I: {
      label: "Informational",
      icon: Info,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    C: {
      label: "Commercial",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    T: {
      label: "Transactional",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    N: {
      label: "Navigational",
      icon: Navigation,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
  }

  const intents = (keyword.intent ?? []) as IntentCode[]

  return (
    <div className="grid grid-cols-12 gap-3 sm:gap-4 h-full p-0.5 sm:p-1">
      {/* Left: Dense dashboard (RTV + core metrics) */}
      <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0 gap-3 sm:gap-4">
        <div className="shrink-0">
          <RtvBreakdown
            volume={volume}
            rtv={rtvValue}
            loss={loss}
            breakdown={rtvBreakdown}
            serpFeatures={keyword.serpFeatures as string[]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Trend Card */}
          <Card className="border-border bg-transparent">
            <CardHeader className="pb-1 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Trend
                </CardTitle>
                <div className="inline-flex items-center gap-1.5 text-[11px]">
                  {React.createElement(trendIcon, {
                    className: cn(
                      "h-3.5 w-3.5",
                      trendGrowth > 3
                        ? "text-emerald-400"
                        : trendGrowth < -3
                          ? "text-rose-400"
                          : "text-muted-foreground"
                    ),
                  })}
                  <span
                    className={cn(
                      "tabular-nums font-medium",
                      trendGrowth > 3
                        ? "text-emerald-400"
                        : trendGrowth < -3
                          ? "text-rose-400"
                          : "text-muted-foreground"
                    )}
                  >
                    {`${trendGrowth >= 0 ? "+" : ""}${trendGrowth.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 pt-2 px-4 pb-4">
              <div className="text-[11px] text-muted-foreground/60">Last 12 months</div>
              <div className="h-[64px] w-full">
                <ResponsiveContainer width="100%" height={64}>
                  <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis dataKey="i" hide />
                    <YAxis hide domain={[0, "dataMax"]} />
                    <RechartsTooltip
                      cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        color: "hsl(var(--popover-foreground))",
                        fontSize: 11,
                      }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                      formatter={(value: unknown) => [formatInt(Number(value) || 0), "Volume"]}
                      labelFormatter={(label) => `Month ${Number(label) + 1}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* KD Card */}
          <Card className="border-border bg-transparent">
            <CardHeader className="pb-1 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  KD
                </CardTitle>
                <span className="text-[11px] text-muted-foreground/60">0–100</span>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center space-y-1.5 pt-2 px-4 pb-4">
              <KdGauge value={kd} />
              <div className="text-sm font-medium text-foreground/80">
                {kd <= 29 ? "Easy" : kd <= 49 ? "Moderate" : kd <= 69 ? "Hard" : "Very Hard"}
              </div>
              <div className="text-[11px] text-center text-muted-foreground/60">Lower is easier to rank</div>
            </CardContent>
          </Card>

          {/* GEO Score Card */}
          <Card className="border-border bg-transparent">
            <CardHeader className="pb-1 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  GEO
                </CardTitle>
                {aioActive ? (
                  <Badge
                    variant="outline"
                    className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px]"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                ) : (
                  <span className="text-[11px] text-muted-foreground/60">Traditional</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center space-y-1.5 pt-2 px-4 pb-4">
              <div className="flex items-center gap-3">
                <Bot
                  className={cn(
                    "h-7 w-7",
                    aioActive ? "text-purple-400" : "text-muted-foreground/40"
                  )}
                />
                <div
                  className={cn(
                    "text-3xl font-bold tabular-nums",
                    aioActive ? "text-purple-300" : "text-primary/70"
                  )}
                >
                  {Math.round(geoScore)}%
                </div>
              </div>
              <div className="text-[11px] text-center text-muted-foreground/60">AI answer readiness</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right: Compact cards (intent + scrollable secondary panels) */}
      <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0 gap-3 sm:gap-4">
        {intents.length > 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2 px-4">
              <CardTitle className="text-sm font-semibold text-foreground">Search Intent</CardTitle>
              <p className="text-[11px] text-muted-foreground">What users want for this query</p>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {intents.map((intentCode) => {
                  const config = intentConfig[intentCode]
                  if (!config) return null
                  const Icon = config.icon

                  return (
                    <Tooltip key={intentCode}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-7 px-2.5 text-xs font-medium border cursor-default",
                            config.bgColor,
                            config.borderColor,
                            config.color
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 mr-1.5" />
                          {config.label}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <div className="font-semibold mb-1">{config.label} Intent</div>
                          <div className="text-muted-foreground">
                            {intentCode === "I" && "Users want information or answers"}
                            {intentCode === "C" && "Users are researching products/services"}
                            {intentCode === "T" && "Users are ready to buy or take action"}
                            {intentCode === "N" && "Users want to find a specific site"}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/50 border-border flex flex-col min-h-0">
          <CardHeader className="pb-2 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Weak Spots
              </CardTitle>
              <div className="inline-flex items-center gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5 text-violet-500" />
                <span className="tabular-nums font-semibold text-violet-600 dark:text-violet-400">
                  {weakSignals.length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 sm:overflow-y-auto pr-2 px-4 pb-4 space-y-2">
            {weakSignals.length > 2 ? (
              <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-700 dark:text-violet-300">
                🎯 High Opportunity
              </div>
            ) : null}

            {weakSignals.length === 0 ? (
              <div className="text-sm text-muted-foreground">No weak platforms in top 10.</div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {weakSignals.map((s) => {
                  const href = s.url || googleSearchUrlFor(s.platform)
                  const label = `${titleCase(s.platform)}`

                  return (
                    <a
                      key={`${s.platform}_${s.rank}`}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-500/50 transition-all group"
                      title={s.url ? "Open result" : "Search Google"}
                    >
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-violet-500 text-[11px] font-bold text-white shadow-sm">
                        #{s.rank}
                      </span>
                      <span className="text-sm font-medium text-violet-700 dark:text-violet-300 group-hover:text-violet-600 dark:group-hover:text-violet-200">
                        {label}
                      </span>
                    </a>
                  )
                })}
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              Click a platform to open result/search
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border flex flex-col min-h-0">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              SERP Features
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 sm:overflow-y-auto pr-2 px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {(keyword.serpFeatures ?? []).length > 0 ? (
                (keyword.serpFeatures ?? []).map((feature) => (
                  <Badge
                    key={feature}
                    variant="outline"
                    className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
                  >
                    {String(feature)}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No special SERP features.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OverviewTab
