// ============================================
// KEYWORD MAGIC - Export Utilities
// ============================================

import type { Keyword } from "../types"
import { calculateMomentum } from "./trend-utils"

// Local export format type (extended)
type ExportFormatExtended = "csv" | "json" | "tsv" | "clipboard"

interface ExportOptionsExtended {
  columns?: string[]
  filename?: string
  includeMetadata?: boolean
}

/**
 * Sanitize string for CSV (prevent injection)
 */
function sanitizeCSVValue(value: string): string {
  if (typeof value !== "string") return String(value)
  if (value === "-") return value
  // Prevent CSV injection
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`
  }
  // Escape quotes and wrap if contains comma or quote
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

const INTENT_LABELS: Record<string, string> = {
  I: "Informational",
  C: "Commercial",
  T: "Transactional",
  N: "Navigational",
}

const SERP_LABELS: Record<string, string> = {
  ai_overview: "AI Overview",
  featured_snippet: "Featured Snippet",
  people_also_ask: "FAQ / PAA",
  video_pack: "Video",
  image_pack: "Image Pack",
  local_pack: "Local Pack",
  shopping_ads: "Shopping",
  ads_top: "Ads",
  knowledge_panel: "Knowledge Panel",
  top_stories: "Top Stories",
  direct_answer: "Direct Answer",
  reviews: "Reviews",
}

const EXPORT_HEADERS = [
  "Keyword",
  "Intent",
  "Volume",
  "RTV",
  "Trend",
  "KD %",
  "CPC",
  "Weak Spot",
  "GEO",
  "SERP",
]

function formatIntent(intent: Keyword["intent"]): string {
  if (!Array.isArray(intent) || intent.length === 0) return "-"
  return intent
    .map((code) => INTENT_LABELS[code] ?? code)
    .join(", ")
}

function formatWeakSpots(weakSpots: Keyword["weakSpots"]): string {
  if (!weakSpots) return "-"

  const ranked = weakSpots.ranked ?? []
  if (ranked.length > 0) {
    const sorted = [...ranked].sort((a, b) => a.rank - b.rank)
    return sorted
      .map((spot) => `${spot.platform.charAt(0).toUpperCase()}${spot.platform.slice(1)}(#${spot.rank})`)
      .join(", ")
  }

  const legacy: string[] = []
  if (typeof weakSpots.reddit === "number") legacy.push(`Reddit(#${weakSpots.reddit})`)
  if (typeof weakSpots.quora === "number") legacy.push(`Quora(#${weakSpots.quora})`)
  if (typeof weakSpots.pinterest === "number") legacy.push(`Pinterest(#${weakSpots.pinterest})`)

  return legacy.length > 0 ? legacy.join(", ") : "-"
}

function formatSerpFeatures(features: Keyword["serpFeatures"]): string {
  if (!Array.isArray(features) || features.length === 0) return "-"
  return features.map((feature) => SERP_LABELS[feature] ?? feature).join(", ")
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return String(value)
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return value.toFixed(2)
}

function formatTrendLabel(trend: number[] | null | undefined): string {
  if (!trend || trend.length < 2) {
    return "Stable"
  }

  const momentum = calculateMomentum(trend)
  const rounded = Math.round(momentum.percent)

  if (momentum.status === "rising") return `Rising (+${rounded}%)`
  if (momentum.status === "falling") return `Falling (${rounded}%)`
  return "Stable"
}

