/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * AI VISIBILITY SERVICES - Barrel Export
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 */

export { AuditService, createAuditService } from "./audit.service"
export { DefenseService, createDefenseService, type BrandFacts } from "./defense.service"
export { TrackerService, createTrackerService } from "./tracker.service"
export {
  checkCitationOnPlatform,
  runFullVisibilityCheck,
  quickPlatformCheck,
  type PlatformCheckInput,
  type PlatformCheckResult,
  type FullVisibilityCheckInput,
  type FullVisibilityCheckResult,
} from "./citation.service"

export {
  ScanService,
  createScanService,
  type GoogleDataResult,
  type AIResponseResult,
  type VirtualPlatformResult,
  type FullScanResult,
  type TechAuditData,
} from "./scan.service"
