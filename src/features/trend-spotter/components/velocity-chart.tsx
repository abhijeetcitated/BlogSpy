"use client"

import Link from "next/link"
import { useCallback, useRef, useState } from "react"
import { format, differenceInDays, subDays, subHours, subMinutes, subMonths } from "date-fns"
import {
  Legend,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"
import { TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import type { VelocityDataPoint } from "../types"
import type { ForecastPoint } from "../utils"
import type { DateRange } from "react-day-picker"


type PlatformKey = "web" | "youtube" | "news" | "shopping"

type VelocityGodPoint = {
  date: string
  web: number | null
  youtube: number | null
  news: number | null
  shopping: number | null
  /** Optional forecast extension for the selected platform. */
  forecastLine?: number | null
}

interface VelocityChartProps {
  searchQuery: string
  /**
   * Preferred input shape ("God View"):
   * { date, web, youtube, news, shopping, forecastLine? }
   */
  data?: VelocityGodPoint[] | VelocityDataPoint[]
  forecastData?: ForecastPoint[]
  globalVolume?: number
  viralityScore?: number
  /** Spotlight selection (e.g. "youtube"). When unset, all lines render normally. */
  activePlatform?: PlatformKey | null
  /** @deprecated Use `activePlatform` instead. */
  selectedPlatform?: string
  timeframe?: string
  dateRange?: DateRange
}

function formatPercent(value: number): string {
  const rounded = Math.round(value)
  if (rounded >= 0) return `+${rounded}%`
  return `${rounded}%`
}

function formatTooltipDate(label: unknown): string {
  if (typeof label !== "string") return String(label ?? "")

  // Expecting YYYY-MM from transformers.
  const m = /^([0-9]{4})-([0-9]{2})$/.exec(label)
  if (!m) return label

  const year = Number(m[1])
  const monthIndex = Number(m[2]) - 1
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return label
  if (monthIndex < 0 || monthIndex > 11) return label

  const date = new Date(Date.UTC(year, monthIndex, 1))
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

function formatXAxisTickMonthOnly(label: unknown): string {
  if (typeof label !== "string") return String(label ?? "")

  const m = /^([0-9]{4})-([0-9]{2})$/.exec(label)
  if (!m) return label

  const monthIndex = Number(m[2]) - 1
  if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) return label

  // Keep the axis clean (just month).
  const date = new Date(Date.UTC(2000, monthIndex, 1))
  return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date)
}

function formatXAxisTickMonthYear(label: unknown): string {
  if (typeof label !== "string") return String(label ?? "")

  const m = /^([0-9]{4})-([0-9]{2})$/.exec(label)
  if (!m) return label

  const year = Number(m[1])
  const monthIndex = Number(m[2]) - 1
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return label
  if (monthIndex < 0 || monthIndex > 11) return label

  // 12M: make year visible (e.g. "Jan 26").
  const date = new Date(Date.UTC(year, monthIndex, 1))
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date)
}

function formatXAxisTickForTimeframe(label: unknown, timeframe?: string): string {
  if (typeof label !== "string") return String(label ?? "")

  const tf = (timeframe ?? "").trim().toUpperCase()

  // 12M: show month + year so it is unambiguous.
  if (tf === "12M") return formatXAxisTickMonthYear(label)

  // 30D: show day + short month (01 Jan)
  if (tf !== "30D") return formatXAxisTickMonthOnly(label)

  // Accept either YYYY-MM-DD or YYYY-MM (fallback).
  const dayMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(label)
  if (dayMatch) {
    const year = Number(dayMatch[1])
    const monthIndex = Number(dayMatch[2]) - 1
    const day = Number(dayMatch[3])
    if (
      Number.isFinite(year) &&
      Number.isFinite(monthIndex) &&
      Number.isFinite(day) &&
      monthIndex >= 0 &&
      monthIndex <= 11
    ) {
      const date = new Date(Date.UTC(year, monthIndex, day))
      return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }).format(date)
    }
  }

  // If we only have YYYY-MM, keep axis clean with month.
  return formatXAxisTickMonthOnly(label)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

