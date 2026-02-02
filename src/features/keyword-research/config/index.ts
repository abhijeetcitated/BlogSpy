// ============================================
// KEYWORD MAGIC - Config Barrel Export
// ============================================

export { FEATURE_CONFIG, type FeatureConfig } from "./feature-config"
export {
  keywordMagicApiConfig,
  type KeywordMagicApiConfig,
  getEndpoint,
  buildApiUrl,
} from "./api-config"

// Location Registry
export {
  LOCATION_CODES,
  LOCATION_LANGUAGE_OVERRIDES,
  LANGUAGE_LABELS,
  LANGUAGE_OPTIONS,
  LOCATION_REGISTRY,
  getNumericLocationCode,
  getSupportedLanguages,
  getPrimaryLanguage,
  getLanguageLabel,
  type LocationMetadata,
} from "./location-registry"
