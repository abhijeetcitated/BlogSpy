// ============================================================
// RTV (Realizable Traffic Value) Calculator
// ============================================================
// Search volume is misleading - AI Overview, Featured Snippets,
// Local Pack, Ads all steal clicks before organic results.
// RTV = Volume × (1 - TotalLoss%)
// ============================================================

/**
 * RTV Breakdown Item with UI metadata
 */
export type RtvBreakdownItem = {
  /** Display label (e.g. "AI Overview") */
  label: string;
  /** Loss percentage as negative number (e.g. -50) */
  value: number;
  /** Icon identifier for UI: "bot" | "map" | "snippet" | "ad" | "video" */
  icon: "bot" | "map" | "snippet" | "ad" | "video";
  /** Tailwind color class for UI */
  color: string;
};

export type RtvResult = {
  /** Realizable Traffic Value (actual achievable clicks) */
  rtv: number;
  /** Total loss as a fraction (0..0.85) */
  lossPercentage: number;
  /** Total loss as percentage points (0..85) */
  lossPercent: number;
  /** Breakdown of losses with UI metadata */
  breakdown: RtvBreakdownItem[];
};

export type SerpFeatureInput =
  | string
  | string[]
  | Record<string, unknown>
  | null
  | undefined;

// ============================================================
// LOSS RULES (Strict Math)
// ============================================================
// - ai_overview         => 50%
// - local_pack          => 30%
// - featured_snippet    => 20% (ignored if AI exists)
// - paid/shopping/cpc>1 => 15%
// - video               => 10%
// - MAX TOTAL CAP       => 85%
// ============================================================

const LOSS_RULES = {
  ai_overview: { loss: 50, label: "AI Overview", icon: "bot" as const, color: "text-red-500" },
  local_pack: { loss: 30, label: "Local Map Pack", icon: "map" as const, color: "text-orange-500" },
  featured_snippet: { loss: 20, label: "Featured Snippet", icon: "snippet" as const, color: "text-amber-500" },
  paid_ads: { loss: 15, label: "Paid Ads / Shopping", icon: "ad" as const, color: "text-pink-500" },
  video: { loss: 10, label: "Video Carousel", icon: "video" as const, color: "text-yellow-500" },
} as const;

const MAX_LOSS_CAP = 85;

// ============================================================
// Helper Functions
// ============================================================

function toFiniteNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSerpFeatures(input: unknown): SerpFeatureInput {
  if (input == null) return undefined;
  if (typeof input === "string") return input;
  if (Array.isArray(input)) return input.map((v) => String(v));
  if (typeof input === "object") return input as Record<string, unknown>;
  return undefined;
}

function hasSerpFeature(features: SerpFeatureInput, key: string): boolean {
  const k = key.toLowerCase();
  if (!features) return false;

  if (typeof features === "string") {
    return features.toLowerCase().includes(k);
  }

  if (Array.isArray(features)) {
    return features.some((s) => String(s).toLowerCase().includes(k));
  }

  if (typeof features === "object") {
    const record = features as Record<string, unknown>;
    if (k in record) return Boolean(record[k]);
    return Object.entries(record).some(([name, v]) => {
      if (name.toLowerCase().includes(k)) return Boolean(v);
      if (typeof v === "string") return v.toLowerCase().includes(k);
      return false;
    });
  }

  return false;
}

// ============================================================
// CORE RTV CALCULATOR
// ============================================================

export type RtvInputs = {
  volume: number;
  cpc?: number | null;
  serpFeatures?: unknown;
};

/**
 * Calculate Realizable Traffic Value (RTV)
 * 
 * RTV = Volume × (1 - TotalLoss%)
 * 
 * @param inputs - Object with volume, cpc, and serpFeatures
 * @returns RtvResult with rtv, lossPercentage, lossPercent, and breakdown
 * 
 * Loss Rules:
 * - ai_overview         => 50%
 * - local_pack          => 30%
 * - featured_snippet    => 20% (ignored if AI exists)
 * - paid/shopping/cpc>1 => 15%
 * - video               => 10%
 * - MAX TOTAL CAP       => 85%
 */
