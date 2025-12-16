import { Snowflake, Flower2, Sun, Leaf } from "lucide-react"
import type { 
  Country, 
  SourceConfig, 
  CategoryConfig, 
  TrafficImpactConfig,
  EventSource,
  EventCategory,
  Season
} from "../types"

// ============================================
// COUNTRY DATA
// ============================================

// Tier-1 Countries (shown at top of dropdown)
export const tier1Countries: Country[] = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
]

// All Countries (complete list)
export const allCountries: Country[] = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
]

// ============================================
// SOURCE CONFIGURATION
// ============================================
export const sourceConfig: Record<EventSource, SourceConfig> = {
  seasonal: { label: "Seasonal", icon: "📅", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  google_trends: { label: "Google Trends", icon: "📈", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  news: { label: "News/PR", icon: "📰", color: "text-amber-400", bgColor: "bg-amber-500/20" },
  industry: { label: "Industry", icon: "🏢", color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  custom: { label: "Custom", icon: "✏️", color: "text-pink-400", bgColor: "bg-pink-500/20" },
  historical: { label: "Historical Winner", icon: "🏆", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
}

// ============================================
// CATEGORY CONFIGURATION
// ============================================
export const categoryConfig: Record<EventCategory, CategoryConfig> = {
  Shopping: { color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  Health: { color: "text-red-400", bgColor: "bg-red-500/20" },
  Lifestyle: { color: "text-pink-400", bgColor: "bg-pink-500/20" },
  Entertainment: { color: "text-purple-400", bgColor: "bg-purple-500/20" },
  Travel: { color: "text-blue-400", bgColor: "bg-blue-500/20" },
  Finance: { color: "text-amber-400", bgColor: "bg-amber-500/20" },
  Environment: { color: "text-green-400", bgColor: "bg-green-500/20" },
  Fashion: { color: "text-fuchsia-400", bgColor: "bg-fuchsia-500/20" },
  Food: { color: "text-orange-400", bgColor: "bg-orange-500/20" },
  Media: { color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  Tech: { color: "text-violet-400", bgColor: "bg-violet-500/20" },
  Sports: { color: "text-lime-400", bgColor: "bg-lime-500/20" },
  Education: { color: "text-teal-400", bgColor: "bg-teal-500/20" },
  All: { color: "text-slate-400", bgColor: "bg-slate-500/20" },
}

// ============================================
// TRAFFIC IMPACT CONFIGURATION
// ============================================
export const trafficImpactConfig: Record<string, TrafficImpactConfig> = {
  high: { label: "🔥 High Impact", color: "text-red-400", bg: "bg-red-500/10" },
  medium: { label: "⚡ Medium", color: "text-amber-400", bg: "bg-amber-500/10" },
  low: { label: "📊 Low", color: "text-slate-400", bg: "bg-slate-500/10" },
}

// ============================================
// SEASON CONFIGURATION
// ============================================
export const seasonIcons: Record<Season, typeof Snowflake> = {
  winter: Snowflake,
  spring: Flower2,
  summer: Sun,
  fall: Leaf,
}

export const seasonColors: Record<Season, string> = {
  winter: "text-blue-400 bg-blue-500/20",
  spring: "text-pink-400 bg-pink-500/20",
  summer: "text-amber-400 bg-amber-500/20",
  fall: "text-orange-400 bg-orange-500/20",
}

// ============================================
// NICHE TO CATEGORIES MAPPING
// ============================================
export const nicheToCategories: Record<string, EventCategory[]> = {
  "All": [],
  "Tech": ["Tech", "Media"],
  "Health": ["Health"],
  "Finance": ["Finance"],
  "E-commerce": ["Shopping"],
  "SaaS": ["Tech"],
  "Marketing": ["Media", "Entertainment"],
  "Travel": ["Travel"],
  "Food": ["Food"],
  "Fashion": ["Fashion"],
  "Education": ["Education"],
}

// ============================================
// MAP CONFIGURATION
// ============================================
export const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
