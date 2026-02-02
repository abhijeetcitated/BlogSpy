/**
 * API Client - Base HTTP client for making API requests
 * Handles authentication, error handling, retries, and caching
 */

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

interface ApiClientConfig {
  baseUrl?: string
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  cache?: RequestCache
  tags?: string[]
  timeout?: number
}

interface ApiResponse<T> {
  data: T
  status: number
  ok: boolean
  headers: Headers
}

interface ApiError {
  message: string
  status: number
  code?: string
  details?: unknown
}

// Default configuration
const defaultConfig: ApiClientConfig = {
  baseUrl: "",
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
}

// Global config (can be set during app initialization)
let globalConfig: ApiClientConfig = { ...defaultConfig }

export function configureApiClient(config: Partial<ApiClientConfig>) {
  globalConfig = { ...globalConfig, ...config }
}

// Get auth token from storage
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

// Build URL with query params
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const baseUrl = globalConfig.baseUrl || ""
  const url = new URL(endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`, window.location.origin)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}

// Build headers
function buildHeaders(customHeaders?: Record<string, string>): Headers {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...globalConfig.headers,
    ...customHeaders,
  })

  const token = getAuthToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return headers
}

// Sleep helper for retry delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Main request function
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers: customHeaders,
    body,
    params,
    cache,
    timeout = globalConfig.timeout,
  } = options

  const url = buildUrl(endpoint, params)
  const headers = buildHeaders(customHeaders)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const fetchOptions: RequestInit = {
    method,
    headers,
    signal: controller.signal,
    cache,
  }

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body)
  }

  let lastError: Error | null = null
  const maxRetries = globalConfig.retries || 3

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions)
      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        const error: ApiError = {
          message: data.error || data.message || "Request failed",
          status: response.status,
          code: data.code,
          details: data,
        }
        throw error
      }

      return {
        data,
        status: response.status,
        ok: response.ok,
        headers: response.headers,
      }
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on client errors (4xx) or abort
      if (
        error instanceof DOMException && error.name === "AbortError" ||
        (error as ApiError).status >= 400 && (error as ApiError).status < 500
      ) {
        throw error
      }

      // Retry on server errors (5xx) or network errors
      if (attempt < maxRetries) {
        await sleep(globalConfig.retryDelay! * (attempt + 1))
        continue
      }
    }
  }

  clearTimeout(timeoutId)
  throw lastError || new Error("Request failed after retries")
}

// Convenience methods
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method">) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
}

// Export types
export type { ApiClientConfig, RequestOptions, ApiResponse, ApiError }
