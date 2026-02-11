/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🌍 AI VISIBILITY — Country/Region Configuration
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Defines supported countries for AI visibility scans.
 * Each country maps to:
 *   - Google SERP location_code (for Google Organic + AI Mode)
 *   - ISO alpha-2 code (for LLM web_search_country_iso_code)
 *   - Language code (for Google SERP language_code)
 *
 * "Worldwide" = fallback to US Google SERP + no LLM country filter.
 *
 * API country support matrix:
 * | API           | Uses location_code | Uses web_search_country_iso_code |
 * |---------------|-------------------|----------------------------------|
 * | Google Organic| YES               | N/A                              |
 * | Google AI Mode| YES               | N/A                              |
 * | ChatGPT       | N/A               | YES (when web_search=true)       |
 * | Claude        | N/A               | YES                              |
 * | Gemini        | N/A               | NO (not supported)               |
 * | Perplexity    | N/A               | YES (Sonar models)               |
 */

export interface AIVisibilityCountry {
  /** ISO alpha-2 code or "WW" for worldwide */
  code: string
  /** Display name */
  name: string
  /** Flag emoji */
  flag: string
  /** DataForSEO location_code for Google SERP APIs */
  locationCode: number
  /** ISO code to pass to LLM web_search_country_iso_code (null = don't send) */
  isoCode: string | null
  /** Default language code for Google APIs */
  languageCode: string
}

/**
 * Curated list of countries for AI Visibility scans.
 * Order matters — this is the dropdown display order.
 * "Worldwide" is always first (default fallback).
 */
export const AI_VISIBILITY_COUNTRIES: AIVisibilityCountry[] = [
  {
    code: "WW",
    name: "Worldwide",
    flag: "🌐",
    locationCode: 2840, // Falls back to US for Google SERP
    isoCode: null,      // Don't send country filter to LLMs
    languageCode: "en",
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    locationCode: 2356,
    isoCode: "IN",
    languageCode: "en",
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    locationCode: 2840,
    isoCode: "US",
    languageCode: "en",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    locationCode: 2826,
    isoCode: "GB",
    languageCode: "en",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    locationCode: 2124,
    isoCode: "CA",
    languageCode: "en",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    locationCode: 2036,
    isoCode: "AU",
    languageCode: "en",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    locationCode: 2276,
    isoCode: "DE",
    languageCode: "en",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    locationCode: 2250,
    isoCode: "FR",
    languageCode: "en",
  },
  {
    code: "ES",
    name: "Spain",
    flag: "🇪🇸",
    locationCode: 2724,
    isoCode: "ES",
    languageCode: "en",
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    locationCode: 2076,
    isoCode: "BR",
    languageCode: "en",
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    locationCode: 2392,
    isoCode: "JP",
    languageCode: "en",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    flag: "🇦🇪",
    locationCode: 2784,
    isoCode: "AE",
    languageCode: "en",
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    locationCode: 2702,
    isoCode: "SG",
    languageCode: "en",
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "🇳🇱",
    locationCode: 2528,
    isoCode: "NL",
    languageCode: "en",
  },
  {
    code: "IT",
    name: "Italy",
    flag: "🇮🇹",
    locationCode: 2380,
    isoCode: "IT",
    languageCode: "en",
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    locationCode: 2484,
    isoCode: "MX",
    languageCode: "en",
  },
  {
    code: "SE",
    name: "Sweden",
    flag: "🇸🇪",
    locationCode: 2752,
    isoCode: "SE",
    languageCode: "en",
  },
]

/** Default country code (Worldwide) */
export const DEFAULT_COUNTRY_CODE = "WW"

/** Get country config by code */
export function getCountryByCode(code: string): AIVisibilityCountry {
  return (
    AI_VISIBILITY_COUNTRIES.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    ) ?? AI_VISIBILITY_COUNTRIES[0] // fallback to Worldwide
  )
}

/**
 * Detect user's country from browser locale.
 * Returns the matching country code if in our list, otherwise "WW" (Worldwide).
 *
 * Uses Intl.DateTimeFormat for reliable locale detection.
 */
export function detectBrowserCountry(): string {
  if (typeof window === "undefined") return DEFAULT_COUNTRY_CODE

  try {
    // Try Intl.DateTimeFormat first (most reliable)
    const resolved = Intl.DateTimeFormat().resolvedOptions()
    const locale = resolved.locale || ""
    const parts = locale.split("-")
    const countryFromLocale = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : ""

    if (countryFromLocale) {
      const match = AI_VISIBILITY_COUNTRIES.find(
        (c) => c.code === countryFromLocale
      )
      if (match) return match.code
    }

    // Fallback: navigator.language
    const navLang = navigator.language || ""
    const navParts = navLang.split("-")
    const navCountry = navParts.length > 1 ? navParts[navParts.length - 1].toUpperCase() : ""

    if (navCountry) {
      const match = AI_VISIBILITY_COUNTRIES.find(
        (c) => c.code === navCountry
      )
      if (match) return match.code
    }
  } catch {
    // Ignore detection errors
  }

  return DEFAULT_COUNTRY_CODE
}
