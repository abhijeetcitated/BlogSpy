// ============================================
// COMPETITOR GAP - DataForSEO Domain Intersection
// ============================================

import "server-only"

import { dataForSEOClient } from "@/services/dataforseo/client"
import { DATAFORSEO } from "@/constants/api-endpoints"
import { createAdminClient, createServerClient } from "@/src/lib/supabase/server"
import { getDataForSEOLocationCode } from "@/src/lib/dataforseo/locations"
import type { ForumIntelPost, GapKeyword } from "../types"
import {
  calculateEstTraffic,
  calculateOpportunity,
  parseDate,
  parseEngagement,
} from "../utils/forum-logic"
import { MOCK_GAP_DATA, MOCK_FORUM_INTEL_DATA } from "../__mocks__/gap-data"

const DOMAIN_INTERSECTION_ENDPOINT = "/v3/dataforseo_labs/google/domain_intersection/live"
const FORUM_INTEL_ENDPOINT = DATAFORSEO.SERP.GOOGLE_ORGANIC
const FORUM_LOCATION_CODE = 2840

export interface DomainIntersectionResult {
  keyword: string
  volume: number
  cpc: number
  kd: number
  myRank: number | null
  compRanks: Array<number | null>
}

type RawIntersectionItem = {
  keyword?: string
  keyword_info?: {
    search_volume?: number
    cpc?: number
    competition?: number
  }
  keyword_data?: {
    search_volume?: number
    cpc?: number
    competition?: number
  }
  keyword_properties?: {
    keyword_difficulty?: number
  }
  intersections?: Record<string, { rank?: number } | number>
  rankings?: Array<{ domain?: string; target?: string; rank?: number; position?: number }>
  domain_intersections?: Array<{ domain?: string; target?: string; rank?: number; position?: number }>
}

type RawIntersectionResult = {
  items?: RawIntersectionItem[]
}

type RawSerpItem = {
  type?: string
  rank_group?: number
  rank_absolute?: number
  title?: string
  url?: string
  domain?: string
  description?: string
  snippet?: string
  date?: string
  date_time?: string
}

type RawSerpResult = {
  items?: RawSerpItem[]
}

type ForumIntelCacheRow = {
  data: ForumIntelPost[]
}

type IntersectionRow = {
  keyword: string
  volume: number
  cpc: number
  kd: number
  myRank: number | null
  compRank: number | null
}

function getRankForTarget(item: RawIntersectionItem, target: string): number | null {
  const normalizedTarget = target.replace(/^www\./, "")

  if (item.intersections) {
    const direct = item.intersections[target] ?? item.intersections[normalizedTarget]
    if (typeof direct === "number") return direct
    if (typeof direct === "object" && direct && typeof direct.rank === "number") return direct.rank
  }

  const arrays = [item.rankings, item.domain_intersections]
  for (const collection of arrays) {
    if (!collection) continue
    const hit = collection.find((entry) =>
      entry.domain === target ||
      entry.domain === normalizedTarget ||
      entry.target === target ||
      entry.target === normalizedTarget
    )
    if (hit && typeof hit.rank === "number") return hit.rank
    if (hit && typeof hit.position === "number") return hit.position
  }

  return null
}

function extractVolume(item: RawIntersectionItem): number {
  return (
    item.keyword_info?.search_volume ??
    item.keyword_data?.search_volume ??
    0
  )
}

function extractCpc(item: RawIntersectionItem): number {
  return (
    item.keyword_info?.cpc ??
    item.keyword_data?.cpc ??
    0
  )
}

function extractKD(item: RawIntersectionItem): number {
  if (typeof item.keyword_properties?.keyword_difficulty === "number") {
    return Math.round(item.keyword_properties.keyword_difficulty)
  }

  const competition =
    item.keyword_info?.competition ??
    item.keyword_data?.competition

  if (typeof competition === "number") {
    return Math.round(competition * 100)
  }

  return 0
}

