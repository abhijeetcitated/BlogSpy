// On-Page Checker Utility Functions
import { SCORE_THRESHOLDS, ALTERNATIVE_SUGGESTIONS } from "../constants"
import type { ScoreInfo, IssuesData } from "../types"

/**
 * Calculate dynamic score based on issues
 * - Starts at 100
 * - Each error: -15 points
 * - Each warning: -5 points
 * - Each passed: +2 points (bonus capped at 10)
 */
export function calculateDynamicScore(issues: IssuesData): number {
  const baseScore = 100
  const errorPenalty = issues.errors.length * 15
  const warningPenalty = issues.warnings.length * 5
  const passedBonus = Math.min(issues.passed.length * 2, 10) // Max 10 bonus
  
  const finalScore = baseScore - errorPenalty - warningPenalty + passedBonus
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, finalScore))
}

/**
 * Calculate score info based on score value
 */
export function getScoreInfo(score: number): ScoreInfo {
  if (score >= SCORE_THRESHOLDS.good) {
    return {
      score,
      color: "text-emerald-600 dark:text-emerald-400",
      glow: "shadow-emerald-500/30",
      message: "Great! Top 10 potential.",
    }
  }
  if (score >= SCORE_THRESHOLDS.medium) {
    return {
      score,
      color: "text-amber-600 dark:text-amber-400",
      glow: "shadow-amber-500/30",
      message: "Good, but room for improvement.",
    }
  }
  return {
    score,
    color: "text-red-600 dark:text-red-400",
    glow: "shadow-red-500/30",
    message: "Critical issues found.",
  }
}

/**
 * Get gradient color for score
 */
export function getScoreGradientColor(score: number): { start: string; end: string } {
  if (score >= SCORE_THRESHOLDS.good) {
    return { start: "#10b981", end: "#06b6d4" }
  }
  if (score >= SCORE_THRESHOLDS.medium) {
    return { start: "#f59e0b", end: "#eab308" }
  }
  return { start: "#ef4444", end: "#f87171" }
}

// Issue-specific AI suggestion templates
const ISSUE_SUGGESTIONS: Record<string, string[]> = {
  "meta description": [
    "Discover the complete guide to SEO in 2024. Learn proven strategies for on-page optimization, technical SEO, and content marketing to boost your search rankings.",
    "Master search engine optimization with our comprehensive 2024 guide. Expert tips on keywords, meta tags, and content strategy for higher rankings.",
    "Your ultimate SEO resource for 2024. From keyword research to link building, learn actionable tactics to dominate search results.",
  ],
  "alt tag": [
    "Descriptive alt text for hero image showing SEO optimization concepts and strategies",
    "Infographic displaying key SEO elements: keywords, backlinks, and content optimization",
    "Visual guide to search engine optimization best practices and techniques",
  ],
  "h1": [
    "Complete SEO Guide 2024: Boost Rankings",
    "Master SEO in 2024: Expert Strategies",
    "SEO Guide 2024: Rank Higher Today",
  ],
  "keyword density": [
    "Consider naturally adding your target keyword in the introduction, H2 headings, and conclusion. Aim for 1-2% density.",
    "Review your content and add keyword variations in subheadings and image alt texts for better semantic relevance.",
    "Increase keyword usage by adding it to your meta description, first paragraph, and at least one H2 heading.",
  ],
  "external links": [
    "Add rel='noopener noreferrer' to all external links for security and SEO best practices.",
    "External links should include rel='noopener' to prevent potential security vulnerabilities.",
    "Update your external links with proper rel attributes for better SEO and security.",
  ],
  "heading": [
    "How to Optimize Title Tags for Maximum Click-Through Rate",
    "Essential Title Tag Strategies for Better SEO",
    "Title Tag Best Practices: A Complete Guide",
  ],
  "default": ALTERNATIVE_SUGGESTIONS,
}

/**
 * Get issue-specific alternative suggestion
 */
export function getRandomSuggestion(issueTitle: string): string {
  const lowerTitle = issueTitle.toLowerCase()
  
  // Find matching suggestion category
  let suggestions = ISSUE_SUGGESTIONS.default
  for (const [key, value] of Object.entries(ISSUE_SUGGESTIONS)) {
    if (key !== "default" && lowerTitle.includes(key)) {
      suggestions = value
      break
    }
  }
  
  const index = Math.floor(Math.random() * suggestions.length)
  return suggestions[index]
}

/**
 * Calculate remaining scan time
 */
export function calculateRemainingTime(progress: number, totalSeconds: number): number {
  return Math.round(totalSeconds - (progress / 100) * totalSeconds)
}

/**
 * Get tag CSS classes
 */
export function getTagClasses(tag: string): string {
  if (tag.startsWith("H")) return "bg-purple-500/20 text-purple-400"
  if (tag === "IMG") return "bg-blue-500/20 text-blue-400"
  if (tag === "A") return "bg-cyan-500/20 text-cyan-400"
  return "bg-muted text-muted-foreground"
}

/**
 * Validate URL format and accessibility
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  // Empty check
  if (!url.trim()) {
    return { valid: false, error: "URL is required" }
  }

  // Format check - must start with http:// or https://
  const urlRegex = /^https?:\/\/.+\..+/
  if (!urlRegex.test(url)) {
    return { valid: false, error: "Invalid URL format. Must start with http:// or https://" }
  }

  // Check for localhost/private IPs
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168.')) {
    return { valid: false, error: "Cannot scan localhost or private IP addresses" }
  }

  // Check max length
  if (url.length > 2048) {
    return { valid: false, error: "URL too long (maximum 2048 characters)" }
  }

  // Check for common invalid patterns
  if (url.includes(' ')) {
    return { valid: false, error: "URL cannot contain spaces" }
  }

  return { valid: true }
}
