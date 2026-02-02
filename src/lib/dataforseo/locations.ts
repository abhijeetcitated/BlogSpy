import "server-only"

import { getNumericLocationCode } from "@/features/keyword-research/config/locations"

/**
 * Centralized DataForSEO location codes keyed by normalized ISO-3166-1 alpha-2.
 *
 * Uses the unified registry to support 200+ countries.
 */
export function getDataForSEOLocationCode(countryCode: string): number {
  return getNumericLocationCode(countryCode)
}
