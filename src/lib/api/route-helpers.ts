/**
 * ============================================
 * API ROUTE HELPERS
 * ============================================
 * 
 * Reusable utilities for API route handlers
 * - Authentication
 * - Rate limiting
 * - Input validation
 * - Error handling
 * - Response formatting
 * 
 * Usage:
 * ```ts
 * import { createApiHandler, ApiError } from "@/lib/api/route-helpers"
 * 
 * export const GET = createApiHandler({
 *   auth: "required",
 *   rateLimit: "api",
 *   schema: MyZodSchema,
 *   handler: async ({ user, data, request }) => {
 *     return { result: "success" }
 *   }
 * })
 * ```
 * ============================================
 */

import { NextRequest, NextResponse } from "next/server"
import { z, ZodSchema, ZodError } from "zod"
import { getServerUser, getUserIdentifier, type AuthResult } from "@/lib/auth/server-auth"
import { 
  checkRateLimit, 
  RateLimitConfigs, 
  getRateLimitHeaders,
  type RateLimitConfig,
  type RateLimitResult 
} from "@/lib/rate-limiter"
import { isDevEnvironment } from "@/lib/feature-access"
import type { User } from "@supabase/supabase-js"

// ============================================
// TYPES
// ============================================

export type AuthMode = "required" | "optional" | "none"
export type RateLimitMode = keyof typeof RateLimitConfigs | "none" | RateLimitConfig

export interface ApiHandlerContext<T = unknown> {
  request: NextRequest
  user: User | null
  isAuthenticated: boolean
  data: T
  params?: Record<string, string>
  searchParams: URLSearchParams
  rateLimit: RateLimitResult
}

export interface ApiHandlerOptions<TInput, TOutput> {
  /** Authentication mode: required, optional, or none */
  auth?: AuthMode
  /** Rate limit configuration */
  rateLimit?: RateLimitMode
  /** Route identifier for rate limiting (auto-generated if not provided) */
  routeId?: string
  /** Zod schema for input validation (query params for GET, body for POST/PUT/PATCH) */
  schema?: ZodSchema<TInput>
  /** The actual handler function */
  handler: (context: ApiHandlerContext<TInput>) => Promise<TOutput>
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    timestamp: string
    [key: string]: unknown
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================
// CUSTOM ERROR CLASS
// ============================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details)
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, "UNAUTHORIZED", message)
  }

  static forbidden(message = "Access denied") {
    return new ApiError(403, "FORBIDDEN", message)
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, "NOT_FOUND", message)
  }

  static tooManyRequests(retryAfter?: number) {
    return new ApiError(429, "TOO_MANY_REQUESTS", "Rate limit exceeded", { retryAfter })
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, "INTERNAL_ERROR", message)
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  )
}

function getRateLimitConfig(mode: RateLimitMode): RateLimitConfig | null {
  if (mode === "none") return null
  if (typeof mode === "object") return mode
  return RateLimitConfigs[mode]
}

function formatSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }
}

function formatErrorResponse(error: ApiError): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  }
}

// ============================================
// MAIN API HANDLER FACTORY
// ============================================

/**
 * Creates a type-safe API route handler with built-in:
 * - Authentication
 * - Rate limiting
 * - Input validation
 * - Error handling
 * - Response formatting
 */
