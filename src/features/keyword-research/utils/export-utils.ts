// ============================================
// KEYWORD MAGIC - Export Utilities
// ============================================

import type { Keyword } from "../types"

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

/**
 * Export keywords to CSV format
 */
export function exportToCSV(keywords: Keyword[], options?: ExportOptionsExtended): string {
  const columns = options?.columns || [
    "keyword",
    "volume",
    "kd",
    "cpc",
    "intent",
    "trend",
    "geoScore",
    "serpFeatures",
  ]

  const headers = columns.map((col) => {
    switch (col) {
      case "keyword": return "Keyword"
      case "volume": return "Volume"
      case "kd": return "KD %"
      case "cpc": return "CPC ($)"
      case "intent": return "Intent"
      case "trend": return "Trend %"
      case "geoScore": return "GEO Score"
      case "serpFeatures": return "SERP Features"
      default: return col
    }
  })

  const rows = keywords.map((kw) =>
    columns.map((col) => {
      switch (col) {
        case "keyword": return sanitizeCSVValue(kw.keyword)
        case "volume": return kw.volume
        case "kd": return kw.kd
        case "cpc": return kw.cpc.toFixed(2)
        case "intent": return kw.intent.join(", ")
        case "trend": return kw.trend?.length > 1 ? Math.round(((kw.trend[kw.trend.length - 1] - kw.trend[0]) / kw.trend[0]) * 100) : 0
        case "geoScore": return kw.geoScore || 0
        case "serpFeatures": return kw.serpFeatures?.join("; ") || ""
        default: return ""
      }
    }).join(",")
  )

  return [headers.join(","), ...rows].join("\n")
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
  const headers = ["Keyword", "Volume", "KD", "CPC", "Intent", "Trend", "GEO"]
  const rows = keywords.map((kw) =>
    [
      kw.keyword,
      kw.volume,
      kw.kd,
      kw.cpc.toFixed(2),
      kw.intent.join(", "),
      kw.trend?.length > 1 ? Math.round(((kw.trend[kw.trend.length - 1] - kw.trend[0]) / kw.trend[0]) * 100) : 0,
      kw.geoScore || 0,
    ].join("\t")
  )

  return [headers.join("\t"), ...rows].join("\n")
}

/**
 * Export keywords to Clipboard format
 */
export function exportToClipboard(keywords: Keyword[]): string {
  return keywords.map((kw) => kw.keyword).join("\n")
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
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea")
    textarea.value = text
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
