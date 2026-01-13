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

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // PROFILES (Auth-linked profile data)
      // ═══════════════════════════════════════════════════════════════════════════════════════
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          role: "user" | "admin" | "moderator" | string
          created_at: string
          // Optional fields used by various server utilities
          password_hash: string | null
          api_keys: string[]
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin" | "moderator" | string
          created_at?: string
          password_hash?: string | null
          api_keys?: string[]
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: "user" | "admin" | "moderator" | string
          created_at?: string
          password_hash?: string | null
          api_keys?: string[]
          stripe_customer_id?: string | null
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // USERS (Application user profile/preferences)
      // ═══════════════════════════════════════════════════════════════════════════════════════
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          company: string | null
          website: string | null
          timezone: string | null
          notifications: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          company?: string | null
          website?: string | null
          timezone?: string | null
          notifications?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          company?: string | null
          website?: string | null
          timezone?: string | null
          notifications?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // USER PROFILES (Extended profile for UI usage)
      // ═══════════════════════════════════════════════════════════════════════════════════════
      user_profiles: {
        Row: {
          id: string
          user_id: string
          plan: "free" | "pro" | "enterprise" | string
          credits: number
          stripe_customer_id: string | null
          subscription_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: "free" | "pro" | "enterprise" | string
          credits?: number
          stripe_customer_id?: string | null
          subscription_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: "free" | "pro" | "enterprise" | string
          credits?: number
          stripe_customer_id?: string | null
          subscription_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // ALERTS
      // ═══════════════════════════════════════════════════════════════════════════════════════
      alerts: {
        Row: {
          id: string
          user_id: string
          category: string
          priority: string
          title: string
          message: string
          data: Json
          channels: string[]
          delivery_status: Json
          url: string | null
          is_read: boolean
          read_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          priority: string
          title: string
          message: string
          data?: Json
          channels?: string[]
          delivery_status?: Json
          url?: string | null
          is_read?: boolean
          read_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          priority?: string
          title?: string
          message?: string
          data?: Json
          channels?: string[]
          delivery_status?: Json
          url?: string | null
          is_read?: boolean
          read_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: []
      }

      alert_logs: {
        Row: {
          id: string
          alert_id: string
          user_id: string
          channel: string
          status: string
          error: string | null
          attempt_count: number
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          alert_id: string
          user_id: string
          channel: string
          status: string
          error?: string | null
          attempt_count?: number
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          alert_id?: string
          user_id?: string
          channel?: string
          status?: string
          error?: string | null
          attempt_count?: number
          sent_at?: string | null
          created_at?: string
        }
        Relationships: []
      }

      user_alert_preferences: {
        Row: {
          id: string
          user_id: string
          is_enabled: boolean
          timezone: string
          quiet_hours: Json
          channels: Json
          categories: Json
          digest: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          is_enabled?: boolean
          timezone?: string
          quiet_hours?: Json
          channels?: Json
          categories?: Json
          digest?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          is_enabled?: boolean
          timezone?: string
          quiet_hours?: Json
          channels?: Json
          categories?: Json
          digest?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // CONTENT DECAY: SCORES
      // ═══════════════════════════════════════════════════════════════════════════════════════
      decay_scores: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string
          overall_score: number
          level: string
          trend: string
          traffic_decay: number
          position_decay: number
          ctr_decay: number
          engagement_decay: number
          comparison_period: Json
          calculated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title: string
          overall_score: number
          level: string
          trend: string
          traffic_decay: number
          position_decay: number
          ctr_decay: number
          engagement_decay: number
          comparison_period?: Json
          calculated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string
          overall_score?: number
          level?: string
          trend?: string
          traffic_decay?: number
          position_decay?: number
          ctr_decay?: number
          engagement_decay?: number
          comparison_period?: Json
          calculated_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // CONTENT DECAY: HISTORY
      // ═══════════════════════════════════════════════════════════════════════════════════════
      decay_history: {
        Row: {
          id: string
          decay_score_id: string
          score: number
          level: string
          recorded_at: string
        }
        Insert: {
          id?: string
          decay_score_id: string
          score: number
          level: string
          recorded_at?: string
        }
        Update: {
          id?: string
          decay_score_id?: string
          score?: number
          level?: string
          recorded_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // CONTENT DECAY: BATCH JOBS
      // ═══════════════════════════════════════════════════════════════════════════════════════
      decay_batch_jobs: {
        Row: {
          id: string
          user_id: string
          status: string
          total_urls: number
          processed_urls: number
          decaying_urls: number
          error: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          total_urls?: number
          processed_urls?: number
          decaying_urls?: number
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total_urls?: number
          processed_urls?: number
          decaying_urls?: number
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // USER INTEGRATIONS (OAuth tokens & selected properties)
      // ═══════════════════════════════════════════════════════════════════════════════════════
      user_integrations: {
        Row: {
          id: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string
          expires_at: string
          selected_property: string | null
          properties: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string
          expires_at: string
          selected_property?: string | null
          properties?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          access_token?: string
          refresh_token?: string
          expires_at?: string
          selected_property?: string | null
          properties?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // GOOGLE SEARCH CONSOLE DATA
      // ═══════════════════════════════════════════════════════════════════════════════════════
      gsc_data: {
        Row: {
          id: string
          user_id: string
          property: string
          date: string
          url: string
          clicks: number
          impressions: number
          ctr: number
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property: string
          date: string
          url: string
          clicks: number
          impressions: number
          ctr: number
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property?: string
          date?: string
          url?: string
          clicks?: number
          impressions?: number
          ctr?: number
          position?: number
          created_at?: string
        }
        Relationships: []
      }

      gsc_sync_jobs: {
        Row: {
          id: string
          user_id: string
          property: string
          status: string
          start_date: string
          end_date: string
          rows_processed: number
          error: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property: string
          status: string
          start_date: string
          end_date: string
          rows_processed?: number
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property?: string
          status?: string
          start_date?: string
          end_date?: string
          rows_processed?: number
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // GOOGLE ANALYTICS 4 DATA
      // ═══════════════════════════════════════════════════════════════════════════════════════
      ga4_data: {
        Row: {
          id: string
          user_id: string
          property_id: string
          date: string
          page_path: string
          views: number
          users: number
          sessions: number
          avg_engagement_time: number
          bounce_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          date: string
          page_path: string
          views: number
          users: number
          sessions: number
          avg_engagement_time: number
          bounce_rate: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          date?: string
          page_path?: string
          views?: number
          users?: number
          sessions?: number
          avg_engagement_time?: number
          bounce_rate?: number
          created_at?: string
        }
        Relationships: []
      }

      ga4_sync_jobs: {
        Row: {
          id: string
          user_id: string
          property_id: string
          status: string
          start_date: string
          end_date: string
          rows_processed: number
          error: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          status: string
          start_date: string
          end_date: string
          rows_processed?: number
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          status?: string
          start_date?: string
          end_date?: string
          rows_processed?: number
          error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
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
