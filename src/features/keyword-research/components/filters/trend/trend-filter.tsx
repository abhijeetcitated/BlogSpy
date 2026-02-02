"use client"

// ============================================
// Trend Filter Popover Component
// ============================================

import { useEffect, useState } from "react"
import { ArrowUp, ArrowDown, Minus, ChevronDown, TrendingUp, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useKeywordStore } from "../../../store"

interface TrendFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TrendStatus = "rising" | "falling" | "stable"

const TREND_ICON_MAP: Record<TrendStatus, { Icon: LucideIcon; color: string }> = {
  rising: { Icon: ArrowUp, color: "text-emerald-500" },
  stable: { Icon: Minus, color: "text-amber-500" },
  falling: { Icon: ArrowDown, color: "text-rose-500" },
}

const TREND_OPTIONS = [
  {
    value: "rising" as const,
    label: "Trending Up",
    description: "Growing keywords (positive trend)",
    icon: ArrowUp,
    color: "text-emerald-500",
  },
  {
    value: "stable" as const,
    label: "Stable",
    description: "Consistent search volume",
    icon: Minus,
    color: "text-amber-500",
  },
  {
    value: "falling" as const,
    label: "Declining",
    description: "Decreasing search volume",
    icon: ArrowDown,
    color: "text-rose-500",
  },
]

const GROWTH_PRESETS = [
  { label: "Any Growth", value: 0 },
  { label: "10%+ Growth", value: 0.1 },
  { label: "25%+ Growth", value: 0.25 },
  { label: "50%+ Growth", value: 0.5 },
  { label: "100%+ Growth", value: 1 },
]

export function TrendFilter({ open, onOpenChange }: TrendFilterProps) {
  const selectedTrend = useKeywordStore((state) => state.filters.selectedTrend)
  const minTrendGrowth = useKeywordStore((state) => state.filters.minTrendGrowth)
  const toggleTrendFilter = useKeywordStore((state) => state.toggleTrendFilter)
  const setFilter = useKeywordStore((state) => state.setFilter)

  const [tempTrend, setTempTrend] = useState<TrendStatus[]>(selectedTrend)
  const [tempMinGrowth, setTempMinGrowth] = useState(minTrendGrowth)

  useEffect(() => {
    if (open) {
      setTempTrend(selectedTrend)
      setTempMinGrowth(minTrendGrowth)
    }
  }, [open, selectedTrend, minTrendGrowth])

  const growthLabel =
    minTrendGrowth > 0 ? `Trend (${Math.round(minTrendGrowth * 100)}%+)` : "Trend"
  const activeTrend = selectedTrend.length === 1 ? selectedTrend[0] : null
  const activeIconConfig = activeTrend ? TREND_ICON_MAP[activeTrend] : null

  const toggleTempTrend = (value: TrendStatus) => {
    setTempTrend((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  const applyTrends = () => {
    const current = new Set(selectedTrend)
    const next = new Set(tempTrend)

    for (const status of current) {
      if (!next.has(status)) {
        toggleTrendFilter(status)
      }
    }

    for (const status of next) {
      if (!current.has(status)) {
        toggleTrendFilter(status)
      }
    }

    setFilter("minTrendGrowth", tempMinGrowth)
    onOpenChange(false)
  }

  const clearTrends = () => {
    setTempTrend([])
    setTempMinGrowth(0)
    if (selectedTrend.length > 0) {
      for (const status of selectedTrend) {
        toggleTrendFilter(status)
      }
    }
    if (minTrendGrowth !== 0) {
      setFilter("minTrendGrowth", 0)
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 sm:h-9 gap-1 sm:gap-1.5 bg-secondary/50 border-border text-foreground text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
            selectedTrend.length > 0 && "border-[#FFD700]/70"
          )}
        >
          <TrendingUp className="h-3 w-3 shrink-0 text-emerald-500" />
          <span>{growthLabel}</span>
          {activeIconConfig ? (
            <span className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border/60 bg-muted/60">
              <activeIconConfig.Icon className={cn("h-3 w-3", activeIconConfig.color)} />
            </span>
          ) : (
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Trend Filter</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Filter by 12-month search trend direction and growth rate.
          </div>

          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
            Trend Direction
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setTempTrend([])}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                tempTrend.length === 0 && "bg-muted/50"
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">-</span>
              <span className="flex-1 text-left">All Trends</span>
            </button>
            {TREND_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = tempTrend.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => toggleTempTrend(option.value)}
                  className={cn(
                    "group w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                    isSelected ? "bg-muted/50" : "hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", option.color)} />
                  <div className="flex-1 text-left">
                    <div className={cn("font-medium", option.color)}>{option.label}</div>
                    <div className="text-[10px] text-muted-foreground">{option.description}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {tempTrend.includes("rising") && (
            <>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                Minimum Growth
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GROWTH_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setTempMinGrowth(preset.value)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                      tempMinGrowth === preset.value
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={clearTrends} className="flex-1">
              Reset
            </Button>
            <Button onClick={applyTrends} className="flex-1 bg-primary hover:bg-primary/90">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
