/**
 * Cannibalization Detection Service
 * 
 * Handles API calls for cannibalization analysis.
 * Currently uses mock data - replace API_BASE_URL when backend is ready.
 */

import type {
  CannibalizationAnalysis,
  CannibalizationIssue,
  CannibalizationSeverity,
} from "../types"
import { generateMockCannibalizationAnalysis } from "../__mocks__/cannibalization-data"

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
const USE_MOCK = true // Set to false when API is ready

// ============================================
// TYPES
// ============================================

export interface ScanOptions {
  domain: string
  depth: "quick" | "standard" | "deep"
  includeSubdomains?: boolean
}

export interface ScanProgress {
  stage: "connecting" | "crawling" | "analyzing" | "complete"
  progress: number
  pagesFound?: number
  issuesFound?: number
}

export interface FixIssuePayload {
  issueId: string
  action: "merge" | "redirect" | "canonical" | "noindex" | "differentiate" | "reoptimize"
  completedSteps: string[]
}

export interface BulkActionPayload {
  issueIds: string[]
  action: "fix" | "ignore" | "in-progress"
}

// ============================================
// API CLIENT
// ============================================

class CannibalizationService {
  private baseUrl: string
  private useMock: boolean

  constructor() {
    this.baseUrl = `${API_BASE_URL}/cannibalization`
    this.useMock = USE_MOCK
  }

  /**
   * Get cannibalization analysis for a domain
   */
  async getAnalysis(domain: string): Promise<CannibalizationAnalysis> {
    if (this.useMock) {
      await this.simulateDelay(500)
      return generateMockCannibalizationAnalysis()
    }

    const response = await fetch(`${this.baseUrl}/analysis?domain=${encodeURIComponent(domain)}`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to get analysis: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Start a new scan for a domain
   */
  async startScan(options: ScanOptions): Promise<{ scanId: string }> {
    if (this.useMock) {
      await this.simulateDelay(300)
      return { scanId: `scan-${Date.now()}` }
    }

    const response = await fetch(`${this.baseUrl}/scan`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to start scan: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get scan progress (for real-time updates)
   */
  async getScanProgress(scanId: string): Promise<ScanProgress> {
    if (this.useMock) {
      await this.simulateDelay(200)
      return {
        stage: "analyzing",
        progress: Math.random() * 100,
        pagesFound: Math.floor(Math.random() * 200),
        issuesFound: Math.floor(Math.random() * 30),
      }
    }

    const response = await fetch(`${this.baseUrl}/scan/${scanId}/progress`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to get scan progress: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Mark an issue as fixed
   */
  async markIssueFixed(payload: FixIssuePayload): Promise<void> {
    if (this.useMock) {
      await this.simulateDelay(500)
      return
    }

    const response = await fetch(`${this.baseUrl}/issues/${payload.issueId}/fix`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to mark issue as fixed: ${response.statusText}`)
    }
  }

  /**
   * Ignore an issue
   */
  async ignoreIssue(issueId: string): Promise<void> {
    if (this.useMock) {
      await this.simulateDelay(300)
      return
    }

    const response = await fetch(`${this.baseUrl}/issues/${issueId}/ignore`, {
      method: "POST",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to ignore issue: ${response.statusText}`)
    }
  }

  /**
   * Bulk action on multiple issues
   */
  async bulkAction(payload: BulkActionPayload): Promise<void> {
    if (this.useMock) {
      await this.simulateDelay(payload.issueIds.length * 100)
      return
    }

    const response = await fetch(`${this.baseUrl}/issues/bulk`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to perform bulk action: ${response.statusText}`)
    }
  }

  /**
   * Get issue history for trends
   */
  async getHistory(domain: string, days: number = 30): Promise<{
    date: string
    issuesCount: number
    fixedCount: number
    trafficLoss: number
  }[]> {
    if (this.useMock) {
      await this.simulateDelay(300)
      // Generate mock history
      return Array.from({ length: days }).map((_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        return {
          date: date.toISOString().split("T")[0],
          issuesCount: Math.max(5, 25 - Math.floor(i * 0.5) + Math.floor(Math.random() * 5)),
          fixedCount: Math.floor(Math.random() * 5) + 1,
          trafficLoss: Math.floor(Math.random() * 2000) + 1000,
        }
      })
    }

    const response = await fetch(
      `${this.baseUrl}/history?domain=${encodeURIComponent(domain)}&days=${days}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Export report
   */
  async exportReport(
    domain: string,
    format: "csv" | "json" | "pdf",
    filters?: {
      severities?: CannibalizationSeverity[]
      includeRecommendations?: boolean
      includePageDetails?: boolean
    }
  ): Promise<Blob> {
    if (this.useMock) {
      await this.simulateDelay(1000)
      // Return mock blob
      const mockData = JSON.stringify({ domain, issues: generateMockCannibalizationAnalysis().issues })
      return new Blob([mockData], { type: "application/json" })
    }

    const params = new URLSearchParams({
      domain,
      format,
      ...(filters?.severities && { severities: filters.severities.join(",") }),
      ...(filters?.includeRecommendations !== undefined && { 
        includeRecommendations: String(filters.includeRecommendations) 
      }),
      ...(filters?.includePageDetails !== undefined && { 
        includePageDetails: String(filters.includePageDetails) 
      }),
    })

    const response = await fetch(`${this.baseUrl}/export?${params}`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to export report: ${response.statusText}`)
    }

    return response.blob()
  }

  /**
   * Get ignored issues list
   */
  async getIgnoredIssues(domain: string): Promise<CannibalizationIssue[]> {
    if (this.useMock) {
      await this.simulateDelay(300)
      return []
    }

    const response = await fetch(
      `${this.baseUrl}/issues/ignored?domain=${encodeURIComponent(domain)}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get ignored issues: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Restore an ignored issue
   */
  async restoreIssue(issueId: string): Promise<void> {
    if (this.useMock) {
      await this.simulateDelay(300)
      return
    }

    const response = await fetch(`${this.baseUrl}/issues/${issueId}/restore`, {
      method: "POST",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to restore issue: ${response.statusText}`)
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      // Add auth token here when implemented
      // "Authorization": `Bearer ${getAuthToken()}`,
    }
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const cannibalizationService = new CannibalizationService()

// ============================================
// HOOK-FRIENDLY EXPORTS
// ============================================

export async function fetchCannibalizationAnalysis(domain: string) {
  return cannibalizationService.getAnalysis(domain)
}

export async function startCannibalizationScan(options: ScanOptions) {
  return cannibalizationService.startScan(options)
}

export async function markIssueFix(payload: FixIssuePayload) {
  return cannibalizationService.markIssueFixed(payload)
}

export async function ignoreIssue(issueId: string) {
  return cannibalizationService.ignoreIssue(issueId)
}

export async function performBulkAction(payload: BulkActionPayload) {
  return cannibalizationService.bulkAction(payload)
}

export async function fetchHistory(domain: string, days?: number) {
  return cannibalizationService.getHistory(domain, days)
}

export async function exportCannibalizationReport(
  domain: string,
  format: "csv" | "json" | "pdf",
  filters?: Parameters<typeof cannibalizationService.exportReport>[2]
) {
  return cannibalizationService.exportReport(domain, format, filters)
}
