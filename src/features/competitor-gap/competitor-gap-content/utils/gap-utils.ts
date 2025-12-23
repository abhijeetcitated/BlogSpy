import type { GapKeyword, ForumIntelPost, GapType, SortField, SortDirection } from "../../types"

export type GapFilter = GapType | "all"

export function calculateGapStats(keywords: GapKeyword[]) {
  return {
    all: keywords.length,
    missing: keywords.filter(k => k.gapType === "missing").length,
    weak: keywords.filter(k => k.gapType === "weak").length,
    strong: keywords.filter(k => k.gapType === "strong").length,
    shared: keywords.filter(k => k.gapType === "shared").length,
    totalVolume: keywords.reduce((sum, k) => sum + k.volume, 0),
    avgKD: Math.round(keywords.reduce((sum, k) => sum + k.kd, 0) / keywords.length) || 0,
  }
}

export function filterGapKeywords(
  keywords: GapKeyword[],
  gapType: GapFilter,
  searchQuery: string
): GapKeyword[] {
  return keywords.filter(kw => {
    if (gapType !== "all" && kw.gapType !== gapType) return false
    if (searchQuery && !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })
}

export function filterForumPosts(
  posts: ForumIntelPost[],
  searchQuery: string
): ForumIntelPost[] {
  if (!searchQuery) return posts
  return posts.filter(post => 
    post.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.subSource.toLowerCase().includes(searchQuery.toLowerCase())
  )
}

export function sortGapKeywords(
  keywords: GapKeyword[],
  field: SortField,
  direction: SortDirection
): GapKeyword[] {
  if (!field) return keywords
  
  return [...keywords].sort((a, b) => {
    let comparison = 0
    switch (field) {
      case "keyword":
        comparison = a.keyword.localeCompare(b.keyword)
        break
      case "volume":
        comparison = a.volume - b.volume
        break
      case "kd":
        comparison = a.kd - b.kd
        break
      case "yourRank":
        comparison = (a.yourRank ?? 999) - (b.yourRank ?? 999)
        break
      case "trend":
        const trendOrder = { rising: 5, growing: 4, stable: 3, declining: 2, falling: 1 }
        comparison = trendOrder[a.trend] - trendOrder[b.trend]
        break
    }
    return direction === "asc" ? comparison : -comparison
  })
}

export function sortForumPosts(
  posts: ForumIntelPost[],
  field: SortField,
  direction: SortDirection
): ForumIntelPost[] {
  if (!field) return posts
  
  return [...posts].sort((a, b) => {
    let comparison = 0
    switch (field) {
      case "engagement":
        comparison = (a.upvotes + a.comments) - (b.upvotes + b.comments)
        break
      case "opportunity":
        comparison = a.opportunityScore - b.opportunityScore
        break
    }
    return direction === "asc" ? comparison : -comparison
  })
}

export const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
