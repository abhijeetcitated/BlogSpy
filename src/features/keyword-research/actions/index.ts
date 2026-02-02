// ============================================
// KEYWORD MAGIC - Actions Barrel Export
// ============================================
// NOTE: search.action.ts removed - use fetchKeywords instead

export { 
  fetchKeywords, 
  bulkSearchKeywords,
  type FetchKeywordsResult,
  type BulkSearchResult,
} from "./fetch-keywords"
export { fetchAmazonData, type FetchAmazonDataAction } from "./fetch-drawer-data"
export { fetchSocialIntel, type FetchSocialIntelResponse } from "./fetch-social-intel"
export { checkTaskStatus, type CheckTaskStatusResponse } from "./check-task-status"
export { refreshKeyword, type RefreshKeywordResponse } from "./refresh-keyword"
export { getUserCreditsAction } from "./refresh-keyword"
export { refreshBulkKeywords, type RefreshBulkKeywordsResponse } from "./refresh-bulk"
export {
  saveFilterPreset,
  getFilterPresets,
  deleteFilterPreset,
  setDefaultPreset,
  type SaveFilterPresetResult,
  type GetFilterPresetsResult,
  type DeleteFilterPresetResult,
  type SetDefaultPresetResult,
} from "./filter-presets"
