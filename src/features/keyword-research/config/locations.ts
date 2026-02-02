import "server-only"

import {
  LOCATION_CODES,
  LOCATION_REGISTRY,
  LOCATION_LANGUAGE_OVERRIDES,
  LANGUAGE_LABELS,
  LANGUAGE_OPTIONS,
  getNumericLocationCode,
  getSupportedLanguages,
  getPrimaryLanguage,
  getLanguageLabel,
} from "./location-registry"

export {
  LOCATION_CODES,
  LOCATION_REGISTRY,
  LOCATION_LANGUAGE_OVERRIDES,
  LANGUAGE_LABELS,
  LANGUAGE_OPTIONS,
  getNumericLocationCode,
  getSupportedLanguages,
  getPrimaryLanguage,
  getLanguageLabel,
}

export function getLocationCode(isoCode: string): number {
  return getNumericLocationCode(isoCode)
}

// --------------------------------------------
// Language Registry (Google Ads Criteria IDs)
// --------------------------------------------
// These numeric codes are used by DataForSEO for
// Google Ads keyword endpoints.
// Fallback is English (1000).
export const LANGUAGE_REGISTRY: Record<string, number> = {
  en: 1000,
  es: 1003,
  fr: 1002,
  de: 1001,
  hi: 1023,
  it: 1004,
  pt: 1014,
  ja: 1005,
  nl: 1010,
  ru: 1031,
  pl: 1030,
  ar: 1019,
  bn: 1056,
  bg: 1020,
  ca: 1038,
  zh_cn: 1017,
  zh_tw: 1018,
  hr: 1039,
  cs: 1021,
  da: 1009,
  et: 1043,
  tl: 1042,
  fil: 1042,
  fi: 1011,
  el: 1022,
  gu: 1072,
  he: 1027,
  iw: 1027,
  hu: 1024,
  is: 1026,
  id: 1025,
  kn: 1086,
  ko: 1012,
  lv: 1028,
  lt: 1029,
  ms: 1102,
  ml: 1098,
  mr: 1101,
  no: 1013,
  fa: 1064,
  pa: 1110,
  ro: 1032,
  sr: 1019,
  sk: 1033,
  sl: 1034,
  sv: 1015,
  ta: 1130,
  te: 1131,
  th: 1044,
  tr: 1035,
  uk: 1036,
  ur: 1041,
  vi: 1040,
} as const

export function getLanguageCode(iso: string): number {
  const normalized = iso?.trim().toLowerCase().replace("-", "_")
  if (!normalized) return LANGUAGE_REGISTRY.en

  if (normalized === "zh") return LANGUAGE_REGISTRY.zh_cn
  if (normalized === "he") return LANGUAGE_REGISTRY.he
  if (normalized === "fil") return LANGUAGE_REGISTRY.fil

  return LANGUAGE_REGISTRY[normalized] ?? LANGUAGE_REGISTRY.en
}
