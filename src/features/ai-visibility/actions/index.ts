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

export {
  runDefenseCheck,
  checkPlatformVisibility,
  batchCheckVisibility,
} from "./run-defense"

export {
  checkGoogleAIO,
  getRanking,
  getRankings,
  checkCitations,
  checkSiriReadiness,
} from "./run-tracker"

export {
  saveVisibilityConfig,
  getVisibilityConfig,
  deleteVisibilityConfig,
  type SaveConfigResponse,
  type GetConfigResponse,
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
