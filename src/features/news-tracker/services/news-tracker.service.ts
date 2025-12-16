/**
 * ============================================
 * NEWS TRACKER - API SERVICE
 * ============================================
 * 
 * Service for interacting with News/Discover APIs
 * Currently uses mock data, ready for real API integration
 * 
 * Integration Points (TODO):
 * 1. DataForSEO API - Primary (Cheapest)
 * 2. SerpAPI - Backup
 * 3. Bright Data - Enterprise
 * 
 * @version 1.0.0
 */

import { 
  NewsKeyword, 
  NewsArticle,
  DiscoverCard,
  NewsRankData,
  DiscoverRankData,
  NewsPlatform,
} from "../types"
import type {
  NewsTrackingRequest,
  BaseAPIResponse,
  NormalizedNewsResult,
  NormalizedNewsItem,
  BatchTrackingRequest,
  BatchTrackingResponse,
  BatchStatus,
  SingleKeywordRequest,
  DataForSEONewsResponse,
} from "../types/api.types"
import { generateMockNewsResults, generateMockDiscoverResults } from "../__mocks__"
import { BLOGSPY_API_CONFIG } from "../config"
import { rateLimiter } from "./rate-limiter.service"
import { securityService } from "./security.service"

// ============================================
// CONFIGURATION
// ============================================

const API_CONFIG = {
  // DataForSEO API (Primary - TO BE CONFIGURED)
  dataForSEO: {
    baseUrl: process.env.NEXT_PUBLIC_DATAFORSEO_API_URL || "https://api.dataforseo.com/v3",
    username: process.env.DATAFORSEO_USERNAME || "",
    password: process.env.DATAFORSEO_PASSWORD || "",
    endpoints: {
      newsTask: "/serp/google/news/task_post",
      newsResult: "/serp/google/news/task_get/advanced",
      newsLive: "/serp/google/news/live/advanced",
    },
  },
  
  // Mode: 'mock' | 'live'
  mode: (process.env.NEXT_PUBLIC_API_MODE as "mock" | "live") || "mock",
  
  // Request settings
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
}

// ============================================
// NEWS TRACKER SERVICE CLASS
// ============================================

class NewsTrackerService {
  private isInitialized = false
  private pendingBatches: Map<string, BatchStatus> = new Map()

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the service
   */
  private initialize(): void {
    if (this.isInitialized) return
    
    // Validate configuration
    if (API_CONFIG.mode === "live") {
      if (!API_CONFIG.dataForSEO.username || !API_CONFIG.dataForSEO.password) {
        console.warn("[NewsTrackerService] DataForSEO credentials not configured. Using mock mode.")
        API_CONFIG.mode = "mock"
      }
    }
    
    this.isInitialized = true
    console.log(`[NewsTrackerService] Initialized in ${API_CONFIG.mode} mode`)
  }

  // ============================================
  // SINGLE KEYWORD TRACKING
  // ============================================

