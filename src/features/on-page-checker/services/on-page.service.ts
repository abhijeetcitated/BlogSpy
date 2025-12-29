/**
 * On-Page SEO Checker Service
 * Handles all API calls for on-page SEO analysis
 */

import { apiClient } from "@/services/api-client"

// Types
export interface ScanRequest {
  url: string
  targetKeyword?: string
}

export interface ScanResponse {
  success: boolean
  data?: ScanResult
  error?: string
}

export interface ScanResult {
  url: string
  targetKeyword: string
  score: number
  pageStructure: PageStructureData
  issues: IssuesData
  nlpKeywords: NLPKeyword[]
  serpPreview: SERPPreview
  scannedAt: string
}

export interface PageStructureData {
  sections: PageSection[]
}

export interface PageSection {
  id: string
  type: "H1" | "H2" | "H3" | "H4" | "P" | "IMG" | "A"
  content: string
  hasError?: boolean
  errorMessage?: string
}

export interface IssuesData {
  errors: SEOIssue[]
  warnings: SEOIssue[]
  passed: SEOIssue[]
}

export interface SEOIssue {
  id: string
  title: string
  description: string
  impact: "high" | "medium" | "low"
  category: string
  element?: string
  suggestion?: string
}

export interface NLPKeyword {
  keyword: string
  count: number
  density: number
  prominence: number
  inTitle: boolean
  inH1: boolean
  inMeta: boolean
}

export interface SERPPreview {
  title: string
  description: string
  url: string
  titleLength: number
  descriptionLength: number
}

export interface AIFixRequest {
  issueId: string
  issueTitle: string
  issueDescription: string
  currentElement?: string
  targetKeyword?: string
}

export interface AIFixResponse {
  success: boolean
  data?: {
    fix: string
    explanation: string
    codeSnippet?: string
  }
  error?: string
}

// API Endpoints
const ENDPOINTS = {
  SCAN: "/api/on-page/scan",
  AI_FIX: "/api/on-page/ai-fix",
  HISTORY: "/api/on-page/history",
} as const

/**
 * On-Page SEO Service Class
 */
class OnPageService {
  private abortController: AbortController | null = null

  /**
   * Perform a full on-page SEO scan
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async scan(
    request: ScanRequest,
    _onProgress?: (progress: number) => void
  ): Promise<ScanResponse> {
    // Cancel any existing scan
    this.cancelScan()
    this.abortController = new AbortController()

    try {
      // Validate URL format
      if (!this.isValidUrl(request.url)) {
        return {
          success: false,
          error: "Invalid URL format. Please enter a valid URL starting with http:// or https://",
        }
      }

      const response = await apiClient.post<ScanResult>(ENDPOINTS.SCAN, request)

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      // Don't treat abort as an error
      if (error instanceof Error && error.name === "AbortError") {
        return { success: false, error: "Scan cancelled" }
      }

      const message = error instanceof Error ? error.message : "Failed to scan page"
      return { success: false, error: message }
    } finally {
      this.abortController = null
    }
  }

  /**
   * Cancel an ongoing scan
   */
  cancelScan(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * Get AI-powered fix suggestion for an issue
   */
  async getAIFix(request: AIFixRequest): Promise<AIFixResponse> {
    try {
      const response = await apiClient.post<AIFixResponse["data"]>(
        ENDPOINTS.AI_FIX,
        request
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate AI fix"
      return { success: false, error: message }
    }
  }

  /**
   * Get scan history for the current user
   */
  async getHistory(userId: string, limit = 10): Promise<ScanResult[]> {
    try {
      const response = await apiClient.get<ScanResult[]>(
        `${ENDPOINTS.HISTORY}?userId=${userId}&limit=${limit}`
      )
      return response.data
    } catch (error) {
      console.error("[OnPageService] Failed to fetch history:", error)
      return []
    }
  }

  /**
   * Save scan result to history
   */
  async saveToHistory(userId: string, result: ScanResult): Promise<boolean> {
    try {
      await apiClient.post(`${ENDPOINTS.HISTORY}`, {
        userId,
        ...result,
      })
      return true
    } catch (error) {
      console.error("[OnPageService] Failed to save to history:", error)
      return false
    }
  }

  /**
   * Clear scan history for user
   */
  async clearHistory(userId: string): Promise<boolean> {
    try {
      await apiClient.delete(`${ENDPOINTS.HISTORY}?userId=${userId}`)
      return true
    } catch (error) {
      console.error("[OnPageService] Failed to clear history:", error)
      return false
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  /**
   * Calculate SEO score from issues
   */
  calculateScore(issues: IssuesData): number {
    const errorWeight = 10
    const warningWeight = 5
    const passedWeight = 3

    const totalErrors = issues.errors.length * errorWeight
    const totalWarnings = issues.warnings.length * warningWeight
    const totalPassed = issues.passed.length * passedWeight

    const totalPoints = totalErrors + totalWarnings + totalPassed
    if (totalPoints === 0) return 100

    const score = Math.round(
      ((totalPassed) / (totalErrors + totalWarnings + totalPassed)) * 100
    )

    return Math.max(0, Math.min(100, score))
  }
}

// Export singleton instance
export const onPageService = new OnPageService()
