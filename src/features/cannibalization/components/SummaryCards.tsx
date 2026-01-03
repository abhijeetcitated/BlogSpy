"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  XCircle,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  EyeOff,
  AlertOctagon,
  Flame,
} from "lucide-react"
import { HealthScoreRing } from "./HealthScoreRing"
import type { CannibalizationAnalysis } from "../types"

interface SummaryCardsProps {
  analysis: CannibalizationAnalysis
  fixedCount?: number
  inProgressCount?: number
  ignoredCount?: number
}

// Stat Card Component for consistency
function StatCard({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  label, 
  value, 
  valueColor,
  subtext,
  gradient
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  valueColor: string
  subtext?: string
  gradient?: string
}) {
  return (
    <Card className={cn(
      "relative overflow-hidden",
      "bg-card/50 dark:bg-card/30",
      "border-border/50 dark:border-border/30",
      "hover:border-border dark:hover:border-border/50",
      "transition-all duration-200"
    )}>
      {gradient && (
        <div className={cn("absolute inset-0 opacity-5 dark:opacity-10", gradient)} />
      )}
      <CardContent className="p-3 sm:p-4 relative">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "p-1.5 sm:p-2 rounded-lg transition-colors",
            iconBg
          )}>
            <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", iconColor)} />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <p className={cn(
          "text-xl sm:text-2xl font-bold tabular-nums",
          valueColor
        )}>
          {value}
        </p>
        {subtext && (
          <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-0.5">{subtext}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Progress Stat Card for Fixed/In Progress/Ignored
function ProgressStatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  borderColor,
  bgColor
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  value: number
  valueColor: string
  borderColor: string
  bgColor: string
}) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:scale-[1.02]",
      bgColor,
      borderColor
    )}>
      <CardContent className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
        <div className={cn("p-1.5 sm:p-2 rounded-lg", iconBg)}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-base sm:text-lg font-bold tabular-nums", valueColor)}>
            {value}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function SummaryCards({
  analysis,
  fixedCount = 0,
  inProgressCount = 0,
  ignoredCount = 0,
}: SummaryCardsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {/* Health Score */}
        <Card className={cn(
          "col-span-2 md:col-span-1 lg:col-span-1",
          "bg-linear-to-br from-card/80 to-card/40 dark:from-card/50 dark:to-card/20",
          "border-border/50 dark:border-border/30"
        )}>
          <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center">
            <HealthScoreRing score={analysis.healthScore} size={90} />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 font-medium">
              Cannibalization Health
            </p>
          </CardContent>
        </Card>
        
        {/* Critical Issues */}
        <StatCard
          icon={AlertOctagon}
          iconBg="bg-red-500/10 dark:bg-red-500/20"
          iconColor="text-red-500 dark:text-red-400"
          label="Critical"
          value={analysis.issuesBySeverity.critical}
          valueColor="text-red-600 dark:text-red-400"
          gradient="bg-linear-to-br from-red-500 to-red-600"
        />
        
        {/* High Issues */}
        <StatCard
          icon={Flame}
          iconBg="bg-amber-500/10 dark:bg-amber-500/20"
          iconColor="text-amber-500 dark:text-amber-400"
          label="High"
          value={analysis.issuesBySeverity.high}
          valueColor="text-amber-600 dark:text-amber-400"
          gradient="bg-linear-to-br from-amber-500 to-orange-500"
        />
        
        {/* Traffic Loss */}
        <StatCard
          icon={TrendingDown}
          iconBg="bg-red-500/10 dark:bg-red-500/20"
          iconColor="text-red-500 dark:text-red-400"
          label="Traffic Loss"
          value={`-${analysis.totalTrafficLoss.toLocaleString()}`}
          valueColor="text-red-600 dark:text-red-400"
          subtext="visits/month"
          gradient="bg-linear-to-br from-red-500 to-rose-500"
        />
        
        {/* Potential Gain */}
        <StatCard
          icon={TrendingUp}
          iconBg="bg-emerald-500/10 dark:bg-emerald-500/20"
          iconColor="text-emerald-500 dark:text-emerald-400"
          label="Potential Gain"
          value={`+${analysis.totalPotentialGain.toLocaleString()}`}
          valueColor="text-emerald-600 dark:text-emerald-400"
          subtext="if all fixed"
          gradient="bg-linear-to-br from-emerald-500 to-green-500"
        />
      </div>

      {/* Progress Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Fixed Issues */}
        <ProgressStatCard
          icon={CheckCircle2}
          iconBg="bg-emerald-500/20 dark:bg-emerald-500/30"
          iconColor="text-emerald-500 dark:text-emerald-400"
          label="Fixed"
          value={fixedCount}
          valueColor="text-emerald-600 dark:text-emerald-400"
          borderColor="border-emerald-500/20 dark:border-emerald-500/30"
          bgColor="bg-emerald-500/5 dark:bg-emerald-500/10"
        />

        {/* In Progress Issues */}
        <ProgressStatCard
          icon={Clock}
          iconBg="bg-cyan-500/20 dark:bg-cyan-500/30"
          iconColor="text-cyan-500 dark:text-cyan-400"
          label="In Progress"
          value={inProgressCount}
          valueColor="text-cyan-600 dark:text-cyan-400"
          borderColor="border-cyan-500/20 dark:border-cyan-500/30"
          bgColor="bg-cyan-500/5 dark:bg-cyan-500/10"
        />

        {/* Ignored Issues */}
        <ProgressStatCard
          icon={EyeOff}
          iconBg="bg-slate-500/20 dark:bg-slate-500/30"
          iconColor="text-slate-500 dark:text-slate-400"
          label="Ignored"
          value={ignoredCount}
          valueColor="text-slate-600 dark:text-slate-400"
          borderColor="border-slate-500/20 dark:border-slate-500/30"
          bgColor="bg-slate-500/5 dark:bg-slate-500/10"
        />
      </div>
    </div>
  )
}
