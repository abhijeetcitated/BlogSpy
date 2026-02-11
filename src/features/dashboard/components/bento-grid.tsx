// ============================================
// BENTO GRID - Dashboard Cards
// ============================================

"use client"

import { memo } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Zap,
  ArrowUp,
  Target,
  ExternalLink,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCredits } from "@/hooks/use-user"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingSparkline, CreditRing } from "@/components/charts"
import type { QuickAction, RecentActivity } from "./command-center-data"

function formatRelativeTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "just now"

  const diffMs = Date.now() - parsed.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  if (diffSeconds < 60) return "just now"

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  }

  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`
}

interface BentoGridProps {
  quickActions: QuickAction[]
  recentActivity: RecentActivity[]
  trendSpotterLabel?: string
  hasProject?: boolean
  onAddProject?: () => void
  stats?: {
    rankCount: number
    avgRank: number
    rankDelta: number
    decayCount: number
    creditUsed: number
    creditTotal: number
    trendName: string
    trendGrowth: number
    recentLogs: {
      id: string
      actionType: string
      description: string
      createdAt: string
    }[]
  }
}

export const BentoGrid = memo(function BentoGrid({
  quickActions,
  recentActivity,
  trendSpotterLabel,
  hasProject,
  onAddProject,
  stats,
}: BentoGridProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { credits } = useCredits()
  const trendLabel = trendSpotterLabel ?? "Trend Spotter"
  const trendGrowth = stats?.trendGrowth ?? 0
  const trendName = stats?.trendName ? stats.trendName : "No Trends"
  const rankCount = stats?.rankCount ?? 0
  const avgRank = stats?.avgRank ?? 0
  const rankDelta = stats?.rankDelta ?? 0
  const decayCount = stats?.decayCount ?? 0
  const creditUsed = stats?.creditUsed ?? credits.used
  const creditTotal = stats?.creditTotal ?? credits.total
  const recentLogs = stats?.recentLogs ?? []
  const projectAvailable = hasProject ?? true
  const handleAddProject = () => onAddProject?.()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Trend Spotter Card */}
      <Link href="/dashboard/research/trends" className="block">
        <Card className="bg-linear-to-br from-card to-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40 transition-colors duration-200 group relative overflow-hidden h-full cursor-pointer">
          <CardContent className="p-4 sm:p-6 relative">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs text-emerald-400 uppercase tracking-wider font-medium">
                  {trendLabel}
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] sm:text-xs px-1.5 sm:px-2">
                    +{trendGrowth}% Viral
                  </Badge>
                  <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {trendName}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Searches up {trendGrowth}% this week
                </p>
              </div>
              <TrendingSparkline growthPercent={trendGrowth} />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Opportunities Card */}
      <Card className="bg-linear-to-br from-card to-amber-950/10 border-border/50 hover:border-amber-500/30 transition-colors duration-200">
        <CardContent className="p-4 sm:p-6">
          {projectAvailable ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] sm:text-xs text-amber-400 uppercase tracking-wider font-medium">Opportunities</span>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-foreground">{decayCount} articles</p>
                <p className="text-xs sm:text-sm text-muted-foreground">dropped to Page 2</p>
              </div>
              <Button
                asChild
                size="sm"
                className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors h-9 text-xs sm:text-sm"
              >
                <Link href="/dashboard/tracking/decay">
                  <Zap className="h-4 w-4 mr-1.5 sm:mr-2" />
                  Fix Now
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 opacity-80">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] sm:text-xs text-amber-400 uppercase tracking-wider font-medium">Opportunities</span>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-foreground">No project yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Add a site to detect decay alerts.</p>
              </div>
              <Button
                size="sm"
                className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors h-9 text-xs sm:text-sm"
                onClick={handleAddProject}
                disabled={!onAddProject}
              >
                <Zap className="h-4 w-4 mr-1.5 sm:mr-2" />
                Add Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Health */}
      <Link href="/dashboard/billing" className="block">
        <Card className="bg-linear-to-br from-card to-card/50 border-border/50 hover:border-border transition-colors duration-200 h-full cursor-pointer group">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Credit Health</span>
                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {authLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <Skeleton className="h-3 w-24 mx-auto" />
                </div>
              ) : isAuthenticated ? (
                <CreditRing used={creditUsed} total={creditTotal} />
              ) : (
                <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
                  Sign in to monitor usage
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Rank Tracker Card */}
      <Card className="bg-linear-to-br from-card to-card/50 border-border/50 hover:border-border transition-colors duration-200">
        <CardContent className="p-4 sm:p-6">
          {projectAvailable ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider font-medium">Rank Tracker</span>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-foreground">{rankCount} Keywords in Top 10</p>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Avg: #{avgRank > 0 ? avgRank.toFixed(1) : "—"}</span>
                  {rankDelta !== 0 && (
                    <div className={`flex items-center gap-0.5 ${rankDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      <ArrowUp className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${rankDelta < 0 ? "rotate-180" : ""}`} />
                      <span className="text-xs sm:text-sm font-medium">{Math.abs(rankDelta).toFixed(1)} {rankDelta > 0 ? "improved" : "dropped"}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="w-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors h-9 text-xs sm:text-sm"
              >
                <Link href="/dashboard/tracking/rank-tracker">
                  <TrendingUp className="h-4 w-4 mr-1.5 sm:mr-2" />
                  View Details
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 opacity-80">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider font-medium">Rank Tracker</span>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-foreground">No project yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Add a project to track rankings.</p>
              </div>
              <Button
                size="sm"
                className="w-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors h-9 text-xs sm:text-sm"
                onClick={handleAddProject}
                disabled={!onAddProject}
              >
                <TrendingUp className="h-4 w-4 mr-1.5 sm:mr-2" />
                Add Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Spans 2 columns */}
      <Card className="col-span-1 sm:col-span-2 bg-linear-to-br from-card to-card/50 border-border/50 hover:border-border transition-colors duration-200">
        <CardContent className="p-4 sm:p-6 lg:h-full lg:flex lg:flex-col">
          <div className="space-y-3 sm:space-y-4 lg:space-y-4 lg:flex lg:flex-col lg:flex-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Quick Actions</span>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 lg:grid-rows-2 lg:auto-rows-fr lg:flex-1">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 lg:p-5 lg:h-full rounded-lg sm:rounded-xl bg-linear-to-br ${action.color} border border-border/30 hover:border-border/50 transition-colors duration-150`}
                >
                  <action.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.iconColor}`} />
                  <span className="text-[10px] sm:text-xs font-medium text-foreground text-center leading-tight">{action.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Spans 2 columns */}
      <Card className="col-span-1 sm:col-span-2 bg-linear-to-br from-card to-card/50 border-border/50 hover:border-border transition-colors duration-200">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Recent Activity</span>
            <div className="space-y-1.5 sm:space-y-2">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <Link
                    key={log.id}
                    href="/dashboard"
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-background/30 hover:bg-slate-900 active:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Zap className="h-4 w-4 shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm text-foreground group-hover:text-emerald-400 transition-colors truncate">
                          {log.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                      <ExternalLink className="hidden sm:block h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-border/40 bg-background/30 px-3 py-3 text-xs sm:text-sm text-muted-foreground">
                  No recent activity yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
