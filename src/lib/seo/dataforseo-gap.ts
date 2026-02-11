import "server-only"

import { URL } from "url"
import { AxiosError } from "axios"
import { DATAFORSEO } from "@/constants/api-endpoints"
import { getDataForSEOClient } from "@/lib/seo/dataforseo"

export type GapKeywordIntent = "commercial" | "informational" | "transactional" | "navigational"

export type GapProviderErrorKind =
  | "PROVIDER_MINUTE_RATE_LIMIT"
  | "PROVIDER_CONCURRENCY_LIMIT"
  | "PROVIDER_COST_LIMIT_REACHED"
  | "PROVIDER_WALLET_EMPTY"
  | "PROVIDER_TEMPORARY_FAILURE"
  | "PROVIDER_BAD_REQUEST"
  | "PROVIDER_AUTH_FAILED"
  | "PROVIDER_UNKNOWN"

const RETRYABLE_PROVIDER_CODES = new Set([40202, 40209])
const HARD_STOP_PROVIDER_CODES = new Set([40203, 40210])

const ZERO_CLICK_SERP_TYPES = new Set([
  "ai_overview",
  "ai_mode_response",
  "answer_box",
  "featured_snippet",
  "knowledge_graph",
])

export class GapProviderError extends Error {
  readonly kind: GapProviderErrorKind
  readonly providerCode: number | null
  readonly retryable: boolean

  constructor(kind: GapProviderErrorKind, message: string, providerCode: number | null, retryable: boolean) {
    super(message)
    this.name = "GapProviderError"
    this.kind = kind
    this.providerCode = providerCode
    this.retryable = retryable
  }
}

type DataForSEOTask<TResult> = {
  id?: string
  status_code?: number
  status_message?: string
  cost?: number
  result?: TResult[]
}

type DataForSEOEnvelope<TResult> = {
  status_code?: number
  status_message?: string
  cost?: number
  tasks?: Array<DataForSEOTask<TResult>>
}

type DomainSerpElement = {
  rank_absolute?: number
  rank_group?: number
  url?: string
  domain?: string
}

type DomainIntersectionItem = {
  keyword?: string
  keyword_data?: {
    keyword?: string
    keyword_info?: {
      search_volume?: number
      cpc?: number
    }
    keyword_properties?: {
      keyword_difficulty?: number
    }
    search_intent_info?: {
      main_intent?: string
    }
  }
  first_domain_serp_element?: DomainSerpElement | null
  second_domain_serp_element?: DomainSerpElement | null
  ranked_serp_element?: DomainSerpElement | null
  first_domain_rank?: number
  second_domain_rank?: number
  search_volume?: number
  keyword_difficulty?: number
  cpc?: number
  intent?: string
}

type DomainIntersectionResult = {
  items?: DomainIntersectionItem[]
}

type OrganicSerpItem = {
  type?: string
  rank_absolute?: number
  url?: string
  domain?: string
}

type OrganicSerpResult = {
  items?: OrganicSerpItem[]
}

export type NormalizedDomainIntersectionKeyword = {
  keyword: string
  yourRank: number | null
  competitorRank: number | null
  yourUrl: string | null
  competitorUrl: string | null
  volume: number
  kd: number
  cpc: number
  intent: GapKeywordIntent
  hasZeroClickRisk: boolean
  raw: Record<string, unknown>
}

export type DomainIntersectionResponse = {
  taskId: string | null
  cost: number
  keywords: NormalizedDomainIntersectionKeyword[]
}

export type RankedKeywordResponse = {
  taskId: string | null
  cost: number
  keywords: Array<{
    keyword: string
    rank: number | null
    url: string | null
    volume: number
    kd: number
    cpc: number
    intent: GapKeywordIntent
    raw: Record<string, unknown>
  }>
}

export type OrganicVerifyResponse = {
  taskId: string | null
  cost: number
  hasZeroClickRisk: boolean
  rankings: Record<string, { rank: number | null; url: string | null }>
}

export type DomainIntersectionRequest = {
  competitorDomain: string
  yourDomain: string
  locationCode: number
  languageCode: string
  limit: number
  offset?: number
  intersections: boolean
  includeSerpInfo?: boolean
  includeClickstreamData?: boolean
}

