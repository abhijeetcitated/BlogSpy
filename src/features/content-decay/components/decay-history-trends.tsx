"use client"

// ============================================
// CONTENT DECAY - History Trends Card
// ============================================
// Weekly decay statistics visualization

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  RefreshCw,
} from "lucide-react"

// ============================================
// INTERFACES
// ============================================

interface DecayHistoryData {
  date: string
  criticalCount: number
  watchCount: number
  revivedCount: number
  trafficAtRisk: number
}

interface DecayHistoryTrendsCardProps {
  history: DecayHistoryData[]
  className?: string
}

// Stat Box Component
function StatBox({
  label,
  value,
  trend,
  trendLabel,
  positive,
}: {
  label: string
  value: string | number
  trend: number
  trendLabel: string
  positive: boolean
}) {
  const isPositive = positive ? trend < 0 : trend > 0
  const isNeutral = trend === 0
  
  return (
    <div className={cn(
      "p-2 sm:p-3 md:p-4 rounded-xl transition-all",
      "bg-muted/30 dark:bg-muted/20",
      "border border-border/50"
    )}>
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground truncate pr-1">
          {label}
        </span>
        {isNeutral ? (
          <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
        ) : isPositive ? (
          <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500 shrink-0" />
        ) : (
          <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500 shrink-0" />
        )}
      </div>
      <p className="text-base sm:text-lg md:text-xl font-bold text-foreground">{value}</p>
      <p className={cn(
        "text-[8px] sm:text-[10px] md:text-xs font-medium truncate",
        isNeutral ? "text-muted-foreground" : isPositive ? "text-emerald-500" : "text-red-500"
      )}>
        {trend > 0 ? "+" : ""}{trendLabel}
      </p>
    </div>
  )
}

// ============================================
// COMPONENT
// ============================================

