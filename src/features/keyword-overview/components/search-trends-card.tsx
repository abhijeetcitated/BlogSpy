"use client"

import { TrendingUp, Monitor, Smartphone } from "lucide-react"
import { TrendAreaChart } from "./trend-area-chart"
import type { DeviceView } from "../types"

interface SearchTrendsCardProps {
  deviceView: DeviceView
  onDeviceChange: (view: DeviceView) => void
}

export function SearchTrendsCard({ deviceView, onDeviceChange }: SearchTrendsCardProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-medium text-slate-400">Search Trends</h3>
        </div>
        <div className="flex items-center bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => onDeviceChange("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              deviceView === "desktop" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </button>
          <button
            onClick={() => onDeviceChange("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              deviceView === "mobile" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>
        </div>
      </div>
      <TrendAreaChart />
      <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <Smartphone className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-blue-300">82% searches are on Mobile. Keep intro short.</span>
      </div>
    </div>
  )
}
