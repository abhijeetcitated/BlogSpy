import { normalizeCountryCode } from "../../features/keyword-research/utils/country-normalizer"

/**
 * Centralized DataForSEO location codes keyed by normalized ISO-3166-1 alpha-2.
 *
 * This must stay consistent with [`normalizeCountryCode()`](src/features/keyword-research/utils/country-normalizer.ts:1)
 * to ensure strict country isolation.
 */
export const LOCATION_MAP: Readonly<Record<string, number>> = {
  US: 2840,
  GB: 2826,
  IN: 2356,
  CA: 2124,
  AU: 2036,
  DE: 2276,
  FR: 2250,
  BR: 2076,
  ES: 2724,
  IT: 2380,
  NL: 2528,
  JP: 2392,
  MX: 2484,
  SG: 2702,
  AE: 2784,
  ZA: 2710,
} as const

export function getDataForSEOLocationCode(countryCode: string): number {
  const normalized = normalizeCountryCode(countryCode)
  const locationCode = LOCATION_MAP[normalized]

  if (typeof locationCode !== "number") {
    // Defensive: normalizeCountryCode should already constrain supported codes.
    throw new Error(`No DataForSEO location code configured for: "${normalized}"`)
  }

  return locationCode
}
