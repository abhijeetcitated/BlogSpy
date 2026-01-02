// ============================================
// SAFE ACTION - Server Action Utilities
// ============================================
// Provides type-safe server actions with Zod validation
// Uses a simplified mock implementation until clerk is integrated
// ============================================

import { z } from "zod"

/**
 * Mock context type for authenticated actions
 */
interface AuthContext {
  userId: string
}

/**
 * Simple safe action client builder (mock implementation)
 * In production, replace with next-safe-action + Clerk integration
 */
function createMockSafeActionClient(config?: { middleware?: () => Promise<AuthContext> }) {
  return {
    schema<T extends z.ZodType>(schema: T) {
      return {
        action<R>(handler: (args: { parsedInput: z.infer<T>; ctx: AuthContext }) => Promise<R>) {
          return async (input: z.infer<T>): Promise<{ data?: R; serverError?: string }> => {
            try {
              // Validate input
              const parseResult = schema.safeParse(input)
              if (!parseResult.success) {
                return { serverError: parseResult.error.message }
              }
              
              // Run middleware if provided
              let ctx: AuthContext = { userId: "mock-user-id" }
              if (config?.middleware) {
                try {
                  ctx = await config.middleware()
                } catch (error) {
                  return { serverError: error instanceof Error ? error.message : "Unauthorized" }
                }
              }
              
              // Execute handler
              const result = await handler({ parsedInput: parseResult.data, ctx })
              return { data: result }
            } catch (error) {
              return { serverError: error instanceof Error ? error.message : "An error occurred" }
            }
          }
        },
      }
    },
  }
}

/**
 * Base action client without authentication
 */
export const action = createMockSafeActionClient()

/**
 * Authenticated action client - ensures user is logged in
 * TODO: Replace with real auth when Clerk is integrated
 */
export const authAction = createMockSafeActionClient({
  async middleware() {
    // TODO: Replace with actual clerk auth
    // const { userId } = await auth()
    // if (!userId) throw new Error("Unauthorized")
    
    // Mock user for development
    return { userId: "dev-user-123" }
  },
})

/**
 * Admin action client - ensures user has admin role
 * TODO: Replace with real admin check when Clerk is integrated
 */
export const adminAction = createMockSafeActionClient({
  async middleware() {
    // TODO: Replace with actual clerk auth
    // const { userId, sessionClaims } = await auth()
    // if (!userId) throw new Error("Unauthorized")
    // if (sessionClaims?.metadata?.role !== "admin") throw new Error("Forbidden")
    
    // Mock admin for development
    return { userId: "admin-user-123" }
  },
})

// Re-export zod for convenience
export { z }
