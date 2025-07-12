export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          action_recommended: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          impact: string
          product_name: string | null
          severity: string
          title: string
          warehouse: string
          zone: string | null
        }
        Insert: {
          action_recommended?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          impact: string
          product_name?: string | null
          severity: string
          title: string
          warehouse: string
          zone?: string | null
        }
        Update: {
          action_recommended?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          impact?: string
          product_name?: string | null
          severity?: string
          title?: string
          warehouse?: string
          zone?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string | null
          demand_trend: string
          forecast_demand: number
          id: string
          last_replenished: string
          product_name: string
          reorder_point: number
          sku: string
          stock_level: number
          supplier: string
          unit_cost: number
          updated_at: string | null
          warehouse: string
          zone: string
        }
        Insert: {
          category: string
          created_at?: string | null
          demand_trend?: string
          forecast_demand?: number
          id?: string
          last_replenished?: string
          product_name: string
          reorder_point?: number
          sku: string
          stock_level?: number
          supplier: string
          unit_cost?: number
          updated_at?: string | null
          warehouse: string
          zone: string
        }
        Update: {
          category?: string
          created_at?: string | null
          demand_trend?: string
          forecast_demand?: number
          id?: string
          last_replenished?: string
          product_name?: string
          reorder_point?: number
          sku?: string
          stock_level?: number
          supplier?: string
          unit_cost?: number
          updated_at?: string | null
          warehouse?: string
          zone?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean
          reroute_id: string | null
          target_warehouse: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean
          reroute_id?: string | null
          target_warehouse: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean
          reroute_id?: string | null
          target_warehouse?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_reroute_id_fkey"
            columns: ["reroute_id"]
            isOneToOne: false
            referencedRelation: "reroutes"
            referencedColumns: ["id"]
          },
        ]
      }
      reroutes: {
        Row: {
          approved_at: string | null
          completed_at: string | null
          created_at: string | null
          delivered_at: string | null
          estimated_delivery: string | null
          from_warehouse: string
          id: string
          product_name: string
          quantity: number
          reason: string
          requested_at: string | null
          status: string
          to_warehouse: string
          transit_progress: number | null
          transit_started_at: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          from_warehouse: string
          id?: string
          product_name: string
          quantity: number
          reason: string
          requested_at?: string | null
          status?: string
          to_warehouse: string
          transit_progress?: number | null
          transit_started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          from_warehouse?: string
          id?: string
          product_name?: string
          quantity?: number
          reason?: string
          requested_at?: string | null
          status?: string
          to_warehouse?: string
          transit_progress?: number | null
          transit_started_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
          warehouse: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
          warehouse: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
          warehouse?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          warehouse: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          warehouse: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          warehouse?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
