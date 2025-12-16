"use client"

import { Target, Users, Bell } from "lucide-react"
import { RadialProgress } from "./radial-progress"
import type { RankStats } from "../types"

interface StatsCardsProps {
  stats: RankStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Visibility Score */}
      <div className="p-3 sm:p-4 rounded-xl border border-border bg-card flex items-center gap-3 sm:gap-4">
        <RadialProgress value={stats.visibilityScore} max={100} size={70} />
        <div>
          <p className="text-xs text-muted-foreground">Visibility</p>
          <p className="text-sm font-medium text-foreground">Score</p>
        </div>
      </div>
      
      {/* Avg Position */}
      <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-muted-foreground">Avg. Position</span>
        </div>
        <p className="text-2xl font-bold text-foreground">#{stats.avgPosition}</p>
      </div>
      
      {/* Traffic Forecast */}
      <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-muted-foreground">Est. Traffic</span>
        </div>
        <p className="text-2xl font-bold text-foreground">
          {stats.trafficForecast.toLocaleString()}
        </p>
      </div>
      
      {/* Alerts */}
      <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-muted-foreground">Rank Alerts</span>
        </div>
        <p className="text-2xl font-bold text-emerald-400">{stats.alertsCount}</p>
        <p className="text-xs text-muted-foreground mt-1">entered Top 3 today</p>
      </div>
    </div>
  )
}
