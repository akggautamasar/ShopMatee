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
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          staff_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          staff_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          staff_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          class_name: string
          created_at: string
          id: string
          schedule: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          schedule?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          schedule?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          contact_type: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_type: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ig_customers: {
        Row: {
          billing_address: string | null
          contact_number: string | null
          created_at: string | null
          customer_tag: string | null
          email: string | null
          id: string
          name: string
          shipping_address: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          contact_number?: string | null
          created_at?: string | null
          customer_tag?: string | null
          email?: string | null
          id?: string
          name: string
          shipping_address?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_address?: string | null
          contact_number?: string | null
          created_at?: string | null
          customer_tag?: string | null
          email?: string | null
          id?: string
          name?: string
          shipping_address?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ig_inventory: {
        Row: {
          created_at: string | null
          id: string
          last_stocked_at: string | null
          low_stock_threshold: number | null
          product_id: string
          quantity_on_hand: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_stocked_at?: string | null
          low_stock_threshold?: number | null
          product_id: string
          quantity_on_hand?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_stocked_at?: string | null
          low_stock_threshold?: number | null
          product_id?: string
          quantity_on_hand?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ig_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "ig_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_invoice_items: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string
          item_description: string
          line_total: number | null
          product_id: string | null
          quantity: number
          rate: number
          tax_percentage: number | null
          unit_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id: string
          item_description: string
          line_total?: number | null
          product_id?: string | null
          quantity?: number
          rate?: number
          tax_percentage?: number | null
          unit_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string
          item_description?: string
          line_total?: number | null
          product_id?: string | null
          quantity?: number
          rate?: number
          tax_percentage?: number | null
          unit_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ig_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "ig_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ig_invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ig_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_invoices: {
        Row: {
          amount_in_words: string | null
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          discount_is_percentage: boolean | null
          due_date: string | null
          grand_total: number | null
          id: string
          invoice_date: string
          invoice_number: string | null
          notes: string | null
          shipping_charges: number | null
          status: string | null
          subtotal: number | null
          terms_and_conditions: string | null
          total_tax_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_in_words?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          discount_is_percentage?: boolean | null
          due_date?: string | null
          grand_total?: number | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          notes?: string | null
          shipping_charges?: number | null
          status?: string | null
          subtotal?: number | null
          terms_and_conditions?: string | null
          total_tax_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_in_words?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          discount_is_percentage?: boolean | null
          due_date?: string | null
          grand_total?: number | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          notes?: string | null
          shipping_charges?: number | null
          status?: string | null
          subtotal?: number | null
          terms_and_conditions?: string | null
          total_tax_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ig_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "ig_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_payments: {
        Row: {
          amount_paid: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          receipt_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ig_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "ig_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_products: {
        Row: {
          created_at: string | null
          default_rate: number | null
          id: string
          name: string
          tax_percentage: number | null
          unit_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_rate?: number | null
          id?: string
          name: string
          tax_percentage?: number | null
          unit_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_rate?: number | null
          id?: string
          name?: string
          tax_percentage?: number | null
          unit_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ig_user_settings: {
        Row: {
          company_address: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string | null
          id: string
          signature_url: string | null
          stamp_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          signature_url?: string | null
          stamp_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_address?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          signature_url?: string | null
          stamp_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_entries: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          received_date: string
          remark: string | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          received_date: string
          remark?: string | null
          source: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          received_date?: string
          remark?: string | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_entries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          name: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          created_at: string
          id: string
          periods: Json
          time_slots: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          periods?: Json
          time_slots?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          periods?: Json
          time_slots?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          address: string | null
          created_at: string
          daily_wage: number
          id: string
          mobile_number: string
          name: string
          photo_url: string | null
          post: string
          updated_at: string
          user_id: string
          workplace: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          daily_wage: number
          id?: string
          mobile_number: string
          name: string
          photo_url?: string | null
          post: string
          updated_at?: string
          user_id: string
          workplace: string
        }
        Update: {
          address?: string | null
          created_at?: string
          daily_wage?: number
          id?: string
          mobile_number?: string
          name?: string
          photo_url?: string | null
          post?: string
          updated_at?: string
          user_id?: string
          workplace?: string
        }
        Relationships: []
      }
      substitution_records: {
        Row: {
          absent_teacher: string
          created_at: string
          date: string
          id: string
          original_class: string | null
          original_subject: string | null
          period: string
          remarks: string | null
          substitute_teacher: string
          updated_at: string
          user_id: string
        }
        Insert: {
          absent_teacher: string
          created_at?: string
          date: string
          id?: string
          original_class?: string | null
          original_subject?: string | null
          period: string
          remarks?: string | null
          substitute_teacher: string
          updated_at?: string
          user_id: string
        }
        Update: {
          absent_teacher?: string
          created_at?: string
          date?: string
          id?: string
          original_class?: string | null
          original_subject?: string | null
          period?: string
          remarks?: string | null
          substitute_teacher?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          contact_number: string
          created_at: string
          id: string
          name: string
          photo_url: string | null
          post: string
          schedule: Json
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_number: string
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          post: string
          schedule?: Json
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_number?: string
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          post?: string
          schedule?: Json
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          contact_id: string
          created_at: string
          date: string
          id: string
          notes: string | null
          payment_mode: string
          signature_url: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contact_id: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          payment_mode: string
          signature_url?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          contact_id?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          payment_mode?: string
          signature_url?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_full_invoice: {
        Args:
          | {
              p_customer_id: string
              p_invoice_date: string
              p_due_date: string
              p_invoice_number: string
              p_notes: string
              p_terms: string
              p_items: Database["public"]["CompositeTypes"]["invoice_item_input"][]
            }
          | {
              p_customer_id: string
              p_invoice_date: string
              p_due_date: string
              p_notes: string
              p_terms: string
              p_items: Database["public"]["CompositeTypes"]["invoice_item_input"][]
            }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      invoice_item_input: {
        product_id: string | null
        item_description: string | null
        quantity: number | null
        unit_type: string | null
        rate: number | null
        tax_percentage: number | null
      }
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
