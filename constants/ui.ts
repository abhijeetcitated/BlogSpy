// ============================================
// UI CONSTANTS
// ============================================
// Colors, sizes, and UI-related constants
// ============================================

// Intent Badge Colors
export const INTENT_COLORS = {
  I: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Informational" },
  C: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Commercial" },
  T: { bg: "bg-green-500/10", text: "text-green-400", label: "Transactional" },
  N: { bg: "bg-orange-500/10", text: "text-orange-400", label: "Navigational" },
} as const

// Keyword Difficulty Levels
export const KD_LEVELS = {
  EASY: { min: 0, max: 29, color: "text-emerald-400", bg: "bg-emerald-500", label: "Easy" },
  MEDIUM: { min: 30, max: 49, color: "text-yellow-400", bg: "bg-yellow-500", label: "Medium" },
  HARD: { min: 50, max: 69, color: "text-orange-400", bg: "bg-orange-500", label: "Hard" },
  VERY_HARD: { min: 70, max: 100, color: "text-red-400", bg: "bg-red-500", label: "Very Hard" },
} as const

// Trend Indicators
export const TREND_COLORS = {
  up: { color: "text-emerald-400", icon: "ArrowUp" },
  down: { color: "text-red-400", icon: "ArrowDown" },
  stable: { color: "text-slate-400", icon: "Minus" },
} as const

// SERP Feature Icons
export const SERP_FEATURES = {
  video: { icon: "Video", label: "Video", color: "text-red-400" },
  snippet: { icon: "FileText", label: "Featured Snippet", color: "text-blue-400" },
  faq: { icon: "HelpCircle", label: "FAQ", color: "text-purple-400" },
  shopping: { icon: "ShoppingCart", label: "Shopping", color: "text-green-400" },
  image: { icon: "ImageIcon", label: "Image Pack", color: "text-pink-400" },
  reviews: { icon: "Star", label: "Reviews", color: "text-yellow-400" },
  local: { icon: "MapPin", label: "Local Pack", color: "text-orange-400" },
  news: { icon: "Newspaper", label: "News", color: "text-cyan-400" },
  ad: { icon: "DollarSign", label: "Ads", color: "text-amber-400" },
} as const

// Table Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const

// Chart Colors
export const CHART_COLORS = {
  primary: "#10b981", // Emerald
  secondary: "#06b6d4", // Cyan
  tertiary: "#8b5cf6", // Purple
  quaternary: "#f59e0b", // Amber
  danger: "#ef4444", // Red
  success: "#22c55e", // Green
  muted: "#64748b", // Slate
} as const

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

// Breakpoints (px)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 50,
  MODAL: 100,
  POPOVER: 150,
  TOOLTIP: 200,
  TOAST: 250,
} as const
