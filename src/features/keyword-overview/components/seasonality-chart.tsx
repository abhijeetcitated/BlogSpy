"use client"

import { SEASONALITY_DATA } from "../constants"
import { getPeakMonth, getBarHeight } from "../utils/overview-utils"
import type { SeasonalityData } from "../types"

interface SeasonalityChartProps {
  data?: SeasonalityData
}

export function SeasonalityChart({ data = SEASONALITY_DATA }: SeasonalityChartProps) {
  const maxValue = Math.max(...data.values)
  const peakIndex = getPeakMonth(data)

  return (
    <div className="flex items-end gap-1 h-24 px-2">
      {data.months.map((month, i) => {
        const height = getBarHeight(data.values[i], maxValue)
        const isPeak = i === peakIndex
        
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className={`w-full rounded-t transition-all ${
                isPeak
                  ? "bg-gradient-to-t from-amber-500 to-amber-400 shadow-lg shadow-amber-500/30"
                  : "bg-muted hover:bg-accent"
              }`}
              style={{ height: `${height}%` }}
            />
            <span className={`text-[9px] mt-1 ${isPeak ? "text-amber-500 dark:text-amber-400 font-semibold" : "text-muted-foreground/70"}`}>
              {month}
            </span>
          </div>
        )
      })}
    </div>
  )
}
