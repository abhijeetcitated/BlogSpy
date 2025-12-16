// ============================================
// AI WRITER - Feature Barrel Export
// ============================================

// Main component
export { AIWriterContent } from "./ai-writer-content"

// Types
export type {
  NLPKeyword,
  CriticalIssue,
  EditorStats,
  AIAction,
  CompetitorData,
} from "./types"

// Constants
export {
  INITIAL_NLP_KEYWORDS,
  CRITICAL_ISSUES_CONFIG,
  DEFAULT_EDITOR_STATS,
  COMPETITOR_DATA,
} from "./constants"

// Utils
export {
  analyzeEditorContent,
  updateNLPKeywordsUsage,
  calculateSEOScore,
  getScoreColor,
  getScoreGlow,
  generateSlug,
  generateExportHTML,
} from "./utils"

// Components
export {
  ImagePlaceholder,
  EditorToolbar,
  SelectionToolbar,
  SEOScoreGauge,
  AIWritingIndicator,
  ToastNotification,
  OptimizationTab,
  OutlineTab,
  CompetitorsTab,
} from "./components"
