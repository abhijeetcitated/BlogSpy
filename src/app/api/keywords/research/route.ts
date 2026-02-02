import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { normalizeForCache, sanitizeKeywordInput } from "@/features/keyword-research/utils/input-parser"
import { getKeywordSearchVolume } from "@/lib/seo/dataforseo"

const LABS_TTL_MS = 30 * 24 * 60 * 60 * 1000
const DEFAULT_COUNTRY = "US"
const DEFAULT_MATCH_TYPE = "broad"
const DEFAULT_LANGUAGE = "en"

type CacheRow = {
  slug: string
  keyword: string
  raw_data: unknown
  analysis_data: unknown
  last_labs_update: string | null
  last_serp_update: string | null
}

type VolumeRecord = {
  keyword: string
  search_volume: number
  cpc: number
  competition: string | null
}

function isFresh(timestamp: string | null | undefined, ttlMs: number): boolean {
  if (!timestamp) return false
  const time = new Date(timestamp).getTime()
  if (Number.isNaN(time)) return false
  return Date.now() - time < ttlMs
}

function buildCacheSlug(keyword: string): string {
  const normalizedKeyword =
    normalizeForCache(keyword) || sanitizeKeywordInput(keyword).replace(/\s+/g, "-") || "keyword"
  const normalizedCountry = DEFAULT_COUNTRY.toLowerCase()
  const normalizedMatch = DEFAULT_MATCH_TYPE.toLowerCase()
  return `${normalizedKeyword}-${normalizedCountry}-${DEFAULT_LANGUAGE}-${normalizedMatch}`
}

function extractMetrics(raw: unknown, keyword: string): VolumeRecord | null {
  if (!Array.isArray(raw)) return null
  const match = raw.find((item) => {
    if (!item || typeof item !== "object") return false
    const value = item as Record<string, unknown>
    return typeof value.keyword === "string" && value.keyword.toLowerCase() === keyword.toLowerCase()
  }) as Record<string, unknown> | undefined

  if (!match) return null
  const volume = Number(match.search_volume ?? match.volume ?? 0)
  const cpc = Number(match.cpc ?? 0)
  const competition =
    typeof match.competition === "string"
      ? match.competition
      : typeof match.competition_level === "string"
        ? match.competition_level
        : null

  return {
    keyword,
    search_volume: Number.isFinite(volume) ? volume : 0,
    cpc: Number.isFinite(cpc) ? cpc : 0,
    competition,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const inputKeywords: string[] = Array.isArray(body?.keywords)
      ? body.keywords.filter((value: unknown): value is string => typeof value === "string")
      : []

    const keywords = Array.from(
      new Set(inputKeywords.map((value) => sanitizeKeywordInput(value)).filter(Boolean))
    )

    if (keywords.length === 0) {
      return NextResponse.json({ success: false, error: "keywords are required" }, { status: 400 })
    }

    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Missing DATAFORSEO credentials in .env" },
        { status: 500 }
      )
    }

    const slugs = keywords.map(buildCacheSlug)
    const slugMap = new Map(keywords.map((keyword, index) => [keyword, slugs[index]]))

    const admin = createAdminClient()
    const { data: cacheRows, error: cacheError } = await admin
      .from("kw_cache")
      .select("slug, keyword, raw_data, analysis_data, last_labs_update, last_serp_update")
      .in("slug", slugs)

    if (cacheError) {
      throw new Error(cacheError.message)
    }

    const cacheBySlug = new Map<string, CacheRow>()
    ;(cacheRows as CacheRow[] | null)?.forEach((row) => cacheBySlug.set(row.slug, row))

    const missing: string[] = []
    const combined: VolumeRecord[] = []

    for (const keyword of keywords) {
      const slug = slugMap.get(keyword)
      const row = slug ? cacheBySlug.get(slug) : undefined
      if (!row || !isFresh(row.last_labs_update, LABS_TTL_MS)) {
        missing.push(keyword)
        continue
      }
      const metrics = extractMetrics(row.raw_data, keyword)
      if (metrics) combined.push(metrics)
    }

    let fetched: VolumeRecord[] = []
    if (missing.length > 0) {
      const apiData = await getKeywordSearchVolume(missing)
      fetched = apiData
        .map((item) => ({
          keyword: item.keyword ?? "",
          search_volume: Number(item.search_volume ?? 0),
          cpc: Number(item.cpc ?? 0),
          competition:
            typeof item.competition_level === "string" ? item.competition_level : null,
        }))
        .filter((entry) => entry.keyword)

      const nowIso = new Date().toISOString()
      const upsertRows = missing.map((keyword) => {
        const slug = slugMap.get(keyword) ?? buildCacheSlug(keyword)
        const rawPayload = apiData.filter(
          (entry) => entry.keyword?.toLowerCase() === keyword.toLowerCase()
        )
        const existing = slug ? cacheBySlug.get(slug) : undefined
        return {
          slug,
          keyword,
          country_code: DEFAULT_COUNTRY,
          match_type: DEFAULT_MATCH_TYPE,
          raw_data: rawPayload,
          analysis_data: existing?.analysis_data ?? null,
          last_labs_update: nowIso,
          last_serp_update: existing?.last_serp_update ?? null,
          last_accessed_at: nowIso,
        }
      })

      const { error: upsertError } = await admin.from("kw_cache").upsert(upsertRows, {
        onConflict: "slug",
      })

      if (upsertError) {
        throw new Error(upsertError.message)
      }
    }

    const allResults = [...combined, ...fetched]

    if (slugs.length > 0) {
      await admin
        .from("kw_cache")
        .update({ last_accessed_at: new Date().toISOString() })
        .in("slug", slugs)
    }

    return NextResponse.json({ success: true, data: allResults })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
