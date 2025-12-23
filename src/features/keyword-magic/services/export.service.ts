// ============================================
// KEYWORD MAGIC - Export Service
// ============================================
// Handles keyword export functionality
// ============================================

import type { Keyword } from "../types"
import type { ExportOptions } from "../types/api.types"

// ============================================
// EXPORT SERVICE
// ============================================

export const exportService = {
  /**
   * Export keywords to file
   */
  async exportKeywords(
    keywords: Keyword[],
    options: ExportOptions
  ): Promise<Blob> {
    // Generate export based on format
    switch (options.format) {
      case "csv":
        return generateCSV(keywords, options)
      case "xlsx":
        // TODO: Implement XLSX export with library
        return generateCSV(keywords, options)
      case "json":
        return new Blob(
          [JSON.stringify(keywords, null, 2)],
          { type: "application/json" }
        )
      default:
        return generateCSV(keywords, options)
    }
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateCSV(keywords: Keyword[], options: ExportOptions): Blob {
  const headers = [
    "Keyword",
    "Volume",
    "KD",
    "CPC",
    "Intent",
    "GEO Score",
    "Weak Spot",
    "SERP Features",
  ]
  
  const rows = keywords.map((k) => [
    `"${k.keyword}"`,
    k.volume,
    k.kd,
    k.cpc.toFixed(2),
    `"${k.intent.join(", ")}"`,
    k.geoScore ?? "N/A",
    k.weakSpot.type ? `${k.weakSpot.type} #${k.weakSpot.rank}` : "None",
    `"${k.serpFeatures.join(", ")}"`,
  ])
  
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")
  
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
}
