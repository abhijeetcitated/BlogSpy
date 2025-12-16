"use client"

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { ROITrendData } from "../types"
import { formatCurrency } from "../utils"

interface ROITrendChartProps {
  data: ROITrendData[]
}

export function ROITrendChart({ data }: ROITrendChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
      <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-500" />
        Revenue vs Cost Trend
      </h3>
      <div className="h-[200px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -10, right: 5, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              width={45}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-foreground)',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
              formatter={(value: number, name: string) => {
                return [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Cost']
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span style={{ color: 'var(--color-foreground)' }}>
                  {value === 'revenue' ? 'Revenue' : 'Cost'}
                </span>
              )}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#revenueGradient)" 
            />
            <Area 
              type="monotone" 
              dataKey="cost" 
              stroke="#ef4444" 
              strokeWidth={2}
              fill="url(#costGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
