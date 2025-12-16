// Cannibalization Services Barrel Export

export {
  cannibalizationService,
  fetchCannibalizationAnalysis,
  startCannibalizationScan,
  markIssueFix,
  ignoreIssue,
  performBulkAction,
  fetchHistory,
  exportCannibalizationReport,
} from "./cannibalization.service"

export type {
  ScanOptions,
  ScanProgress,
  FixIssuePayload,
  BulkActionPayload,
} from "./cannibalization.service"
