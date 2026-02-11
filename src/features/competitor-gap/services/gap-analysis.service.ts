import "server-only"

import {
  fetchDomainIntersection,
  fetchOrganicVerify,
  fetchRankedKeywordsOptional,
  type GapKeywordIntent,
  type NormalizedDomainIntersectionKeyword,
} from "@/lib/seo/dataforseo-gap"
import type { GapKeyword, GapType, CompetitorSource } from "../types"

const GAP_CLASSIFICATION_DELTA = 5
const PROVIDER_MAX_CONCURRENCY = 12

class Semaphore {
  private readonly capacity: number
  private active = 0
  private readonly waiting: Array<() => void> = []

  constructor(capacity: number) {
    this.capacity = capacity
  }

  async acquire(): Promise<() => void> {
    if (this.active < this.capacity) {
      this.active += 1
      return () => this.release()
    }

    await new Promise<void>((resolve) => {
      this.waiting.push(resolve)
    })

    this.active += 1
    return () => this.release()
  }

  private release() {
    this.active = Math.max(this.active - 1, 0)
    const next = this.waiting.shift()
    if (next) {
      next()
    }
  }
}

const providerSemaphore = new Semaphore(PROVIDER_MAX_CONCURRENCY)

type AggregatedKeyword = {
  keyword: string
  intent: GapKeywordIntent
  volume: number
  kd: number
  cpc: number
  yourRank: number | null
  comp1Rank: number | null
  comp2Rank: number | null
  yourUrl: string | null
  comp1Url: string | null
  comp2Url: string | null
  hasZeroClickRisk: boolean
}

export type GapAnalysisMode = "missing-only" | "full-gap"

export type GapAnalysisInput = {
  yourDomain: string
  competitor1Domain: string
  competitor2Domain?: string | null
  locationCode: number
  languageCode: string
  mode: GapAnalysisMode
  includeSerpInfo?: boolean
  includeClickstreamData?: boolean
  includeRankedKeywordsFallback?: boolean
  limitPerCall?: number
}

export type GapAnalysisOutput = {
  keywords: GapKeyword[]
  upstreamCallsUsed: number
  providerCostEstimate: number
  retriesUsed: number
}

export type VerifyKeywordInput = {
  yourDomain: string
  competitor1Domain: string
  competitor2Domain?: string | null
  locationCode: number
  languageCode: string
  keywords: string[]
}

export type VerifyKeywordOutput = {
  updated: Array<{
    keyword: string
    yourRank: number | null
    comp1Rank: number | null
    comp2Rank: number | null
    yourUrl: string | null
    comp1Url: string | null
    comp2Url: string | null
    hasZeroClickRisk: boolean
  }>
  upstreamCallsUsed: number
  providerCostEstimate: number
  retriesUsed: number
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] ?? ""
}

function classifyGapType(yourRank: number | null, comp1Rank: number | null, comp2Rank: number | null): GapType {
  const validCompetitorRanks = [comp1Rank, comp2Rank].filter((rank): rank is number => typeof rank === "number")
  const bestCompetitorRank = validCompetitorRanks.length > 0 ? Math.min(...validCompetitorRanks) : null

  if (yourRank === null && bestCompetitorRank !== null) {
    return "missing"
  }

  if (yourRank !== null && bestCompetitorRank !== null) {
    if (yourRank > bestCompetitorRank + GAP_CLASSIFICATION_DELTA) {
      return "weak"
    }

    if (yourRank < bestCompetitorRank - GAP_CLASSIFICATION_DELTA) {
      return "strong"
    }
  }

  return "shared"
}