function buildFallbackData(timeframe?: string, dateRange?: DateRange): VelocityGodPoint[] {
  const tf = (timeframe ?? "").trim().toUpperCase()
  const rawBaseDate = dateRange?.to ?? new Date()
  const baseDate =
    tf === "4H"
      ? new Date(Math.floor(rawBaseDate.getTime() / (10 * 60 * 1000)) * 10 * 60 * 1000)
      : tf === "24H"
        ? new Date(Math.floor(rawBaseDate.getTime() / (60 * 60 * 1000)) * 60 * 60 * 1000)
        : rawBaseDate

  const makePoint = (date: Date, index: number): VelocityGodPoint => {
    const base = Math.min(100, 35 + index * 3)
    return {
      date: date.toISOString(),
      web: base,
      youtube: Math.max(0, base - 8),
      news: Math.max(0, base - 14),
      shopping: Math.max(0, base - 18),
    }
  }

  const buildSeries = (count: number, step: (date: Date, index: number) => Date) =>
    Array.from({ length: count }, (_, i) => {
      const idx = count - 1 - i
      const pointDate = step(baseDate, idx)
      return makePoint(pointDate, i)
    })

  if (tf === "4H") {
    return buildSeries(24, (date, index) => subMinutes(date, index * 10))
  }

  if (tf === "24H") {
    return buildSeries(24, (date, index) => subHours(date, index))
  }

  if (tf === "7D") {
    return buildSeries(7, (date, index) => subDays(date, index))
  }

  if (tf === "30D") {
    return buildSeries(30, (date, index) => subDays(date, index))
  }

  if (tf === "12M") {
    const points = buildSeries(12, (date, index) => subMonths(date, index))
    return points.map((point) => {
      const d = new Date(point.date)
      const label = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      return { ...point, date: label }
    })
  }

  if (tf === "CUSTOM" && dateRange?.from && dateRange?.to) {
    const diff = differenceInDays(dateRange.to, dateRange.from)
    if (diff <= 2) {
      return buildSeries(24, (date, index) => subHours(date, index))
    }
    if (diff <= 120) {
      const count = Math.max(2, diff + 1)
      return buildSeries(count, (date, index) => subDays(date, index))
    }
    const points = buildSeries(12, (date, index) => subMonths(date, index))
    return points.map((point) => {
      const d = new Date(point.date)
      const label = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
      return { ...point, date: label }
    })
  }

  return buildSeries(30, (date, index) => subDays(date, index))
}

function monthAbbrevToIndex(value: string): number | null {
  const normalized = value.trim().toLowerCase()
  const map: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  }

  const idx = map[normalized]
  return typeof idx === "number" ? idx : null
}

function addMonthsToYearMonth(yearMonth: string, offsetMonths: number): string {
  const m = /^([0-9]{4})-([0-9]{2})$/.exec(yearMonth)
  if (!m) return yearMonth

  const year = Number(m[1])
  const monthIndex = Number(m[2]) - 1
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return yearMonth

  const d = new Date(Date.UTC(year, monthIndex + offsetMonths, 1))
  const y = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0")
  return `${y}-${mo}`
}

function clamp0(n: number): number {
  return Math.max(0, n)
}

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function parseSortableDate(label: string): number | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const date = new Date(`${label}T00:00:00Z`)
    return Number.isFinite(date.getTime()) ? date.getTime() : null
  }
  if (/^\d{4}-\d{2}$/.test(label)) {
    const date = new Date(`${label}-01T00:00:00Z`)
    return Number.isFinite(date.getTime()) ? date.getTime() : null
  }
  return null
}

function mergeForecastPoints(
  data: VelocityGodPoint[],
  forecastData?: ForecastPoint[],
  baseKey: PlatformKey = "web"
): VelocityGodPoint[] {
  if (!forecastData || forecastData.length === 0) return data

  const merged = data.map((point) => ({ ...point }))
  const indexByDate = new Map<string, number>()
  merged.forEach((point, index) => indexByDate.set(point.date, index))

  for (const point of forecastData) {
    const existingIndex = indexByDate.get(point.date)
    if (existingIndex !== undefined) {
      merged[existingIndex].forecastLine = point.forecast
      continue
    }
    merged.push({
      date: point.date,
      web: null,
      youtube: null,
      news: null,
      shopping: null,
      forecastLine: point.forecast,
    })
  }

  const lastActualIndex = merged.reduce((idx, point, index) => {
    if (typeof point[baseKey] === "number") return index
    return idx
  }, -1)

  if (lastActualIndex >= 0) {
    const lastActual = merged[lastActualIndex]?.[baseKey]
    if (typeof lastActual === "number") {
      merged[lastActualIndex].forecastLine = lastActual
    }
  }

  const sortable = merged.every((point) => parseSortableDate(point.date) !== null)
  if (sortable) {
    merged.sort((a, b) => (parseSortableDate(a.date) ?? 0) - (parseSortableDate(b.date) ?? 0))
  }

  return merged
}

