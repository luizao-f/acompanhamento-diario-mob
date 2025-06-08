export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      billings_data: {
        Row: {
          created_at: string
          date: string
          id: string
          menstruacao: string | null
          muco: string[] | null
          observacoes: string | null
          relacao_sexual: boolean | null
          sensacao: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          menstruacao?: string | null
          muco?: string[] | null
          observacoes?: string | null
          relacao_sexual?: boolean | null
          sensacao?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          menstruacao?: string | null
          muco?: string[] | null
          observacoes?: string | null
          relacao_sexual?: boolean | null
          sensacao?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      billings_records: {
        Row: {
          created_at: string
          date: string
          id: string
          menstruation: string | null
          mucus: string[] | null
          observations: string | null
          sensations: string[] | null
          sexual_relation: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          menstruation?: string | null
          mucus?: string[] | null
          observations?: string | null
          sensations?: string[] | null
          sexual_relation?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          menstruation?: string | null
          mucus?: string[] | null
          observations?: string | null
          sensations?: string[] | null
          sexual_relation?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      menstruation_corrections: {
        Row: {
          actual_result: boolean
          correction_date: string
          correction_type: string
          created_at: string | null
          id: string
          original_prediction: boolean
          user_id: string | null
        }
        Insert: {
          actual_result: boolean
          correction_date: string
          correction_type: string
          created_at?: string | null
          id?: string
          original_prediction: boolean
          user_id?: string | null
        }
        Update: {
          actual_result?: boolean
          correction_date?: string
          correction_type?: string
          created_at?: string | null
          id?: string
          original_prediction?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      menstruation_predictions: {
        Row: {
          based_on_months: number | null
          confidence_score: number | null
          created_at: string | null
          cycle_average: number | null
          duration_average: number | null
          id: string
          predicted_date: string
          prediction_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          based_on_months?: number | null
          confidence_score?: number | null
          created_at?: string | null
          cycle_average?: number | null
          duration_average?: number | null
          id?: string
          predicted_date: string
          prediction_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          based_on_months?: number | null
          confidence_score?: number | null
          created_at?: string | null
          cycle_average?: number | null
          duration_average?: number | null
          id?: string
          predicted_date?: string
          prediction_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      prediction_settings: {
        Row: {
          created_at: string | null
          id: string
          lookback_months: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lookback_months?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lookback_months?: number | null
          updated_at?: string | null
          user_id?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
