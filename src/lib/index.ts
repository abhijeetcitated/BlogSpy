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
 * import { openrouter, getDataForSEOClient, lemonSqueezy } from "@/lib"
 * ```
 */

// Client-safe exports only.
// - Client entrypoint: [`client.ts`](src/lib/client.ts:1)
// - Server entrypoint: [`server.ts`](src/lib/server.ts:1)

export * from "./client"
