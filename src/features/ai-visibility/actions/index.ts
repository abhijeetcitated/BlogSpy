/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * AI VISIBILITY ACTIONS - Barrel Export
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 */

export {
  runTechAudit,
  checkRobotsTxt,
  checkLlmsTxt,
  checkSchemaOrg,
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
  type SaveConfigInput,
  type SaveConfigResponse,
  type GetConfigResponse,
} from "./save-config"

export {
  addTrackedKeyword,
  getTrackedKeywords,
  deleteTrackedKeyword,
  type AddKeywordInput,
  type KeywordResponse,
} from "./save-keyword"

export {
  runVisibilityCheck,
  checkPlatformNow,
  batchVisibilityCheck,
  type RunVisibilityCheckInput,
  type CheckPlatformInput,
  type VisibilityActionResponse,
} from "./run-citation"