function flattenKeywordData(keyword: Keyword): string[] {
  const trendSeries = keyword.trendRaw ?? keyword.trend
  return [
    keyword.keyword,
    formatIntent(keyword.intent),
    formatNumber(keyword.volume),
    formatNumber(keyword.rtv),
    formatTrendLabel(trendSeries),
    formatNumber(keyword.kd),
    formatCurrency(keyword.cpc),
    formatWeakSpots(keyword.weakSpots),
    formatNumber(keyword.geoScore),
    formatSerpFeatures(keyword.serpFeatures),
  ]
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportKeywordsToCSV(keywords: Keyword[]): void {
  const rows = keywords.map((kw) =>
    flattenKeywordData(kw).map((value) => sanitizeCSVValue(value)).join(",")
  )
  const csvContent = [EXPORT_HEADERS.join(","), ...rows].join("\n")
  const dateStamp = new Date().toISOString().split("T")[0]
  downloadCSV(csvContent, `BlogSpy_Keywords_${dateStamp}.csv`)
}

export function downloadAsCSV(keywords: Keyword[]): void {
  const rows = keywords.map((kw) =>
    flattenKeywordData(kw).map((value) => sanitizeCSVValue(value)).join(",")
  )
  const csvContent = [EXPORT_HEADERS.join(","), ...rows].join("\n")
  downloadCSV(csvContent, "BlogSpy_Research.csv")
}

/**
 * Export keywords to CSV format
 */
export function exportToCSV(keywords: Keyword[], options?: ExportOptionsExtended): string {
  void options
  const rows = keywords.map((kw) =>
    flattenKeywordData(kw).map((value) => sanitizeCSVValue(value)).join(",")
  )

  return [EXPORT_HEADERS.join(","), ...rows].join("\n")
}

/**
 * Export keywords to JSON format
 */
export function exportToJSON(keywords: Keyword[], options?: ExportOptionsExtended): string {
  const exportData = keywords.map((kw) => ({
    keyword: kw.keyword,
    volume: kw.volume,
    kd: kw.kd,
    cpc: kw.cpc,
    intent: kw.intent,
    trend: kw.trend,
    geoScore: kw.geoScore,
    rtv: kw.rtv,
    serpFeatures: kw.serpFeatures,
    weakSpot: kw.weakSpot,
    ...(options?.includeMetadata && {
      id: kw.id,
      lastUpdated: kw.lastUpdated,
    }),
  }))

  return JSON.stringify(exportData, null, 2)
}

/**
 * Export keywords to TSV format
 */
export function exportToTSV(keywords: Keyword[]): string {
  const rows = keywords.map((kw) => flattenKeywordData(kw).join("\t"))
  return [EXPORT_HEADERS.join("\t"), ...rows].join("\n")
}

/**
 * Export keywords to Clipboard format
 */
export function exportToClipboard(keywords: Keyword[]): string {
  const rows = keywords.map((kw) => flattenKeywordData(kw).join("\t"))
  return [EXPORT_HEADERS.join("\t"), ...rows].join("\n")
}

/**
 * Download export file
 */
export function downloadExport(
  content: string,
  filename: string,
  format: ExportFormatExtended
): void {
  const mimeTypes: Record<ExportFormatExtended, string> = {
    csv: "text/csv",
    json: "application/json",
    tsv: "text/tab-separated-values",
    clipboard: "text/plain",
  }

  const blob = new Blob([content], { type: mimeTypes[format] })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.${format === "clipboard" ? "txt" : format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean>
export async function copyToClipboard(keywords: Keyword[]): Promise<boolean>
export async function copyToClipboard(input: string | Keyword[]): Promise<boolean> {
  try {
    const content = Array.isArray(input)
      ? [
          EXPORT_HEADERS.join("\t"),
          ...input.map((kw) => flattenKeywordData(kw).join("\t")),
        ].join("\n")
      : input

    await navigator.clipboard.writeText(content)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea")
    textarea.value = Array.isArray(input)
      ? [EXPORT_HEADERS.join("\t"), ...input.map((kw) => flattenKeywordData(kw).join("\t"))].join("\n")
      : input
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand("copy")
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

/**
 * Download keywords as CSV file (convenience wrapper)
 * Compatible with the old export-utils API from table folder
 */
export function downloadKeywordsCSV(keywords: Keyword[], selectedIds?: Set<number>): void {
  // Get data to export (selected rows or all)
  const exportData = selectedIds && selectedIds.size > 0 
    ? keywords.filter(k => selectedIds.has(k.id))
    : keywords
  
  const csvContent = exportToCSV(exportData)
  const filename = `blogspy-keywords-${new Date().toISOString().split('T')[0]}`
  downloadExport(csvContent, filename, "csv")
}
