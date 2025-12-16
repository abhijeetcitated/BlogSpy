"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { BlogNiche } from "../types"
import { BLOG_NICHES } from "../constants"
import { NicheIcons } from "./Icons"

interface RpmChartProps {
  niche: BlogNiche
  currentRpm: number
}

export function RpmChart({ niche, currentRpm }: RpmChartProps) {
  // Compare RPM across niches
  const chartData = BLOG_NICHES
    .map(n => ({
      name: n.name.split(" ")[0], // Short name
      rpm: n.avgRpm,
      id: n.id,
      isSelected: n.id === niche.id,
    }))
    .sort((a, b) => b.rpm - a.rpm)
    .slice(0, 8) // Top 8 niches

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
        <TrendingUp className="h-4 w-4 text-cyan-500" />
        RPM by Niche
      </h3>
      <div className="h-[200px] sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis 
              type="number" 
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-foreground)',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
              itemStyle={{ color: 'var(--color-foreground)' }}
              formatter={(value: number) => [`$${value}`, 'Avg RPM']}
            />
            <Bar dataKey="rpm" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isSelected ? 'var(--color-chart-2)' : 'var(--color-chart-1)'} 
                  opacity={entry.isSelected ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Your niche:</span>
          <span className="font-medium text-foreground flex items-center gap-2">
            <span className="flex-shrink-0">{NicheIcons[niche.id]}</span>
            <span className="truncate max-w-[120px] sm:max-w-none">{niche.name}</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
          <span className="text-muted-foreground">Current RPM:</span>
          <span className="font-mono text-cyan-400">${currentRpm}</span>
        </div>
      </div>
    </div>
  )
}