export function calculateRtv(inputs: RtvInputs): RtvResult {
  const volume = Math.max(0, toFiniteNumber(inputs.volume, 0));
  const cpc = toFiniteNumber(inputs.cpc, 0);
  const serp = normalizeSerpFeatures(inputs.serpFeatures);

  // Detect SERP features
  const hasAi =
    hasSerpFeature(serp, "ai_overview") ||
    hasSerpFeature(serp, "ai overview") ||
    hasSerpFeature(serp, "aio");

  const hasLocalPack =
    hasSerpFeature(serp, "local_pack") ||
    hasSerpFeature(serp, "local pack") ||
    hasSerpFeature(serp, "local_map") ||
    hasSerpFeature(serp, "maps");

  const hasSnippet =
    hasSerpFeature(serp, "featured_snippet") ||
    hasSerpFeature(serp, "featured snippet");

  const hasPaidFeature =
    hasSerpFeature(serp, "paid") ||
    hasSerpFeature(serp, "shopping") ||
    hasSerpFeature(serp, "shopping_ads") ||
    hasSerpFeature(serp, "top_ads");
  const hasAds = hasPaidFeature || cpc > 1;

  const hasVideo =
    hasSerpFeature(serp, "video_carousel") ||
    hasSerpFeature(serp, "video");

  // Build breakdown with strict loss rules
  const breakdown: RtvBreakdownItem[] = [];
  let totalLoss = 0;

  // AI Overview: -50%
  if (hasAi) {
    totalLoss += LOSS_RULES.ai_overview.loss;
    breakdown.push({
      label: LOSS_RULES.ai_overview.label,
      value: -LOSS_RULES.ai_overview.loss,
      icon: LOSS_RULES.ai_overview.icon,
      color: LOSS_RULES.ai_overview.color,
    });
  }

  // Local Map Pack: -30%
  if (hasLocalPack) {
    totalLoss += LOSS_RULES.local_pack.loss;
    breakdown.push({
      label: LOSS_RULES.local_pack.label,
      value: -LOSS_RULES.local_pack.loss,
      icon: LOSS_RULES.local_pack.icon,
      color: LOSS_RULES.local_pack.color,
    });
  }

  // Featured Snippet: -20% (ONLY if no AI Overview)
  if (hasSnippet && !hasAi) {
    totalLoss += LOSS_RULES.featured_snippet.loss;
    breakdown.push({
      label: LOSS_RULES.featured_snippet.label,
      value: -LOSS_RULES.featured_snippet.loss,
      icon: LOSS_RULES.featured_snippet.icon,
      color: LOSS_RULES.featured_snippet.color,
    });
  }

  // Paid Ads / Shopping: -15%
  if (hasAds) {
    totalLoss += LOSS_RULES.paid_ads.loss;
    breakdown.push({
      label: LOSS_RULES.paid_ads.label,
      value: -LOSS_RULES.paid_ads.loss,
      icon: LOSS_RULES.paid_ads.icon,
      color: LOSS_RULES.paid_ads.color,
    });
  }

  // Video Carousel: -10%
  if (hasVideo) {
    totalLoss += LOSS_RULES.video.loss;
    breakdown.push({
      label: LOSS_RULES.video.label,
      value: -LOSS_RULES.video.loss,
      icon: LOSS_RULES.video.icon,
      color: LOSS_RULES.video.color,
    });
  }

  // Cap at 85%
  const cappedLoss = Math.min(totalLoss, MAX_LOSS_CAP);

  // Scale breakdown if we hit the cap
  let scaledBreakdown = breakdown;
  if (totalLoss > MAX_LOSS_CAP && totalLoss > 0) {
    const scale = cappedLoss / totalLoss;
    scaledBreakdown = breakdown.map((b) => ({
      ...b,
      value: -Math.round(Math.abs(b.value) * scale),
    }));
  }

  // Calculate RTV
  const rtv = Math.floor(volume * (1 - cappedLoss / 100));

  return {
    rtv,
    lossPercentage: cappedLoss / 100,
    lossPercent: cappedLoss,
    breakdown: scaledBreakdown,
  };
}

/**
 * Calculate RTV from raw SERP items array
 * 
 * Uses detectTrafficStealers() for feature detection from DataForSEO response.
 * 
 * @param volume - Search volume for the keyword
 * @param serpItems - Raw SERP items array from DataForSEO
 * @param cpc - Cost per click (optional)
 * @returns RtvResult with breakdown
 */
export function calculateRTV(volume: number, serpItems: unknown[], cpc: number = 0): RtvResult {
  const vol = Math.max(0, Number.isFinite(volume) ? volume : 0);
  const cost = Number.isFinite(cpc) ? cpc : 0;

  // Detect traffic-stealing features from SERP items inline
  // (avoids circular dependency with serp-parser)
  const items = Array.isArray(serpItems) ? serpItems : [];
  
  let hasAIO = false;
  let hasLocal = false;
  let hasSnippet = false;
  let hasAds = false;
  let hasVideo = false;

  for (const item of items) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;
    const itemType = String(obj.type || "").toLowerCase();
    
    if (itemType.includes("ai_overview") || itemType.includes("ai overview")) hasAIO = true;
    if (itemType.includes("local_pack") || itemType.includes("local pack") || itemType.includes("maps")) hasLocal = true;
    if (itemType.includes("featured_snippet") || itemType.includes("featured snippet")) hasSnippet = true;
    if (itemType.includes("paid") || itemType.includes("shopping") || itemType.includes("ads")) hasAds = true;
    if (itemType.includes("video")) hasVideo = true;
  }

  // Convert detections to serpFeatures array
  const serpFeatures: string[] = [];
  if (hasAIO) serpFeatures.push("ai_overview");
  if (hasLocal) serpFeatures.push("local_pack");
  if (hasSnippet) serpFeatures.push("featured_snippet");
  if (hasAds) serpFeatures.push("paid");
  if (hasVideo) serpFeatures.push("video");

  // Use main calculator
  return calculateRtv({
    volume: vol,
    cpc: cost,
    serpFeatures,
  });
}