export type RankedKeywordsRequest = {
  targetDomain: string
  locationCode: number
  languageCode: string
  limit: number
  offset?: number
  includeSerpInfo?: boolean
  includeClickstreamData?: boolean
}

export type OrganicVerifyRequest = {
  keyword: string
  domains: string[]
  locationCode: number
  languageCode: string
  depth?: number
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}

function asIntent(value: string | undefined): GapKeywordIntent {
  const normalized = value?.trim().toLowerCase()
  switch (normalized) {
    case "commercial":
      return "commercial"
    case "transactional":
      return "transactional"
    case "navigational":
      return "navigational"
    default:
      return "informational"
  }
}

function normalizeDomain(domainOrUrl: string): string {
  const value = domainOrUrl.trim().toLowerCase()
  if (!value) return ""

  try {
    const parsed = value.includes("://") ? new URL(value) : new URL(`https://${value}`)
    return parsed.hostname.replace(/^www\./, "")
  } catch {
    return value.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] ?? ""
  }
}

function mapProviderCodeToError(statusCode: number | undefined, statusMessage: string | undefined): GapProviderError {
  const code = typeof statusCode === "number" ? statusCode : null
  const message = statusMessage?.trim() || "Provider request failed"

  if (code === 40202) {
    return new GapProviderError("PROVIDER_MINUTE_RATE_LIMIT", message, code, true)
  }
  if (code === 40209) {
    return new GapProviderError("PROVIDER_CONCURRENCY_LIMIT", message, code, true)
  }
  if (code === 40203) {
    return new GapProviderError("PROVIDER_COST_LIMIT_REACHED", message, code, false)
  }
  if (code === 40210) {
    return new GapProviderError("PROVIDER_WALLET_EMPTY", message, code, false)
  }
  if (code === 40101 || code === 40103 || code === 40104) {
    return new GapProviderError("PROVIDER_AUTH_FAILED", message, code, false)
  }
  if (code !== null && code >= 40000 && code < 50000) {
    return new GapProviderError("PROVIDER_BAD_REQUEST", message, code, false)
  }
  if (code !== null && code >= 50000) {
    return new GapProviderError("PROVIDER_TEMPORARY_FAILURE", message, code, true)
  }

  return new GapProviderError("PROVIDER_UNKNOWN", message, code, false)
}

function mapTransportError(error: unknown): GapProviderError {
  if (error instanceof GapProviderError) {
    return error
  }

  if (error instanceof AxiosError) {
    if (error.response?.status === 429) {
      return new GapProviderError("PROVIDER_MINUTE_RATE_LIMIT", "Provider rate limit reached", 40202, true)
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return new GapProviderError("PROVIDER_AUTH_FAILED", "Provider authentication failed", null, false)
    }

    if (error.response?.status === 402) {
      const message = typeof error.response.data === "object" && error.response.data !== null
        ? String((error.response.data as Record<string, unknown>).status_message ?? "Provider account unavailable")
        : "Provider account unavailable"

      return new GapProviderError("PROVIDER_WALLET_EMPTY", message, 40210, false)
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new GapProviderError("PROVIDER_TEMPORARY_FAILURE", "Provider request timed out", null, true)
    }

    return new GapProviderError(
      "PROVIDER_UNKNOWN",
      error.message || "Provider transport error",
      null,
      false
    )
  }

  if (error instanceof Error) {
    return new GapProviderError("PROVIDER_UNKNOWN", error.message, null, false)
  }

  return new GapProviderError("PROVIDER_UNKNOWN", "Unknown provider error", null, false)
}