export function createApiHandler<TInput = unknown, TOutput = unknown>(
  options: ApiHandlerOptions<TInput, TOutput>
) {
  const {
    auth = "required",
    rateLimit: rateLimitMode = "api",
    routeId,
    schema,
    handler,
  } = options

  return async (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const headers: Record<string, string> = {}
    
    try {
      // 1. AUTHENTICATION
      let authResult: AuthResult = { user: null, error: null, isAuthenticated: false }
      
      if (auth !== "none") {
        authResult = await getServerUser()
        
        if (auth === "required" && !isDevEnvironment() && !authResult.isAuthenticated) {
          throw ApiError.unauthorized()
        }
      }

      // 2. RATE LIMITING
      const rateLimitConfig = getRateLimitConfig(rateLimitMode)
      let rateLimitResult: RateLimitResult = { 
        allowed: true, 
        remaining: 999, 
        resetTime: Date.now() + 60000 
      }
      
      if (rateLimitConfig) {
        const ip = getClientIp(request)
        const identifier = getUserIdentifier(authResult.user, ip)
        const route = routeId || request.nextUrl.pathname
        
        rateLimitResult = checkRateLimit(`${identifier}:${route}`, rateLimitConfig)
        Object.assign(headers, getRateLimitHeaders(rateLimitResult))
        
        if (!rateLimitResult.allowed) {
          throw ApiError.tooManyRequests(rateLimitResult.retryAfter)
        }
      }

      // 3. INPUT VALIDATION
      let validatedData: TInput = {} as TInput
      
      if (schema) {
        const method = request.method.toUpperCase()
        let rawData: unknown
        
        if (method === "GET" || method === "DELETE") {
          // Parse query params
          const searchParams = request.nextUrl.searchParams
          rawData = Object.fromEntries(searchParams.entries())
        } else {
          // Parse body
          try {
            rawData = await request.json()
          } catch {
            rawData = {}
          }
        }
        
        const parseResult = schema.safeParse(rawData)
        
        if (!parseResult.success) {
          throw ApiError.badRequest("Validation failed", parseResult.error.flatten())
        }
        
        validatedData = parseResult.data
      }

      // 4. RESOLVE PARAMS (for dynamic routes)
      const params = context?.params ? await context.params : undefined

      // 5. EXECUTE HANDLER
      const result = await handler({
        request,
        user: authResult.user,
        isAuthenticated: authResult.isAuthenticated,
        data: validatedData,
        params,
        searchParams: request.nextUrl.searchParams,
        rateLimit: rateLimitResult,
      })

      // 6. FORMAT SUCCESS RESPONSE
      return NextResponse.json(formatSuccessResponse(result), { headers })

    } catch (error) {
      // Handle known API errors
      if (error instanceof ApiError) {
        return NextResponse.json(formatErrorResponse(error), { 
          status: error.statusCode,
          headers,
        })
      }

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const apiError = ApiError.badRequest("Validation failed", error.flatten())
        return NextResponse.json(formatErrorResponse(apiError), { 
          status: 400,
          headers,
        })
      }

      // Log unexpected errors (server-side only)
      console.error("[API Error]", error)

      // Return generic error to client
      const apiError = ApiError.internal()
      return NextResponse.json(formatErrorResponse(apiError), { 
        status: 500,
        headers,
      })
    }
  }
}

// ============================================
// SPECIALIZED HANDLERS
// ============================================

/**
 * Create a public API handler (no auth required)
 */
export function createPublicHandler<TInput = unknown, TOutput = unknown>(
  options: Omit<ApiHandlerOptions<TInput, TOutput>, "auth">
) {
  return createApiHandler({ ...options, auth: "none" })
}

/**
 * Create a protected API handler (auth required)
 */
export function createProtectedHandler<TInput = unknown, TOutput = unknown>(
  options: Omit<ApiHandlerOptions<TInput, TOutput>, "auth">
) {
  return createApiHandler({ ...options, auth: "required" })
}

/**
 * Create a strict rate-limited handler (10 req/min)
 */
export function createStrictHandler<TInput = unknown, TOutput = unknown>(
  options: Omit<ApiHandlerOptions<TInput, TOutput>, "rateLimit">
) {
  return createApiHandler({ ...options, rateLimit: "strict" })
}

// ============================================
// RESPONSE HELPERS
// ============================================

export function jsonResponse<T>(data: T, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(formatSuccessResponse(data), { status, headers })
}

export function errorResponse(error: ApiError, headers?: Record<string, string>) {
  return NextResponse.json(formatErrorResponse(error), { 
    status: error.statusCode, 
    headers 
  })
}

// ============================================
// COMMON SCHEMAS
// ============================================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const SearchSchema = z.object({
  query: z.string().min(1).max(200),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const IdParamSchema = z.object({
  id: z.string().uuid(),
})
