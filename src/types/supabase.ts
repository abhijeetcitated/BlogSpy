export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bill_credits: {
        Row: {
          credits_total: number
          credits_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          credits_total?: number
          credits_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          credits_total?: number
          credits_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bill_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          feature_name: string | null
          id: string
          idempotency_key: string
          lemonsqueezy_order_id: string | null
          metadata: Json
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          feature_name?: string | null
          id?: string
          idempotency_key: string
          lemonsqueezy_order_id?: string | null
          metadata?: Json
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          feature_name?: string | null
          id?: string
          idempotency_key?: string
          lemonsqueezy_order_id?: string | null
          metadata?: Json
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      core_profiles: {
        Row: {
          billing_tier: string | null
          created_at: string | null
          date_format: string
          email: string
          full_name: string | null
          id: string
          language_preference: string
          last_password_change: string | null
          timezone: string
        }
        Insert: {
          billing_tier?: string | null
          created_at?: string | null
          date_format?: string
          email: string
          full_name?: string | null
          id: string
          language_preference?: string
          last_password_change?: string | null
          timezone?: string
        }
        Update: {
          billing_tier?: string | null
          created_at?: string | null
          date_format?: string
          email?: string
          full_name?: string | null
          id?: string
          language_preference?: string
          last_password_change?: string | null
          timezone?: string
        }
        Relationships: []
      }
      core_security_violations: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          metadata: Json
          user_agent: string | null
          violation_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          metadata?: Json
          user_agent?: string | null
          violation_type: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          metadata?: Json
          user_agent?: string | null
          violation_type?: string
        }
        Relationships: []
      }
      kw_cache: {
        Row: {
          analysis_data: Json | null
          country_code: string
          device_type: string | null
          id: string
          keyword: string
          language_code: string
          last_accessed_at: string
          last_labs_update: string
          last_serp_update: string | null
          match_type: string
          raw_data: Json | null
          slug: string
        }
        Insert: {
          analysis_data?: Json | null
          country_code: string
          device_type?: string | null
          id?: string
          keyword: string
          language_code?: string
          last_accessed_at?: string
          last_labs_update?: string
          last_serp_update?: string | null
          match_type: string
          raw_data?: Json | null
          slug: string
        }
        Update: {
          analysis_data?: Json | null
          country_code?: string
          device_type?: string | null
          id?: string
          keyword?: string
          language_code?: string
          last_accessed_at?: string
          last_labs_update?: string
          last_serp_update?: string | null
          match_type?: string
          raw_data?: Json | null
          slug?: string
        }
        Relationships: []
      }
      kw_filter_presets: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_default: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          is_default?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_default?: boolean
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kw_filter_presets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "core_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kw_serp_tasks: {
        Row: {
          created_at: string
          id: string
          keyword_slug: string
          status: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keyword_slug: string
          status?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keyword_slug?: string
          status?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kw_serp_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "core_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_credits_atomic: {
        Args: {
          p_amount: number
          p_description?: string
          p_feature_name: string
          p_idempotency_key?: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: {
          balance: number
          success: boolean
        }[]
      }
      deduct_credits_atomic: {
        Args: { p_amount: number; p_idempotency_key: string; p_user_id: string }
        Returns: {
          balance: number
          success: boolean
        }[]
      }
      maintain_kw_cache_health: { Args: never; Returns: undefined }
      refund_credits_atomic: {
        Args: { p_amount: number; p_idempotency_key: string; p_user_id: string }
        Returns: {
          balance: number
          success: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
