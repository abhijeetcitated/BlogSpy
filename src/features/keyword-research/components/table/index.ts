// ============================================
// KEYWORD TABLE - Sub-components Index
// ============================================

// Core table components
export { KeywordTableFooter } from "./KeywordTableFooter"
export { KeywordTable } from "./KeywordTable"
export type { KeywordTableProps } from "./KeywordTable"

// TanStack Table Column Definitions
// NOTE: `createColumns()` column factory was removed after confirming zero repo usage.

// Utilities - now in utils/ folder
// export { generateKeywordCSV, downloadKeywordsCSV } from "../../utils/export-utils"
// export { sortKeywords } from "../../utils/sort-utils"

// Action bar
export { ActionBar, BulkActions, SelectionInfo } from "./action-bar"

// Column components
export {
  CheckboxColumn,
  CheckboxHeader,
  KeywordColumn,
  VolumeColumn,
  KdColumn,
  CpcColumn,
  IntentColumn,
  TrendColumn,
  SerpColumn,
  GeoColumn,
  WeakSpotColumn,
  RefreshColumn,
  ActionsColumn,
} from "./columns"
