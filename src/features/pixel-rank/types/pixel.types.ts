// ============================================
// PIXEL RANK TYPES
// ============================================
// Pixel-based ranking metrics for SERP visibility
// Traditional rank (#1, #2) doesn't show real visibility
// Pixel rank shows actual scroll distance to see result
// ============================================

/**
 * SERP Element Types that appear above organic results
 */
export type SERPElementType = 
  | "ai_overview"      // Google AI Overview (SGE)
  | "featured_snippet" // Featured Snippet box
  | "people_also_ask"  // PAA accordion
  | "video_carousel"   // Video results carousel
  | "image_pack"       // Image pack results
  | "local_pack"       // Local 3-pack (maps)
  | "shopping_ads"     // Shopping carousel
  | "top_ads"          // Top text ads
  | "knowledge_panel"  // Right sidebar panel
  | "top_stories"      // News carousel
  | "organic"          // Regular organic result
  | "site_links"       // Expanded sitelinks
  | "bottom_ads"       // Bottom text ads

/**
 * Individual SERP Element with pixel position
 */
export interface SERPElement {
  type: SERPElementType
  pixelStart: number    // Where element starts (px from top)
  pixelEnd: number      // Where element ends
  height: number        // Total height in pixels
  position?: number     // Organic position (1-10) if applicable
  isYourSite?: boolean  // Is this your website?
  title?: string        // Element title/heading
  domain?: string       // Domain if applicable
}

/**
 * Complete SERP Layout Analysis
 */
export interface SERPLayout {
  keyword: string
  totalHeight: number           // Total SERP height
  viewportHeight: number        // Standard viewport (800px)
  elements: SERPElement[]       // All SERP elements
  yourPosition?: number         // Your organic rank (1-10)
  yourPixelRank: number         // Your pixel position
  aboveFoldElements: number     // Elements visible without scroll
  requiresScroll: boolean       // Need to scroll to see your result
  scrollDepth: number           // How many px to scroll
}

/**
 * Pixel Rank Score with visibility grade
 */
export interface PixelRankScore {
  pixelPosition: number         // Absolute pixel position
  visibilityScore: number       // 0-100 visibility score
  grade: PixelRankGrade         // Letter grade
  foldStatus: "above" | "below" | "partial" // Fold position
  competingElements: SERPElementType[] // What's above you
  estimatedCTR: number          // Estimated click-through rate
  organicRank: number           // Traditional rank position
}

/**
 * Pixel Rank Grade based on visibility
 */
export type PixelRankGrade = "A+" | "A" | "B" | "C" | "D" | "F"

/**
 * Pixel Rank Thresholds
 */
export const PIXEL_THRESHOLDS = {
  EXCELLENT: 200,    // A+ grade - Top of page
  GREAT: 400,        // A grade - Above fold
  GOOD: 600,         // B grade - Near fold
  FAIR: 800,         // C grade - Just below fold
  POOR: 1200,        // D grade - Requires scroll
  TERRIBLE: 1600,    // F grade - Deep scroll needed
} as const

/**
 * Average heights for SERP elements (pixels)
 */
export const SERP_ELEMENT_HEIGHTS = {
  ai_overview: 320,       // AI Overview is massive
  featured_snippet: 180,  // Featured snippet box
  people_also_ask: 200,   // PAA with 4 questions
  video_carousel: 220,    // Video carousel
  image_pack: 180,        // Image pack row
  local_pack: 280,        // Local 3-pack with map
  shopping_ads: 160,      // Shopping carousel
  top_ads: 120,           // Per ad (avg 2-4 ads)
  knowledge_panel: 400,   // Sidebar panel
  top_stories: 200,       // News carousel
  organic: 100,           // Single organic result
  site_links: 180,        // Expanded sitelinks
  bottom_ads: 100,        // Bottom ad
} as const

/**
 * Estimated CTR by pixel position
 */
