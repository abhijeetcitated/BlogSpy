"use client"

import { Globe, Target, Calendar, Video, AlertTriangle } from "lucide-react"
import { WorldMap } from "./world-map"
import { RadarChart } from "./radar-chart"
import { SeasonalityChart } from "./seasonality-chart"
import { GEOScoreRing } from "@/components/ui/geo-score-ring"
import { Clock, Shield, FileText } from "lucide-react"
import { GLOBAL_VOLUMES } from "../constants"
import type { GEOScoreComponents } from "@/types/geo.types"

interface GEOScoreCardProps {
  score: number
  components: GEOScoreComponents
}

export function GEOScoreCard({ score, components }: GEOScoreCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-cyan-900/20 border border-cyan-500/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-medium text-slate-400">GEO Score</h3>
        </div>
        <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
          High Opportunity
        </span>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <GEOScoreRing 
          score={score} 
          size="lg" 
          components={components}
          showTooltip={true}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Citation Age
          </span>
          <span className="text-emerald-400">{components.citationFreshness}/25</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Authority Gap
          </span>
          <span className="text-emerald-400">{components.authorityWeakness}/25</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Video className="w-3 h-3" /> Media Gap
          </span>
          <span className="text-amber-400">{components.mediaGap}/25</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Text Quality
          </span>
          <span className="text-amber-400">{components.textQuality}/25</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-700">
        <p className="text-xs text-cyan-300">
          🎯 AI is citing weak sources. High chance to get cited with quality content.
        </p>
      </div>
    </div>
  )
}

export function GlobalVolumeCard() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-medium text-slate-400">Global Interest</h3>
      </div>
      <WorldMap />
      <div className="flex items-center justify-center gap-6 mt-4">
        {GLOBAL_VOLUMES.map((item) => (
          <div key={item.country} className="flex items-center gap-2">
            <span className="text-lg">{item.flag}</span>
            <span className="text-white font-semibold">{item.volume}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function IntentProfileCard() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-cyan-400" />
        <h3 className="text-sm font-medium text-slate-400">Intent Profile</h3>
      </div>
      <RadarChart />
      <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <Video className="w-4 h-4 text-cyan-400" />
        <span className="text-xs text-cyan-300">High Video Intent detected</span>
      </div>
    </div>
  )
}

export function TrendForecastCard() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-medium text-slate-400">Trend Forecast</h3>
      </div>
      <SeasonalityChart />
      <div className="flex items-center gap-2 mt-3 px-2 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span className="text-xs text-amber-300">Peak in 3 months. Publish now to rank.</span>
      </div>
    </div>
  )
}
