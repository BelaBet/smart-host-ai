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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          id: string
          metadata: Json
          new_data: Json | null
          occurred_at: string
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          id?: string
          metadata?: Json
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          id?: string
          metadata?: Json
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      cashier_sessions: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closing_balance: number | null
          created_at: string
          difference: number | null
          expected_balance: number | null
          id: string
          notes: string | null
          opened_at: string
          opened_by: string
          opening_balance: number
          status: Database["public"]["Enums"]["cashier_session_status"]
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string
          difference?: number | null
          expected_balance?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by: string
          opening_balance?: number
          status?: Database["public"]["Enums"]["cashier_session_status"]
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string
          difference?: number | null
          expected_balance?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string
          opening_balance?: number
          status?: Database["public"]["Enums"]["cashier_session_status"]
        }
        Relationships: []
      }
      cashier_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string
          guest_id: string | null
          id: string
          payment_method: string
          room_number: string | null
          session_id: string
          type: Database["public"]["Enums"]["cashier_transaction_type"]
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          guest_id?: string | null
          id?: string
          payment_method: string
          room_number?: string | null
          session_id: string
          type: Database["public"]["Enums"]["cashier_transaction_type"]
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          guest_id?: string | null
          id?: string
          payment_method?: string
          room_number?: string | null
          session_id?: string
          type?: Database["public"]["Enums"]["cashier_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "cashier_transactions_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashier_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cashier_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          document: string
          document_type: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          total_spent: number
          total_stays: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          document: string
          document_type?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          total_spent?: number
          total_stays?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          document?: string
          document_type?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          total_spent?: number
          total_stays?: number
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          adults: number
          check_in: string
          check_out: string
          children: number
          confirmation_code: string
          created_at: string
          guest_id: string
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          room_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          total_value: number
          updated_at: string
        }
        Insert: {
          adults?: number
          check_in: string
          check_out: string
          children?: number
          confirmation_code: string
          created_at?: string
          guest_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          room_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_value: number
          updated_at?: string
        }
        Update: {
          adults?: number
          check_in?: string
          check_out?: string
          children?: number
          confirmation_code?: string
          created_at?: string
          guest_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          room_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_maintenance: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string
          description: string
          id: string
          notes: string | null
          room_id: string
          scheduled_date: string | null
          status: string
          type: string
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          room_id: string
          scheduled_date?: string | null
          status?: string
          type: string
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          room_id?: string
          scheduled_date?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_maintenance_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          floor: number
          id: string
          notes: string | null
          number: string
          price_per_night: number
          status: Database["public"]["Enums"]["room_status"]
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          floor?: number
          id?: string
          notes?: string | null
          number: string
          price_per_night?: number
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          floor?: number
          id?: string
          notes?: string | null
          number?: string
          price_per_night?: number
          status?: Database["public"]["Enums"]["room_status"]
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      close_cashier: {
        Args: {
          p_closing_balance: number
          p_notes?: string
          p_session_id: string
        }
        Returns: {
          closed_at: string | null
          closed_by: string | null
          closing_balance: number | null
          created_at: string
          difference: number | null
          expected_balance: number | null
          id: string
          notes: string | null
          opened_at: string
          opened_by: string
          opening_balance: number
          status: Database["public"]["Enums"]["cashier_session_status"]
        }
        SetofOptions: {
          from: "*"
          to: "cashier_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      open_cashier: {
        Args: { p_opening_balance: number }
        Returns: {
          closed_at: string | null
          closed_by: string | null
          closing_balance: number | null
          created_at: string
          difference: number | null
          expected_balance: number | null
          id: string
          notes: string | null
          opened_at: string
          opened_by: string
          opening_balance: number
          status: Database["public"]["Enums"]["cashier_session_status"]
        }
        SetofOptions: {
          from: "*"
          to: "cashier_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      cashier_session_status: "open" | "closed"
      cashier_transaction_type: "income" | "expense"
      reservation_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
      room_status:
        | "available"
        | "occupied"
        | "maintenance"
        | "cleaning"
        | "reserved"
      room_type: "standard" | "superior" | "deluxe" | "suite" | "presidential"
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
    Enums: {
      cashier_session_status: ["open", "closed"],
      cashier_transaction_type: ["income", "expense"],
      reservation_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ],
      room_status: [
        "available",
        "occupied",
        "maintenance",
        "cleaning",
        "reserved",
      ],
      room_type: ["standard", "superior", "deluxe", "suite", "presidential"],
    },
  },
} as const
