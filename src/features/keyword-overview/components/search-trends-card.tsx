"use client"

import { TrendingUp, Monitor, Smartphone } from "lucide-react"
import { TrendAreaChart } from "./trend-area-chart"
import type { DeviceView } from "../types"

interface TrendMessage {
  icon: string
  text: string
}

interface SearchTrendsCardProps {
  deviceView: DeviceView
  onDeviceChange: (view: DeviceView) => void
  trendMessage?: TrendMessage
}

export function SearchTrendsCard({ 
  deviceView, 
  onDeviceChange,
  trendMessage = { icon: "📱", text: "82% searches are on Mobile. Keep intro short." }
}: SearchTrendsCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
          <h3 className="text-sm font-medium text-muted-foreground">Search Trends</h3>
        </div>
        <div className="flex items-center bg-muted rounded-lg p-1" role="tablist" aria-label="Device view selector">
          <button
            role="tab"
            aria-selected={deviceView === "desktop"}
            aria-controls="trend-chart"
            onClick={() => onDeviceChange("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              deviceView === "desktop" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
            Desktop
          </button>
          <button
            role="tab"
            aria-selected={deviceView === "mobile"}
            aria-controls="trend-chart"
            onClick={() => onDeviceChange("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              deviceView === "mobile" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            Mobile
          </button>
        </div>
      </div>
      <div id="trend-chart" role="tabpanel">
        <TrendAreaChart />
      </div>
      <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <span className="text-base" aria-hidden="true">{trendMessage.icon}</span>
        <span className="text-sm text-blue-600 dark:text-blue-300">{trendMessage.text}</span>
      </div>
    </div>
  )
}
