/**
 * ============================================
 * NEWS TRACKER FEATURE - BARREL EXPORT
 * ============================================
 * 
 * Complete News & Discover Tracker feature module
 * 
 * Structure:
 * ├── components/     UI components
 * ├── config/         Configuration & pricing
 * ├── constants/      Static constants
 * ├── hooks/          Custom React hooks
 * ├── services/       Business logic & API
 * ├── types/          TypeScript definitions
 * └── __mocks__/      Mock data for development
 * 
 * Integration Status:
 * ✅ UI Components - Complete
 * ✅ Credit System - Complete (mock)
 * ✅ Security Layer - Complete
 * ✅ Rate Limiting - Complete
 * ⏳ Payment Gateway - Ready for Razorpay/Stripe
 * ⏳ Real API - Ready for DataForSEO
 * ⏳ Database - Ready for Supabase/Prisma
 * 
 * @version 2.0.0
 */

// Main Content Component
export { NewsTrackerContent } from "./news-tracker-content"

// Types
export * from "./types"

// Constants
export * from "./constants"

// Components
export * from "./components"

// Hooks
export * from "./hooks"

// Configuration
export * from "./config"

// ⚠️ Server-only exports
// Import from [`server.ts`](src/features/news-tracker/server.ts:1) in Server Components / Route Handlers.
