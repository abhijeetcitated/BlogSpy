// ============================================
// SUGGESTION ENGINE - Rule-Based AI Suggestions
// ============================================
// Pure function: receives raw DB data, applies rules, returns AgenticSuggestion[]
// No DB calls, no auth, no side effects — only logic.
// ============================================

import type { AgenticSuggestion } from "../components/command-center-data"
import { FEATURE_FLAGS } from "@/config/feature-flags"

// ============================================
// RAW DATA TYPES (from DB queries)
// ============================================

export interface RankingWithKeyword {
  keywordId: string
  keyword: string
  slug: string
  currentPosition: number
  previousPosition: number | null // position from ~7 days ago
  url: string | null
  checkedAt: string
  // From kw_cache
  difficulty: number | null // raw_data.difficulty
  searchVolume: number | null // raw_data.search_volume
  lossPercentage: number | null
  rtvScore: number | null
}

export interface DecayingContent {
  id: string
  url: string
  projectId: string
}

export interface TrendingTopic {
  id: string
  topic: string
  growthPercent: number
}

export interface AIScanActivity {
  keywordScanned: string // from meta_data
  createdAt: string
}

export interface SuggestionEngineInput {
  rankings: RankingWithKeyword[]
  decayingContent: DecayingContent[]
  trendingTopics: TrendingTopic[]
  aiScans: AIScanActivity[]
}

// ============================================
// THEME PRESETS (icon + colors per type)
// ============================================

interface SuggestionTheme {
  iconKey: AgenticSuggestion["iconKey"]
  iconColor: string
  bgColor: string
  borderColor: string
  impactColor: string
}

const THEMES: Record<string, SuggestionTheme> = {
  rank_drop: {
    iconKey: "file_edit",
    iconColor: "text-amber-400",
    bgColor: "from-amber-500/10 to-orange-500/10",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
    impactColor: "text-emerald-400",
  },
  content_decay: {
    iconKey: "alert_triangle",
    iconColor: "text-red-400",
    bgColor: "from-red-500/10 to-orange-500/10",
    borderColor: "border-red-500/20 hover:border-red-500/40",
    impactColor: "text-red-400",
  },
  trend_spike: {
    iconKey: "lightbulb",
    iconColor: "text-yellow-400",
    bgColor: "from-yellow-500/10 to-amber-500/10",
    borderColor: "border-yellow-500/20 hover:border-yellow-500/40",
    impactColor: "text-yellow-400",
  },
  snippet_opportunity: {
    iconKey: "eye",
    iconColor: "text-purple-400",
    bgColor: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/20 hover:border-purple-500/40",
    impactColor: "text-purple-400",
  },
  weak_spot: {
    iconKey: "target",
    iconColor: "text-cyan-400",
    bgColor: "from-cyan-500/10 to-blue-500/10",
    borderColor: "border-cyan-500/20 hover:border-cyan-500/40",
    impactColor: "text-cyan-400",
  },
  ai_overview_gap: {
    iconKey: "sparkles",
    iconColor: "text-emerald-400",
    bgColor: "from-emerald-500/10 to-teal-500/10",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    impactColor: "text-emerald-400",
  },
  rtv_alert: {
    iconKey: "activity",
    iconColor: "text-orange-400",
    bgColor: "from-orange-500/10 to-red-500/10",
    borderColor: "border-orange-500/20 hover:border-orange-500/40",
    impactColor: "text-red-400",
  },
}

// ============================================
// RULE CONSTANTS
// ============================================

const RANK_DROP_THRESHOLD = 3 // positions
const RANK_DROP_HIGH_THRESHOLD = 5
const SNIPPET_POSITION_MIN = 2
const SNIPPET_POSITION_MAX = 5
const WEAK_SPOT_POSITION_MIN = 4
const WEAK_SPOT_POSITION_MAX = 15
const WEAK_SPOT_KD_MAX = 30
const AI_OVERVIEW_POSITION_MAX = 5
const TREND_GROWTH_MIN = 100
const TREND_GROWTH_HIGH = 200
const RTV_LOSS_THRESHOLD = 50
const RTV_LOSS_HIGH_THRESHOLD = 70
const MAX_SUGGESTIONS = 20

type CtaRouteInput = {
  enabled: boolean
  primaryHref: string
  fallbackHref: string
  primaryLabel: string
  fallbackLabel: string
}

// ============================================
// PRIORITY ORDER
// ============================================

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

// ============================================
// SLUG HELPER
// ============================================

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

