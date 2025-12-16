// Cannibalization Feature - Main Barrel Export

export { CannibalizationContent } from "./cannibalization-content"

// Types
export type {
  CannibalizationSeverity,
  CannibalizationType,
  CannibalizationAction,
  CannibalizingPage,
  CannibalizationIssue,
  CannibalizationAnalysis,
  CannibalizationTrend,
  FixSuggestion,
  SortField,
  SortDirection,
  FilterSeverity,
} from "./types"

// Components
export {
  HealthScoreRing,
  SeverityBadge,
  IssueCard,
  PageHeader,
  SummaryCards,
  Filters,
  IssueList,
  SummaryFooter,
} from "./components"

// Utils
export {
  getSeverityColor,
  getSeverityBgColor,
  getSeverityBadgeColor,
  getActionLabel,
  getActionDescription,
  getTypeLabel,
  getHealthScoreColor,
  getHealthScoreLabel,
  calculateSeverity,
  calculateOverlapScore,
  calculateTrafficLoss,
  sortIssues,
  filterIssues,
  generateFixSuggestion,
} from "./utils/cannibalization-utils"

// Constants
export {
  SEVERITY_ORDER,
  ALL_SEVERITIES,
  SORT_OPTIONS,
  SEMANTIC_GROUPS,
  KEYWORD_VOLUMES,
  MOCK_PAGES,
} from "./constants"

// Mock Data
export {
  generateMockCannibalizationAnalysis,
  getCannibalizationTrend,
} from "./__mocks__/cannibalization-data"
