import React from "react"
import {
  Video,
  FileText,
  ImageIcon,
  Star,
  ShoppingCart,
  HelpCircle,
  MessageSquare,
  Map,
  Newspaper,
  Calculator,
  CloudSun,
} from "lucide-react"

// Intent Configuration for display - Strong colors for both dark and light mode
export const INTENT_CONFIG: Record<string, { color: string; label: string; tooltip: string; description: string }> = {
  I: { 
    color: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40", 
    label: "I", 
    tooltip: "Informational",
    description: "User wants to learn or understand something. Great for blog posts and guides."
  },
  C: { 
    color: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40", 
    label: "C", 
    tooltip: "Commercial",
    description: "User is researching before buying. Good for comparison and review content."
  },
  T: { 
    color: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/40", 
    label: "T", 
    tooltip: "Transactional",
    description: "User is ready to buy or take action. Best for product/landing pages."
  },
  N: { 
    color: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40", 
    label: "N", 
    tooltip: "Navigational",
    description: "User is looking for a specific website or page. Brand-related queries."
  },
}

// SERP Feature Icons Configuration
export const SERP_ICONS: Record<string, { icon: React.ReactNode; label: string; ctrImpact: number }> = {
  video: { icon: React.createElement(Video, { className: "h-3.5 w-3.5" }), label: "Video Carousel", ctrImpact: 15 },
  snippet: { icon: React.createElement(FileText, { className: "h-3.5 w-3.5" }), label: "Featured Snippet", ctrImpact: 25 },
  image: { icon: React.createElement(ImageIcon, { className: "h-3.5 w-3.5" }), label: "Image Pack", ctrImpact: 10 },
  reviews: { icon: React.createElement(Star, { className: "h-3.5 w-3.5" }), label: "Reviews", ctrImpact: 5 },
  shopping: { icon: React.createElement(ShoppingCart, { className: "h-3.5 w-3.5" }), label: "Shopping Results", ctrImpact: 20 },
  faq: { icon: React.createElement(HelpCircle, { className: "h-3.5 w-3.5" }), label: "People Also Ask", ctrImpact: 12 },
  local: { icon: React.createElement(Map, { className: "h-3.5 w-3.5" }), label: "Local Pack", ctrImpact: 18 },
  news: { icon: React.createElement(Newspaper, { className: "h-3.5 w-3.5" }), label: "Top Stories", ctrImpact: 10 },
  calculator: { icon: React.createElement(Calculator, { className: "h-3.5 w-3.5" }), label: "Calculator", ctrImpact: 30 },
  weather: { icon: React.createElement(CloudSun, { className: "h-3.5 w-3.5" }), label: "Weather Widget", ctrImpact: 35 },
  ai_overview: { icon: React.createElement(MessageSquare, { className: "h-3.5 w-3.5" }), label: "AI Overview", ctrImpact: 40 },
}

// Sort types - Extended for all sortable columns
export type SortField = 
  | "keyword" 
  | "volume" 
  | "rtv"
  | "kd" 
  | "cpc" 
  | "trend" 
  | "geoScore" 
  | "aioScore"
  | "decayScore"
  | "videoOpp"
  | "commerceOpp"
  | "socialOpp"
  | null

export type SortDirection = "asc" | "desc"

// Column definitions for the table
export interface ColumnDefinition {
  id: string
  header: string
  accessor: string
  sortable: boolean
  width: string
  align: "left" | "center" | "right"
  tooltip?: string
}

export const TABLE_COLUMNS: ColumnDefinition[] = [
  { id: "select", header: "", accessor: "", sortable: false, width: "w-10", align: "center" },
  { id: "keyword", header: "Keyword", accessor: "keyword", sortable: true, width: "w-[180px]", align: "left" },
  { id: "intent", header: "Intent", accessor: "intent", sortable: false, width: "w-14", align: "center" },
  { 
    id: "volume", 
    header: "Volume", 
    accessor: "volume", 
    sortable: true, 
    width: "w-20", 
    align: "right",
    tooltip: "Monthly search volume for this keyword"
  },
  { 
    id: "rtv", 
    header: "RTV", 
    accessor: "rtv", 
    sortable: true, 
    width: "w-16", 
    align: "right",
    tooltip: "Realizable Traffic Volume - actual traffic potential after SERP features steal clicks"
  },
  { id: "trend", header: "Trend", accessor: "trend", sortable: true, width: "w-16", align: "center" },
  { id: "weakSpot", header: "Weak Spot", accessor: "weakSpot", sortable: false, width: "w-24", align: "center" },
  { 
    id: "geoScore", 
    header: "GEO", 
    accessor: "geoScore", 
    sortable: true, 
    width: "w-16", 
    align: "center",
    tooltip: "GEO Score (0-100) - How easy to get cited by AI Overview"
  },
  { 
    id: "aio", 
    header: "AIO", 
    accessor: "aioAnalysis", 
    sortable: true, 
    width: "w-14", 
    align: "center",
    tooltip: "AI Overview citation position and opportunity score"
  },
  { 
    id: "decay", 
    header: "Decay", 
    accessor: "communityDecay", 
    sortable: true, 
    width: "w-14", 
    align: "center",
    tooltip: "Community Decay Score - How outdated is forum content in SERP"
  },
  { 
    id: "videoOpp", 
    header: "Video", 
    accessor: "videoOpportunity", 
    sortable: true, 
    width: "w-14", 
    align: "center",
    tooltip: "Video Opportunity - YouTube/TikTok ranking potential"
  },
  { 
    id: "commerceOpp", 
    header: "Commerce", 
    accessor: "commerceOpportunity", 
    sortable: true, 
    width: "w-14", 
    align: "center",
    tooltip: "Commerce Opportunity - Amazon ranking potential"
  },
  { 
    id: "socialOpp", 
    header: "Social", 
    accessor: "socialOpportunity", 
    sortable: true, 
    width: "w-14", 
    align: "center",
    tooltip: "Social Opportunity - Pinterest/X/Instagram potential"
  },
  { 
    id: "kd", 
    header: "KD", 
    accessor: "kd", 
    sortable: true, 
    width: "w-14", 
    align: "center",
    tooltip: "Keyword Difficulty (0-100)"
  },
  { 
    id: "cpc", 
    header: "CPC", 
    accessor: "cpc", 
    sortable: true, 
    width: "w-14", 
    align: "right",
    tooltip: "Cost Per Click in USD"
  },
  { id: "serp", header: "SERP", accessor: "serpFeatures", sortable: false, width: "w-20", align: "left" },
  { id: "actions", header: "Actions", accessor: "", sortable: false, width: "w-24", align: "right" },
]

// KD Level configuration
export const KD_LEVELS = [
  { min: 0, max: 14, label: "Very Easy", color: "#22c55e", bgColor: "bg-green-500" },
  { min: 15, max: 29, label: "Easy", color: "#4ade80", bgColor: "bg-green-400" },
  { min: 30, max: 49, label: "Moderate", color: "#eab308", bgColor: "bg-yellow-500" },
  { min: 50, max: 69, label: "Hard", color: "#f97316", bgColor: "bg-orange-500" },
  { min: 70, max: 84, label: "Very Hard", color: "#f87171", bgColor: "bg-red-400" },
  { min: 85, max: 100, label: "Extreme", color: "#dc2626", bgColor: "bg-red-600" },
]

// Get KD level info
export function getKDLevel(kd: number) {
  return KD_LEVELS.find(level => kd >= level.min && kd <= level.max) || KD_LEVELS[KD_LEVELS.length - 1]
}