async function fetchIntersectionForCompetitor(
  userDomain: string,
  competitor: string,
  countryCode: string
): Promise<IntersectionRow[]> {
  const locationCode = getDataForSEOLocationCode(countryCode)
  const payload = {
    target1: userDomain,
    target2: competitor,
    location_code: locationCode,
    intersection_mode: "all",
    include_serp_info: true,
  }

  const response = await dataForSEOClient.request<RawIntersectionResult[]>(
    DOMAIN_INTERSECTION_ENDPOINT,
    [payload]
  )

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch DataForSEO domain intersection")
  }

  const rawResults = Array.isArray(response.data) ? response.data : [response.data]
  const items = rawResults.flatMap((result) => result.items ?? [])

  return items
    .map((item) => {
      const keyword = item.keyword?.trim()
      if (!keyword) return null

      return {
        keyword,
        volume: extractVolume(item),
        cpc: extractCpc(item),
        kd: extractKD(item),
        myRank: getRankForTarget(item, userDomain),
        compRank: getRankForTarget(item, competitor),
      }
    })
    .filter((row): row is IntersectionRow => row !== null)
}

export async function fetchDomainIntersection(
  targets: { userDomain: string; comp1: string; comp2?: string | null },
  countryCode: string | number
): Promise<DomainIntersectionResult[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("[MOCK MODE] Returning fake data for Competitor Gap")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return MOCK_GAP_DATA.map((item: GapKeyword) => ({
      keyword: item.keyword,
      volume: item.volume ?? 0,
      cpc: item.cpc ?? 0,
      kd: item.kd ?? 0,
      myRank: item.yourRank ?? null,
      compRanks: [item.comp1Rank ?? null, item.comp2Rank ?? null],
    }))
  }

  const locationCode = typeof countryCode === "number"
    ? countryCode
    : getDataForSEOLocationCode(countryCode)
  const payload = {
    target1: targets.userDomain,
    target2: targets.comp1,
    target3: targets.comp2 || undefined,
    location_code: locationCode,
    language_code: "en",
    intersection_mode: "all",
    include_serp_info: true,
    limit: 500,
  }

  const response = await dataForSEOClient.request<RawIntersectionResult[]>(
    DOMAIN_INTERSECTION_ENDPOINT,
    [payload]
  )

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch DataForSEO domain intersection")
  }

  const rawResults = Array.isArray(response.data) ? response.data : [response.data]
  const items = rawResults.flatMap((result) => result.items ?? [])
  const compTargets = [targets.comp1, targets.comp2].filter(Boolean) as string[]

  return items
    .map((item) => {
      const keyword = item.keyword?.trim()
      if (!keyword) return null

      return {
        keyword,
        volume: extractVolume(item),
        cpc: extractCpc(item),
        kd: extractKD(item),
        myRank: getRankForTarget(item, targets.userDomain),
        compRanks: compTargets.map((target) => getRankForTarget(item, target)),
      }
    })
    .filter((row): row is DomainIntersectionResult => row !== null)
}

export async function fetchGapData(
  userDomain: string,
  competitors: string[],
  countryCode: string
): Promise<DomainIntersectionResult[]> {
  return analyzeGap(userDomain, competitors, countryCode)
}

export async function analyzeGap(
  userDomain: string,
  competitors: string[],
  countryCode: string
): Promise<DomainIntersectionResult[]> {
  const normalizedCompetitors = competitors.filter((value) => value.trim().length > 0)
  if (normalizedCompetitors.length === 0) {
    throw new Error("At least one competitor is required")
  }

  const [comp1, comp2] = normalizedCompetitors
  const results = await fetchDomainIntersection(
    { userDomain, comp1, comp2 },
    countryCode
  )

  return results.filter((entry) => {
    const compRanks = entry.compRanks.filter((rank): rank is number => Number.isFinite(rank))
    const bestCompRank = compRanks.length > 0 ? Math.min(...compRanks) : null

    if (entry.myRank === null && bestCompRank !== null) {
      return true
    }

    if (entry.myRank !== null && bestCompRank !== null && entry.myRank > bestCompRank) {
      return true
    }

    return false
  })
}

function detectForumSource(domain?: string): "reddit" | "quora" | null {
  const normalized = (domain ?? "").toLowerCase()
  if (normalized.includes("reddit.com")) return "reddit"
  if (normalized.includes("quora.com")) return "quora"
  return null
}