function mergeKeyword(
  map: Map<string, AggregatedKeyword>,
  keywordRecord: NormalizedDomainIntersectionKeyword,
  competitorIndex: 0 | 1
) {
  const existing = map.get(keywordRecord.keyword)

  const patch: Partial<AggregatedKeyword> = {
    intent: keywordRecord.intent,
    volume: keywordRecord.volume,
    kd: keywordRecord.kd,
    cpc: keywordRecord.cpc,
    yourRank: keywordRecord.yourRank,
    yourUrl: keywordRecord.yourUrl,
    hasZeroClickRisk: keywordRecord.hasZeroClickRisk,
  }

  if (competitorIndex === 0) {
    patch.comp1Rank = keywordRecord.competitorRank
    patch.comp1Url = keywordRecord.competitorUrl
  } else {
    patch.comp2Rank = keywordRecord.competitorRank
    patch.comp2Url = keywordRecord.competitorUrl
  }

  if (!existing) {
    map.set(keywordRecord.keyword, {
      keyword: keywordRecord.keyword,
      intent: patch.intent ?? "informational",
      volume: patch.volume ?? 0,
      kd: patch.kd ?? 0,
      cpc: patch.cpc ?? 0,
      yourRank: patch.yourRank ?? null,
      comp1Rank: patch.comp1Rank ?? null,
      comp2Rank: patch.comp2Rank ?? null,
      yourUrl: patch.yourUrl ?? null,
      comp1Url: patch.comp1Url ?? null,
      comp2Url: patch.comp2Url ?? null,
      hasZeroClickRisk: patch.hasZeroClickRisk ?? false,
    })
    return
  }

  const merged: AggregatedKeyword = {
    ...existing,
    intent: existing.intent || patch.intent || "informational",
    volume: Math.max(existing.volume, patch.volume ?? 0),
    kd: patch.kd ?? existing.kd,
    cpc: patch.cpc ?? existing.cpc,
    yourRank: existing.yourRank ?? patch.yourRank ?? null,
    comp1Rank: existing.comp1Rank ?? patch.comp1Rank ?? null,
    comp2Rank: existing.comp2Rank ?? patch.comp2Rank ?? null,
    yourUrl: existing.yourUrl ?? patch.yourUrl ?? null,
    comp1Url: existing.comp1Url ?? patch.comp1Url ?? null,
    comp2Url: existing.comp2Url ?? patch.comp2Url ?? null,
    hasZeroClickRisk: existing.hasZeroClickRisk || (patch.hasZeroClickRisk ?? false),
  }

  map.set(keywordRecord.keyword, merged)
}

async function withProviderSlot<T>(operation: () => Promise<T>): Promise<T> {
  const release = await providerSemaphore.acquire()
  try {
    return await operation()
  } finally {
    release()
  }
}

