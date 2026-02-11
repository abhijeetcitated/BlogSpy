/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * AI VISIBILITY ACTIONS - Barrel Export
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * REFACTORED: All actions now use authAction wrapper for consistent auth/rate-limiting.
 * Types are exported but input types are now defined via Zod schemas internally.
 */

export {
  runTechAudit,
  checkRobotsTxt,
  checkLlmsTxt,
  checkSchemaOrg,
  type AuditActionResponse,
} from "./run-audit"

// DELETED (2026-02-08): run-defense.ts — OpenRouter-dependent, no DataForSEO equivalent
// Backups: backups/2026-02-08_ai-visibility-delete/run-defense.ts

export {
  checkGoogleAIO,
  getRanking,
  getRankings,
  checkCitations,
} from "./run-tracker"

export {
  saveVisibilityConfig,
  getVisibilityConfig,
  listVisibilityConfigs,
  deleteVisibilityConfig,
  type SaveConfigResponse,
  type GetConfigResponse,
  type ListConfigResponse,
} from "./save-config"

export {
  addTrackedKeyword,
  getTrackedKeywords,
  deleteTrackedKeyword,
  type KeywordResponse,
} from "./save-keyword"

export {
  runVisibilityCheck,
  checkPlatformNow,
  batchVisibilityCheck,
  type VisibilityActionResponse,
} from "./run-citation"

export {
  runFullScan,
  getScanHistory,
  getKeywordScanResult,
  getCreditBalance,
  type RunScanInput,
  type RunScanResult,
} from "./run-scan"

export {
  getVisibilityDashboardData,
  type DashboardDataResponse,
} from "./get-dashboard-data"
