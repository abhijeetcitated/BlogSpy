"use client"

import dynamic from "next/dynamic"

// Loading placeholder for charts
function ChartLoading({ height = 300 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center w-full animate-pulse" style={{ height }}>
      <div className="w-full h-full rounded-lg bg-muted/50" />
    </div>
  )
}

// Lazy load recharts components to reduce initial bundle
// These are code-split and only loaded when charts are rendered

export const LazyAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { loading: () => <ChartLoading />, ssr: false }
)

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { loading: () => <ChartLoading />, ssr: false }
)

export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { loading: () => <ChartLoading />, ssr: false }
)

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  { loading: () => <ChartLoading />, ssr: false }
)

export const LazyComposedChart = dynamic(
  () => import("recharts").then((mod) => mod.ComposedChart),
  { loading: () => <ChartLoading />, ssr: false }
)

export const LazyRadarChart = dynamic(
  () => import("recharts").then((mod) => mod.RadarChart),
  { loading: () => <ChartLoading />, ssr: false }
)

// Re-export commonly used non-chart recharts components
// These are lightweight and don't need lazy loading
export {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  Bar,
  Line,
  Pie,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
