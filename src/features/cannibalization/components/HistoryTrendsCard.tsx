"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ArrowUpRight,
  Activity,
} from "lucide-react"

// ============================================
// INTERFACES
// ============================================

interface HistoryTrendsCardProps {
  history: {
    date: string
    issuesCount: number
    fixedCount: number
    trafficLoss: number
  }[]
  className?: string
}

// Stat Box Component
function StatBox({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  positive,
}: {
  label: string
  value: string | number
  trend: number
  trendLabel: string
  icon: React.ElementType
  positive: boolean
}) {
  const isPositive = positive ? trend < 0 : trend > 0
  const isNeutral = trend === 0
  
  return (
    <div className={cn(
      "p-3 sm:p-4 rounded-xl transition-all",
      "bg-muted/30 dark:bg-muted/20",
      "border border-border/50"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {isNeutral ? (
          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
        ) : isPositive ? (
          <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <TrendingUp className="h-3.5 w-3.5 text-red-500" />
        )}
      </div>
      <p className="text-lg sm:text-xl font-bold text-foreground">{value}</p>
      <p className={cn(
        "text-[10px] sm:text-xs font-medium",
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

export function HistoryTrendsCard({ history, className }: HistoryTrendsCardProps) {
  // Calculate trends
  const current = history[history.length - 1]
  const previous = history[history.length - 2]
  
  const issuesTrend = current && previous 
    ? ((current.issuesCount - previous.issuesCount) / previous.issuesCount) * 100 
    : 0
  
  const fixedTrend = current && previous
    ? current.fixedCount - previous.fixedCount
    : 0

  const trafficTrend = current && previous
    ? ((current.trafficLoss - previous.trafficLoss) / previous.trafficLoss) * 100
    : 0

  // Calculate max for chart scaling
  const maxIssues = Math.max(...history.map(h => h.issuesCount), 1)
  const maxFixed = Math.max(...history.map(h => h.fixedCount), 1)

  return (
    <Card className={cn(
      "p-4 sm:p-6",
      "bg-card/50 dark:bg-card/30",
      "border-border/50 dark:border-border/30",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 dark:from-cyan-500/30 dark:to-emerald-500/30 flex items-center justify-center ring-1 ring-cyan-500/20">
            <Activity className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            Progress History
          </h3>
        </div>
        <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium">
          Last 7 days
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <StatBox
          label="Active Issues"
          value={current?.issuesCount || 0}
          trend={issuesTrend}
          trendLabel={`${issuesTrend.toFixed(1)}% from last week`}
          icon={AlertTriangle}
          positive={true}
        />
        
        <StatBox
          label="Fixed This Week"
          value={current?.fixedCount || 0}
          trend={fixedTrend}
          trendLabel={`${fixedTrend} vs last week`}
          icon={CheckCircle2}
          positive={false}
        />
        
        <StatBox
          label="Traffic Loss"
          value={`-${current?.trafficLoss.toLocaleString() || 0}`}
          trend={trafficTrend}
          trendLabel={`${trafficTrend.toFixed(1)}% from last week`}
          icon={TrendingDown}
          positive={true}
        />
      </div>

      {/* Chart */}
      <div className="relative h-32 sm:h-40 mt-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] sm:text-xs text-muted-foreground w-6 sm:w-8">
          <span>{maxIssues}</span>
          <span>{Math.round(maxIssues / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 sm:ml-10 h-full flex items-end gap-1 sm:gap-1.5">
          {history.map((day, index) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full">
              {/* Bars */}
              <div className="flex-1 w-full flex gap-0.5 items-end">
                {/* Issues bar */}
                <div
                  className={cn(
                    "flex-1 rounded-t transition-all duration-300",
                    "bg-gradient-to-t from-red-500/80 to-red-400/60",
                    "dark:from-red-600/80 dark:to-red-500/50",
                    "hover:from-red-500 hover:to-red-400"
                  )}
                  style={{ height: `${Math.max((day.issuesCount / maxIssues) * 100, 4)}%` }}
                  title={`${day.issuesCount} issues`}
                />
                {/* Fixed bar */}
                <div
                  className={cn(
                    "flex-1 rounded-t transition-all duration-300",
                    "bg-gradient-to-t from-emerald-500/80 to-emerald-400/60",
                    "dark:from-emerald-600/80 dark:to-emerald-500/50",
                    "hover:from-emerald-500 hover:to-emerald-400"
                  )}
                  style={{ height: `${Math.max((day.fixedCount / maxFixed) * 100, 4)}%` }}
                  title={`${day.fixedCount} fixed`}
                />
              </div>
              {/* Date label */}
              <span className="text-[8px] sm:text-[10px] text-muted-foreground font-medium">
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gradient-to-t from-red-500 to-red-400" />
          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Active Issues</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gradient-to-t from-emerald-500 to-emerald-400" />
          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Fixed</span>
        </div>
      </div>

      {/* Insight */}
      <div className={cn(
        "mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl",
        "bg-gradient-to-r from-cyan-500/5 to-emerald-500/5",
        "dark:from-cyan-500/10 dark:to-emerald-500/10",
        "border border-cyan-500/20 dark:border-cyan-500/30"
      )}>
        <div className="flex items-start gap-2">
          <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-500 dark:text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
            {issuesTrend < 0 
              ? `Great progress! Issues decreased by ${Math.abs(issuesTrend).toFixed(0)}% this week.`
              : issuesTrend > 0
                ? `Attention needed: ${Math.abs(issuesTrend).toFixed(0)}% more issues detected this week.`
                : "Stable week - focus on fixing existing issues to improve SEO health."
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

export function generateMockHistory(days: number = 7) {
  const history = []
  const baseIssues = 25
  const baseFixed = 3

  // Always start from Monday of the current week
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Sunday = 6 days from Monday
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - daysFromMonday)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // Simulate gradual improvement
    const variance = Math.random() * 0.3 - 0.15 // -15% to +15%
    const issuesCount = Math.max(5, Math.round(baseIssues * (1 - i * 0.05) * (1 + variance)))
    const fixedCount = Math.round(baseFixed * (1 + i * 0.1) * (1 + variance))
    const trafficLoss = Math.round(issuesCount * 150 * (1 + variance))

    history.push({
      date: date.toISOString().split('T')[0],
      issuesCount,
      fixedCount,
      trafficLoss,
    })
  }

  return history
}