function extractSubSource(source: "reddit" | "quora", url?: string): string {
  if (!url) return source === "reddit" ? "reddit" : "quora"
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split("/").filter(Boolean)
    if (source === "reddit") {
      const subredditIndex = parts.findIndex((part) => part.toLowerCase() === "r")
      if (subredditIndex >= 0 && parts[subredditIndex + 1]) {
        return `r/${parts[subredditIndex + 1]}`
      }
    }
    if (source === "quora" && parts[0]) {
      return parts[0]
    }
  } catch {
    return source === "reddit" ? "reddit" : "quora"
  }
  return source === "reddit" ? "reddit" : "quora"
}

function normalizeDate(value: string | null | undefined): string {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString()
  }
  return new Date().toISOString()
}

function getDaysOld(dateStr: string): number {
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) return 0
  const diffMs = Date.now() - parsed.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export async function fetchForumIntel(
  keyword: string,
  volume: number,
  countryCode: number = FORUM_LOCATION_CODE
): Promise<ForumIntelPost[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("[MOCK MODE] Returning fake data for Competitor Gap")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return MOCK_FORUM_INTEL_DATA
  }

  const normalizedKeyword = keyword.trim().toLowerCase()
  const supabase = await createServerClient()

  const cacheTable = (supabase as unknown as { from: (table: string) => any }).from("forum_intel_cache")
  const { data: cached } = await cacheTable
    .select("data")
    .eq("keyword", normalizedKeyword)
    .eq("country_code", countryCode)
    .maybeSingle()

  if (cached?.data && Array.isArray(cached.data)) {
    return cached.data
  }

  const response = await dataForSEOClient.request<RawSerpResult[]>(
    FORUM_INTEL_ENDPOINT,
    [
      {
        keyword: `${normalizedKeyword} site:reddit.com OR site:quora.com`,
        location_code: countryCode,
        language_code: "en",
        depth: 20,
        se_domain: "google.com",
      },
    ]
  )

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch forum intel")
  }

  const rawResults = Array.isArray(response.data) ? response.data : [response.data]
  const items = rawResults.flatMap((result) => result.items ?? [])

  const posts: ForumIntelPost[] = items
    .filter((item) => item.type === "organic")
    .filter((item) => typeof item.rank_group === "number")
    .flatMap((item) => {
      const source = detectForumSource(item.domain)
      if (!source) return []
      const rank = item.rank_group ?? item.rank_absolute ?? 0
      const snippet = item.snippet ?? item.description ?? ""
      const rawDate = parseDate(snippet, item.date ?? item.date_time)
      const dateText = normalizeDate(rawDate)
      const engagement = parseEngagement(snippet)
      const engagementScore = engagement.upvotes + engagement.comments
      const daysOld = getDaysOld(dateText)
      const trafficEstimate = calculateEstTraffic(rank, volume)
      const opportunity = calculateOpportunity(rank, daysOld, engagementScore)
      const post: ForumIntelPost = {
        id: `${normalizedKeyword}-${rank}-${item.url ?? item.title ?? Math.random().toString(36).slice(2)}`,
        topic: item.title ?? normalizedKeyword,
        source,
        subSource: extractSubSource(source, item.url),
        serpRank: rank,
        monthlyVolume: volume,
        trafficEstimate,
        upvotes: 0,
        comments: 0,
        opportunityScore: opportunity.score,
        opportunityLevel: opportunity.label.toLowerCase() as ForumIntelPost["opportunityLevel"],
        relatedKeywords: [],
        lastActive: dateText,
        url: item.url ?? "",
      }
      if (!post.url) return []
      return [post]
    })

  const admin = createAdminClient()
  const adminCacheTable = (admin as unknown as { from: (table: string) => any }).from("forum_intel_cache")
  await adminCacheTable.upsert(
    {
      keyword: normalizedKeyword,
      country_code: countryCode,
      data: posts,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "keyword,country_code" }
  )

  return posts
}

export async function fetchForumData(
  keyword: string,
  volume: number,
  countryCode: number = FORUM_LOCATION_CODE
): Promise<ForumIntelPost[]> {
  return fetchForumIntel(keyword, volume, countryCode)
}
