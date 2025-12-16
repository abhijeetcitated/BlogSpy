// ============================================
// CONTENT DECAY - Feature Barrel Export
// ============================================

// Main component
export { ContentDecayContent } from "./content-decay-content"

// Types
export type {
  DecayReason,
  DecayStatus,
  MatrixZone,
  AlertSeverity,
  AlertChannel,
  DecayArticle,
  MatrixPoint,
  RecoveredArticle,
  DecayAlert,
  AlertPreferences,
} from "./types"

// Constants
export {
  DECAY_REASON_DISPLAY,
  DEFAULT_ALERT_PREFS,
  ZONE_DOT_COLORS,
  ZONE_GLOW_COLORS,
  ALERT_SEVERITY_COLORS,
} from "./constants"

// Utils
export {
  generateMatrixPoints,
  getDecayReasonDisplay,
  filterCriticalArticles,
  filterWatchArticles,
  calculateTotalTrafficAtRisk,
  findArticleById,
} from "./utils"

// Components
export {
  DecaySparkline,
  ToastNotification,
  TriageHeader,
  AlertCenter,
  DecayMatrix,
  RevivalQueue,
  WatchList,
  RecoveredSection,
} from "./components"
