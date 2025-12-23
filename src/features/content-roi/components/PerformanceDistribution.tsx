"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { BarChart3 } from "lucide-react"
import { ArticlePerformanceGroup, PerformanceTier } from "../types"
import { PERFORMANCE_TIERS, PerformanceIcons } from "../constants"

interface PerformanceDistributionProps {
  groups: ArticlePerformanceGroup[]
}

const TIER_COLORS: Record<string, string> = {
  star: '#eab308',
  profitable: '#10b981',
  'break-even': '#06b6d4',
  underperforming: '#f59e0b',
  loss: '#ef4444',
}

export function PerformanceDistribution({ groups }: PerformanceDistributionProps) {
  const chartData = groups
    .filter(g => g.count > 0)
    .map(g => ({
      name: g.label,
      value: g.count,
      tier: g.tier,
      icon: g.icon,
    }))

  const total = groups.reduce((sum, g) => sum + g.count, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-purple-500" />
        Performance Distribution
      </h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        {/* Pie Chart */}
        <div className="h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] shrink-0 mx-auto sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={TIER_COLORS[entry.tier]} 
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  padding: '8px 12px',
                }}
                itemStyle={{
                  color: 'hsl(var(--card-foreground))',
                }}
                labelStyle={{
                  color: 'hsl(var(--card-foreground))',
                  fontWeight: 600,
                }}
                formatter={(value: number, name: string) => [
                  `${value} articles (${((value / total) * 100).toFixed(0)}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-1.5 sm:space-y-2">
          {groups.map(group => (
            <div 
              key={group.tier} 
              className={`flex items-center justify-between p-1.5 sm:p-2 rounded-lg transition-colors ${
                group.count > 0 ? 'hover:bg-muted/30' : 'opacity-50'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div 
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: TIER_COLORS[group.tier] }}
                />
                <span className="text-xs sm:text-sm text-foreground flex items-center gap-1 sm:gap-1.5">
                  <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4">{PerformanceIcons[group.tier as PerformanceTier]()}</span>
                  {group.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-mono text-xs sm:text-sm text-foreground">{group.count}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  ({total > 0 ? ((group.count / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