function timeAgoText(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

function resolveCtaRoute(input: CtaRouteInput) {
  if (input.enabled) {
    return {
      ctaHref: input.primaryHref,
      ctaLabel: input.primaryLabel,
    }
  }

  return {
    ctaHref: input.fallbackHref,
    ctaLabel: input.fallbackLabel,
  }
}

// ============================================
// CTR CURVE (Google organic CTR by position)
// Source: Backlinko / Advanced Web Ranking 2025 studies
// ============================================

const CTR_CURVE: Record<number, number> = {
  1: 0.295, 2: 0.155, 3: 0.095, 4: 0.062, 5: 0.044,
  6: 0.032, 7: 0.024, 8: 0.019, 9: 0.015, 10: 0.012,
}

function positionToCTR(position: number): number {
  if (position <= 0) return 0
  if (position <= 10) return CTR_CURVE[position] ?? 0.01
  if (position <= 20) return 0.005
  return 0.001
}

/** Estimate monthly organic clicks for a keyword at a given position */
function estimateTraffic(searchVolume: number | null, position: number): number {
  if (!searchVolume || searchVolume <= 0) return 0
  return Math.round(searchVolume * positionToCTR(position))
}

/** Format large numbers: 12500 → "12.5K", 1200 → "1.2K", 800 → "800" */
function formatVolume(vol: number | null): string {
  if (!vol || vol <= 0) return ""
  if (vol >= 1000) return `${(vol / 1000).toFixed(1).replace(/\.0$/, "")}K`
  return vol.toLocaleString()
}

/** Extract readable path from URL: https://example.com/blog/seo-tips → /blog/seo-tips */
function formatUrlPath(url: string | null): string {
  if (!url) return ""
  const path = url.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "")
  if (path.length > 40) return path.slice(0, 37) + "..."
  return path || "/"
}

// ============================================
// RULE FUNCTIONS
// ============================================

function generateRankDrops(rankings: RankingWithKeyword[]): AgenticSuggestion[] {
  const suggestions: AgenticSuggestion[] = []
  const theme = THEMES.rank_drop

  for (const r of rankings) {
    if (r.previousPosition === null) continue
    const drop = r.currentPosition - r.previousPosition
    if (drop < RANK_DROP_THRESHOLD) continue

    const priority = drop >= RANK_DROP_HIGH_THRESHOLD ? "high" : "medium"
    const slug = toSlug(r.keyword)

    // Compute estimated traffic loss from position change
    const trafficBefore = estimateTraffic(r.searchVolume, r.previousPosition)
    const trafficAfter = estimateTraffic(r.searchVolume, r.currentPosition)
    const trafficLost = trafficBefore - trafficAfter
    const volText = formatVolume(r.searchVolume)
    const urlPath = formatUrlPath(r.url)

    // Build data-rich evidence line
    const evidenceParts = [`#${r.previousPosition} → #${r.currentPosition} (-${drop} ranks)`]
    if (volText) evidenceParts.push(`Vol: ${volText}/mo`)
    if (urlPath) evidenceParts.push(urlPath)

    // Quantified impact instead of vague percentage
    const impactText = trafficLost > 0
      ? `~${trafficLost.toLocaleString()} clicks/mo at risk`
      : `+${Math.min(drop * 10, 60)}% recovery potential`

    suggestions.push({
      id: 0, // will be assigned later
      type: "rank_drop",
      priority,
      iconKey: theme.iconKey,
      iconColor: theme.iconColor,
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      title: `Update '${r.keyword}' — dropped #${r.previousPosition} → #${r.currentPosition}`,
      description: `Update content to recover ranking before competitors cement their position.`,
      evidence: evidenceParts.join(" | "),
      ...resolveCtaRoute({
        enabled: FEATURE_FLAGS.AI_WRITER,
        primaryHref: `/dashboard/creation/ai-writer?action=update&keyword=${slug}`,
        fallbackHref: `/dashboard/research/keyword-magic?keyword=${slug}`,
        primaryLabel: "Auto-Draft Update",
        fallbackLabel: "Open Keyword",
      }),
      impact: impactText,
      impactColor: theme.impactColor,
      freshness: timeAgoText(r.checkedAt),
      effort: "~30 min content update",
    })
  }

  return suggestions
}

