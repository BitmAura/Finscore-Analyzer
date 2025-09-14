import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gamibloxsvnzmfbbsrjq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey) {
  console.warn('[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Client operations may fail until envs are configured.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database
export interface UserProfile {
  id: string
  email: string
  full_name: string
  company_name?: string
  subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise'
  created_at: string
  updated_at: string
  avatar_url?: string
}

export interface Document {
  id: string
  user_id: string
  filename: string
  file_type: 'pdf' | 'csv' | 'xlsx' | 'json'
  file_size: number
  upload_date: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  analysis_results?: any
  password_protected: boolean
}

export interface AnalysisReport {
  id: string
  document_id: string
  user_id: string
  report_type: string
  generated_at: string
  data: any
}