import { detectTrafficStealers, type TrafficStealers } from "./serp-parser"

export type RtvBreakdownItem = {
  label: string;
  /** Loss contribution in percentage points (0..100). */
  value: number;
};

export type RtvResult = {
  rtv: number;
  /** Total loss as a fraction (0..1). */
  lossPercentage: number;
  breakdown: RtvBreakdownItem[];
};

export type SerpFeatureInput =
  | string
  | string[]
  | Record<string, unknown>
  | null
  | undefined;

function normalizeSerpFeatures(input: unknown): SerpFeatureInput {
  if (input == null) return undefined;
  if (typeof input === "string") return input;
  if (Array.isArray(input)) return input.map((v) => String(v));
  if (typeof input === "object") return input as Record<string, unknown>;
  return undefined;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function roundInt(n: number): number {
  return Math.round(n);
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
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
    // Supports both boolean flags (e.g. { ai_overview: true })
    // and rich objects (e.g. { type: 'ai_overview', ... }).
    const record = features as Record<string, unknown>;

    if (k in record) {
      return Boolean(record[k]);
    }

    return Object.entries(record).some(([name, v]) => {
      if (name.toLowerCase().includes(k)) return Boolean(v);
      if (typeof v === "string") return v.toLowerCase().includes(k);
      return false;
    });
  }

  return false;
}

export type RtvInputs = {
  volume: number;
  cpc?: number | null;
  /**
   * Accepts flexible inputs from multiple sources:
   * - string (e.g. "ai_overview")
   * - string[]
   * - record/flags
   */
  serpFeatures?: unknown;
};

/**
 * Calculate Realizable Traffic Value (RTV) from raw SERP items
 *
 * Clean API that accepts raw SERP items array directly.
 * Uses detectTrafficStealers() for feature detection.
 *
 * @param volume - Search volume for the keyword
 * @param serpItems - Raw SERP items array from DataForSEO
 * @param cpc - Cost per click (optional, used to detect paid competition)
 * @returns RTV calculation result with breakdown
 */
export function calculateRTV(volume: number, serpItems: unknown[], cpc: number = 0): RtvResult {
  const vol = Math.max(0, Number.isFinite(volume) ? volume : 0)
  const cost = Number.isFinite(cpc) ? cpc : 0
  
  // Detect traffic-stealing features
  const stealers = detectTrafficStealers(Array.isArray(serpItems) ? serpItems : [])
  
  const breakdown: RtvBreakdownItem[] = []
  let loss = 0
  
  // Apply loss rules
  if (stealers.hasAIO) {
    loss += 0.5  // 50%
    breakdown.push({ label: "AI Overview", value: 50 })
  }
  
  if (stealers.hasLocal) {
    loss += 0.3  // 30%
    breakdown.push({ label: "Local Map Pack", value: 30 })
  }
  
  // Featured Snippet: Only if NO AI Overview
  if (stealers.hasSnippet && !stealers.hasAIO) {
    loss += 0.2  // 20%
    breakdown.push({ label: "Featured Snippet", value: 20 })
  }
  
  // Paid Ads: Either explicit ads OR high CPC
  if (stealers.hasAds || cost > 1.0) {
    loss += 0.15  // 15%
    breakdown.push({ label: "Paid Ads / Shopping", value: 15 })
  }
  
  if (stealers.hasVideo) {
    loss += 0.1  // 10%
    breakdown.push({ label: "Video Carousel", value: 10 })
  }
  
  // Cap at 85%
  const cappedLoss = Math.min(loss, 0.85)
  
  // Scale breakdown if we hit the cap
  const scale = loss > 0 ? cappedLoss / loss : 1
  const scaledBreakdown = breakdown
    .map((b) => ({ ...b, value: Math.round(b.value * scale) }))
    .filter((b) => b.value > 0)
  
  const rtv = Math.round(vol * (1 - cappedLoss))
  
  return {
    rtv,
    lossPercentage: cappedLoss,
    breakdown: scaledBreakdown,
  }
}

/**
 * RTV = Volume × (1 − TotalLoss)
 *
 * Legacy flexible API that accepts various input formats.
 *
 * @deprecated Use calculateRTV() instead for cleaner API
 *
 * Designed to match (and be resilient to) DataForSEO-like keys.
 * Accepted inputs:
 * - volume: number
 * - cpc: number | null
 * - serpFeatures: string[] (or other flexible shapes; normalized internally)
 *
 * Loss rules:
 * - "ai_overview" => 50%
 * - "featured_snippet" => 20%
 * - "video" OR "video_carousel" => 10%
 * - "paid" OR cpc > 1 => 15%
 */
export function calculateRtv(inputs: RtvInputs): RtvResult {
  const volume = Math.max(0, toFiniteNumber(inputs.volume, 0));
  const cpc = toFiniteNumber(inputs.cpc, 0);
  const serp = normalizeSerpFeatures(inputs.serpFeatures);

  // AI Overview: -50% (sabse bada traffic chor)
  const hasAi =
    hasSerpFeature(serp, "ai_overview") ||
    hasSerpFeature(serp, "ai overview") ||
    hasSerpFeature(serp, "aio");

  // Local Map Pack: -30% (user dukaan dhundh raha hai)
  const hasLocalPack =
    hasSerpFeature(serp, "local_pack") ||
    hasSerpFeature(serp, "local pack") ||
    hasSerpFeature(serp, "local_map") ||
    hasSerpFeature(serp, "maps");

  // Featured Snippet: -20% (Position 0)
  const hasSnippet =
    hasSerpFeature(serp, "featured_snippet") ||
    hasSerpFeature(serp, "featured snippet");

  // Paid Ads / Shopping: -15%
  const hasPaidFeature = 
    hasSerpFeature(serp, "paid") ||
    hasSerpFeature(serp, "shopping") ||
    hasSerpFeature(serp, "shopping_ads") ||
    hasSerpFeature(serp, "top_ads");
  const hasAds = hasPaidFeature || cpc > 1;

  // Video Carousel: -10%
  const hasVideo =
    hasSerpFeature(serp, "video_carousel") ||
    hasSerpFeature(serp, "video");

  const breakdown: RtvBreakdownItem[] = [];

  let loss = 0;

  // Loss percentages based on SEO research
  if (hasAi) {
    loss += 0.5;  // 50%
    breakdown.push({ label: "AI Overview", value: 50 });
  }

  if (hasLocalPack) {
    loss += 0.3;  // 30%
    breakdown.push({ label: "Local Map Pack", value: 30 });
  }

  // Featured Snippet: Only add loss if NO AI Overview present (per spec)
  if (hasSnippet && !hasAi) {
    loss += 0.2;  // 20%
    breakdown.push({ label: "Featured Snippet", value: 20 });
  }

  if (hasAds) {
    loss += 0.15;  // 15%
    breakdown.push({ label: "Paid Ads / Shopping", value: 15 });
  }

  if (hasVideo) {
    loss += 0.1;  // 10%
    breakdown.push({ label: "Video Carousel", value: 10 });
  }

  // Maximum cap at 85% (traffic kabhi pura 0 nahi hota)
  const cappedLoss = clamp(loss, 0, 0.85);

  // If we hit the cap, scale breakdown down proportionally to keep sums consistent.
  const scale = loss > 0 ? cappedLoss / loss : 1;
  const scaledBreakdown = breakdown
    .map((b) => ({ ...b, value: roundInt(b.value * scale) }))
    .filter((b) => b.value > 0);

  const rtv = roundInt(volume * (1 - cappedLoss));

  return {
    rtv,
    lossPercentage: cappedLoss,
    breakdown: scaledBreakdown,
  };
}