function generateContentDecay(
  decayingContent: DecayingContent[],
  rankings: RankingWithKeyword[]
): AgenticSuggestion[] {
  const suggestions: AgenticSuggestion[] = []
  const theme = THEMES.content_decay

  // Find decaying content that still has rankings
  for (const content of decayingContent) {
    const matchingRanking = rankings.find(
      (r) => r.url && content.url && r.url.includes(content.url.replace(/^https?:\/\/[^/]+/, ""))
    )

    if (matchingRanking) {
      const slug = toSlug(matchingRanking.keyword)
      const estTraffic = estimateTraffic(matchingRanking.searchVolume, matchingRanking.currentPosition)
      const volText = formatVolume(matchingRanking.searchVolume)

      // Build evidence with volume + rank
      const evidenceParts = ["DECAYING", `Rank: #${matchingRanking.currentPosition}`]
      if (volText) evidenceParts.push(`Vol: ${volText}/mo`)

      const impactText = estTraffic > 0
        ? `~${estTraffic.toLocaleString()} clicks/mo at risk`
        : `Save #${matchingRanking.currentPosition} ranking`

      suggestions.push({
        id: 0,
        type: "content_decay",
        priority: "high",
        iconKey: theme.iconKey,
        iconColor: theme.iconColor,
        bgColor: theme.bgColor,
        borderColor: theme.borderColor,
        title: `Decaying content still ranks for '${matchingRanking.keyword}'`,
      description: `Update this page before you lose your ranking position entirely.`,
      evidence: evidenceParts.join(" | "),
      ...resolveCtaRoute({
        enabled: FEATURE_FLAGS.AI_WRITER,
        primaryHref: `/dashboard/creation/ai-writer?keyword=${slug}&action=update`,
        fallbackHref: `/dashboard/research/keyword-magic?keyword=${slug}`,
        primaryLabel: "Update Content",
        fallbackLabel: "Open Keyword",
      }),
      impact: impactText,
      impactColor: theme.impactColor,
      freshness: "Decay detected",
      effort: "~45 min content refresh",
      })
    } else {
      // Decaying content without matching ranking — still show alert
      const urlPath = content.url.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "")
      suggestions.push({
        id: 0,
        type: "content_decay",
        priority: "medium",
        iconKey: theme.iconKey,
        iconColor: theme.iconColor,
        bgColor: theme.bgColor,
        borderColor: theme.borderColor,
        title: `Content decaying: ${urlPath || content.url}`,
      description: `Review and update to prevent further decline.`,
      evidence: `Content status: DECAYING | URL: ${content.url}`,
      ...resolveCtaRoute({
        enabled: FEATURE_FLAGS.ON_PAGE_CHECKER,
        primaryHref: `/dashboard/creation/on-page?url=${encodeURIComponent(content.url)}`,
        fallbackHref: "/dashboard/research/keyword-magic",
        primaryLabel: "Review Content",
        fallbackLabel: "Open Research",
      }),
      impact: "Prevent further decline",
      impactColor: theme.impactColor,
      freshness: "Decay detected",
      effort: "~45 min content refresh",
      })
    }
  }

  return suggestions
}

function generateTrendSpikes(trendingTopics: TrendingTopic[]): AgenticSuggestion[] {
  const suggestions: AgenticSuggestion[] = []
  const theme = THEMES.trend_spike

  for (const trend of trendingTopics) {
    if (trend.growthPercent < TREND_GROWTH_MIN) continue

    const priority = trend.growthPercent >= TREND_GROWTH_HIGH ? "high" : "low"
    const slug = toSlug(trend.topic)

    suggestions.push({
      id: 0,
      type: "trend_spike",
      priority,
      iconKey: theme.iconKey,
      iconColor: theme.iconColor,
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      title: `Trending: '${trend.topic}' searches up ${trend.growthPercent}%`,
      description: `Publish now to capture early traffic before competition moves in.`,
      evidence: `Growth: +${trend.growthPercent}% in recent tracking period`,
      ...resolveCtaRoute({
        enabled: FEATURE_FLAGS.AI_WRITER,
        primaryHref: `/dashboard/creation/ai-writer?keyword=${slug}`,
        fallbackHref: `/dashboard/research/keyword-magic?keyword=${slug}`,
        primaryLabel: "Write Now",
        fallbackLabel: "Open Keyword",
      }),
      impact: "First mover advantage",
      impactColor: theme.impactColor,
      freshness: "Trend detected",
      effort: "~2 hrs new content",
    })
  }

  return suggestions
}

