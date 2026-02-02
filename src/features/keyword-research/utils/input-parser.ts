const STOPWORDS = new Set(["a", "an", "the", "in", "of", "for", "with", "to"])

export function sanitizeKeywordInput(input: string): string {
  return input.trim().toLowerCase()
}

function normalizePluralToken(token: string): string {
  if (!token) return token

  if (/ies$/.test(token) && token.length > 3) {
    return `${token.slice(0, -3)}y`
  }

  if (/es$/.test(token) && token.length > 2) {
    return token.slice(0, -2)
  }

  if (/s$/.test(token) && !/(ss|is|us)$/.test(token)) {
    return token.slice(0, -1)
  }

  return token
}

export function normalizeForCache(keyword: string): string {
  const cleaned = sanitizeKeywordInput(keyword)
  if (!cleaned) return ""

  const tokens = cleaned
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => normalizePluralToken(token))
    .filter((token) => !STOPWORDS.has(token))

  if (tokens.length === 0) return ""

  tokens.sort((a, b) => a.localeCompare(b))
  return tokens.join("-")
}

export function normalizeKeyword(input: string): string {
  return sanitizeKeywordInput(input)
}

export function parseBulkKeywords(raw: string): string[] {
  if (!raw) return []

  const parts = raw.split(/[\n,]+/)
  const results: string[] = []
  const seen = new Set<string>()

  for (const part of parts) {
    const normalized = sanitizeKeywordInput(part)
    if (!normalized) continue
    if (seen.has(normalized)) continue

    seen.add(normalized)
    results.push(normalized)

    if (results.length >= 100) break
  }

  return results
}

export function buildCacheSlug(
  keyword: string,
  country: string,
  language: string,
  device: string
): string {
  const normalizedKeyword =
    normalizeForCache(keyword) ||
    sanitizeKeywordInput(keyword).replace(/\s+/g, "-") ||
    "keyword"
  const normalizedCountry = (country || "us").trim().toLowerCase()
  const normalizedLanguage = (language || "en").trim().toLowerCase()
  const normalizedDevice = (device || "desktop").trim().toLowerCase()
  return `${normalizedKeyword}-${normalizedCountry}-${normalizedLanguage}-${normalizedDevice}`
}
