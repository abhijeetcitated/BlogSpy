export const FEATURE_FLAGS = {
  // ❌ OFF (DISABLED as per specific list)
  NEWS_TRACKER: false,
  COMMUNITY_TRACKER: false,
  SOCIAL_TRACKER: false,
  COMMERCE_TRACKER: false,
  AI_WRITER: false,
  SNIPPET_STEALER: false,
  ON_PAGE_CHECKER: false,
  AFFILIATE_FINDER: false,
  API_KEYS: false,

  // ✅ ON (EVERYTHING ELSE STAYS ACTIVE)
  KEYWORD_MAGIC: true,
  KEYWORD_OVERVIEW: true,
  TREND_SPOTTER: true,
  COMPETITOR_GAP: true,
  VIDEO_HIJACK: true,
  AI_VISIBILITY: false, // (Am I Cited)
  TOPIC_CLUSTERS: true,
  CONTENT_ROADMAP: false,
  RANK_TRACKER: true,
  CONTENT_DECAY: true,
  CANNIBALIZATION: true,
  SCHEMA_GENERATOR: false,
  CONTENT_CALENDAR: true,
  CONTENT_ROI: false,
  EARNINGS_CALC: false,
  SETTINGS: true,
  INTEGRATIONS: true,
  NOTIFICATIONS: true,
  COMMAND_PALETTE: true
} as const;
