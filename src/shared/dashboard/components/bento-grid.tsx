// ============================================
// BENTO GRID - Dashboard Cards
// ============================================

"use client"

import Link from "next/link"
import {
  AlertTriangle,
  Zap,
  ArrowUp,
  Target,
  ExternalLink,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingSparkline, CreditRing } from "@/components/charts"
import type { QuickAction, RecentActivity } from "./command-center-data"

interface BentoGridProps {
  quickActions: QuickAction[]
  recentActivity: RecentActivity[]
}

export function BentoGrid({ quickActions, recentActivity }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Trend Spotter Card */}
      <Link href="/dashboard/research/trends" className="block">
        <Card className="bg-linear-to-br from-card to-emerald-950/20 border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300 group relative overflow-hidden h-full cursor-pointer">
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <CardContent className="p-4 sm:p-6 relative">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs text-emerald-400 uppercase tracking-wider font-medium">Trend Spotter</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] sm:text-xs px-1.5 sm:px-2">+300%</Badge>
                  <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-emerald-400 transition-colors">AI Agents</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Viral keyword detected</p>
              </div>
              <TrendingSparkline />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Opportunities Card */}
      <Card className="bg-linear-to-br from-card to-amber-950/10 border-border/50 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] sm:text-xs text-amber-400 uppercase tracking-wider font-medium">Opportunities</span>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-semibold text-foreground">3 articles</p>
              <p className="text-xs sm:text-sm text-muted-foreground">dropped to Page 2</p>
            </div>
            <Button
              asChild
              size="sm"
              className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all h-9 text-xs sm:text-sm"
            >
              <Link href="/dashboard/tracking/decay">
                <Zap className="h-4 w-4 mr-1.5 sm:mr-2" />
                Fix Now
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credit Health */}
      <Link href="/dashboard/billing" className="block">
        <Card className="bg-linear-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300 h-full cursor-pointer group">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Credit Health</span>
                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CreditRing used={250} total={1000} />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Rank Tracker Card */}
      <Card className="bg-linear-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              <span className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-wider font-medium">Rank Tracker</span>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-semibold text-foreground">12 Keywords in Top 10</p>
              <div className="flex items-center gap-1 sm:gap-1.5 mt-1">
                <span className="text-xs sm:text-sm text-muted-foreground">Avg: 14.2</span>
                <div className="flex items-center gap-0.5 text-emerald-400">
                  <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="text-xs sm:text-sm font-medium">2.1</span>
                </div>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="w-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all h-9 text-xs sm:text-sm"
            >
              <Link href="/dashboard/tracking/rank-tracker">
                <TrendingUp className="h-4 w-4 mr-1.5 sm:mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Spans 2 columns */}
      <Card className="col-span-1 sm:col-span-2 bg-linear-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Quick Actions</span>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-linear-to-br ${action.color} border border-border/30 hover:border-border/50 active:scale-[0.98] hover:scale-[1.02] transition-all duration-200`}
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
      <Card className="col-span-1 sm:col-span-2 bg-linear-to-br from-card to-card/50 border-border/50 backdrop-blur-sm hover:border-border transition-all duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Recent Activity</span>
            <div className="space-y-1.5 sm:space-y-2">
              {recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-background/30 hover:bg-slate-900 active:bg-slate-800 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <activity.icon className={`h-4 w-4 shrink-0 ${activity.iconColor} group-hover:scale-110 transition-transform`} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm text-foreground group-hover:text-emerald-400 transition-colors truncate">
                        {activity.title}
                      </span>
                      {activity.subtitle && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {activity.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{activity.time}</span>
                    <ExternalLink className="hidden sm:block h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
