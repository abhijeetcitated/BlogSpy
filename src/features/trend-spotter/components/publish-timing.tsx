"use client"

import { useMemo, useState } from "react"
import { MapPin } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import type { PublishTimingData, UrgencyLevel } from "../types"
import { saveToRoadmap } from "../actions/save-to-roadmap"
import { ClockIcon, CalendarIcon, WarningIcon, LightningIcon } from "./icons"

type ForecastPoint = { date: string; value: number }

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Urgency config
const urgencyConfig: Record<UrgencyLevel, { color: string; bgColor: string; icon: typeof LightningIcon }> = {
  critical: { color: "text-red-400", bgColor: "bg-red-500/20", icon: WarningIcon },
  high: { color: "text-amber-400", bgColor: "bg-amber-500/20", icon: LightningIcon },
  medium: { color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: ClockIcon },
  low: { color: "text-green-400", bgColor: "bg-green-500/20", icon: ClockIcon },
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, offset: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + offset)
  return next
}

function parseForecastDate(label: string, anchor: Date): Date | null {
  if (/^\+\d+$/.test(label)) {
    const offset = Number(label.slice(1))
    if (Number.isFinite(offset)) return addDays(anchor, offset)
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    return new Date(`${label}T00:00:00`)
  }

  if (/^\d{4}-\d{2}$/.test(label)) {
    return new Date(`${label}-01T00:00:00`)
  }

  return null
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
}

function formatDayName(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)
}

function calculateTimingData(forecastData?: ForecastPoint[]): PublishTimingData {
  const today = startOfDay(new Date())
  const windowEnd = addDays(today, 30)

  const parsedForecast = (forecastData ?? [])
    .map((point) => {
      const date = parseForecastDate(point.date, today)
      return date ? { date, value: point.value } : null
    })
    .filter((point): point is { date: Date; value: number } => !!point)

  const candidates = parsedForecast.filter(
    (point) => point.date >= today && point.date <= windowEnd
  )

  const pickBest = (items: { date: Date; value: number }[]) => {
    return items.reduce((best, current) => {
      if (!best) return current
      if (current.value > best.value) return current
      if (current.value === best.value && current.date < best.date) return current
      return best
    }, null as { date: Date; value: number } | null)
  }

  const bestInWindow = pickBest(candidates)
  const bestOverall = pickBest(parsedForecast)
  const peakDate = bestInWindow?.date ?? bestOverall?.date ?? addDays(today, 7)

  const publishWindowStart = addDays(peakDate, -7)
  const daysUntilPeak = Math.max(0, Math.ceil((peakDate.getTime() - today.getTime()) / MS_PER_DAY))
  const currentPosition = Math.min(100, Math.max(0, Math.round((daysUntilPeak / 30) * 100)))

  const urgency: UrgencyLevel =
    daysUntilPeak <= 3
      ? "critical"
      : daysUntilPeak <= 7
        ? "high"
        : daysUntilPeak <= 14
          ? "medium"
          : "low"

  return {
    currentPosition,
    windowStart: formatShortDate(publishWindowStart),
    windowEnd: formatShortDate(peakDate),
    daysRemaining: daysUntilPeak,
    optimalDate: formatShortDate(peakDate),
    optimalDay: formatDayName(peakDate),
    urgency,
    urgencyReason: `Peak in ${daysUntilPeak} days`,
  }
}

interface PublishTimingProps {
  searchQuery: string
  forecastData?: ForecastPoint[]
  className?: string
}

export function PublishTiming({ searchQuery, forecastData, className }: PublishTimingProps) {
  const [isSaving, setIsSaving] = useState(false)
  const data = useMemo(() => calculateTimingData(forecastData), [forecastData])

  const urgency = urgencyConfig[data.urgency]
  const UrgencyIcon = urgency.icon

  const handleSave = async () => {
    const keyword = searchQuery.trim()
    if (!keyword || isSaving) return

    setIsSaving(true)
    try {
      const result = await saveToRoadmap({ keyword })
      if (result?.success) {
        toast.success("Added to Roadmap!")
      } else {
        toast.error(result?.error ?? "Failed to add to roadmap")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add to roadmap"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn("mt-3 sm:mt-4 p-3 sm:p-4 bg-muted/30 border border-border/50 rounded-lg mx-2 sm:mx-6 mb-3 sm:mb-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
        <span className="text-xs sm:text-sm font-semibold text-foreground">Best Time to Publish</span>
      </div>

      {/* Timeline Bar */}
      <div className="relative mb-3 sm:mb-4">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground mb-1">
          <span>NOW</span>
          <span>PEAK</span>
        </div>
        <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F59E0B] rounded-full transition-all"
            style={{ width: `${data.currentPosition}%` }}
          />
        </div>
        {/* Current Position Marker */}
        <div
          className="absolute top-5 sm:top-6 transform -translate-x-1/2"
          style={{ left: `${data.currentPosition}%` }}
        >
          <div className="flex flex-col items-center">
            <div
              className="w-0 h-0 border-l-[3px] sm:border-l-4 border-r-[3px] sm:border-r-4 border-b-[3px] sm:border-b-4 border-transparent"
              style={{ borderBottomColor: "#F59E0B" }}
            />
            <span className="text-[8px] sm:text-[10px] text-[#F59E0B] font-medium mt-0.5 whitespace-nowrap">YOU ARE HERE</span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8 mb-2 sm:mb-3">
        {/* Publish Window */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Publish Window</p>
            <p className="text-[10px] sm:text-xs font-medium text-foreground truncate">
              {data.windowStart} - {data.windowEnd} ({data.daysRemaining}d)
            </p>
          </div>
        </div>

        {/* Optimal Date */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
            <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Optimal Day</p>
            <p className="text-[10px] sm:text-xs font-medium text-foreground truncate">
              {data.optimalDate} ({data.optimalDay})
            </p>
          </div>
        </div>

        {/* Urgency */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <UrgencyIcon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0", urgency.color)} />
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Urgency</p>
            <p className={cn("text-[10px] sm:text-xs font-medium uppercase truncate", urgency.color)}>
              {data.urgency}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end mt-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !searchQuery.trim()}
          className="h-7 sm:h-8 px-3 sm:px-4 gap-1 sm:gap-1.5 text-xs sm:text-sm bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all active:scale-95"
        >
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Save to Roadmap</span>
          <span className="sm:hidden">Save</span>
        </Button>
      </div>
    </div>
  )
}
