// ============================================
// RANK TRACKER - Utility Functions
// ============================================

import type { RankData, RankStats, RankChangeItem, FilterTab, SortField, SortDirection } from "../types"

/**
 * Calculates statistics from ranking data
 */
export function calculateStats(data: RankData[]): RankStats {
  const totalKeywords = data.length

  const top3Count = data.filter((k) => k.rank <= 3).length
  const top10Count = data.filter((k) => k.rank <= 10).length
  const improvedCount = data.filter((k) => k.change > 0).length
  const declinedCount = data.filter((k) => k.change < 0).length

  // Visibility score (weighted by rank position)
  const visibilityScore = Math.round(
    (data.reduce((acc, k) => {
      if (k.rank <= 3) return acc + 10
      if (k.rank <= 10) return acc + 5
      if (k.rank <= 20) return acc + 2
      return acc + 1
    }, 0) /
      (totalKeywords * 10)) *
      100
  )

  // Average position
  const avgPosition = (
    data.reduce((acc, k) => acc + k.rank, 0) / totalKeywords
  ).toFixed(1)

  // Traffic forecast (based on volume and rank)
  const trafficForecast = data.reduce((acc, k) => {
    const ctr =
      k.rank === 1 ? 0.3 : k.rank <= 3 ? 0.15 : k.rank <= 10 ? 0.05 : 0.01
    return acc + Math.round(k.volume * ctr)
  }, 0)

  // Alerts count (keywords that entered top 3 today)
  const alertsCount = data.filter((k) => k.rank <= 3 && k.change > 0).length

  return {
    visibilityScore,
    avgPosition,
    trafficForecast,
    alertsCount,
    top3Count,
    top10Count,
    improvedCount,
    declinedCount,
  }
}

/**
 * Gets top winners (most improved rankings)
 */
export function getTopWinners(data: RankData[], limit: number = 3): RankChangeItem[] {
  return data
    .filter((d) => d.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, limit)
    .map((d) => ({
      keyword: d.keyword,
      from: d.previousRank,
      to: d.rank,
    }))
}

/**
 * Gets top losers (most declined rankings)
 */
export function getTopLosers(data: RankData[], limit: number = 3): RankChangeItem[] {
  return data
    .filter((d) => d.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, limit)
    .map((d) => ({
      keyword: d.keyword,
      from: d.previousRank,
      to: d.rank,
    }))
}

/**
 * Formats traffic number for display
 */
export function formatTraffic(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

/**
 * Filters ranking data based on active filter tab
 */
export function filterByTab(data: RankData[], activeTab: FilterTab): RankData[] {
  switch (activeTab) {
    case "Improved":
      return data.filter((d) => d.change > 0)
    case "Declined":
      return data.filter((d) => d.change < 0)
    case "Top 3":
      return data.filter((d) => d.rank <= 3)
    case "Top 10":
      return data.filter((d) => d.rank <= 10)
    case "Top 100":
      return data.filter((d) => d.rank <= 100)
    case "All":
    default:
      return data
  }
}

/**
 * Filters ranking data by search query
 */
export function filterBySearch(data: RankData[], query: string): RankData[] {
  if (!query.trim()) return data

  const lowerQuery = query.toLowerCase()
  return data.filter(
    (d) =>
      d.keyword.toLowerCase().includes(lowerQuery) ||
      d.url.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Sorts ranking data by field and direction
 */
export function sortData(
  data: RankData[],
  sortField: SortField,
  sortDirection: SortDirection
): RankData[] {
  if (!sortField) return data

  const sorted = [...data].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "keyword":
        comparison = a.keyword.localeCompare(b.keyword)
        break
      case "rank":
        comparison = a.rank - b.rank
        break
      case "change":
        comparison = a.change - b.change
        break
      case "volume":
        comparison = a.volume - b.volume
        break
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

  return sorted
}

/**
 * Applies all filters and sorting to ranking data
 */
export function processRankData(
  data: RankData[],
  activeTab: FilterTab,
  searchQuery: string,
  sortField: SortField,
  sortDirection: SortDirection
): RankData[] {
  let result = filterByTab(data, activeTab)
  result = filterBySearch(result, searchQuery)
  result = sortData(result, sortField, sortDirection)
  return result
}

/**
 * Gets rank change color class
 */
export function getRankChangeColor(change: number): string {
  if (change > 0) return "text-emerald-500"
  if (change < 0) return "text-red-500"
  return "text-muted-foreground"
}

/**
 * Gets rank change icon symbol
 */
export function getRankChangeIcon(change: number): string {
  if (change > 0) return "↑"
  if (change < 0) return "↓"
  return "−"
}

/**
 * Converts MultiPlatformKeyword data to RankData for a specific platform and country
 * @param multiPlatformData - The full multi-platform keyword data
 * @param platform - The search platform to filter by (google, bing, etc.)
 * @param countryFilter - The country code to filter by (default: "worldwide" shows all)
 */
export function convertToRankData(
  multiPlatformData: import("../types/platforms").MultiPlatformKeyword[],
  platform: import("../types/platforms").SearchPlatform,
  countryFilter: string = "worldwide"
): RankData[] {
  return multiPlatformData
    .filter((item) => {
      const platformData = item.platforms[platform]
      // Check if has rank data
      if (!platformData || platformData.rank === null) return false
      // Filter by country (worldwide shows all, otherwise match country or worldwide keywords)
      if (countryFilter !== "worldwide") {
        return item.country === countryFilter || item.country === "worldwide"
      }
      return true
    })
    .map((item) => {
      const platformData = item.platforms[platform]
      // Generate random AI Overview status
      const aiPositions = ["cited", "mentioned", "not_included"] as const
      const position = aiPositions[Math.floor(Math.random() * 3)]
      
      return {
        id: `${item.id}-${platform}`,
        keyword: item.keyword,
        rank: platformData.rank!,
        previousRank: platformData.previousRank ?? platformData.rank!,
        change: platformData.change,
        serpFeatures: platformData.serpFeatures as import("../types").SerpFeature[],
        volume: item.volume,
        url: platformData.url ?? "",
        trendHistory: item.trendHistory[platform],
        lastUpdated: platformData.lastUpdated,
        country: item.country,
        aiOverview: {
          inOverview: position !== "not_included",
          position,
          citationUrl: position === "cited" ? platformData.url : null,
          competitors: position !== "cited" ? ["competitor.com", "example.com"] : [],
          recommendation: position === "not_included" 
            ? "Consider adding structured data and improving content quality" 
            : null,
        },
      }
    })
}

/**
 * Export data as CSV string
 */
export function exportToCSV(data: RankData[], platform: string): string {
  const headers = ["Keyword", "Rank", "Previous Rank", "Change", "Volume", "URL", "SERP Features", "AI Overview", "Last Updated"]
  const rows = data.map((item) => [
    `"${item.keyword}"`,
    item.rank,
    item.previousRank,
    item.change > 0 ? `+${item.change}` : item.change,
    item.volume,
    `"${item.url}"`,
    `"${item.serpFeatures.join(", ")}"`,
    `"${item.aiOverview}"`,
    `"${item.lastUpdated}"`,
  ])

  return [
    `# Rank Tracker Export - ${platform} - ${new Date().toLocaleDateString()}`,
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
