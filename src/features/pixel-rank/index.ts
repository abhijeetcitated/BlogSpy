// ============================================
// PIXEL RANK - Public API
// ============================================

export {
  PixelRankBadge,
  PixelRankCard,
  PixelRankMini,
  PixelPositionIndicator,
} from "./components/pixel-rank-badge"

export {
  MiniSERPVisualizer,
  SERPStackVisualizer,
  SERPComparison,
  SERPFeaturesBreakdown,
  PixelRankSummary,
  SERP_ICONS,
  SERP_COLORS,
} from "./components/serp-visualizer"

export type {
  SERPElement,
  SERPLayout,
  PixelRankScore,
  SERPElementType,
  PixelRankGrade,
} from "./types/pixel.types"

export {
  calculatePixelRank,
  buildSERPLayout,
  generateMockPixelRank,
  analyzePixelRankTrend,
  getPixelRankRecommendations,
  comparePixelRank,
} from "./utils/pixel-calculator"
