export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          cif_nif: string
          name: string
          email: string
          country: string
          region: string | null
          sector: string
          company_size: string
          employee_count: number | null
          annual_revenue: number | null
          compliance_score: number
          last_score_update: string | null
          plan: 'free' | 'pro' | 'business'
          owner_id: string | null
          managed_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          cif_nif: string
          name: string
          email: string
          country: string
          region?: string | null
          sector: string
          company_size: string
          employee_count?: number | null
          annual_revenue?: number | null
          compliance_score?: number
          last_score_update?: string | null
          plan?: 'free' | 'pro' | 'business'
          owner_id?: string | null
          managed_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          cif_nif?: string
          name?: string
          email?: string
          country?: string
          region?: string | null
          sector?: string
          company_size?: string
          employee_count?: number | null
          annual_revenue?: number | null
          compliance_score?: number
          last_score_update?: string | null
          plan?: 'free' | 'pro' | 'business'
          owner_id?: string | null
          managed_by?: string | null
        }
      }
      compliance_requirements: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          category: string
          severity: 'critical' | 'high' | 'medium' | 'low'
          countries: string[]
          sectors: string[]
          company_sizes: string[]
          is_recurring: boolean
          frequency: string | null
          action_steps: Json | null
          estimated_time: number | null
          links: Json | null
        }
      }
      company_compliance: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          company_id: string
          requirement_id: string
          status: 'pending' | 'in_progress' | 'completed' | 'not_applicable'
          priority: number
          due_date: string | null
          completed_at: string | null
          notes: string | null
        }
      }
      grants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          issuer: string
          countries: string[]
          sectors: string[]
          company_sizes: string[]
          min_employees: number | null
          max_employees: number | null
          max_amount: number | null
          funding_type: string | null
          application_start: string | null
          application_deadline: string | null
          is_active: boolean
          requirements: Json | null
          documents_needed: Json | null
          official_url: string | null
          application_url: string | null
        }
      }
      company_grants: {
        Row: {
          id: string
          created_at: string
          company_id: string
          grant_id: string
          match_score: number | null
          status: 'opportunity' | 'in_progress' | 'submitted' | 'awarded' | 'rejected'
          applied_at: string | null
          result_date: string | null
          awarded_amount: number | null
          notes: string | null
        }
      }
      generated_documents: {
        Row: {
          id: string
          created_at: string
          company_id: string
          document_type: string
          title: string
          content: string
          related_grant_id: string | null
          related_requirement_id: string | null
          ai_model: string | null
          generation_prompt: string | null
          version: number
          is_final: boolean
        }
      }
    }
  }
}
