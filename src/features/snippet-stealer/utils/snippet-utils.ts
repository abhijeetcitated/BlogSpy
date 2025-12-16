// Snippet Stealer Utility Functions
import { WORD_COUNT_THRESHOLDS, KEYWORD_THRESHOLDS } from "../constants"
import type { WordCountStatus } from "../types"

/**
 * Format volume for display
 */
export function formatVolume(vol: number): string {
  if (vol >= 1000) return `${(vol / 1000).toFixed(vol >= 10000 ? 0 : 1)}k`
  return vol.toString()
}

/**
 * Get word count status for snippet length
 */
export function getWordCountStatus(count: number): WordCountStatus {
  if (count < WORD_COUNT_THRESHOLDS.min) {
    return { color: "text-red-400", bg: "bg-red-500", label: "Too Short", ideal: false }
  }
  if (count <= WORD_COUNT_THRESHOLDS.idealMax) {
    return { color: "text-emerald-400", bg: "bg-emerald-500", label: "Ideal", ideal: true }
  }
  return { color: "text-amber-400", bg: "bg-amber-500", label: "Too Long", ideal: false }
}

/**
 * Calculate word count from text
 */
export function calculateWordCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.length
}

/**
 * Calculate keywords used in text
 */
export function calculateKeywordsUsed(text: string, targetKeywords: string[]): number {
  if (!text.trim()) return 0
  const lowerText = text.toLowerCase()
  return targetKeywords.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  ).length
}

/**
 * Get keyword count color class
 */
export function getKeywordCountColor(used: number): string {
  if (used >= KEYWORD_THRESHOLDS.good) return "text-emerald-400"
  if (used >= KEYWORD_THRESHOLDS.medium) return "text-amber-400"
  return "text-red-400"
}

/**
 * Calculate progress percentage for word count
 */
export function calculateProgressPercent(wordCount: number): number {
  return Math.min((wordCount / WORD_COUNT_THRESHOLDS.displayMax) * 100, 100)
}

/**
 * Check if competitor word count is in ideal range
 */
export function isCompetitorWordCountIdeal(count: number): boolean {
  return count >= 40 && count <= 50
}

/**
 * Generate URL slug from keyword
 */
export function generateSlug(keyword: string): string {
  return keyword.replace(/\s+/g, "-")
}

/**
 * Capitalize first letter
 */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