  /**
   * Track a single keyword on a platform
   */
  async trackKeyword(request: SingleKeywordRequest): Promise<BaseAPIResponse<NormalizedNewsResult>> {
    const startTime = Date.now()
    const requestId = this.generateRequestId()

    try {
      // Security validation
      const sanitizedKeyword = securityService.sanitizeInput(request.keyword)
      if (!securityService.validateKeyword(sanitizedKeyword)) {
        return this.createErrorResponse(requestId, "INVALID_KEYWORD", "Invalid keyword format")
      }

      // Rate limiting check
      const rateLimitCheck = await rateLimiter.checkLimit(request.userId, "trackKeyword")
      if (!rateLimitCheck.allowed) {
        return this.createErrorResponse(
          requestId, 
          "RATE_LIMITED", 
          `Rate limit exceeded. Retry after ${rateLimitCheck.retryAfter}s`,
          true,
          rateLimitCheck.retryAfter
        )
      }

      // Execute tracking based on mode
      let result: NormalizedNewsResult

      if (API_CONFIG.mode === "live") {
        result = await this.fetchLiveNewsData(sanitizedKeyword, request.platform)
      } else {
        result = await this.fetchMockNewsData(sanitizedKeyword, request.platform)
      }

      const processingTime = Date.now() - startTime

      return {
        success: true,
        data: result,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime,
          creditsUsed: 1,
          remainingCredits: 0, // Will be updated by credit service
          rateLimit: rateLimitCheck.info,
        },
      }
    } catch (error) {
      console.error("[NewsTrackerService] trackKeyword error:", error)
      return this.createErrorResponse(
        requestId,
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Unknown error occurred"
      )
    }
  }

  // ============================================
  // BATCH TRACKING
  // ============================================

  /**
   * Track multiple keywords in batch
   */
  async trackBatch(request: BatchTrackingRequest): Promise<BatchTrackingResponse> {
    const batchId = this.generateBatchId()

    try {
      // Validate request
      if (!request.keywords.length) {
        return {
          success: false,
          batchId,
          totalKeywords: 0,
          estimatedCredits: 0,
          estimatedTime: 0,
          status: "failed",
          error: {
            code: "INVALID_REQUEST",
            message: "No keywords provided",
            retryable: false,
          },
        }
      }

      // Sanitize keywords
      const sanitizedKeywords = request.keywords
        .map(k => securityService.sanitizeInput(k))
        .filter(k => securityService.validateKeyword(k))

      if (!sanitizedKeywords.length) {
        return {
          success: false,
          batchId,
          totalKeywords: 0,
          estimatedCredits: 0,
          estimatedTime: 0,
          status: "failed",
          error: {
            code: "INVALID_KEYWORDS",
            message: "No valid keywords after sanitization",
            retryable: false,
          },
        }
      }

      // Calculate estimates
      const platformMultiplier = request.platform === "both" ? 2 : 1
      const estimatedCredits = sanitizedKeywords.length * platformMultiplier
      const estimatedTime = Math.ceil(sanitizedKeywords.length * 0.5) // ~0.5s per keyword

      // Initialize batch status
      const batchStatus: BatchStatus = {
        batchId,
        status: "queued",
        progress: 0,
        processedCount: 0,
        totalCount: sanitizedKeywords.length,
        successCount: 0,
        failedCount: 0,
        creditsUsed: 0,
        startedAt: new Date().toISOString(),
      }
      this.pendingBatches.set(batchId, batchStatus)

      // Process batch asynchronously
      this.processBatch(batchId, sanitizedKeywords, request.platform, request.userId)

      return {
        success: true,
        batchId,
        totalKeywords: sanitizedKeywords.length,
        estimatedCredits,
        estimatedTime,
        status: "queued",
      }
    } catch (error) {
      return {
        success: false,
        batchId,
        totalKeywords: 0,
        estimatedCredits: 0,
        estimatedTime: 0,
        status: "failed",
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          retryable: true,
        },
      }
    }
  }

  /**
   * Get batch status
   */
  async getBatchStatus(batchId: string): Promise<BatchStatus | null> {
    return this.pendingBatches.get(batchId) || null
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Process batch keywords
   */
  private async processBatch(
    batchId: string,
    keywords: string[],
    platform: "google-news" | "google-discover" | "both",
    userId: string
  ): Promise<void> {
    const batch = this.pendingBatches.get(batchId)
    if (!batch) return

    batch.status = "processing"
    const results: NormalizedNewsResult[] = []
    const platforms: NewsPlatform[] = platform === "both" 
      ? ["google-news", "google-discover"] 
      : [platform as NewsPlatform]

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i]

      for (const p of platforms) {
        try {
          const result = API_CONFIG.mode === "live"
            ? await this.fetchLiveNewsData(keyword, p)
            : await this.fetchMockNewsData(keyword, p)

          results.push(result)
          batch.successCount++
          batch.creditsUsed++
        } catch {
          batch.failedCount++
        }
      }

      batch.processedCount++
      batch.progress = Math.round((batch.processedCount / batch.totalCount) * 100)
      
      // Small delay to prevent rate limiting
      await this.delay(100)
    }

    batch.status = batch.failedCount === batch.totalCount ? "failed" : 
                   batch.failedCount > 0 ? "partial" : "completed"
    batch.completedAt = new Date().toISOString()
    batch.results = results
  }

  /**
   * Fetch live news data from DataForSEO
   */
  private async fetchLiveNewsData(
    keyword: string,
    platform: NewsPlatform
  ): Promise<NormalizedNewsResult> {
    // TODO: Implement actual DataForSEO API call
    // This is the integration point for real API
    
    const response = await fetch(`${API_CONFIG.dataForSEO.baseUrl}${API_CONFIG.dataForSEO.endpoints.newsLive}`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${API_CONFIG.dataForSEO.username}:${API_CONFIG.dataForSEO.password}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        keyword,
        location_code: 2356, // India
        language_code: "en",
        depth: 100,
      }]),
    })

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status}`)
    }

    const data: DataForSEONewsResponse = await response.json()
    return this.normalizeDataForSEOResponse(data, keyword, platform)
  }

  /**
   * Fetch mock news data (for development)
   */
  private async fetchMockNewsData(
    keyword: string,
    platform: NewsPlatform
  ): Promise<NormalizedNewsResult> {
    // Simulate network delay
    await this.delay(Math.random() * 500 + 200)

    const items: NormalizedNewsItem[] = platform === "google-news"
      ? generateMockNewsResults(keyword, 10)
      : generateMockDiscoverResults(keyword, 10)

    return {
      id: this.generateResultId(),
      keyword,
      platform,
      items,
      totalResults: items.length,
      checkDate: new Date().toISOString(),
      cost: BLOGSPY_API_CONFIG.costPerKeyword,
      processingTime: Math.random() * 500 + 200,
    }
  }

  /**
   * Normalize DataForSEO response to our format
   */
  private normalizeDataForSEOResponse(
    response: DataForSEONewsResponse,
    keyword: string,
    platform: NewsPlatform
  ): NormalizedNewsResult {
    const task = response.tasks?.[0]
    const result = task?.result?.[0]

    const items: NormalizedNewsItem[] = (result?.items || []).map((item, index) => ({
      id: `${keyword}-${index}`,
      position: item.rank_absolute || index + 1,
      title: item.title || "",
      url: item.url || "",
      source: item.source || item.domain || "",
      domain: item.domain || "",
      publishedAt: item.date || new Date().toISOString(),
      snippet: item.snippet || "",
      thumbnailUrl: item.image_url,
      isAMP: item.amp_version || false,
      isTopStory: item.position === "top_stories",
      category: "general",
    }))

    return {
      id: task?.id || this.generateResultId(),
      keyword,
      platform,
      items,
      totalResults: result?.items_count || items.length,
      checkDate: new Date().toISOString(),
      cost: response.cost || BLOGSPY_API_CONFIG.costPerKeyword,
      processingTime: 0,
    }
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    requestId: string,
    code: string,
    message: string,
    retryable = false,
    retryAfter?: number
  ): BaseAPIResponse<never> {
    return {
      success: false,
      error: {
        code,
        message,
        retryable,
        retryAfter,
      },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: 0,
        creditsUsed: 0,
        remainingCredits: 0,
        rateLimit: {
          limit: 0,
          remaining: 0,
          resetAt: new Date().toISOString(),
        },
      },
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateResultId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<{ healthy: boolean; mode: string; latency: number }> {
    const start = Date.now()
    
    try {
      if (API_CONFIG.mode === "live") {
        // TODO: Ping DataForSEO API
      }
      
      return {
        healthy: true,
        mode: API_CONFIG.mode,
        latency: Date.now() - start,
      }
    } catch {
      return {
        healthy: false,
        mode: API_CONFIG.mode,
        latency: Date.now() - start,
      }
    }
  }
}

// Export singleton instance
export const newsTrackerService = new NewsTrackerService()

// Export class for testing
export { NewsTrackerService }