function generateSnippetOpportunities(rankings: RankingWithKeyword[]): AgenticSuggestion[] {
  const suggestions: AgenticSuggestion[] = []
  const theme = THEMES.snippet_opportunity

  for (const r of rankings) {
    if (r.currentPosition < SNIPPET_POSITION_MIN || r.currentPosition > SNIPPET_POSITION_MAX) continue

    const priority = r.currentPosition <= 3 ? "high" : "medium"
    const slug = toSlug(r.keyword)

    // Featured Snippet CTR bonus: ~8.6% of clicks go to snippets (Ahrefs study)
    const snippetCTR = 0.086
    const currentCTR = positionToCTR(r.currentPosition)
    const extraClicks = r.searchVolume ? Math.round(r.searchVolume * (snippetCTR - currentCTR + positionToCTR(1))) : 0
    const volText = formatVolume(r.searchVolume)

    const evidenceParts = [`Position: #${r.currentPosition}`, "Featured Snippet range"]
    if (volText) evidenceParts.push(`Vol: ${volText}/mo`)

    const impactText = extraClicks > 0
      ? `+${extraClicks.toLocaleString()} potential clicks/mo`
      : "Position 0 opportunity"

    suggestions.push({
      id: 0,
      type: "snippet_opportunity",
      priority,
      iconKey: theme.iconKey,
      iconColor: theme.iconColor,
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      title: `Steal Featured Snippet for '${r.keyword}'`,
      description: `Optimize your content format to capture Position 0 from the current holder.`,
      evidence: evidenceParts.join(" | "),
      ...resolveCtaRoute({
        enabled: FEATURE_FLAGS.SNIPPET_STEALER,
        primaryHref: `/dashboard/creation/snippet-stealer?keyword=${slug}`,
        fallbackHref: `/dashboard/research/keyword-magic?keyword=${slug}`,
        primaryLabel: "View Snippet Strategy",
        fallbackLabel: "Open Keyword",
      }),
      impact: impactText,
      impactColor: theme.impactColor,
      freshness: timeAgoText(r.checkedAt),
      effort: "~20 min format optimization",
    })
  }

  return suggestions
}

function generateWeakSpots(rankings: RankingWithKeyword[]): AgenticSuggestion[] {
  const suggestions: AgenticSuggestion[] = []
  const theme = THEMES.weak_spot

  for (const r of rankings) {
    if (r.currentPosition < WEAK_SPOT_POSITION_MIN || r.currentPosition > WEAK_SPOT_POSITION_MAX) continue
    if (r.difficulty === null || r.difficulty >= WEAK_SPOT_KD_MAX) continue

    const volumeText = r.searchVolume
      ? `${r.searchVolume.toLocaleString()} monthly searches`
      : "Low competition"
    const slug = toSlug(r.keyword)
    const urlPath = formatUrlPath(r.url)

    const evidenceParts = [`KD: ${r.difficulty}/100`, volumeText, `Position: #${r.currentPosition}`]
    if (urlPath) evidenceParts.push(urlPath)

    // Estimate clicks from jumping to top 3
    const currentTraffic = estimateTraffic(r.searchVolume, r.currentPosition)
    const top3Traffic = estimateTraffic(r.searchVolume, 3)
    const extraClicks = top3Traffic - currentTraffic

    const impactText = extraClicks > 0
      ? `+${extraClicks.toLocaleString()} clicks/mo if top 3`
      : volumeText

    suggestions.push({
      id: 0,
      type: "weak_spot",
      priority: "medium",
      iconKey: theme.iconKey,
      iconColor: theme.iconColor,
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      title: `Easy win: '${r.keyword}' — KD ${r.difficulty}`,
      description: `Optimize existing content or create fresh to jump to top 3.`,
      evidence: evidenceParts.join(" | "),
      ...resolveCtaRoute({
        enabled: FEATURE_FLAGS.AI_WRITER,
        primaryHref: `/dashboard/creation/ai-writer?keyword=${slug}`,
        fallbackHref: `/dashboard/research/keyword-magic?keyword=${slug}`,
        primaryLabel: "Create Article",
        fallbackLabel: "Open Keyword",
      }),
      impact: impactText,
      impactColor: theme.impactColor,
      freshness: "Weak spot detected",
      effort: "~1 hr content optimization",
    })
  }

  return suggestions
}

function generateAIOverviewGaps(
  rankings: RankingWithKeyword[],
  aiScans: AIScanActivity[]
): AgenticSuggestion[] {
  const suggestions: AgenticSuggestion[] = []
  const theme = THEMES.ai_overview_gap

  const scannedKeywords = new Set(
    aiScans.map((s) => s.keywordScanned.toLowerCase())
  )

  for (const r of rankings) {
    if (r.currentPosition > AI_OVERVIEW_POSITION_MAX) continue
    if (scannedKeywords.has(r.keyword.toLowerCase())) continue

    const priority = r.currentPosition <= 3 ? "high" : "medium"
    const slug = toSlug(r.keyword)
    const volText = formatVolume(r.searchVolume)

    const evidenceParts = [`Rank #${r.currentPosition}`, "No AI scan yet"]
    if (volText) evidenceParts.push(`Vol: ${volText}/mo`)

    const impactText = r.searchVolume
      ? `${formatVolume(r.searchVolume)} searchers may see AI answer first`
      : "Potential AI visibility boost"

    suggestions.push({
      id: 0,
      type: "ai_overview_gap",
      priority,
      iconKey: theme.iconKey,
      iconColor: theme.iconColor,
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      title: `AI citation opportunity for '${r.keyword}'`,
      description: `Scan now to find citation gaps and optimize for AI Overview inclusion.`,
      evidence: evidenceParts.join(" | "),
      ...resolveCtaRoute({
        enabled: FEATURE_FLAGS.AI_VISIBILITY,
        primaryHref: `/dashboard/tracking/ai-visibility?keyword=${slug}`,
        fallbackHref: `/dashboard/research/overview/${slug}`,
        primaryLabel: "Check AI Visibility",
        fallbackLabel: "Open Overview",
      }),
      impact: impactText,
      impactColor: theme.impactColor,
      freshness: timeAgoText(r.checkedAt),
      effort: "~5 min AI scan",
    })
  }

  return suggestions
}

function generateRTVAlerts(rankings: RankingWithKeyword[]): AgenticSuggestion[] {
  const suggestions: AgenticSuggestion[] = []
  const theme = THEMES.rtv_alert

  for (const r of rankings) {
    if (r.lossPercentage === null || r.lossPercentage <= RTV_LOSS_THRESHOLD) continue

    const priority = r.lossPercentage > RTV_LOSS_HIGH_THRESHOLD ? "high" : "medium"
    const slug = toSlug(r.keyword)
    const lossRounded = Math.round(r.lossPercentage)

    // Compute absolute click loss using volume + CTR + loss %
    const estTraffic = estimateTraffic(r.searchVolume, r.currentPosition)
    const clicksLost = estTraffic > 0 ? Math.round(estTraffic * (lossRounded / 100)) : 0
    const volText = formatVolume(r.searchVolume)

    const evidenceParts = [`${lossRounded}% traffic lost to SERP features`]
    if (volText) evidenceParts.push(`Vol: ${volText}/mo`)
    evidenceParts.push(`Rank: #${r.currentPosition}`)

    const impactText = clicksLost > 0
      ? `~${clicksLost.toLocaleString()} clicks/mo lost`
      : `${lossRounded}% traffic being lost`

    suggestions.push({
      id: 0,
      type: "rtv_alert",
      priority,
      iconKey: theme.iconKey,
      iconColor: theme.iconColor,
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      title: `⚠️ Low Click Rate: '${r.keyword}'`,
      description: `Target Featured Snippets and optimize meta to recover lost organic clicks.`,
      evidence: evidenceParts.join(" | "),
      ctaLabel: "See Why",
      ctaHref: `/dashboard/research/overview/${slug}`,
      impact: impactText,
      impactColor: theme.impactColor,
      freshness: "Click analysis",
      effort: "~30 min snippet targeting",
    })
  }

  return suggestions
}

// ============================================
// MAIN ENGINE
// ============================================

export function generateSuggestions(input: SuggestionEngineInput): AgenticSuggestion[] {
  const { rankings, decayingContent, trendingTopics, aiScans } = input

  // Generate all suggestions from 7 rule types
  const allSuggestions: AgenticSuggestion[] = [
    ...generateRankDrops(rankings),
    ...generateContentDecay(decayingContent, rankings),
    ...generateTrendSpikes(trendingTopics),
    ...generateSnippetOpportunities(rankings),
    ...generateWeakSpots(rankings),
    ...generateAIOverviewGaps(rankings, aiScans),
    ...generateRTVAlerts(rankings),
  ]

  // Sort: HIGH first, then MEDIUM, then LOW. Within same priority, preserve insertion order.
  allSuggestions.sort((a, b) => {
    return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
  })

  // Limit to MAX_SUGGESTIONS and assign sequential IDs
  return allSuggestions.slice(0, MAX_SUGGESTIONS).map((s, i) => ({
    ...s,
    id: i + 1,
  }))
}
