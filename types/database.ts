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
      auth_rate_limits: {
        Row: {
          attempted_at: string
          email: string
          id: string
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      completed_dates: {
        Row: {
          actual_cost: number | null
          completed_at: string | null
          id: string
          notes: string | null
          profile_id: string
          rating: number | null
          suggestion_id: string
          would_repeat: boolean | null
        }
        Insert: {
          actual_cost?: number | null
          completed_at?: string | null
          id?: string
          notes?: string | null
          profile_id: string
          rating?: number | null
          suggestion_id: string
          would_repeat?: boolean | null
        }
        Update: {
          actual_cost?: number | null
          completed_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string
          rating?: number | null
          suggestion_id?: string
          would_repeat?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "completed_dates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_dates_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          partner_a: string
          partner_b: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          partner_a: string
          partner_b?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          partner_a?: string
          partner_b?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "couples_partner_a_fkey"
            columns: ["partner_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couples_partner_b_fkey"
            columns: ["partner_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      date_sessions: {
        Row: {
          chosen_idea_id: string | null
          context: Json | null
          couple_id: string
          created_at: string
          created_by: string
          filters: Json | null
          id: string
          match_idea_ids: string[]
          mode: string
          revealed_at: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          chosen_idea_id?: string | null
          context?: Json | null
          couple_id: string
          created_at?: string
          created_by: string
          filters?: Json | null
          id?: string
          match_idea_ids?: string[]
          mode?: string
          revealed_at?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          chosen_idea_id?: string | null
          context?: Json | null
          couple_id?: string
          created_at?: string
          created_by?: string
          filters?: Json | null
          id?: string
          match_idea_ids?: string[]
          mode?: string
          revealed_at?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_sessions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      exclusions: {
        Row: {
          created_at: string | null
          excluded_until: string
          id: string
          idea_template_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          excluded_until: string
          id?: string
          idea_template_id: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          excluded_until?: string
          id?: string
          idea_template_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exclusions_idea_template_id_fkey"
            columns: ["idea_template_id"]
            isOneToOne: false
            referencedRelation: "idea_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exclusions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          idea_template_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          idea_template_id: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          idea_template_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_idea_template_id_fkey"
            columns: ["idea_template_id"]
            isOneToOne: false
            referencedRelation: "idea_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_templates: {
        Row: {
          category: string
          cost_level: number
          created_at: string | null
          description: string
          dietary_friendly: string[] | null
          duration_minutes: number
          estimated_cost_max: number | null
          estimated_cost_min: number | null
          id: string
          intensity_level: number | null
          is_active: boolean | null
          quick_filters: string[] | null
          requires_reservation: boolean | null
          reservation_platforms: string[] | null
          search_keywords: string[] | null
          seasonal: string[] | null
          setting_type: string | null
          title: string
          updated_at: string | null
          venue_type: string | null
          vibe_tags: string[] | null
        }
        Insert: {
          category: string
          cost_level: number
          created_at?: string | null
          description: string
          dietary_friendly?: string[] | null
          duration_minutes: number
          estimated_cost_max?: number | null
          estimated_cost_min?: number | null
          id?: string
          intensity_level?: number | null
          is_active?: boolean | null
          quick_filters?: string[] | null
          requires_reservation?: boolean | null
          reservation_platforms?: string[] | null
          search_keywords?: string[] | null
          seasonal?: string[] | null
          setting_type?: string | null
          title: string
          updated_at?: string | null
          venue_type?: string | null
          vibe_tags?: string[] | null
        }
        Update: {
          category?: string
          cost_level?: number
          created_at?: string | null
          description?: string
          dietary_friendly?: string[] | null
          duration_minutes?: number
          estimated_cost_max?: number | null
          estimated_cost_min?: number | null
          id?: string
          intensity_level?: number | null
          is_active?: boolean | null
          quick_filters?: string[] | null
          requires_reservation?: boolean | null
          reservation_platforms?: string[] | null
          search_keywords?: string[] | null
          seasonal?: string[] | null
          setting_type?: string | null
          title?: string
          updated_at?: string | null
          venue_type?: string | null
          vibe_tags?: string[] | null
        }
        Relationships: []
      }
      mystery_dates: {
        Row: {
          created_at: string
          dress_code: string | null
          idea_template_id: string
          planner_id: string
          revealed: boolean
          scheduled_at: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          dress_code?: string | null
          idea_template_id: string
          planner_id: string
          revealed?: boolean
          scheduled_at?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          dress_code?: string | null
          idea_template_id?: string
          planner_id?: string
          revealed?: boolean
          scheduled_at?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_dates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "date_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          cost_levels: number[] | null
          created_at: string | null
          dietary_restrictions: string[] | null
          display_name: string | null
          favorite_categories: string[] | null
          id: string
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          location_state: string | null
          max_distance_miles: number | null
          partner_name: string | null
          preferred_day_of_week: number[] | null
          preferred_intensity_levels: number[] | null
          preferred_time_of_day: string[] | null
          updated_at: string | null
          vibe_tags: string[] | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          cost_levels?: number[] | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          favorite_categories?: string[] | null
          id: string
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_state?: string | null
          max_distance_miles?: number | null
          partner_name?: string | null
          preferred_day_of_week?: number[] | null
          preferred_intensity_levels?: number[] | null
          preferred_time_of_day?: string[] | null
          updated_at?: string | null
          vibe_tags?: string[] | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          cost_levels?: number[] | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          favorite_categories?: string[] | null
          id?: string
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_state?: string | null
          max_distance_miles?: number | null
          partner_name?: string | null
          preferred_day_of_week?: number[] | null
          preferred_intensity_levels?: number[] | null
          preferred_time_of_day?: string[] | null
          updated_at?: string | null
          vibe_tags?: string[] | null
        }
        Relationships: []
      }
      prompt_cards: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          kind: string
          text: string
          vibe_tags: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind: string
          text: string
          vibe_tags?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          text?: string
          vibe_tags?: string[]
        }
        Relationships: []
      }
      session_candidates: {
        Row: {
          id: string
          idea_template_id: string
          match_score: number | null
          position: number
          score_breakdown: Json | null
          session_id: string
        }
        Insert: {
          id?: string
          idea_template_id: string
          match_score?: number | null
          position: number
          score_breakdown?: Json | null
          session_id: string
        }
        Update: {
          id?: string
          idea_template_id?: string
          match_score?: number | null
          position?: number
          score_breakdown?: Json | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_candidates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "date_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_picks: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          liked: boolean
          profile_id: string
          session_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          liked: boolean
          profile_id: string
          session_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          liked?: boolean
          profile_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_picks_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "session_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_picks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "date_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          created_at: string | null
          generated_reservation_url: string | null
          generated_venue_address: string | null
          generated_venue_name: string | null
          id: string
          idea_template_id: string
          profile_id: string
          scheduled_at: string | null
          scheduled_duration_minutes: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          generated_reservation_url?: string | null
          generated_venue_address?: string | null
          generated_venue_name?: string | null
          id?: string
          idea_template_id: string
          profile_id: string
          scheduled_at?: string | null
          scheduled_duration_minutes?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          generated_reservation_url?: string | null
          generated_venue_address?: string | null
          generated_venue_name?: string | null
          id?: string
          idea_template_id?: string
          profile_id?: string
          scheduled_at?: string | null
          scheduled_duration_minutes?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_idea_template_id_fkey"
            columns: ["idea_template_id"]
            isOneToOne: false
            referencedRelation: "idea_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_couple_invite: {
        Args: { p_code: string }
        Returns: string
      }
      check_auth_rate_limit: {
        Args: {
          p_email: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      dn_score_v4: {
        Args: {
          i_avg_rating: number
          i_category: string
          i_comp_n: number
          i_cost_level: number
          i_cost_min: number
          i_dietary_friendly: string[]
          i_fav_n: number
          i_intensity: number
          i_rating_n: number
          i_seasonal: string[]
          i_sugg_n: number
          i_vibe_tags: string[]
          p_budget_max: number
          p_cost_levels: number[]
          p_current_season: string
          p_dietary: string[]
          p_favorite_categories: string[]
          p_pref_intensity: number[]
          p_vibe_tags: string[]
        }
        Returns: Json
      }
      generate_couple_candidates_v3: {
        Args: {
          p_current_season?: string
          p_intensity_levels?: number[]
          p_limit?: number
          p_profile_a: string
          p_profile_b?: string
          p_setting_types?: string[]
        }
        Returns: {
          idea_data: Json
          idea_id: string
          match_score: number
          score_breakdown: Json
        }[]
      }
      get_active_exclusions: {
        Args: { p_profile_id: string }
        Returns: {
          days_remaining: number
          excluded_until: string
          idea_template_id: string
          title: string
        }[]
      }
      get_mystery_view: {
        Args: { p_session_id: string }
        Returns: Json
      }
      get_profile_stats: {
        Args: { p_profile_id: string }
        Returns: {
          active_exclusions: number
          average_rating: number
          completed_dates: number
          favorites_count: number
          total_suggestions: number
        }[]
      }
      get_prompt_cards: {
        Args: { p_idea_id: string; p_limit?: number }
        Returns: {
          id: string
          kind: string
          text: string
        }[]
      }
      get_session_state: {
        Args: { p_session_id: string }
        Returns: Json
      }
      is_couple_member: {
        Args: { p_couple_id: string }
        Returns: boolean
      }
      resolve_session: {
        Args: { p_session_id: string }
        Returns: Json
      }
      reveal_mystery: {
        Args: { p_session_id: string }
        Returns: Json
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
