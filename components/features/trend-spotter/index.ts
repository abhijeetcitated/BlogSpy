// ============================================
// TREND SPOTTER - Feature Components
// ============================================
// NOTE: This feature has been refactored to src/features/trend-spotter/
// These exports maintain backward compatibility

// Re-export from new location
export { TrendSpotter } from "@/src/features/trend-spotter"

// For backward compatibility with TrendSpotterContent name
export { TrendSpotter as TrendSpotterContent } from "@/src/features/trend-spotter"

// Re-export all sub-components for advanced usage
export {
  WorldMap,
  SearchableCountryDropdown,
  CascadingCityDropdown,
  VelocityChart,
  GeographicInterest,
  NewsContext,
  RelatedDataLists,
  TrendCalendar,
} from "@/src/features/trend-spotter"
