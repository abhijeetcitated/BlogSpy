/**
 * ============================================
 * NEWS TRACKER - API Types
 * ============================================
 * 
 * Type definitions for API requests, responses,
 * and third-party integrations.
 * 
 * @version 1.0.0
 */

// ============================================
// API REQUEST TYPES
// ============================================

/**
 * Base API request
 */
export interface BaseAPIRequest {
  timestamp: string
  requestId: string
  userId?: string
  apiKey?: string
}

/**
 * News tracking request
 */
export interface NewsTrackingRequest extends BaseAPIRequest {
  keywords: string[]
  platform: "google-news" | "google-discover" | "both"
  options?: {
    location?: string
    language?: string
    freshness?: "day" | "week" | "month"
    includeTopStories?: boolean
    maxResults?: number
  }
}

/**
 * Single keyword check request
 */
export interface SingleKeywordRequest {
  keyword: string
  platform: "google-news" | "google-discover"
  userId: string
  deductCredits?: boolean
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Base API response
 */
export interface BaseAPIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: APIError
  metadata: APIMetadata
}

/**
 * API error
 */
export interface APIError {
  code: string
  message: string
  details?: Record<string, unknown>
  retryable: boolean
  retryAfter?: number // seconds
}

/**
 * API metadata
 */
export interface APIMetadata {
  requestId: string
  timestamp: string
  processingTime: number // ms
  creditsUsed: number
  remainingCredits: number
  rateLimit: {
    limit: number
    remaining: number
    resetAt: string
  }
}

// ============================================
// DATAFORSEO API TYPES
// ============================================

/**
 * DataForSEO Task Post Request
 */
export interface DataForSEOTaskRequest {
  keyword: string
  location_code?: number
  language_code?: string
  depth?: number
  search_param?: string
  tag?: string
}

/**
 * DataForSEO News SERP Response
 */
export interface DataForSEONewsResponse {
  version: string
  status_code: number
  status_message: string
  time: string
  cost: number
  tasks_count: number
  tasks_error: number
  tasks: DataForSEOTask[]
}

/**
 * DataForSEO Task
 */
export interface DataForSEOTask {
  id: string
  status_code: number
  status_message: string
  time: string
  cost: number
  result_count: number
  path: string[]
  data: {
    api: string
    function: string
    keyword: string
  }
  result: DataForSEONewsResult[]
}

/**
 * DataForSEO News Result
 */
export interface DataForSEONewsResult {
  keyword: string
  type: string
  se_domain: string
  location_code: number
  language_code: string
  check_url: string
  datetime: string
  spell: null | object
  item_types: string[]
  items_count: number
  items: DataForSEONewsItem[]
}

/**
 * DataForSEO News Item
 */
export interface DataForSEONewsItem {
  type: string
  rank_group: number
  rank_absolute: number
  position: string
  xpath: string
  domain: string
  title: string
  url: string
  source: string
  date: string
  amp_version: boolean
  snippet: string
  rectangle?: {
    x: number
    y: number
    width: number
    height: number
  }
  image_url?: string
}

// ============================================
// TRANSFORMED DATA TYPES
// ============================================

/**
 * Normalized news result (our format)
 */
export interface NormalizedNewsResult {
  id: string
  keyword: string
  platform: "google-news" | "google-discover"
  items: NormalizedNewsItem[]
  totalResults: number
  checkDate: string
  cost: number
  processingTime: number
}

/**
 * Normalized news item (our format)
 */
export interface NormalizedNewsItem {
  id: string
  position: number
  title: string
  url: string
  source: string
  domain: string
  publishedAt: string
  snippet: string
  thumbnailUrl?: string
  isAMP: boolean
  isTopStory: boolean
  category?: string
}

// ============================================
// BATCH OPERATION TYPES
// ============================================

/**
 * Batch tracking request
 */
export interface BatchTrackingRequest {
  userId: string
  keywords: string[]
  platform: "google-news" | "google-discover" | "both"
  priority?: "standard" | "priority" | "live"
  webhookUrl?: string
}

/**
 * Batch tracking response
 */
export interface BatchTrackingResponse {
  success: boolean
  batchId: string
  totalKeywords: number
  estimatedCredits: number
  estimatedTime: number // seconds
  status: "queued" | "processing" | "completed" | "failed"
  results?: NormalizedNewsResult[]
  error?: APIError
}

/**
 * Batch status
 */
export interface BatchStatus {
  batchId: string
  status: "queued" | "processing" | "completed" | "failed" | "partial"
  progress: number // 0-100
  processedCount: number
  totalCount: number
  successCount: number
  failedCount: number
  creditsUsed: number
  startedAt?: string
  completedAt?: string
  results?: NormalizedNewsResult[]
  errors?: APIError[]
}

// ============================================
// WEBHOOK TYPES
// ============================================

/**
 * Webhook payload
 */
export interface WebhookPayload {
  event: "batch.completed" | "batch.failed" | "credit.low" | "keyword.alert"
  timestamp: string
  data: unknown
  signature: string
}

// ============================================
// RATE LIMIT TYPES
// ============================================

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  userId: string
  endpoint: string
  limit: number
  remaining: number
  resetAt: string
  isLimited: boolean
}
