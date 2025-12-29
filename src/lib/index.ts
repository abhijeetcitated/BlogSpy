/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 📦 CORE LIBRARY - Global Barrel Export
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Central export point for all core services.
 * Import from here for quick access to all clients.
 * 
 * @example
 * ```ts
 * import { openrouter, dataforseo, lemonSqueezy } from "@/lib"
 * ```
 */

// Database (Supabase)
export * from "./supabase"

// AI (OpenRouter)
export * from "./ai"

// SEO Data (DataForSEO)
export * from "./seo"

// Payments (Lemon Squeezy)
export * from "./payments"
