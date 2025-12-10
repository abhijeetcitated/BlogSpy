/**
 * API Response Handler
 * ============================================
 * Standardized API responses for consistency
 * ============================================
 */

import { NextResponse } from "next/server"

// ============================================
// TYPES
// ============================================

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
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

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================
// ERROR CODES
// ============================================

export const ErrorCodes = {
  // Client Errors (4xx)
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // Server Errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// ============================================
// SUCCESS RESPONSE HELPERS
// ============================================

export function successResponse<T>(
  data: T,
  meta?: ApiSuccessResponse["meta"],
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  )
}

export function createdResponse<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, undefined, 201)
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

// ============================================
// ERROR RESPONSE HELPERS
// ============================================

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const errorObj: ApiErrorResponse["error"] = {
    code,
    message,
  }
  
  if (details !== undefined) {
    errorObj.details = details
  }

  return NextResponse.json(
    {
      success: false,
      error: errorObj,
    },
    { status }
  )
}

// Specific error helpers
export function badRequestResponse(message = "Bad request", details?: unknown) {
  return errorResponse(ErrorCodes.BAD_REQUEST, message, 400, details)
}

export function unauthorizedResponse(message = "Unauthorized") {
  return errorResponse(ErrorCodes.UNAUTHORIZED, message, 401)
}

export function forbiddenResponse(message = "Forbidden") {
  return errorResponse(ErrorCodes.FORBIDDEN, message, 403)
}

export function notFoundResponse(message = "Resource not found") {
  return errorResponse(ErrorCodes.NOT_FOUND, message, 404)
}

export function methodNotAllowedResponse(message = "Method not allowed") {
  return errorResponse(ErrorCodes.METHOD_NOT_ALLOWED, message, 405)
}

export function conflictResponse(message = "Conflict") {
  return errorResponse(ErrorCodes.CONFLICT, message, 409)
}

export function validationErrorResponse(message = "Validation error", details?: unknown) {
  return errorResponse(ErrorCodes.VALIDATION_ERROR, message, 422, details)
}

export function rateLimitResponse(message = "Rate limit exceeded") {
  return errorResponse(ErrorCodes.RATE_LIMIT_EXCEEDED, message, 429)
}

export function internalErrorResponse(message = "Internal server error") {
  return errorResponse(ErrorCodes.INTERNAL_ERROR, message, 500)
}

export function serviceUnavailableResponse(message = "Service unavailable") {
  return errorResponse(ErrorCodes.SERVICE_UNAVAILABLE, message, 503)
}

// ============================================
// ERROR HANDLER
// ============================================

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error("[API Error]", error)

  // Known error types
  if (error instanceof Error) {
    // Prisma errors
    if (error.message.includes("Prisma")) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, "Database error", 500)
    }

    // Validation errors (Zod)
    if (error.name === "ZodError") {
      return validationErrorResponse("Validation failed", error)
    }

    // Generic error
    return internalErrorResponse(
      process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    )
  }

  return internalErrorResponse()
}

// ============================================
// PAGINATION HELPER
// ============================================

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiSuccessResponse<T[]>> {
  return successResponse(data, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
}