async function runWithRetry<T>(operation: () => Promise<T>, retries = 3): Promise<{ value: T; retriesUsed: number }> {
  let attempt = 0
  let retriesUsed = 0

  while (true) {
    try {
      const value = await operation()
      return { value, retriesUsed }
    } catch (error) {
      const mapped = mapTransportError(error)
      const shouldRetryByCode = mapped.providerCode !== null && RETRYABLE_PROVIDER_CODES.has(mapped.providerCode)
      const shouldRetry = mapped.retryable || shouldRetryByCode

      if (!shouldRetry || attempt >= retries - 1) {
        throw mapped
      }

      retriesUsed += 1
      attempt += 1
      const backoffMs = Math.min(5000, 350 * (2 ** attempt) + Math.floor(Math.random() * 250))
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }
}

function parseRank(element: DomainSerpElement | null | undefined, explicitRank?: number): number | null {
  if (typeof explicitRank === "number" && Number.isFinite(explicitRank)) {
    return explicitRank
  }

  const absolute = element?.rank_absolute
  if (typeof absolute === "number" && Number.isFinite(absolute)) {
    return absolute
  }

  const grouped = element?.rank_group
  if (typeof grouped === "number" && Number.isFinite(grouped)) {
    return grouped
  }

  return null
}

function parseKeywordMetrics(item: DomainIntersectionItem): {
  keyword: string
  volume: number
  kd: number
  cpc: number
  intent: GapKeywordIntent
} {
  const keywordData = item.keyword_data
  const keyword = (keywordData?.keyword || item.keyword || "").trim()
  const volume = Number(keywordData?.keyword_info?.search_volume ?? item.search_volume ?? 0)
  const kd = Number(keywordData?.keyword_properties?.keyword_difficulty ?? item.keyword_difficulty ?? 0)
  const cpc = Number(keywordData?.keyword_info?.cpc ?? item.cpc ?? 0)
  const intent = asIntent(keywordData?.search_intent_info?.main_intent ?? item.intent)

  return {
    keyword,
    volume: Number.isFinite(volume) ? Math.max(0, Math.round(volume)) : 0,
    kd: Number.isFinite(kd) ? Math.max(0, Math.min(100, Math.round(kd))) : 0,
    cpc: Number.isFinite(cpc) ? Math.max(0, Number(cpc)) : 0,
    intent,
  }
}

async function postTask<TResult>(endpoint: string, payload: Array<Record<string, unknown>>): Promise<DataForSEOTask<TResult>> {
  const client = getDataForSEOClient()

  let response: DataForSEOEnvelope<TResult>
  try {
    const { data } = await client.post<DataForSEOEnvelope<TResult>>(endpoint, payload)
    response = data
  } catch (error) {
    throw mapTransportError(error)
  }

  const rootStatus = response.status_code
  if (rootStatus !== 20000) {
    throw mapProviderCodeToError(rootStatus, response.status_message)
  }

  const task = response.tasks?.[0]
  if (!task) {
    throw new GapProviderError("PROVIDER_UNKNOWN", "Provider task missing in response", null, false)
  }

  const taskStatus = task.status_code
  if (taskStatus !== 20000) {
    throw mapProviderCodeToError(taskStatus, task.status_message)
  }

  return task
}

export async function fetchDomainIntersection(input: DomainIntersectionRequest): Promise<DomainIntersectionResponse & { retriesUsed: number }> {
  const payload: Record<string, unknown> = {
    target1: normalizeDomain(input.competitorDomain),
    target2: normalizeDomain(input.yourDomain),
    location_code: input.locationCode,
    language_code: input.languageCode,
    intersections: input.intersections,
    limit: input.limit,
    offset: input.offset ?? 0,
    include_serp_info: input.includeSerpInfo ?? false,
    include_clickstream_data: input.includeClickstreamData ?? false,
  }

  const { value: task, retriesUsed } = await runWithRetry(() =>
    postTask<DomainIntersectionResult>(DATAFORSEO.LABS_GOOGLE.DOMAIN_INTERSECTION, [payload])
  )

  const result = task.result?.[0]
  const items = result?.items ?? []

  const keywords: NormalizedDomainIntersectionKeyword[] = items
    .map((item) => {
      const metrics = parseKeywordMetrics(item)
      if (!metrics.keyword) {
        return null
      }

      const first = item.first_domain_serp_element ?? item.ranked_serp_element ?? null
      const second = item.second_domain_serp_element ?? null

      return {
        keyword: metrics.keyword,
        volume: metrics.volume,
        kd: metrics.kd,
        cpc: metrics.cpc,
        intent: metrics.intent,
        competitorRank: parseRank(first, item.first_domain_rank),
        yourRank: parseRank(second, item.second_domain_rank),
        competitorUrl: first?.url ?? null,
        yourUrl: second?.url ?? null,
        hasZeroClickRisk: false,
        raw: asRecord(item),
      }
    })
    .filter((item): item is NormalizedDomainIntersectionKeyword => item !== null)

  return {
    taskId: task.id ?? null,
    cost: typeof task.cost === "number" ? task.cost : 0,
    keywords,
    retriesUsed,
  }
}

export async function fetchRankedKeywordsOptional(input: RankedKeywordsRequest): Promise<RankedKeywordResponse & { retriesUsed: number }> {
  const payload: Record<string, unknown> = {
    target: normalizeDomain(input.targetDomain),
    location_code: input.locationCode,
    language_code: input.languageCode,
    limit: input.limit,
    offset: input.offset ?? 0,
    include_serp_info: input.includeSerpInfo ?? false,
    include_clickstream_data: input.includeClickstreamData ?? false,
  }

  const { value: task, retriesUsed } = await runWithRetry(() =>
    postTask<DomainIntersectionResult>(DATAFORSEO.LABS_GOOGLE.RANKED_KEYWORDS, [payload])
  )

  const result = task.result?.[0]
  const items = result?.items ?? []

  const keywords = items
    .map((item) => {
      const metrics = parseKeywordMetrics(item)
      if (!metrics.keyword) {
        return null
      }

      const ranked = item.ranked_serp_element ?? item.first_domain_serp_element ?? null

      return {
        keyword: metrics.keyword,
        rank: parseRank(ranked, item.first_domain_rank),
        url: ranked?.url ?? null,
        volume: metrics.volume,
        kd: metrics.kd,
        cpc: metrics.cpc,
        intent: metrics.intent,
        raw: asRecord(item),
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return {
    taskId: task.id ?? null,
    cost: typeof task.cost === "number" ? task.cost : 0,
    keywords,
    retriesUsed,
  }
}

export async function fetchOrganicVerify(input: OrganicVerifyRequest): Promise<OrganicVerifyResponse & { retriesUsed: number }> {
  const payload: Record<string, unknown> = {
    keyword: input.keyword,
    location_code: input.locationCode,
    language_code: input.languageCode,
    depth: input.depth ?? 100,
  }

  const { value: task, retriesUsed } = await runWithRetry(() =>
    postTask<OrganicSerpResult>(DATAFORSEO.SERP.GOOGLE_ORGANIC, [payload])
  )

  const result = task.result?.[0]
  const items = result?.items ?? []
  const normalizedDomains = input.domains.map((domain) => normalizeDomain(domain)).filter(Boolean)

  const rankings: Record<string, { rank: number | null; url: string | null }> = {}
  for (const domain of normalizedDomains) {
    rankings[domain] = { rank: null, url: null }
  }

  let hasZeroClickRisk = false

  for (const item of items) {
    const itemType = item.type?.toLowerCase() ?? ""
    if (ZERO_CLICK_SERP_TYPES.has(itemType)) {
      hasZeroClickRisk = true
    }

    if (itemType !== "organic") {
      continue
    }

    const itemDomain = normalizeDomain(item.domain ?? item.url ?? "")
    if (!itemDomain) {
      continue
    }

    for (const domain of normalizedDomains) {
      if (!itemDomain.includes(domain) || rankings[domain]?.rank !== null) {
        continue
      }

      rankings[domain] = {
        rank: typeof item.rank_absolute === "number" ? item.rank_absolute : null,
        url: item.url ?? null,
      }
    }
  }

  return {
    taskId: task.id ?? null,
    cost: typeof task.cost === "number" ? task.cost : 0,
    rankings,
    hasZeroClickRisk,
    retriesUsed,
  }
}

export function isProviderHardStop(error: GapProviderError): boolean {
  return error.providerCode !== null && HARD_STOP_PROVIDER_CODES.has(error.providerCode)
}
