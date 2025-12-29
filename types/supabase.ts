/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🗄️ SUPABASE DATABASE TYPES
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Auto-generated types for Supabase database.
 * 
 * To regenerate these types, run:
 * ```bash
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
 * ```
 * 
 * Or use the Supabase CLI:
 * ```bash
 * supabase gen types typescript --local > src/types/supabase.ts
 * ```
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Database schema types.
 * 
 * ⚠️ TODO: Replace this placeholder with actual generated types
 * by running the Supabase CLI command above.
 */
export interface Database {
  public: {
    Tables: {
      // ═══════════════════════════════════════════════════════════════════════════════════════
      // USER CREDITS
      // ═══════════════════════════════════════════════════════════════════════════════════════
      user_credits: {
        Row: {
          id: string
          user_id: string
          credits_total: number
          credits_used: number
          reset_date: string
          last_reset_at: string
          plan: "FREE" | "PRO" | "ENTERPRISE"
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credits_total?: number
          credits_used?: number
          reset_date?: string
          last_reset_at?: string
          plan?: "FREE" | "PRO" | "ENTERPRISE"
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credits_total?: number
          credits_used?: number
          reset_date?: string
          last_reset_at?: string
          plan?: "FREE" | "PRO" | "ENTERPRISE"
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // CREDIT USAGE HISTORY
      // ═══════════════════════════════════════════════════════════════════════════════════════
      credit_usage_history: {
        Row: {
          id: string
          user_id: string
          credits_amount: number
          transaction_type: "usage" | "refund" | "purchase" | "reset" | "bonus"
          feature_used: string | null
          credits_before: number
          credits_after: number
          description: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credits_amount: number
          transaction_type: "usage" | "refund" | "purchase" | "reset" | "bonus"
          feature_used?: string | null
          credits_before: number
          credits_after: number
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credits_amount?: number
          transaction_type?: "usage" | "refund" | "purchase" | "reset" | "bonus"
          feature_used?: string | null
          credits_before?: number
          credits_after?: number
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // PLAN LIMITS
      // ═══════════════════════════════════════════════════════════════════════════════════════
      plan_limits: {
        Row: {
          id: string
          plan: "FREE" | "PRO" | "ENTERPRISE"
          monthly_credits: number
          daily_limit: number | null
          max_projects: number
          max_keywords: number
          max_tracked_urls: number
          features: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan: "FREE" | "PRO" | "ENTERPRISE"
          monthly_credits: number
          daily_limit?: number | null
          max_projects?: number
          max_keywords?: number
          max_tracked_urls?: number
          features?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan?: "FREE" | "PRO" | "ENTERPRISE"
          monthly_credits?: number
          daily_limit?: number | null
          max_projects?: number
          max_keywords?: number
          max_tracked_urls?: number
          features?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // AI VISIBILITY CONFIGS
      // ═══════════════════════════════════════════════════════════════════════════════════════
      ai_visibility_configs: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          tracked_domain: string
          brand_keywords: string[]
          competitor_domains: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          tracked_domain: string
          brand_keywords?: string[]
          competitor_domains?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          tracked_domain?: string
          brand_keywords?: string[]
          competitor_domains?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // AI VISIBILITY KEYWORDS
      // ═══════════════════════════════════════════════════════════════════════════════════════
      ai_visibility_keywords: {
        Row: {
          id: string
          config_id: string
          user_id: string
          keyword: string
          category: string | null
          search_volume: number | null
          priority: "high" | "medium" | "low"
          status: "active" | "paused" | "archived"
          last_results: Json | null
          last_checked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          config_id: string
          user_id: string
          keyword: string
          category?: string | null
          search_volume?: number | null
          priority?: "high" | "medium" | "low"
          status?: "active" | "paused" | "archived"
          last_results?: Json | null
          last_checked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          config_id?: string
          user_id?: string
          keyword?: string
          category?: string | null
          search_volume?: number | null
          priority?: "high" | "medium" | "low"
          status?: "active" | "paused" | "archived"
          last_results?: Json | null
          last_checked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // Add more tables here as you create them...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      use_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_feature?: string
          p_description?: string
        }
        Returns: {
          success: boolean
          remaining: number
          message: string
        }[]
      }
      reset_monthly_credits: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      plan_type: "FREE" | "PRO" | "ENTERPRISE"
      transaction_type: "usage" | "refund" | "purchase" | "reset" | "bonus"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

// Convenience exports
export type UserCredits = Tables<"user_credits">
export type CreditUsageHistory = Tables<"credit_usage_history">
export type PlanLimits = Tables<"plan_limits">
export type AIVisibilityConfig = Tables<"ai_visibility_configs">
export type AIVisibilityKeyword = Tables<"ai_visibility_keywords">
