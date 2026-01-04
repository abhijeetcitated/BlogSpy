// ============================================
// KEYWORD TABLE - Sub-components Index
// ============================================

// Core table components
export { KeywordTableHeader } from "./KeywordTableHeader"
export { KeywordTableFooter } from "./KeywordTableFooter"
export { KeywordTable } from "./KeywordTable"
export { KeywordTableRow } from "./KeywordTableRow"
export type { KeywordTableProps } from "./KeywordTable"

// TanStack Table v8 Component (NEW)
export { KeywordDataTable } from "./KeywordDataTable"
export type { KeywordDataTableProps } from "./KeywordDataTable"

// TanStack Table Column Definitions
export { createColumns, defaultColumns } from "./columns/columns"

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
