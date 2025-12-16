// ============================================
// TREND SPOTTER FEATURE
// ============================================
// This is the public API for the trend-spotter feature.
// Only import from this file in other parts of the app.

// Main component
export { TrendSpotter } from "./trend-spotter"

// Sub-components (for advanced use cases)
export { 
  WorldMap,
  SearchableCountryDropdown,
  CascadingCityDropdown,
  VelocityChart,
  GeographicInterest,
  NewsContext,
  RelatedDataLists,
  TrendCalendar,
} from "./components"

// Types (for TypeScript consumers)
export type {
  Season,
  EventCategory,
  EventSource,
  IndustryNiche,
  TrafficImpact,
  CalendarView,
  Country,
  CountryInterest,
  CityData,
  SeasonalEvent,
  SeasonalTrend,
  VelocityDataPoint,
  NewsItem,
  RelatedTopic,
  BreakoutQuery,
  MapMarker,
  TooltipState,
  PlatformOption,
  SourceConfig,
  CategoryConfig,
  TrafficImpactConfig,
} from "./types"

// Constants (for customization)
export {
  tier1Countries,
  allCountries,
  sourceConfig,
  categoryConfig,
  trafficImpactConfig,
  seasonIcons,
  seasonColors,
  nicheToCategories,
  geoUrl,
} from "./constants"

// Utilities (for advanced use cases)
export {
  calculateDaysUntil,
  getCurrentDateInfo,
  parseExactDate,
  filterCalendarEvents,
  orderCalendarFromCurrentMonth,
  calculateCalendarStats,
} from "./utils"
