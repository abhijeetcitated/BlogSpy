/**
 * Clerk Authentication Helpers
 * Utility functions for Clerk authentication
 * 
 * NOTE: Currently using MOCK implementation
 * Real Clerk integration will be added later:
 * 1. npm install @clerk/nextjs
 * 2. Set up CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env
 * 3. Replace mock functions with real Clerk imports
 */

// Mock user for development
const MOCK_USER = {
  id: "user_demo_123",
  email: "demo@blogspy.io",
  firstName: "Demo",
  lastName: "User",
  imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
  createdAt: new Date("2024-01-01"),
}

/**
 * Get the current authenticated user's Clerk ID
 * Use in Server Components and API routes
 * 
 * TODO: Replace with real Clerk auth when installed:
 * import { auth } from "@clerk/nextjs/server"
 * const { userId } = await auth()
 */
export async function getAuthUserId(): Promise<string | null> {
  // Mock: Always return demo user ID
  // In production: const { userId } = await auth(); return userId;
  return MOCK_USER.id
}

/**
 * Require authentication - throws if not authenticated
 * Use in protected API routes
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthUserId()
  
  if (!userId) {
    throw new Error("Unauthorized: Authentication required")
  }
  
  return userId
}

/**
 * Get current user details from Clerk
 * 
 * TODO: Replace with real Clerk currentUser when installed:
 * import { currentUser } from "@clerk/nextjs/server"
 * const user = await currentUser()
 */
export async function getCurrentUser() {
  // Mock: Return demo user
  // In production: const user = await currentUser()
  return {
    id: MOCK_USER.id,
    email: MOCK_USER.email,
    name: `${MOCK_USER.firstName} ${MOCK_USER.lastName}`.trim(),
    avatar: MOCK_USER.imageUrl,
    createdAt: MOCK_USER.createdAt,
  }
}

/**
 * Check if user has a specific role (for future use)
 * 
 * TODO: Replace with real Clerk session claims when installed:
 * const { sessionClaims } = await auth()
 */
export async function hasRole(role: string): Promise<boolean> {
  // Mock: Demo user has all roles
  // In production: check sessionClaims.roles
  const mockRoles = ["user", "pro"]
  return mockRoles.includes(role)
}

/**
 * Clerk public routes configuration
 */
export const CLERK_PUBLIC_ROUTES = [
  "/",
  "/features",
  "/pricing",
  "/blog",
  "/blog/(.*)",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/api/webhooks/(.*)",
]

/**
 * Clerk ignored routes (static files, etc.)
 */
export const CLERK_IGNORED_ROUTES = [
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
]