function isGodPointArray(value: unknown): value is VelocityGodPoint[] {
  if (!Array.isArray(value)) return false
  const first = value[0] as unknown
  if (!first || typeof first !== "object") return false
  return (
    "date" in (first as Record<string, unknown>) &&
    "web" in (first as Record<string, unknown>) &&
    "youtube" in (first as Record<string, unknown>) &&
    "news" in (first as Record<string, unknown>) &&
    "shopping" in (first as Record<string, unknown>)
  )
}

function normalizeToGodView(
  input: VelocityChartProps["data"],
  seed: number
): VelocityGodPoint[] {
  // 1) If the caller already passes the god-view shape, trust it.
  if (isGodPointArray(input) && input.length > 0) {
    return input
  }

  // 2) Fallback: convert existing single-series VelocityDataPoint[] into the 4-series structure.
  // If no data is provided, render an empty chart (no mock/static points).
  const legacy = (Array.isArray(input) && input.length > 0 ? input : []) as VelocityDataPoint[]

  // Deterministic offsets so each platform line is distinct.
  const jitterA = (seed % 7) - 3
  const jitterB = (seed % 9) - 4
  const jitterC = (seed % 11) - 5

  // If the legacy series uses month names (Jan..Dec), promote them to YYYY-MM so tooltip can show Month+Year.
  const now = new Date()
  const currentYear = now.getUTCFullYear()
  const monthTokens = new Set(legacy.map((p) => p.month.trim()))
  const looksLikeCalendarYear = monthTokens.has("Jan") && monthTokens.has("Dec")
  const baseYear = looksLikeCalendarYear ? currentYear - 1 : currentYear

  let lastYearMonth: string | null = null

  if (legacy.length === 0) return []

  return legacy.map((p) => {
    let dateLabel = p.month

    // YYYY-MM already
    if (/^\d{4}-\d{2}$/.test(p.month)) {
      dateLabel = p.month
      lastYearMonth = p.month
    } else {
      const plus = /^\+(\d+)$/.exec(p.month.trim())
      if (plus && lastYearMonth) {
        const offset = Number(plus[1])
        if (Number.isFinite(offset) && offset > 0) {
          dateLabel = addMonthsToYearMonth(lastYearMonth, offset)
        }
      } else {
        const idx = monthAbbrevToIndex(p.month)
        if (idx !== null) {
          dateLabel = `${baseYear}-${String(idx + 1).padStart(2, "0")}`
          lastYearMonth = dateLabel
        }
      }
    }

    const baseActual = p.actual
    const baseForOthers = typeof baseActual === "number" ? baseActual : p.forecast ?? null

    const youtube =
      typeof baseForOthers === "number" ? clamp0(Math.round(baseForOthers * 0.92 + jitterA)) : null
    const news = typeof baseForOthers === "number" ? clamp0(Math.round(baseForOthers * 0.78 + jitterB)) : null
    const shopping =
      typeof baseForOthers === "number" ? clamp0(Math.round(baseForOthers * 0.66 + jitterC)) : null

    return {
      date: dateLabel,
      web: baseActual,
      youtube,
      news,
      shopping,
      // Keep the legacy forecast as a dashed web extension.
      forecastLine: p.forecast,
    }
  })
}

function formatPlatformLabel(platform: PlatformKey): string {
  switch (platform) {
    case "web":
      return "Web Search"
    case "youtube":
      return "YouTube"
    case "news":
      return "Viral Signals"
    case "shopping":
      return "Buyer Intent"
  }
}

function getForecastStroke(platform: PlatformKey | null): string {
  switch (platform) {
    case "youtube":
      return "#FCA5A5"
    case "news":
      return "#6EE7B7"
    case "shopping":
      return "#FCD34D"
    case "web":
    default:
      return "#93C5FD"
  }
}

function formatValue(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A"
  return `${Math.round(value)}`
}

