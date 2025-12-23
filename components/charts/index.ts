// ============================================
// CHARTS - BARREL EXPORT
// ============================================
// All chart components live in this folder
// Import from "@/components/charts"
// ============================================

// Sparkline Chart - Simple trend lines
export { Sparkline } from "./sparkline"

// Velocity Chart - Time-series with predictions
export { VelocityChart } from "./velocity-chart"

// Trending Sparkline - Gradient area chart
export { TrendingSparkline } from "./trending-sparkline"

// KD Ring - Keyword difficulty indicator
export { KDRing } from "./kd-ring"

// Credit Ring - Usage meter
export { CreditRing } from "./credit-ring"

// Chart Styles - Shared tooltip and axis styles for theming
export { 
  chartTooltipStyles, 
  chartAxisStyles, 
  chartColors,
  intentColors,
  difficultyColors,
} from "./chart-styles"

// Lazy-loaded charts - Use these to reduce initial bundle size
// Recharts (~100KB) will only load when chart is rendered
export {
  LazyAreaChart,
  LazyBarChart,
  LazyLineChart,
  LazyPieChart,
  LazyComposedChart,
  LazyRadarChart,
  // Re-exported recharts helpers (lightweight)
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
} from "./lazy-charts"
