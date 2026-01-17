/**
 * Strict country normalization for keyword research.
 *
 * Rules:
 * - trim
 * - uppercase
 * - map UK -> GB
 * - map EN -> US (legacy compatibility)
 * - validate against a static allowed ISO-3166-1 alpha-2 subset that we support
 *
 * Defaults to US on invalid/unsupported input.
 */

const COUNTRY_ALIAS_MAP: Readonly<Record<string, string>> = {
  UK: "GB",
  EN: "US",
} as const

/**
 * Supported countries for DataForSEO calls in this repo.
 * Keep this in sync with [`LOCATION_MAP`](src/lib/dataforseo/locations.ts:1).
 */
const ALLOWED_COUNTRY_CODES: ReadonlySet<string> = new Set([
  "US",
  "GB",
  "IN",
  "CA",
  "AU",
  "DE",
  "FR",
  "BR",
  "ES",
  "IT",
  "NL",
  "JP",
  "MX",
  "SG",
  "AE",
  "ZA",
])

export function normalizeCountryCode(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) {
    return "US"
  }

  const upper = trimmed.toUpperCase()
  const aliased = COUNTRY_ALIAS_MAP[upper] ?? upper

  if (!/^[A-Z]{2}$/.test(aliased)) {
    return "US"
  }

  if (!ALLOWED_COUNTRY_CODES.has(aliased)) {
    return "US"
  }

  return aliased
}
