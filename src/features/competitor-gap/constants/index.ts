// ============================================
// COMPETITOR GAP & FORUM INTEL - Constants & Config
// ============================================

import type { VolumePreset, KDPreset, QuickFilter, GapKeyword, ForumSourceConfig } from "../types"

/**
 * Volume Filter Presets
 */
export const VOLUME_PRESETS: VolumePreset[] = [
  { label: "Any", min: 0, max: 500000 },
  { label: "0-1K", min: 0, max: 1000 },
  { label: "1K-5K", min: 1000, max: 5000 },
  { label: "5K-10K", min: 5000, max: 10000 },
  { label: "10K+", min: 10000, max: 500000 },
]

/**
 * Keyword Difficulty Presets
 */
export const KD_PRESETS: KDPreset[] = [
  { label: "Any", min: 0, max: 100 },
  { label: "Easy (0-30)", min: 0, max: 30 },
  { label: "Medium (30-50)", min: 30, max: 50 },
  { label: "Hard (50-70)", min: 50, max: 70 },
  { label: "Very Hard (70+)", min: 70, max: 100 },
]

/**
 * Quick Filter Options
 */
export const QUICK_FILTERS: QuickFilter[] = [
  { id: "easy", label: "Easy Wins (KD < 30)", filter: (kw: GapKeyword) => kw.kd < 30 },
  { id: "highvol", label: "High Volume (> 1K)", filter: (kw: GapKeyword) => kw.volume > 1000 },
  { id: "commercial", label: "Commercial Intent", filter: (kw: GapKeyword) => kw.intent === "commercial" },
  { id: "trending", label: "Trending ↑", filter: (kw: GapKeyword) => kw.trend === "rising" || kw.trend === "growing" },
]

/**
 * Default Volume Range
 */
export const DEFAULT_VOLUME_RANGE: [number, number] = [0, 500000]

/**
 * Default KD Range
 */
export const DEFAULT_KD_RANGE: [number, number] = [0, 100]

/**
 * Gap Type Colors & Styles
 */
export const GAP_TYPE_COLORS = {
  all: {
    bg: "bg-zinc-500/20",
    border: "border-zinc-500/50",
    text: "text-zinc-400",
    dot: "bg-zinc-400",
  },
  missing: {
    bg: "bg-red-500/20",
    border: "border-red-500/50",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  weak: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  strong: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  shared: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
} as const

/**
 * Gap Type Labels & Descriptions
 */
export const GAP_TYPE_INFO = {
  all: {
    label: "All",
    description: "All keywords",
    emoji: "📊",
  },
  missing: {
    label: "Missing",
    description: "You don't rank",
    emoji: "🔴",
  },
  weak: {
    label: "Weak",
    description: "You rank lower",
    emoji: "🟡",
  },
  strong: {
    label: "Strong",
    description: "You rank higher",
    emoji: "🟢",
  },
  shared: {
    label: "Shared",
    description: "Similar rankings",
    emoji: "🔵",
  },
} as const

/**
 * Intent Badge Styles
 */
export const INTENT_STYLES = {
  commercial: { 
    bg: "bg-emerald-500/20", 
    text: "text-emerald-400", 
    border: "border-emerald-500/30",
    icon: "🛒",
    label: "Commercial"
  },
  transactional: { 
    bg: "bg-blue-500/20", 
    text: "text-blue-400", 
    border: "border-blue-500/30",
    icon: "💳",
    label: "Transactional"
  },
  informational: { 
    bg: "bg-purple-500/20", 
    text: "text-purple-400", 
    border: "border-purple-500/30",
    icon: "ℹ️",
    label: "Informational"
  },
  navigational: { 
    bg: "bg-amber-500/20", 
    text: "text-amber-400", 
    border: "border-amber-500/30",
    icon: "🧭",
    label: "Navigational"
  },
} as const

/**
 * Trend Styles
 */
export const TREND_STYLES = {
  rising: { 
    icon: "↑", 
    color: "text-green-400", 
    bg: "bg-green-400/10",
    label: "Rising"
  },
  growing: { 
    icon: "↗", 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    label: "Growing"
  },
  stable: { 
    icon: "→", 
    color: "text-yellow-400", 
    bg: "bg-yellow-400/10",
    label: "Stable"
  },
  declining: { 
    icon: "↘", 
    color: "text-orange-400", 
    bg: "bg-orange-400/10",
    label: "Declining"
  },
  falling: { 
    icon: "↓", 
    color: "text-red-400", 
    bg: "bg-red-400/10",
    label: "Falling"
  },
} as const

/**
 * Forum Intel Source Configurations
 */
export const FORUM_SOURCES: ForumSourceConfig[] = [
  {
    id: "reddit",
    label: "Reddit",
    icon: "🔴",
    color: "text-[#FF4500]",
    bgColor: "bg-[#FF4500]/20",
  },
  {
    id: "quora",
    label: "Quora",
    icon: "🟠",
    color: "text-[#B92B27]",
    bgColor: "bg-[#B92B27]/20",
  },
  {
    id: "stackoverflow",
    label: "Stack Overflow",
    icon: "🟡",
    color: "text-[#F48024]",
    bgColor: "bg-[#F48024]/20",
  },
  {
    id: "hackernews",
    label: "Hacker News",
    icon: "🟢",
    color: "text-[#FF6600]",
    bgColor: "bg-[#FF6600]/20",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: "🔵",
    color: "text-[#FF0000]",
    bgColor: "bg-[#FF0000]/20",
  },
]

/**
 * Competition Level Styles
 */
export const COMPETITION_STYLES = {
  low: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    label: "Low",
    emoji: "🟢",
  },
  medium: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    label: "Medium",
    emoji: "🟡",
  },
  high: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    label: "High",
    emoji: "🔴",
  },
} as const

/**
 * Source Badge Styles (Legacy support)
 */
export const SOURCE_STYLES = {
  both: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  comp1: "bg-red-500/10 text-red-400 border-red-500/30",
  comp2: "bg-orange-500/10 text-orange-400 border-orange-500/30",
} as const
