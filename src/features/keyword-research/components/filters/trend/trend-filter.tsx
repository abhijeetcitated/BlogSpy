"use client"

// ============================================
// Trend Filter Popover Component
// ============================================

import { TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TrendFilterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tempTrendDirection: "up" | "down" | "stable" | null
  tempMinGrowth: number | null
  onTempTrendDirectionChange: (direction: "up" | "down" | "stable" | null) => void
  onTempMinGrowthChange: (growth: number | null) => void
  onApply: () => void
}

const TREND_OPTIONS = [
  { 
    value: "up" as const, 
    label: "Trending Up", 
    description: "Growing keywords (positive trend)",
    icon: TrendingUp,
    color: "text-green-500"
  },
  { 
    value: "stable" as const, 
    label: "Stable", 
    description: "Consistent search volume",
    icon: Minus,
    color: "text-amber-500"
  },
  { 
    value: "down" as const, 
    label: "Declining", 
    description: "Decreasing search volume",
    icon: TrendingDown,
    color: "text-red-500"
  },
]

const GROWTH_PRESETS = [
  { label: "Any Growth", value: null },
  { label: "10%+ Growth", value: 10 },
  { label: "25%+ Growth", value: 25 },
  { label: "50%+ Growth", value: 50 },
  { label: "100%+ Growth", value: 100 },
]

export function TrendFilter({
  open,
  onOpenChange,
  tempTrendDirection,
  tempMinGrowth,
  onTempTrendDirectionChange,
  onTempMinGrowthChange,
  onApply,
}: TrendFilterProps) {
  const hasFilter = tempTrendDirection !== null || tempMinGrowth !== null

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-7 sm:h-9 gap-0.5 sm:gap-1.5 bg-secondary/50 border-border text-[11px] sm:text-sm px-1.5 sm:px-3 shrink-0 min-w-0",
            hasFilter && "border-emerald-500/50"
          )}
        >
          <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />
          <span>Trend</span>
          {hasFilter && (
            <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[10px] bg-emerald-500/20 text-emerald-400">
              {tempTrendDirection === "up" ? "↑" : tempTrendDirection === "down" ? "↓" : "→"}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
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
              onClick={() => onTempTrendDirectionChange(null)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                tempTrendDirection === null && "bg-muted/50"
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">•</span>
              <span className="flex-1 text-left">All Trends</span>
            </button>
            {TREND_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => onTempTrendDirectionChange(option.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                    tempTrendDirection === option.value && "bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", option.color)} />
                  <div className="flex-1 text-left">
                    <div>{option.label}</div>
                    <div className="text-[10px] text-muted-foreground">{option.description}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {tempTrendDirection === "up" && (
            <>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                Minimum Growth
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GROWTH_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onTempMinGrowthChange(preset.value)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                      tempMinGrowth === preset.value
                        ? "bg-primary text-primary-foreground"
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onTempTrendDirectionChange(null)
                onTempMinGrowthChange(null)
              }}
              className="flex-1"
            >
              Reset
            </Button>
            <Button onClick={onApply} className="flex-1 bg-primary hover:bg-primary/90">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
