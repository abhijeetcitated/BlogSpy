/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * AI VISIBILITY SERVICES - Barrel Export
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * DELETED (2026-02-08): scan.service, citation.service, defense.service
 * Reason: OpenRouter-dependent, replaced by DataForSEO-only architecture
 * Backups: backups/2026-02-08_ai-visibility-delete/
 * 
 * ADDED (2026-02-08): dataforseo-visibility.service — core engine using DataForSEO APIs
 */

export { AuditService, createAuditService } from "./audit.service"
export { TrackerService, createTrackerService } from "./tracker.service"
export {
  runVisibilityScan,
  checkSinglePlatform,
  type VisibilityScanInput,
  type VisibilityScanResult,
} from "./dataforseo-visibility.service"
