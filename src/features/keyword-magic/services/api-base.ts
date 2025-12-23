// ============================================
// KEYWORD MAGIC - API Base & Error Handling
// ============================================
// Common utilities for keyword API services
// ============================================

// Base API URL - configure in environment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * API Error class
 */
export class KeywordAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = "KeywordAPIError"
  }
}

/**
 * Simulate network delay for mock implementations
 */
export function simulateNetworkDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
