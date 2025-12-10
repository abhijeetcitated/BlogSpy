// ============================================
// DATAFORSEO API CLIENT
// ============================================
// Base client for DataForSEO API calls
// ============================================

import { DATAFORSEO } from "@/constants/api-endpoints"

interface DataForSEOConfig {
  login: string
  password: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  cost?: number
}

class DataForSEOClient {
  private baseUrl: string
  private authHeader: string

  constructor(config?: DataForSEOConfig) {
    this.baseUrl = DATAFORSEO.BASE_URL
    
    // Get credentials from env or config
    const login = config?.login || process.env.DATAFORSEO_LOGIN || ""
    const password = config?.password || process.env.DATAFORSEO_PASSWORD || ""
    
    // Create Basic Auth header
    this.authHeader = `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return this.authHeader !== "Basic Og==" // Empty credentials result in this
  }

  /**
   * Make API request to DataForSEO
   */
  async request<T>(
    endpoint: string,
    data?: unknown,
    method: "GET" | "POST" = "POST"
  ): Promise<ApiResponse<T>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "DataForSEO API credentials not configured. Add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to .env.local",
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      const result = await response.json()

      if (result.status_code === 20000) {
        return {
          success: true,
          data: result.tasks?.[0]?.result || result,
          cost: result.cost,
        }
      }

      return {
        success: false,
        error: result.status_message || "API request failed",
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }
}

// Singleton instance
export const dataForSEOClient = new DataForSEOClient()

// Export class for custom instances
export { DataForSEOClient }
export type { ApiResponse, DataForSEOConfig }
