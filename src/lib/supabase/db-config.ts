/**
 * Supabase DB connection helpers.
 *
 * Ensure Supavisor Transaction Mode is used:
 * - Port 6543
 * - `pgbouncer=true` query param
 *
 * Do not log or expose the connection string.
 */

const SUPABASE_DB_URL =
  process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL ?? ""

function parseDbUrl(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl)
  } catch {
    return null
  }
}

export function assertSupabaseTransactionMode(): void {
  if (!SUPABASE_DB_URL) return

  const url = parseDbUrl(SUPABASE_DB_URL)
  if (!url) {
    console.warn("[Supabase] Database URL is not a valid URL string.")
    return
  }

  const port = url.port || "5432"
  const usesTransactionPort = port === "6543"
  const pgbouncerEnabled = url.searchParams.get("pgbouncer") === "true"

  if (!usesTransactionPort || !pgbouncerEnabled) {
    console.warn(
      "[Supabase] Use Supavisor transaction mode (port 6543) with pgbouncer=true for serverless pooling."
    )
  }
}

export function getSupabaseDbUrl(): string | null {
  assertSupabaseTransactionMode()
  return SUPABASE_DB_URL || null
}