export const PIXEL_CTR_MAP: Record<number, number> = {
  100: 0.35,   // 35% CTR at 100px
  200: 0.28,   // 28% CTR at 200px
  300: 0.22,   // 22% CTR
  400: 0.15,   // 15% CTR
  500: 0.10,   // 10% CTR
  600: 0.07,   // 7% CTR
  800: 0.04,   // 4% CTR
  1000: 0.02,  // 2% CTR
  1200: 0.01,  // 1% CTR
  1500: 0.005, // 0.5% CTR
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get grade based on pixel position
 */
export function getPixelRankGrade(pixelPosition: number): PixelRankGrade {
  if (pixelPosition <= PIXEL_THRESHOLDS.EXCELLENT) return "A+"
  if (pixelPosition <= PIXEL_THRESHOLDS.GREAT) return "A"
  if (pixelPosition <= PIXEL_THRESHOLDS.GOOD) return "B"
  if (pixelPosition <= PIXEL_THRESHOLDS.FAIR) return "C"
  if (pixelPosition <= PIXEL_THRESHOLDS.POOR) return "D"
  return "F"
}

/**
 * Get visibility score (0-100) from pixel position
 */
export function getVisibilityScore(pixelPosition: number): number {
  // Max score at 0px, decreases as pixel position increases
  // Score 100 at 0px, score 0 at 2000px+
  const maxPixels = 2000
  const score = Math.max(0, 100 - (pixelPosition / maxPixels) * 100)
  return Math.round(score)
}

/**
 * Get color class based on pixel rank grade
 */
export function getPixelRankColor(grade: PixelRankGrade): string {
  const colors: Record<PixelRankGrade, string> = {
    "A+": "text-emerald-400",
    "A": "text-emerald-400",
    "B": "text-cyan-400",
    "C": "text-amber-400",
    "D": "text-orange-400",
    "F": "text-red-400",
  }
  return colors[grade]
}

/**
 * Get background color class based on pixel rank grade
 */
export function getPixelRankBgColor(grade: PixelRankGrade): string {
  const colors: Record<PixelRankGrade, string> = {
    "A+": "bg-emerald-500/20 border-emerald-500/30",
    "A": "bg-emerald-500/20 border-emerald-500/30",
    "B": "bg-cyan-500/20 border-cyan-500/30",
    "C": "bg-amber-500/20 border-amber-500/30",
    "D": "bg-orange-500/20 border-orange-500/30",
    "F": "bg-red-500/20 border-red-500/30",
  }
  return colors[grade]
}

/**
 * Get fold status based on pixel position
 */
export function getFoldStatus(pixelPosition: number, viewportHeight = 800): "above" | "below" | "partial" {
  if (pixelPosition + 100 <= viewportHeight) return "above"
  if (pixelPosition >= viewportHeight) return "below"
  return "partial"
}

/**
 * Estimate CTR based on pixel position
 */
export function estimateCTR(pixelPosition: number): number {
  // Find the closest threshold
  const thresholds = Object.keys(PIXEL_CTR_MAP).map(Number).sort((a, b) => a - b)
  
  for (let i = 0; i < thresholds.length; i++) {
    if (pixelPosition <= thresholds[i]) {
      return PIXEL_CTR_MAP[thresholds[i]]
    }
  }
  
  return 0.005 // Minimum CTR for deep positions
}

/**
 * Get SERP element display name
 */
export function getSERPElementName(type: SERPElementType): string {
  const names: Record<SERPElementType, string> = {
    ai_overview: "AI Overview",
    featured_snippet: "Featured Snippet",
    people_also_ask: "People Also Ask",
    video_carousel: "Videos",
    image_pack: "Images",
    local_pack: "Local Pack",
    shopping_ads: "Shopping",
    top_ads: "Ads",
    knowledge_panel: "Knowledge Panel",
    top_stories: "Top Stories",
    organic: "Organic",
    site_links: "Sitelinks",
    bottom_ads: "Bottom Ads",
  }
  return names[type]
}

/**
 * Get SERP element icon name (for lucide-react)
 */
export function getSERPElementIcon(type: SERPElementType): string {
  const icons: Record<SERPElementType, string> = {
    ai_overview: "Sparkles",
    featured_snippet: "FileText",
    people_also_ask: "HelpCircle",
    video_carousel: "Video",
    image_pack: "Image",
    local_pack: "MapPin",
    shopping_ads: "ShoppingCart",
    top_ads: "DollarSign",
    knowledge_panel: "Info",
    top_stories: "Newspaper",
    organic: "Globe",
    site_links: "Link",
    bottom_ads: "DollarSign",
  }
  return icons[type]
}
