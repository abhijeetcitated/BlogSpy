"use client"

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts"
import { Calendar } from "lucide-react"
import { MonthlyProjection } from "../types"
import { formatCurrency } from "../utils"

interface ProjectionChartProps {
  projections: MonthlyProjection[]
}

export function ProjectionChart({ projections }: ProjectionChartProps) {
  const totalYearlyEarnings = projections.reduce((sum, p) => sum + p.earnings, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-1 sm:gap-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
          <Calendar className="h-4 w-4 text-emerald-500" />
          12-Month Projection
        </h3>
        <span className="text-xs sm:text-sm text-muted-foreground">
          Total: <span className="font-mono text-emerald-400">{formatCurrency(totalYearlyEarnings)}</span>
        </span>
      </div>
      <div className="h-[200px] sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projections} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              interval={0}
            />
            <YAxis 
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`}
              width={40}
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
              formatter={(value: number, name: string) => {
                if (name === 'earnings') return [formatCurrency(value), 'Earnings']
                if (name === 'traffic') return [value.toLocaleString(), 'Pageviews']
                return [value, name]
              }}
            />
            <Area 
              type="monotone" 
              dataKey="earnings" 
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#earningsGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3 text-center">
        *Based on 5% monthly traffic growth rate (Jan-Dec)
      </p>
    </div>
  )
}
