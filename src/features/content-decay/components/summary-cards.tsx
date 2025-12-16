// ============================================
// CONTENT DECAY - Summary Cards Component
// ============================================
// Statistics overview cards for decay metrics

import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Eye,
  TrendingDown,
  CheckCircle2,
  RefreshCw,
} from "lucide-react"

interface SummaryCardsProps {
  criticalCount: number
  watchCount: number
  trafficAtRisk: number
  fixedCount: number
  recoveredCount: number
  className?: string
}

const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  label: string
  value: string | number
  subtext?: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  valueColor?: string
}) => (
  <div className="p-3 sm:p-4 lg:p-5 rounded-xl bg-card border border-border">
    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
      <div className={cn("w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ring-1 shrink-0", iconBg)}>
        <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground font-medium truncate">{label}</p>
        <p className={cn("text-lg sm:text-xl lg:text-2xl font-bold", valueColor || "text-foreground")}>
          {value}
        </p>
        {subtext && (
          <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  </div>
)

export function SummaryCards({
  criticalCount,
  watchCount,
  trafficAtRisk,
  fixedCount,
  recoveredCount,
  className,
}: SummaryCardsProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4", className)}>
      <StatCard
        label="Critical Articles"
        value={criticalCount}
        subtext="Needs immediate attention"
        icon={AlertTriangle}
        iconBg="bg-red-500/10 ring-red-500/20"
        iconColor="text-red-500"
        valueColor="text-red-600 dark:text-red-400"
      />
      
      <StatCard
        label="Watch List"
        value={watchCount}
        subtext="Early decay signs"
        icon={Eye}
        iconBg="bg-amber-500/10 ring-amber-500/20"
        iconColor="text-amber-500"
        valueColor="text-amber-600 dark:text-amber-400"
      />
      
      <StatCard
        label="Traffic at Risk"
        value={`-${trafficAtRisk.toLocaleString()}`}
        subtext="Monthly visits"
        icon={TrendingDown}
        iconBg="bg-violet-500/10 ring-violet-500/20"
        iconColor="text-violet-500"
        valueColor="text-violet-600 dark:text-violet-400"
      />
      
      <StatCard
        label="Fixed"
        value={fixedCount}
        subtext="Marked as done"
        icon={CheckCircle2}
        iconBg="bg-emerald-500/10 ring-emerald-500/20"
        iconColor="text-emerald-500"
        valueColor="text-emerald-600 dark:text-emerald-400"
      />
      
      <StatCard
        label="Recovered"
        value={recoveredCount}
        subtext="Traffic restored"
        icon={RefreshCw}
        iconBg="bg-cyan-500/10 ring-cyan-500/20"
        iconColor="text-cyan-500"
        valueColor="text-cyan-600 dark:text-cyan-400"
      />
    </div>
  )
}
