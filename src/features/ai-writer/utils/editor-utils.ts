// ============================================
// AI WRITER - Utility Functions
// ============================================

import type { EditorStats, NLPKeyword, CriticalIssue } from "../types"

/**
 * Analyze editor content for SEO stats
 */
export function analyzeEditorContent(
  html: string,
  text: string,
  targetKeyword: string,
  featuredImageUrl: string | null
): EditorStats {
  // Word count
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // Character count
  const characterCount = text.length

  // Heading counts
  const h1Count = (html.match(/<h1/gi) || []).length
  const h2Count = (html.match(/<h2/gi) || []).length
  const h3Count = (html.match(/<h3/gi) || []).length

  // Paragraph count
  const paragraphCount = (html.match(/<p/gi) || []).length

  // Image count
  const imageCount = (html.match(/<img/gi) || []).length + (featuredImageUrl ? 1 : 0)

  // Link count
  const linkCount = (html.match(/<a /gi) || []).length

  // Keyword density
  const keywordLower = targetKeyword.toLowerCase()
  const textLower = text.toLowerCase()
  const keywordMatches = textLower.split(keywordLower).length - 1
  const keywordDensity = wordCount > 0 ? (keywordMatches / wordCount) * 100 : 0

  return {
    wordCount,
    characterCount,
    headingCount: { h1: h1Count, h2: h2Count, h3: h3Count },
    paragraphCount,
    imageCount,
    linkCount,
    keywordDensity: Math.round(keywordDensity * 100) / 100,
    keywordCount: keywordMatches,
    content: text,
  }
}

/**
 * Update NLP keywords usage based on content
 */
export function updateNLPKeywordsUsage(
  keywords: NLPKeyword[],
  text: string
): NLPKeyword[] {
  const textLower = text.toLowerCase()
  return keywords.map((keyword) => ({
    ...keyword,
    used: textLower.includes(keyword.text.toLowerCase()),
  }))
}

/**
 * Calculate SEO score based on stats and keywords
 */
export function calculateSEOScore(
  editorStats: EditorStats,
  nlpKeywords: NLPKeyword[],
  criticalIssues: CriticalIssue[]
): number {
  let score = 0
  const maxScore = criticalIssues.length * 15 + 10 // Max possible score

  // Score from critical issues
  criticalIssues.forEach((issue) => {
    if (issue.check(editorStats)) {
      score += 15
    }
  })

  // Bonus for NLP keywords usage
  const usedKeywords = nlpKeywords.filter((k) => k.used).length
  const keywordBonus = Math.min((usedKeywords / nlpKeywords.length) * 10, 10)
  score += keywordBonus

  return Math.min(Math.round((score / maxScore) * 100), 100)
}

/**
 * Get score color class based on score value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400"
  if (score >= 60) return "text-yellow-400"
  return "text-red-400"
}

/**
 * Get score glow class based on score value
 */
export function getScoreGlow(score: number): string {
  if (score >= 80) return "shadow-emerald-500/50"
  if (score >= 60) return "shadow-yellow-500/50"
  return "shadow-red-500/50"
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/**
 * Generate HTML export content
 */
export function generateExportHTML(
  title: string,
  html: string,
  featuredImageUrl: string | null
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta name="description" content="${title}">
</head>
<body>
  ${featuredImageUrl ? `<img src="${featuredImageUrl}" alt="${title}" />` : ""}
  ${html}
</body>
</html>
  `.trim()
}
