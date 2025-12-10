/**
 * Environment Configuration
 * Centralized environment variable management
 */

interface EnvConfig {
  // App
  appName: string
  appUrl: string
  nodeEnv: "development" | "production" | "test"
  isDev: boolean
  isProd: boolean

  // API
  apiUrl: string
  apiTimeout: number

  // Auth (Clerk)
  clerkPublishableKey: string
  clerkSecretKey: string

  // Database (Supabase)
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey: string
  databaseUrl: string

  // SEO Data (DataForSEO)
  dataForSeoLogin: string
  dataForSeoPassword: string
  dataForSeoApiUrl: string

  // Payments (Stripe)
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string

  // Analytics
  googleAnalyticsId: string
  mixpanelToken: string

  // Feature Flags
  useMockData: boolean
  enableAnalytics: boolean
  enablePayments: boolean
}

function getEnvVar(key: string, defaultValue = ""): string {
  if (typeof window !== "undefined") {
    // Client-side: only NEXT_PUBLIC_ variables are available
    return (process.env as Record<string, string | undefined>)[key] || defaultValue
  }
  return process.env[key] || defaultValue
}

function getBoolEnvVar(key: string, defaultValue = false): boolean {
  const value = getEnvVar(key)
  if (!value) return defaultValue
  return value === "true" || value === "1"
}

const nodeEnv = (getEnvVar("NODE_ENV", "development") as EnvConfig["nodeEnv"])

export const env: EnvConfig = {
  // App
  appName: getEnvVar("NEXT_PUBLIC_APP_NAME", "BlogSpy"),
  appUrl: getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  nodeEnv,
  isDev: nodeEnv === "development",
  isProd: nodeEnv === "production",

  // API
  apiUrl: getEnvVar("NEXT_PUBLIC_API_URL", "/api"),
  apiTimeout: parseInt(getEnvVar("API_TIMEOUT", "30000"), 10),

  // Auth (Clerk)
  clerkPublishableKey: getEnvVar("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  clerkSecretKey: getEnvVar("CLERK_SECRET_KEY"),

  // Database (Supabase)
  supabaseUrl: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceKey: getEnvVar("SUPABASE_SERVICE_KEY"),
  databaseUrl: getEnvVar("DATABASE_URL"),

  // SEO Data (DataForSEO)
  dataForSeoLogin: getEnvVar("DATAFORSEO_LOGIN"),
  dataForSeoPassword: getEnvVar("DATAFORSEO_PASSWORD"),
  dataForSeoApiUrl: getEnvVar("DATAFORSEO_API_URL", "https://api.dataforseo.com/v3"),

  // Payments (Stripe)
  stripePublishableKey: getEnvVar("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  stripeSecretKey: getEnvVar("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: getEnvVar("STRIPE_WEBHOOK_SECRET"),

  // Analytics
  googleAnalyticsId: getEnvVar("NEXT_PUBLIC_GA_ID"),
  mixpanelToken: getEnvVar("NEXT_PUBLIC_MIXPANEL_TOKEN"),

  // Feature Flags
  useMockData: getBoolEnvVar("NEXT_PUBLIC_USE_MOCK_DATA", true),
  enableAnalytics: getBoolEnvVar("NEXT_PUBLIC_ENABLE_ANALYTICS", false),
  enablePayments: getBoolEnvVar("NEXT_PUBLIC_ENABLE_PAYMENTS", false),
}

// Validate required env vars (server-side only)
export function validateEnv(): { valid: boolean; missing: string[] } {
  if (typeof window !== "undefined") {
    return { valid: true, missing: [] }
  }

  const required: (keyof EnvConfig)[] = []

  // In production, require real API keys
  if (env.isProd && !env.useMockData) {
    required.push(
      "clerkSecretKey",
      "supabaseUrl",
      "supabaseServiceKey",
      "databaseUrl",
      "dataForSeoLogin",
      "dataForSeoPassword",
      "stripeSecretKey"
    )
  }

  const missing = required.filter((key) => !env[key])

  return {
    valid: missing.length === 0,
    missing: missing as string[],
  }
}

// Type-safe env access for specific keys
export function requireEnv(key: keyof EnvConfig): string {
  const value = env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return String(value)
}

export default env
