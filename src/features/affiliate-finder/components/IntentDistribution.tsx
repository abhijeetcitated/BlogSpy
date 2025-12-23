"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Target } from "lucide-react"
import { chartTooltipStyles, intentColors } from "@/components/charts"
import { AffiliateKeyword, BuyerIntent } from "../types"
import { BUYER_INTENT_CONFIG } from "../constants"

interface IntentDistributionProps {
  keywords: AffiliateKeyword[]
}

// Use centralized intent colors for consistency
const INTENT_COLORS: Record<BuyerIntent, string> = intentColors

export function IntentDistribution({ keywords }: IntentDistributionProps) {
  // Count keywords by intent
  const intentCounts: Record<BuyerIntent, number> = {
    transactional: 0,
    commercial: 0,
    informational: 0,
    navigational: 0,
  }

  keywords.forEach(k => {
    intentCounts[k.buyerIntent]++
  })

  const chartData = Object.entries(intentCounts)
    .filter(([_, count]) => count > 0)
    .map(([intent, count]) => ({
      name: BUYER_INTENT_CONFIG[intent as BuyerIntent].label,
      value: count,
      intent: intent as BuyerIntent,
    }))

  const total = keywords.length

  return (
    <div className="rounded-xl border border-border bg-card p-5 overflow-hidden">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-500" />
        Buyer Intent Distribution
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Pie Chart */}
        <div className="h-[160px] w-[160px] sm:h-[180px] sm:w-[180px] shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={INTENT_COLORS[entry.intent]} 
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={chartTooltipStyles.contentStyle}
                itemStyle={chartTooltipStyles.itemStyle}
                labelStyle={chartTooltipStyles.labelStyle}
                formatter={(value: number, name: string) => [
                  `${value} keywords (${((value / total) * 100).toFixed(0)}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full sm:w-auto">
          {Object.entries(BUYER_INTENT_CONFIG).map(([intent, config]) => {
            const count = intentCounts[intent as BuyerIntent]
            return (
              <div 
                key={intent} 
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  count > 0 ? 'hover:bg-muted/30' : 'opacity-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: INTENT_COLORS[intent as BuyerIntent] }}
                  />
                  <div>
                    <span className="text-sm text-foreground">{config.label}</span>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
