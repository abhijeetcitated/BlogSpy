/**
 * ============================================
 * TOPIC CLUSTERS - KEYWORD POOL CONSTANTS
 * ============================================
 * 
 * Constants for the Topic Cluster Keyword Pool feature
 */

import { 
  Wand2, BarChart3, Target, Scissors, Flame,
  Video, MessageSquare, Star, ShoppingCart, Image, Map, Eye, Zap,
  TrendingDown
} from "lucide-react"
import type { SerpFeature, ImportSource, IntentConfig, SerpFeatureConfig, Keyword } from "../types/keyword-types"

// Import sources configuration
export const IMPORT_SOURCES: ImportSource[] = [
  { id: "keyword-magic", label: "Keyword Magic", icon: Wand2, color: "text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20" },
  { id: "competitor-gap", label: "Competitor Gap", icon: BarChart3, color: "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20" },
  { id: "content-decay", label: "Content Decay", icon: TrendingDown, color: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20" },
  { id: "rank-tracker", label: "Rank Tracker", icon: Target, color: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" },
  { id: "snippet-stealer", label: "Snippet Stealer", icon: Scissors, color: "text-pink-500 dark:text-pink-400 bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20" },
  { id: "trend-spotter", label: "Trend Spotter", icon: Flame, color: "text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20" },
]

// Intent display configuration
export const INTENT_CONFIG: Record<string, IntentConfig> = {
  informational: { label: "Informational", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", short: "INFO" },
  transactional: { label: "Transactional", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", short: "TRAN" },
  navigational: { label: "Navigational", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30", short: "NAVI" },
  commercial: { label: "Commercial", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", short: "COMM" },
}

// SERP feature icons configuration
export const SERP_FEATURE_ICONS: Record<SerpFeature, SerpFeatureConfig> = {
  featured_snippet: { icon: Zap, label: "Featured Snippet", color: "text-yellow-500" },
  paa: { icon: MessageSquare, label: "People Also Ask", color: "text-blue-500" },
  video: { icon: Video, label: "Video", color: "text-red-500" },
  images: { icon: Image, label: "Images", color: "text-green-500" },
  shopping: { icon: ShoppingCart, label: "Shopping", color: "text-purple-500" },
  local_pack: { icon: Map, label: "Local Pack", color: "text-orange-500" },
  reviews: { icon: Star, label: "Reviews", color: "text-amber-500" },
  knowledge_panel: { icon: Eye, label: "Knowledge Panel", color: "text-cyan-500" },
}

// Source-specific data availability
// "Complete Solution": We enable calculated metrics (Traffic Pot, Clicks, CPS) for ALL sources 
// so the table never looks "empty" or broken.
export const SOURCE_DATA_MAP: Record<string, Partial<Record<keyof Keyword, boolean>>> = {
  "keyword-magic": { volume: true, kd: true, cpc: true, intent: true, trend: true, trafficPotential: true, serpFeatures: true, clicks: true, cps: true },
  "competitor-gap": { volume: true, kd: true, cpc: true, intent: true, position: false, trafficPotential: true, rankingUrl: false, clicks: true, cps: true, trend: true },
  "content-decay": { volume: true, kd: true, trend: true, position: true, positionChange: true, trafficPotential: true, rankingUrl: true, clicks: true, cps: true },
  "rank-tracker": { volume: true, kd: true, position: true, positionChange: true, serpFeatures: true, trafficPotential: true, rankingUrl: true, clicks: true, cps: true, trend: true },
  "snippet-stealer": { volume: true, kd: true, intent: true, position: true, serpFeatures: true, hasFeaturedSnippet: true, trafficPotential: true, clicks: true, cps: true },
  "trend-spotter": { volume: true, trend: true, trendPercent: true, trafficPotential: true, clicks: true, cps: true, kd: true, intent: true },
  "manual": { volume: true, kd: true, cpc: true, intent: true, trend: true, trafficPotential: true, clicks: true, cps: true },
}

// Keywords organized by source for mock data generation
export const KEYWORDS_BY_SOURCE: Record<string, { kw: string; parent: string }[]> = {
  "keyword-magic": [
    { kw: "seo tools", parent: "SEO Software" },
    { kw: "best seo tools 2024", parent: "SEO Software" },
    { kw: "keyword research tool", parent: "Keyword Research" },
    { kw: "backlink checker free", parent: "Backlink Analysis" },
    { kw: "competitor analysis tool", parent: "Competitive Analysis" },
    { kw: "site audit tool", parent: "Technical SEO" },
    { kw: "rank tracker software", parent: "Rank Tracking" },
    { kw: "content optimization tool", parent: "Content SEO" },
  ],
  "manual": [
    { kw: "my custom keyword", parent: "Custom Topic" },
    { kw: "niche specific term", parent: "Custom Topic" },
  ],
  "competitor-gap": [
    { kw: "ahrefs alternatives", parent: "SEO Tools Comparison" },
    { kw: "semrush vs ahrefs", parent: "SEO Tools Comparison" },
    { kw: "moz pro review", parent: "SEO Tools Review" },
    { kw: "ubersuggest free", parent: "Free SEO Tools" },
    { kw: "serpstat pricing", parent: "SEO Tools Pricing" },
  ],
  "content-decay": [
    { kw: "seo guide 2023", parent: "SEO Guides" },
    { kw: "link building strategies", parent: "Link Building" },
    { kw: "on page seo checklist", parent: "On-Page SEO" },
    { kw: "google algorithm updates", parent: "Algorithm Updates" },
  ],
  "rank-tracker": [
    { kw: "how to rank on google", parent: "SEO Basics" },
    { kw: "increase website traffic", parent: "Traffic Growth" },
    { kw: "local seo tips", parent: "Local SEO" },
    { kw: "mobile seo best practices", parent: "Mobile SEO" },
    { kw: "voice search optimization", parent: "Voice Search" },
  ],
  "snippet-stealer": [
    { kw: "what is seo", parent: "SEO Basics" },
    { kw: "how does google work", parent: "Search Engines" },
    { kw: "best time to post on instagram", parent: "Social Media" },
    { kw: "how to start a blog", parent: "Blogging" },
  ],
  "trend-spotter": [
    { kw: "ai seo tools", parent: "AI in SEO" },
    { kw: "chatgpt for seo", parent: "AI in SEO" },
    { kw: "google sge optimization", parent: "AI Search" },
    { kw: "tiktok seo", parent: "Social SEO" },
  ],
}