export async function runGapAnalysis(input: GapAnalysisInput): Promise<GapAnalysisOutput> {
  const yourDomain = normalizeDomain(input.yourDomain)
  const competitors = [input.competitor1Domain, input.competitor2Domain]
    .map((domain) => (domain ? normalizeDomain(domain) : ""))
    .filter(Boolean)

  const keywordMap = new Map<string, AggregatedKeyword>()
  let upstreamCallsUsed = 0
  let providerCostEstimate = 0
  let retriesUsed = 0

  const runIntersectionCall = async (
    competitorDomain: string,
    competitorIndex: 0 | 1,
    intersections: boolean
  ) => {
    const response = await withProviderSlot(() =>
      fetchDomainIntersection({
        competitorDomain,
        yourDomain,
        locationCode: input.locationCode,
        languageCode: input.languageCode,
        limit: input.limitPerCall ?? 200,
        intersections,
        includeSerpInfo: input.includeSerpInfo ?? false,
        includeClickstreamData: input.includeClickstreamData ?? false,
      })
    )

    upstreamCallsUsed += 1
    providerCostEstimate += response.cost
    retriesUsed += response.retriesUsed

    response.keywords.forEach((item) => mergeKeyword(keywordMap, item, competitorIndex))
  }

  await Promise.all(
    competitors.map(async (competitorDomain, idx) => {
      const competitorIndex = idx === 0 ? 0 : 1
      await runIntersectionCall(competitorDomain, competitorIndex, false)

      if (input.mode === "full-gap") {
        await runIntersectionCall(competitorDomain, competitorIndex, true)
      }
    })
  )

  if (input.includeRankedKeywordsFallback && input.mode === "full-gap") {
    const fallback = await withProviderSlot(() =>
      fetchRankedKeywordsOptional({
        targetDomain: yourDomain,
        locationCode: input.locationCode,
        languageCode: input.languageCode,
        limit: 100,
        includeSerpInfo: false,
        includeClickstreamData: false,
      })
    )

    upstreamCallsUsed += 1
    providerCostEstimate += fallback.cost
    retriesUsed += fallback.retriesUsed

    for (const item of fallback.keywords) {
      if (keywordMap.has(item.keyword)) {
        continue
      }

      keywordMap.set(item.keyword, {
        keyword: item.keyword,
        intent: item.intent,
        volume: item.volume,
        kd: item.kd,
        cpc: item.cpc,
        yourRank: item.rank,
        comp1Rank: null,
        comp2Rank: null,
        yourUrl: item.url,
        comp1Url: null,
        comp2Url: null,
        hasZeroClickRisk: false,
      })
    }
  }

  const keywords: GapKeyword[] = Array.from(keywordMap.values())
    .map((item, index) => {
      const source = (item.comp1Rank !== null && item.comp2Rank !== null
        ? "both"
        : item.comp1Rank !== null
          ? "comp1"
          : "comp2") as CompetitorSource

      const gapType = classifyGapType(item.yourRank, item.comp1Rank, item.comp2Rank)

      return {
        id: `${item.keyword}-${index}`,
        keyword: item.keyword,
        intent: item.intent,
        gapType,
        hasZeroClickRisk: item.hasZeroClickRisk,
        yourRank: item.yourRank,
        comp1Rank: item.comp1Rank,
        comp2Rank: item.comp2Rank,
        volume: item.volume,
        kd: item.kd,
        cpc: item.cpc,
        trend: "stable" as const,
        yourUrl: item.yourUrl ?? undefined,
        comp1Url: item.comp1Url ?? undefined,
        comp2Url: item.comp2Url ?? undefined,
        source,
      }
    })
    .sort((a, b) => {
      const typePriority: Record<GapType, number> = {
        missing: 0,
        weak: 1,
        strong: 2,
        shared: 3,
        all: 4,
      }

      const typeDiff = typePriority[a.gapType] - typePriority[b.gapType]
      if (typeDiff !== 0) {
        return typeDiff
      }

      return b.volume - a.volume
    })

  return {
    keywords,
    upstreamCallsUsed,
    providerCostEstimate,
    retriesUsed,
  }
}

export async function verifyGapKeywords(input: VerifyKeywordInput): Promise<VerifyKeywordOutput> {
  const yourDomain = normalizeDomain(input.yourDomain)
  const comp1Domain = normalizeDomain(input.competitor1Domain)
  const comp2Domain = input.competitor2Domain ? normalizeDomain(input.competitor2Domain) : null

  const domains = [yourDomain, comp1Domain, comp2Domain].filter(Boolean) as string[]

  let upstreamCallsUsed = 0
  let providerCostEstimate = 0
  let retriesUsed = 0

  const updated = await Promise.all(
    input.keywords.map(async (keyword) => {
      const verify = await withProviderSlot(() =>
        fetchOrganicVerify({
          keyword,
          domains,
          locationCode: input.locationCode,
          languageCode: input.languageCode,
          depth: 100,
        })
      )

      upstreamCallsUsed += 1
      providerCostEstimate += verify.cost
      retriesUsed += verify.retriesUsed

      return {
        keyword,
        yourRank: verify.rankings[yourDomain]?.rank ?? null,
        comp1Rank: verify.rankings[comp1Domain]?.rank ?? null,
        comp2Rank: comp2Domain ? verify.rankings[comp2Domain]?.rank ?? null : null,
        yourUrl: verify.rankings[yourDomain]?.url ?? null,
        comp1Url: verify.rankings[comp1Domain]?.url ?? null,
        comp2Url: comp2Domain ? verify.rankings[comp2Domain]?.url ?? null : null,
        hasZeroClickRisk: verify.hasZeroClickRisk,
      }
    })
  )

  return {
    updated,
    upstreamCallsUsed,
    providerCostEstimate,
    retriesUsed,
  }
}