export function DecayHistoryTrendsCard({ history, className }: DecayHistoryTrendsCardProps) {
  // Calculate trends
  const current = history[history.length - 1]
  const previous = history[history.length - 2]
  
  const criticalTrend = current && previous 
    ? current.criticalCount - previous.criticalCount
    : 0
  
  const revivedTrend = current && previous
    ? current.revivedCount - previous.revivedCount
    : 0

  const trafficTrend = current && previous && previous.trafficAtRisk !== 0
    ? ((current.trafficAtRisk - previous.trafficAtRisk) / previous.trafficAtRisk) * 100
    : 0

  // Calculate max for chart scaling
  const maxCritical = Math.max(...history.map(h => h.criticalCount + h.watchCount), 1)
  const maxRevived = Math.max(...history.map(h => h.revivedCount), 1)

  return (
    <Card className={cn(
      "p-3 sm:p-4 md:p-6",
      "bg-card/50 dark:bg-card/30",
      "border-border/50 dark:border-border/30",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-xl bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 dark:from-violet-500/30 dark:to-fuchsia-500/30 flex items-center justify-center ring-1 ring-violet-500/20">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-500 dark:text-violet-400" />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
            Decay Trend History
          </h3>
        </div>
        <Badge variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs font-medium">
          Last 7 days
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-4 mb-3 sm:mb-4 md:mb-6">
        <StatBox
          label="Critical"
          value={current?.criticalCount || 0}
          trend={criticalTrend}
          trendLabel={`${criticalTrend} from yesterday`}
          positive={true}
        />
        
        <StatBox
          label="Revived"
          value={current?.revivedCount || 0}
          trend={revivedTrend}
          trendLabel={`${revivedTrend > 0 ? "+" : ""}${revivedTrend} vs yesterday`}
          positive={false}
        />
        
        <StatBox
          label="At Risk"
          value={`-${(current?.trafficAtRisk || 0).toLocaleString()}`}
          trend={trafficTrend}
          trendLabel={`${trafficTrend.toFixed(1)}%`}
          positive={true}
        />
      </div>

      {/* Chart */}
      <div className="relative h-28 sm:h-32 md:h-40 mt-3 sm:mt-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-5 sm:bottom-6 flex flex-col justify-between text-[8px] sm:text-[10px] md:text-xs text-muted-foreground w-5 sm:w-6 md:w-8">
          <span>{maxCritical}</span>
          <span>{Math.round(maxCritical / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-6 sm:ml-8 md:ml-10 h-full flex items-end gap-0.5 sm:gap-1 md:gap-1.5">
          {history.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full">
              {/* Bars */}
              <div className="flex-1 w-full flex gap-0.5 items-end">
                {/* Critical bar */}
                <div
                  className={cn(
                    "flex-1 rounded-t transition-all duration-300",
                    "bg-linear-to-t from-red-500/80 to-red-400/60",
                    "dark:from-red-600/80 dark:to-red-500/50",
                    "hover:from-red-500 hover:to-red-400"
                  )}
                  style={{ height: `${Math.max((day.criticalCount / maxCritical) * 100, 4)}%` }}
                  title={`${day.criticalCount} critical`}
                />
                {/* Watch bar */}
                <div
                  className={cn(
                    "flex-1 rounded-t transition-all duration-300",
                    "bg-linear-to-t from-amber-500/80 to-amber-400/60",
                    "dark:from-amber-600/80 dark:to-amber-500/50",
                    "hover:from-amber-500 hover:to-amber-400"
                  )}
                  style={{ height: `${Math.max((day.watchCount / maxCritical) * 100, 4)}%` }}
                  title={`${day.watchCount} watch`}
                />
                {/* Revived bar */}
                <div
                  className={cn(
                    "flex-1 rounded-t transition-all duration-300",
                    "bg-linear-to-t from-emerald-500/80 to-emerald-400/60",
                    "dark:from-emerald-600/80 dark:to-emerald-500/50",
                    "hover:from-emerald-500 hover:to-emerald-400"
                  )}
                  style={{ height: `${Math.max((day.revivedCount / maxRevived) * 100, 4)}%` }}
                  title={`${day.revivedCount} revived`}
                />
              </div>
              {/* Date label */}
              <span className="text-[7px] sm:text-[8px] md:text-[10px] text-muted-foreground font-medium">
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-6 mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-border/50">
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-sm bg-linear-to-t from-red-500 to-red-400" />
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">Critical</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-sm bg-linear-to-t from-amber-500 to-amber-400" />
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">Watch</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-sm bg-linear-to-t from-emerald-500 to-emerald-400" />
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">Revived</span>
        </div>
      </div>

      {/* Insight */}
      <div className={cn(
        "mt-2 sm:mt-3 md:mt-4 p-2 sm:p-2.5 md:p-3 rounded-xl",
        "bg-linear-to-r from-violet-500/5 to-fuchsia-500/5",
        "dark:from-violet-500/10 dark:to-fuchsia-500/10",
        "border border-violet-500/20 dark:border-violet-500/30"
      )}>
        <div className="flex items-start gap-1.5 sm:gap-2">
          <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0" />
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-relaxed">
            {criticalTrend < 0 
              ? `Excellent! Critical articles decreased by ${Math.abs(criticalTrend)} this week.`
              : criticalTrend > 0
                ? `Action needed: ${Math.abs(criticalTrend)} more articles became critical.`
                : "Stable week - keep monitoring decaying content."
            }
          </p>
        </div>
      </div>
    </Card>
  )
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

export function generateMockDecayHistory(days: number = 7): DecayHistoryData[] {
  const history: DecayHistoryData[] = []
  const baseCritical = 5
  const baseWatch = 8
  const baseRevived = 2

  // Always start from Monday of the current week
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - daysFromMonday)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // Simulate gradual improvement (critical decreasing, revived increasing)
    const variance = Math.random() * 0.3 - 0.15
    const criticalCount = Math.max(1, Math.round(baseCritical * (1 - i * 0.08) * (1 + variance)))
    const watchCount = Math.max(2, Math.round(baseWatch * (1 - i * 0.03) * (1 + variance)))
    const revivedCount = Math.round(baseRevived * (1 + i * 0.15) * (1 + variance))
    const trafficAtRisk = Math.round((criticalCount * 2500 + watchCount * 800) * (1 + variance))

    history.push({
      date: date.toISOString().split('T')[0],
      criticalCount,
      watchCount,
      revivedCount,
      trafficAtRisk,
    })
  }

  return history
}
