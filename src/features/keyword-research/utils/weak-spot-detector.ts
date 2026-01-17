export type WeakSpotResult = {
  hasWeakSpot: boolean
  platforms: string[]
  topRank: number | null
}

export type SerpItem = {
  url?: string
  domain?: string
}

const WEAK_SPOT_DOMAINS: ReadonlyArray<string> = [
  "reddit.com",
  "quora.com",
  "pinterest.com",
  "linkedin.com",
  "medium.com",
]

function extractHostname(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

function mapPlatform(domain: string): string {
  return domain.split(".")[0] || domain
}

/**
 * Detects weak-spot platforms within the top 10 SERP items.
 *
 * Logic:
 * - Inspect first 10 results.
 * - Match against a known set of weak-spot domains.
 * - Return unique platforms plus the earliest rank where a weak spot appears.
 */
export function detectWeakSpots(serpItems: SerpItem[]): WeakSpotResult {
  const platforms = new Set<string>()
  let topRank: number | null = null

  const slice = serpItems.slice(0, 10)

  slice.forEach((item, index) => {
    const rawDomain = item.domain?.toLowerCase()
    const urlHost = item.url ? extractHostname(item.url) : null
    const hostname = rawDomain || urlHost
    if (!hostname) return

    const matched = WEAK_SPOT_DOMAINS.find((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
    if (!matched) return

    platforms.add(mapPlatform(matched))
    if (topRank === null) {
      topRank = index + 1
    }
  })

  return {
    hasWeakSpot: platforms.size > 0,
    platforms: Array.from(platforms),
    topRank,
  }
}
