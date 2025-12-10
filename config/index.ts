/**
 * Config Barrel Export
 * Central export point for all configuration
 */

export { env, validateEnv, requireEnv } from "./env"
export type { } from "./env"

export { routes, isPublicRoute, isAuthRoute, isDashboardRoute, getRedirectUrl, getBreadcrumbs, breadcrumbs } from "./routes"

export {
  PLANS,
  SEO_THRESHOLDS,
  SEARCH_INTENTS,
  SERP_FEATURES,
  DECAY_RISK_COLORS,
  LOCATIONS,
  LANGUAGES,
  DATE_RANGES,
  PAGINATION,
  RATE_LIMITS,
  ANIMATION,
  CHART_COLORS,
} from "./constants"
export type { PlanId } from "./constants"

export { siteConfig } from "./site"
export type { SiteConfig } from "./site"