function GodViewTooltip({
  active,
  label,
  payload,
  activePlatform,
  formatLabel,
  globalVolume,
}: TooltipProps<number, string> & {
  activePlatform: PlatformKey | null
  formatLabel: (value: string) => string
  globalVolume?: number
}) {
  if (!active || !payload || payload.length === 0) return null

  // We want a stable order regardless of which series Recharts sends first.
  const byKey: Partial<Record<PlatformKey, number | null>> = {}

  for (const item of payload) {
    const key = item.dataKey
    if (key === "web" || key === "youtube" || key === "news" || key === "shopping") {
      const v = typeof item.value === "number" ? item.value : null
      byKey[key] = v
    }
  }

  const rows: Array<{ key: PlatformKey; color: string }> = [
    { key: "web", color: "#3B82F6" },
    { key: "youtube", color: "#EF4444" },
    { key: "news", color: "#10B981" },
    { key: "shopping", color: "#F59E0B" },
  ]

  return (
    <div className="rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 shadow-xl px-3 py-2">
      <div className="text-xs font-medium mb-2 text-slate-900 dark:text-slate-100">
        {formatLabel(String(label ?? ""))}
      </div>

      <div className="space-y-1 text-slate-900 dark:text-slate-100">
        {rows.map((row) => {
          const isActive = activePlatform !== null && activePlatform === row.key
          const trendScore = byKey[row.key]
          const hasVolume = typeof globalVolume === "number" && Number.isFinite(globalVolume)
          const estimatedSearches =
            typeof trendScore === "number" && hasVolume
              ? Math.round((trendScore / 100) * globalVolume)
              : null
          return (
            <div
              key={row.key}
              className={
                "flex items-center justify-between gap-4 text-xs rounded-md px-2 py-1 " +
                (isActive ? "bg-slate-900/5 dark:bg-white/10 font-bold" : "")
              }
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                <span>{formatPlatformLabel(row.key)}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatValue(trendScore)}</div>
                <div className="text-[10px] leading-3 text-slate-500 dark:text-slate-400">(Interest Score)</div>
                {estimatedSearches !== null && (
                  <div className="text-[10px] leading-3 text-slate-500 dark:text-slate-400">
                    Est. Searches: {formatNumber(estimatedSearches)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function VelocityChart({
  searchQuery,
  data,
  forecastData,
  globalVolume,
  viralityScore,
  activePlatform,
  selectedPlatform,
  timeframe,
  dateRange,
}: VelocityChartProps) {
  const chartBoundsRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [cardPos, setCardPos] = useState({ x: 8, y: 8 })
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const clampCardPosition = useCallback((x: number, y: number) => {
    const bounds = chartBoundsRef.current?.getBoundingClientRect()
    const card = cardRef.current?.getBoundingClientRect()
    if (!bounds || !card) return { x, y }

    const maxX = Math.max(0, bounds.width - card.width)
    const maxY = Math.max(0, bounds.height - card.height)
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    }
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!chartBoundsRef.current || !cardRef.current) return
      const bounds = chartBoundsRef.current.getBoundingClientRect()
      dragOffsetRef.current = {
        x: event.clientX - bounds.left - cardPos.x,
        y: event.clientY - bounds.top - cardPos.y,
      }
      setIsDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [cardPos.x, cardPos.y]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !chartBoundsRef.current) return
      const bounds = chartBoundsRef.current.getBoundingClientRect()
      const nextX = event.clientX - bounds.left - dragOffsetRef.current.x
      const nextY = event.clientY - bounds.top - dragOffsetRef.current.y
      setCardPos(clampCardPosition(nextX, nextY))
    },
    [isDragging, clampCardPosition]
  )

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [isDragging])
  const getAxisFormat = useCallback(
    (dateStr: string) => {
      const date = new Date(dateStr)
      if (Number.isNaN(date.getTime())) return dateStr

      const tf = (timeframe ?? "").trim().toUpperCase()
      if (tf === "4H" || tf === "24H") return format(date, "HH:mm")
      if (tf === "7D" || tf === "30D") return format(date, "d MMM")
      if (tf === "12M") return format(date, "MMM yy")

      if (tf === "CUSTOM" && dateRange?.from && dateRange?.to) {
        const diff = differenceInDays(dateRange.to, dateRange.from)
        if (diff <= 2) return format(date, "HH:mm")
        if (diff <= 90) return format(date, "d MMM")
        return format(date, "MMM yy")
      }

      return format(date, "d MMM")
    },
    [timeframe, dateRange]
  )

  const spotlightKey: PlatformKey | null =
    activePlatform ??
    (selectedPlatform === "web" ||
    selectedPlatform === "youtube" ||
    selectedPlatform === "news" ||
    selectedPlatform === "shopping"
      ? selectedPlatform
      : null)

  const isSpotlightOn = spotlightKey !== null

  const formatXAxis = (dateStr: string) => getAxisFormat(dateStr)

  function lineStyle(key: PlatformKey) {
    const isActive = isSpotlightOn && spotlightKey === key
    if (isActive) {
      return { strokeOpacity: 1, strokeWidth: 4, dot: true as const }
    }
    if (isSpotlightOn) {
      // Keep inactive lines visible while still dimmed.
      return { strokeOpacity: 0.2, strokeWidth: 2, dot: false as const }
    }
    return { strokeOpacity: 1, strokeWidth: 3, dot: false as const }
  }

  function forecastStyle() {
    const isActive = isSpotlightOn && spotlightKey !== null
    if (isActive) {
      return { strokeOpacity: 1, strokeWidth: 2, dot: false as const }
    }
    if (isSpotlightOn) {
      // Keep inactive forecast visible while still dimmed.
      return { strokeOpacity: 0.4, strokeWidth: 2, dot: false as const }
    }
    return { strokeOpacity: 1, strokeWidth: 2, dot: false as const }
  }

  // Seed only used for legacy->god view conversion (keeps mock refresh working).
  const seed = hashString(`${spotlightKey ?? ""}:${timeframe ?? ""}`)
  const normalizedData = normalizeToGodView(data, seed)

  const fallbackData = buildFallbackData(timeframe, dateRange)

  // Use normalized data if available, otherwise use fallback
  const safeData = normalizedData.length > 0 ? normalizedData : fallbackData
  const forecastBaseKey: PlatformKey = spotlightKey ?? "web"
  const chartData = mergeForecastPoints(safeData, forecastData, forecastBaseKey)

  const score = typeof viralityScore === "number" && Number.isFinite(viralityScore) ? viralityScore : 39
  const forecastStroke = getForecastStroke(spotlightKey)
  const forecastMonths = forecastData?.length ?? 0
  const lastActual = [...chartData]
    .reverse()
    .find((point) => typeof point[forecastBaseKey] === "number")?.[forecastBaseKey]
  const maxForecast = forecastData?.reduce((max, point) => Math.max(max, point.forecast), -Infinity)
  const hasForecast =
    typeof lastActual === "number" &&
    typeof maxForecast === "number" &&
    Number.isFinite(maxForecast) &&
    forecastMonths > 0
  const growthLabel = hasForecast
    ? `Peak: ${formatPercent(((maxForecast - (lastActual as number)) / Math.max(1, lastActual as number)) * 100)} in ${forecastMonths}mo`
    : "Peak: +14% in 3mo"

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Velocity Chart</CardTitle>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 sm:w-4 h-0.5 bg-blue-500 rounded-full" />
              <span>Web</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 sm:w-4 h-0.5 bg-red-500 rounded-full" />
              <span>YouTube</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 sm:w-4 h-0.5 bg-emerald-500 rounded-full" />
              <span>Viral</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 sm:w-4 h-0.5 bg-amber-500 rounded-full" />
              <span>Intent</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative h-[280px] sm:h-[350px] md:h-[400px] pt-2 sm:pt-4 px-2 sm:px-6 pb-3 sm:pb-6">
        {/* Breakout Overlay Card */}
        <div
          ref={chartBoundsRef}
          className="absolute inset-2 sm:inset-4 z-20 pointer-events-none"
        >
          <div
            ref={cardRef}
            className="pointer-events-auto touch-none select-none inline-block"
            style={{ transform: `translate3d(${cardPos.x}px, ${cardPos.y}px, 0)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div
              className={
                "bg-linear-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl " +
                "p-2.5 sm:p-4 shadow-xl sm:shadow-2xl shadow-amber-500/30 min-w-[150px] sm:min-w-[200px] " +
                "cursor-grab active:cursor-grabbing"
              }
            >
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] sm:text-xs font-bold text-white/90 uppercase tracking-wider">Breakout</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
              {formatPercent(score)} <span className="text-xs sm:text-base font-medium">Viral</span>
            </p>
            {/* Difficulty Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 mb-2 sm:mb-3 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-white/20 rounded-md sm:rounded-lg backdrop-blur-sm">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-white">Easy</span>
              <span className="text-[8px] sm:text-[10px] text-white/70 hidden sm:inline">(Weak)</span>
            </div>
            <Button
              size="sm"
              className="w-full h-7 sm:h-8 text-[10px] sm:text-xs bg-white hover:bg-zinc-100 text-black font-semibold"
              asChild
            >
              <Link href={`/ai-writer?source=trend-spotter&keyword=${encodeURIComponent(searchQuery)}&velocity=rising`}>
                <span className="hidden sm:inline">Write Article Now</span>
                <span className="sm:hidden">Write Now</span>
              </Link>
            </Button>
          </div>
          </div>
        </div>

        {/* The Chart (God View) */}
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 30, right: 20, left: 0, bottom: 40 }}>
              {/* Remove default Recharts legend (we already render a custom one in the header). */}
              <Legend content={() => null} />
              <Tooltip
                content={
                  <GodViewTooltip
                    activePlatform={spotlightKey}
                    formatLabel={formatXAxis}
                    globalVolume={globalVolume}
                  />
                }
              />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#333", opacity: 0.2 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => formatXAxis(String(value ?? ""))}
              >
                <Label value="Timeline" offset={0} position="insideBottom" fill="#6B7280" fontSize={10} />
              </XAxis>

              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}`}
              >
                <Label
                  value="Interest Score (0-100)"
                  angle={-90}
                  position="insideLeft"
                  fill="#6B7280"
                  fontSize={10}
                  style={{ textAnchor: "middle" }}
                />
              </YAxis>

              {/* Web Search (main) */}
              <Line
                type="monotone"
                dataKey="web"
                name="Web Search"
                stroke="#3B82F6"
                strokeOpacity={lineStyle("web").strokeOpacity}
                strokeWidth={lineStyle("web").strokeWidth}
                dot={lineStyle("web").dot}
                isAnimationActive
                animationDuration={400}
                animationEasing="ease-out"
                connectNulls={false}
              />

              {/* YouTube */}
              <Line
                type="monotone"
                dataKey="youtube"
                name="YouTube"
                stroke="#EF4444"
                strokeOpacity={lineStyle("youtube").strokeOpacity}
                strokeWidth={lineStyle("youtube").strokeWidth}
                dot={lineStyle("youtube").dot}
                isAnimationActive
                animationDuration={400}
                animationEasing="ease-out"
                connectNulls={false}
              />

              {/* Viral Signals */}
              <Line
                type="monotone"
                dataKey="news"
                name="Viral Signals"
                stroke="#10B981"
                strokeOpacity={lineStyle("news").strokeOpacity}
                strokeWidth={lineStyle("news").strokeWidth}
                dot={lineStyle("news").dot}
                isAnimationActive
                animationDuration={400}
                animationEasing="ease-out"
                connectNulls={false}
              />

              {/* Buyer Intent */}
              <Line
                type="monotone"
                dataKey="shopping"
                name="Buyer Intent"
                stroke="#F59E0B"
                strokeOpacity={lineStyle("shopping").strokeOpacity}
                strokeWidth={lineStyle("shopping").strokeWidth}
                dot={lineStyle("shopping").dot}
                isAnimationActive
                animationDuration={400}
                animationEasing="ease-out"
                connectNulls={false}
              />

              {/* Forecast extension (dashed) for active platform */}
              <Line
                type="monotone"
                dataKey="forecastLine"
                name={`${formatPlatformLabel(forecastBaseKey)} Forecast`}
                stroke={forecastStroke}
                strokeOpacity={forecastStyle().strokeOpacity}
                strokeWidth={forecastStyle().strokeWidth}
                strokeDasharray="5 5"
                dot={forecastStyle().dot}
                isAnimationActive
                animationDuration={400}
                animationEasing="ease-out"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Banner */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-amber-900/30 border border-amber-700/40 rounded-md sm:rounded-lg">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-amber-300">
              {growthLabel}
            </span>
            <span className="text-[10px] sm:text-xs text-amber-400/70 hidden md:inline">Based on historical patterns</span>
            <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] sm:text-xs px-1.5 sm:px-2">
              {hasForecast ? growthLabel.replace("Peak: ", "") : formatPercent(score)}
            </Badge>
          </div>
        </div>
      </CardContent>

    </Card>
  )
}
