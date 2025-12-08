"use client"

import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"

const data = [
  { time: "12am", actual: 100, prediction: null },
  { time: "3am", actual: 120, prediction: null },
  { time: "6am", actual: 180, prediction: null },
  { time: "9am", actual: 280, prediction: null },
  { time: "12pm", actual: 450, prediction: null },
  { time: "3pm", actual: 620, prediction: null },
  { time: "6pm", actual: 780, prediction: 780 },
  { time: "9pm", actual: null, prediction: 950 },
  { time: "12am+", actual: null, prediction: 1100 },
  { time: "3am+", actual: null, prediction: 1180 },
]

export function VelocityChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <ReferenceLine
            x="6pm"
            stroke="#64748b"
            strokeDasharray="3 3"
            label={{
              value: "Now",
              position: "top",
              fill: "#64748b",
              fontSize: 11,
            }}
          />
          {/* Actual trend line */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: "#10b981" }}
          />
          {/* AI Prediction line */}
          <Line
            type="monotone"
            dataKey="prediction"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="8 4"
            dot={false}
            opacity={0.6}
          />
        </LineChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-6 bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Actual Trend</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-0.5 w-6 bg-emerald-500/60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #10b981 0, #10b981 8px, transparent 8px, transparent 12px)",
            }}
          />
          <span className="text-xs text-muted-foreground">AI Prediction</span>
        </div>
      </div>
    </div>
  )
}
