"use client"

/**
 * CommerceSidebar - Sidebar cards for Commerce Tracker
 * 
 * Extracted from commerce-tracker-content.tsx for better maintainability
 * Includes: Credit cost, Quick stats, Amazon tips, Features cards
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Lightbulb,
  Zap,
  TrendingUp,
  Package,
  ChevronRight,
} from "lucide-react"
import { COMMERCE_PLATFORM_CONFIG, AMAZON_TIPS } from "../constants"

// ============================================
// Types
// ============================================

export interface CommerceSidebarProps {
  stats: {
    top3Count: number
    top10Count: number
    avgCpc: string
    avgSearchVolume: number
  }
}

// ============================================
// Component
// ============================================

export function CommerceSidebar({ stats }: CommerceSidebarProps) {
  const config = COMMERCE_PLATFORM_CONFIG.amazon

  return (
    <div className="space-y-4">
      {/* Credit Cost Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg sm:text-xl font-bold text-foreground">{config.creditCost} Credits</p>
              <p className="text-xs sm:text-sm text-muted-foreground">per keyword • {config.apiSource}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-card border-border">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
          {[
            { label: "Top 3 Rankings", value: stats.top3Count, color: "text-amber-400" },
            { label: "Top 10 Rankings", value: stats.top10Count, color: "text-emerald-400" },
            { label: "Avg CPC", value: `$${stats.avgCpc}`, color: "text-green-400" },
            { label: "Avg Volume", value: stats.avgSearchVolume.toLocaleString(), color: "text-cyan-400" },
          ].map((stat, i) => (
            <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/30">
              <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
              <span className={`text-sm sm:text-base font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Amazon Tips */}
      <Card className="bg-card border-border">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            Amazon Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <ul className="space-y-2.5">
            {AMAZON_TIPS.slice(0, 4).map((tip, i) => (
              <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="bg-card border-border">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            Features
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <ul className="space-y-2.5">
            {config.features.slice(0, 5).map((feature, i) => (
              <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommerceSidebar
