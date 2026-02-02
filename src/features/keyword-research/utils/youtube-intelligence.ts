// ============================================
// YOUTUBE INTELLIGENCE ENGINE
// ============================================
// Analysis layer for generating 6 USP insights:
// 1. Win Probability
// 2. Freshness Gap Index (FGI)
// 3. Authority Wall
// 4. Angle Map (Content Gap)
// 5. Exploit Recommendation
// 6. Effort Level
// ============================================

import { differenceInDays, parseISO, isValid } from "date-fns"

// ============================================
// CONSTANTS
// ============================================

export const WEAK_COMPETITOR_SUBS = 10000
export const OUTDATED_DAYS = 730 // 2 years
export const ONE_YEAR_DAYS = 365
export const RECENT_DAYS = 180
export const VIRAL_THRESHOLD = 5 // Views / Subs ratio
export const AUTHORITY_THRESHOLD = 1000000 // 1M Subs

// Angle keyword clusters for content gap analysis
export const ANGLE_CLUSTERS = {
  Beginner: ["beginner", "start", "basic", "101", "introduction", "intro", "newbie", "getting started"],
  Mistakes: ["mistake", "wrong", "fail", "don't", "avoid", "stop", "never", "error"],
  StepByStep: ["step by step", "guide", "tutorial", "how to", "walkthrough", "complete guide"],
  Update: ["2025", "2026", "update", "news", "latest", "new", "this year"],
  Comparison: ["vs", "better", "review", "best", "comparison", "versus", "compared"],
} as const

export type AngleClusterKey = keyof typeof ANGLE_CLUSTERS

// ============================================
// INPUT TYPES (Extended YouTube Result)
// ============================================

export interface YouTubeVideoInput {
  title: string
  url: string
  thumbnailUrl?: string
  views?: number | null
  viewsLabel?: string
  channel?: string
  /** Date string (ISO 8601) or relative string like "2 months ago" */
  published?: string
  /** Channel subscriber count - null if hidden/unavailable */
  subscriberCount?: number | null
  /** Video duration in seconds */
  durationSeconds?: number | null
  /** ISO date when video was published */
  publishedAt?: string | null
}

// ============================================
// OUTPUT TYPES (Analysis Results)
// ============================================

export type WinProbabilityLabel = "High" | "Medium" | "Low"
export type AuthorityStatus = "Hard (Wall)" | "Mixed" | "Open Field"
export type EffortLevel = "High Effort (Deep Tutorial needed)" | "Medium Effort" | "Low Effort (Shorts/Snackable)"
export type FreshnessGapLevel = "High" | "Low"
export type CompetitorStrengthLabel = "Weak" | "Moderate" | "Strong"

export interface WinProbabilityResult {
  score: number // 0-100
  label: WinProbabilityLabel
  breakdown: {
    weakCount: number
    outdatedCount: number
    viralCount: number
    optimizationGap?: boolean
  }
}

export interface FreshnessGapResult {
  percentage: number
  isRipeForUpdate: boolean
  outdatedCount: number
  totalCount: number
  level: FreshnessGapLevel
}

export interface AuthorityWallResult {
  status: AuthorityStatus
  ratio: number
  highAuthorityCount: number
  totalChecked: number
}

export interface AngleMapResult {
  dominantAngles: AngleClusterKey[]
  missingAngles: AngleClusterKey[]
  angleCounts: Record<AngleClusterKey, number>
}

export interface ExploitRecommendation {
  strategy: string
  reasoning: string
  icon: "📅" | "🚀" | "🎯" | "📚"
}

export interface EffortEstimate {
  level: EffortLevel
  avgDurationMinutes: number
  recommendation: string
}

export interface YouTubeIntelligenceResult {
  winProbability: WinProbabilityResult
  freshnessGap: FreshnessGapResult
  authorityWall: AuthorityWallResult
  competitorStrength: {
    label: CompetitorStrengthLabel
    score: number
    reason: string
  }
  angleMap: AngleMapResult
  exploit: ExploitRecommendation
  effort: EffortEstimate
  analyzedAt: string
}

// ============================================
// VIDEO BADGE TYPES (for UI rendering)
// ============================================

export type VideoBadgeType = "viral" | "outdated" | "weak"

export interface VideoBadge {
  type: VideoBadgeType
  label: string
  emoji: string
}

export interface AnalyzedVideo extends YouTubeVideoInput {
  badges: VideoBadge[]
  ageDays: number | null
  viralRatio: number | null
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse video age from published string or publishedAt date
 * Returns days since publication, or null if unparseable
 */
function parseVideoAge(video: YouTubeVideoInput): number | null {
  const now = new Date()

  // Try ISO date first
  if (video.publishedAt) {
    const parsed = parseISO(video.publishedAt)
    if (isValid(parsed)) {
      return differenceInDays(now, parsed)
    }
  }

  // Try relative string parsing (e.g., "2 months ago", "1 year ago")
  if (video.published) {
    const lowerPublished = video.published.toLowerCase()
    
    // Match patterns like "X years ago", "X months ago", "X weeks ago", "X days ago"
    const yearMatch = lowerPublished.match(/(\d+)\s*years?\s*ago/i)
    if (yearMatch) {
      return parseInt(yearMatch[1], 10) * 365
    }
    
    const monthMatch = lowerPublished.match(/(\d+)\s*months?\s*ago/i)
    if (monthMatch) {
      return parseInt(monthMatch[1], 10) * 30
    }
    
    const weekMatch = lowerPublished.match(/(\d+)\s*weeks?\s*ago/i)
    if (weekMatch) {
      return parseInt(weekMatch[1], 10) * 7
    }
    
    const dayMatch = lowerPublished.match(/(\d+)\s*days?\s*ago/i)
    if (dayMatch) {
      return parseInt(dayMatch[1], 10)
    }

    // Handle "Streamed X ago" format
    const streamedMatch = lowerPublished.match(/streamed\s+(\d+)\s*(years?|months?|weeks?|days?)\s*ago/i)
    if (streamedMatch) {
      const num = parseInt(streamedMatch[1], 10)
      const unit = streamedMatch[2].toLowerCase()
      if (unit.startsWith("year")) return num * 365
      if (unit.startsWith("month")) return num * 30
      if (unit.startsWith("week")) return num * 7
      return num
    }
  }

  return null
}

/**
 * Calculate viral ratio (views / subscribers)
 * Returns null if data is insufficient
 */
function calculateViralRatio(video: YouTubeVideoInput): number | null {
  const views = video.views ?? 0
  const subs = video.subscriberCount ?? 0
  
  if (subs === 0 || views === 0) return null
  return views / subs
}

/**
 * Get subscriber count with fallback to 0 (treats hidden/null as weak competitor)
 */
function getSubscriberCount(video: YouTubeVideoInput): number {
  return video.subscriberCount ?? 0
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * 1. Calculate Win Probability (High/Medium/Low)
 * Rules:
 * - High: Videos are >2 years old AND channel has <10k subs.
 * - Medium: Videos are ~1 year old.
 * - Low: Top results are from huge channels (1M+ subs) updated recently.
 */
export function calculateWinProbability(
  videos: YouTubeVideoInput[],
  keyword: string
): WinProbabilityResult {
  const top10 = videos.slice(0, 10)
  const topVideo = top10[0]

  let weakCount = 0
  let outdatedCount = 0
  let viralCount = 0

  for (const video of top10) {
    const subs = getSubscriberCount(video)
    if (subs < WEAK_COMPETITOR_SUBS) {
      weakCount++
    }

    const ageDays = parseVideoAge(video)
    if (ageDays !== null && ageDays > OUTDATED_DAYS) {
      outdatedCount++
    }

    const viralRatio = calculateViralRatio(video)
    if (viralRatio !== null && viralRatio > VIRAL_THRESHOLD) {
      viralCount++
    }
  }

  let score = 0
  let optimizationGap = false

  if (topVideo) {
    const topAgeDays = parseVideoAge(topVideo)
    if (topAgeDays !== null && topAgeDays > OUTDATED_DAYS) {
      score += 30
    }

    const topSubs = getSubscriberCount(topVideo)
    if (topSubs < WEAK_COMPETITOR_SUBS) {
      score += 30
    }

    const normalizedKeyword = normalizeText(keyword)
    const normalizedTitle = normalizeText(topVideo.title ?? "")
    if (normalizedKeyword && !normalizedTitle.includes(normalizedKeyword)) {
      score += 20
      optimizationGap = true
    }

    const topViralRatio = calculateViralRatio(topVideo)
    if (topViralRatio !== null && topViralRatio > VIRAL_THRESHOLD) {
      score += 20
    }
  }

  score = Math.min(100, Math.max(0, score))

  let label: WinProbabilityLabel
  if (score >= 70) {
    label = "High"
  } else if (score >= 40) {
    label = "Medium"
  } else {
    label = "Low"
  }

  return {
    score,
    label,
    breakdown: {
      weakCount,
      outdatedCount,
      viralCount,
      optimizationGap,
    },
  }
}

/**
 * 2. Calculate Freshness Gap Index (FGI)
 * Formula: (Count of Videos > 2 Years Old / Total Videos) * 100
 */
export function calculateFreshnessGap(videos: YouTubeVideoInput[]): FreshnessGapResult {
  const videosWithAge = videos.filter((v) => parseVideoAge(v) !== null)
  const totalCount = videosWithAge.length

  if (totalCount === 0) {
    return {
      percentage: 0,
      isRipeForUpdate: false,
      outdatedCount: 0,
      totalCount: videos.length,
      level: "Low",
    }
  }

  const outdatedCount = videosWithAge.filter((v) => {
    const ageDays = parseVideoAge(v)
    return ageDays !== null && ageDays > OUTDATED_DAYS
  }).length

  const percentage = Math.round((outdatedCount / totalCount) * 100)

  const isRipeForUpdate = percentage > 50
  return {
    percentage,
    isRipeForUpdate,
    outdatedCount,
    totalCount,
    level: isRipeForUpdate ? "High" : "Low",
  }
}

/**
 * 3. Calculate Authority Wall
 * Checks top 5 results only
 * Returns status based on ratio of high-authority channels (> 100k subs)
 */
export function calculateAuthorityWall(videos: YouTubeVideoInput[]): AuthorityWallResult {
  const top5 = videos.slice(0, 5)
  const totalChecked = Math.min(5, top5.length)

  if (totalChecked === 0) {
    return {
      status: "Open Field",
      ratio: 0,
      highAuthorityCount: 0,
      totalChecked: 0,
    }
  }

  const highAuthorityCount = top5.filter((v) => {
    const subs = getSubscriberCount(v)
    return subs >= AUTHORITY_THRESHOLD
  }).length

  const ratio = highAuthorityCount / totalChecked

  let status: AuthorityStatus
  if (ratio > 0.6) {
    status = "Hard (Wall)"
  } else if (ratio >= 0.2) {
    status = "Mixed"
  } else {
    status = "Open Field"
  }

  return {
    status,
    ratio,
    highAuthorityCount,
    totalChecked,
  }
}

/**
 * 4. Generate Angle Map (Content Gap Analysis)
 * Scans titles of top 10 videos for keyword clusters
 */
export function generateAngleMap(videos: YouTubeVideoInput[]): AngleMapResult {
  const top10 = videos.slice(0, 10)
  const angleCounts: Record<AngleClusterKey, number> = {
    Beginner: 0,
    Mistakes: 0,
    StepByStep: 0,
    Update: 0,
    Comparison: 0,
  }

  // Count matches for each cluster
  for (const video of top10) {
    const titleLower = video.title.toLowerCase()

    for (const [cluster, keywords] of Object.entries(ANGLE_CLUSTERS)) {
      const clusterKey = cluster as AngleClusterKey
      const hasMatch = keywords.some((kw) => titleLower.includes(kw.toLowerCase()))
      if (hasMatch) {
        angleCounts[clusterKey]++
      }
    }
  }

  // Determine dominant (found frequently) vs missing angles
  const dominantAngles: AngleClusterKey[] = []
  const missingAngles: AngleClusterKey[] = []

  // Threshold: if found in >= 2 videos, it's dominant
  const DOMINANT_THRESHOLD = 2

  for (const [cluster, count] of Object.entries(angleCounts)) {
    const clusterKey = cluster as AngleClusterKey
    if (count >= DOMINANT_THRESHOLD) {
      dominantAngles.push(clusterKey)
    } else {
      missingAngles.push(clusterKey)
    }
  }

  return {
    dominantAngles,
    missingAngles,
    angleCounts,
  }
}

/**
 * 5. Determine Exploit Recommendation
 * Logic-based strategy suggestion based on other metrics
 */
export function determineExploit(
  freshnessGap: FreshnessGapResult,
  authorityWall: AuthorityWallResult,
  viralCount: number
): ExploitRecommendation {
  // Priority 1: FGI > 50 AND Authority != Hard
  if (freshnessGap.percentage > 50 && authorityWall.status !== "Hard (Wall)") {
    return {
      strategy: "Strategy: Create Updated Guide (2026)",
      reasoning: `${freshnessGap.percentage}% of top videos are outdated. Create fresh, updated content.`,
      icon: "📅",
    }
  }

  // Priority 2: Viral opportunities exist
  if (viralCount >= 2) {
    return {
      strategy: "Strategy: Model the Viral Hooks",
      reasoning: `${viralCount} videos went viral. Analyze their hooks and thumbnails.`,
      icon: "🚀",
    }
  }

  // Priority 3: Authority wall is hard
  if (authorityWall.status === "Hard (Wall)") {
    return {
      strategy: "Strategy: Niche Down / Long-tail Angle",
      reasoning: "Top results dominated by big channels. Target a specific sub-niche.",
      icon: "🎯",
    }
  }

  // Default: Comprehensive guide
  return {
    strategy: "Strategy: Comprehensive 'All-in-One' Guide",
    reasoning: "Market is open. Create the definitive resource on this topic.",
    icon: "📚",
  }
}

/**
 * 6. Estimate Effort Level
 * Based on average duration of top videos
 */
export function estimateEffort(videos: YouTubeVideoInput[]): EffortEstimate {
  const videosWithDuration = videos.filter(
    (v) => v.durationSeconds !== null && v.durationSeconds !== undefined
  )

  if (videosWithDuration.length === 0) {
    return {
      level: "Medium Effort",
      avgDurationMinutes: 0,
      recommendation: "Unable to estimate effort (no duration data available)",
    }
  }

  const totalSeconds = videosWithDuration.reduce(
    (sum, v) => sum + (v.durationSeconds ?? 0),
    0
  )
  const avgSeconds = totalSeconds / videosWithDuration.length
  const avgMinutes = avgSeconds / 60

  let level: EffortLevel
  let recommendation: string

  if (avgMinutes > 8) {
    level = "High Effort (Deep Tutorial needed)"
    recommendation = `Average video is ${avgMinutes.toFixed(1)} minutes. Prepare in-depth, well-researched content.`
  } else if (avgMinutes >= 3) {
    level = "Medium Effort"
    recommendation = `Average video is ${avgMinutes.toFixed(1)} minutes. Standard tutorial format works well.`
  } else {
    level = "Low Effort (Shorts/Snackable)"
    recommendation = `Average video is ${avgMinutes.toFixed(1)} minutes. Short-form content dominates.`
  }

  return {
    level,
    avgDurationMinutes: Math.round(avgMinutes * 10) / 10,
    recommendation,
  }
}

/**
 * Determine competitor strength from the top result.
 */
export function assessCompetitorStrength(videos: YouTubeVideoInput[]): {
  label: CompetitorStrengthLabel
  score: number
  reason: string
} {
  const top = videos[0]
  if (!top) {
    return {
      label: "Weak",
      score: 20,
      reason: "No competitor data available",
    }
  }

  const subs = getSubscriberCount(top)
  const ageDays = parseVideoAge(top)
  const isRecent = ageDays !== null && ageDays <= RECENT_DAYS

  if (subs >= AUTHORITY_THRESHOLD && isRecent) {
    return {
      label: "Strong",
      score: 85,
      reason: "Top result is a large, recently active channel",
    }
  }

  if (subs >= WEAK_COMPETITOR_SUBS) {
    return {
      label: "Moderate",
      score: 60,
      reason: "Top result comes from a mid-size channel",
    }
  }

  return {
    label: "Weak",
    score: 30,
    reason: "Top result is a small channel",
  }
}

// ============================================
// BADGE GENERATOR (for video cards)
// ============================================

/**
 * Generate badges for a single video based on analysis thresholds
 */
export function generateVideoBadges(video: YouTubeVideoInput): VideoBadge[] {
  const badges: VideoBadge[] = []

  // Viral badge: views/subs > 5
  const viralRatio = calculateViralRatio(video)
  if (viralRatio !== null && viralRatio > VIRAL_THRESHOLD) {
    badges.push({
      type: "viral",
      label: "Viral Potential",
      emoji: "⚡",
    })
  }

  // Outdated badge: age > 2 years
  const ageDays = parseVideoAge(video)
  if (ageDays !== null && ageDays > OUTDATED_DAYS) {
    badges.push({
      type: "outdated",
      label: "Outdated",
      emoji: "👴",
    })
  }

  // Weak competitor badge: subs < 1000
  const subs = getSubscriberCount(video)
  if (subs < WEAK_COMPETITOR_SUBS) {
    badges.push({
      type: "weak",
      label: "Weak Competitor",
      emoji: "🐣",
    })
  }

  return badges
}

/**
 * Analyze videos and add badges to each
 */
export function analyzeVideosWithBadges(videos: YouTubeVideoInput[]): AnalyzedVideo[] {
  return videos.map((video) => ({
    ...video,
    badges: generateVideoBadges(video),
    ageDays: parseVideoAge(video),
    viralRatio: calculateViralRatio(video),
  }))
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Run full YouTube Intelligence analysis on a list of videos
 * Returns comprehensive insights for the Strategy Dashboard
 */
export function analyzeYouTubeCompetition(
  videos: YouTubeVideoInput[],
  keyword: string = ""
): YouTubeIntelligenceResult {
  // Run all analyses
  const winProbability = calculateWinProbability(videos, keyword)
  const freshnessGap = calculateFreshnessGap(videos)
  const authorityWall = calculateAuthorityWall(videos)
  const competitorStrength = assessCompetitorStrength(videos)
  const angleMap = generateAngleMap(videos)
  const exploit = determineExploit(
    freshnessGap,
    authorityWall,
    winProbability.breakdown.viralCount
  )
  const effort = estimateEffort(videos)

  const topVideo = videos[0]
  const topAgeDays = topVideo ? parseVideoAge(topVideo) : null
  const freshnessLevel = topAgeDays !== null && topAgeDays > OUTDATED_DAYS ? "High" : "Low"

  return {
    winProbability,
    freshnessGap: { ...freshnessGap, level: freshnessLevel },
    authorityWall,
    competitorStrength,
    angleMap,
    exploit,
    effort,
    analyzedAt: new Date().toISOString(),
  }
}
