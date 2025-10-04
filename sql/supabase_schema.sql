-- FinScore Analyzer - Supabase Database Schema
-- This script sets up all required tables for your SaaS financial analysis platform.

-- Moved all SQL schema files from root to /sql folder for better organization

-- Table for uploaded documents (bank statements, PDFs, etc.)
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  bank_name text,
  is_password_protected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table for financial analyses
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  files jsonb, -- Array of file names or metadata
  status text DEFAULT 'processing',
  result jsonb, -- Analysis result data
  created_at timestamptz DEFAULT now()
);

-- Table for dashboard stats per user
CREATE TABLE IF NOT EXISTS public.user_dashboard_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_analyses integer DEFAULT 0,
  this_month integer DEFAULT 0,
  processing_queue integer DEFAULT 0,
  avg_processing_time text DEFAULT '0 min',
  system_health numeric DEFAULT 98.5,
  storage_used numeric DEFAULT 0,
  active_users integer DEFAULT 1,
  risk_alerts_count integer DEFAULT 0
);

-- Table for user activities (recent actions, uploads, etc.)
CREATE TABLE IF NOT EXISTS public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text, -- e.g., 'analysis', 'upload', 'alert'
  description text,
  status text, -- e.g., 'success', 'warning', 'error'
  created_at timestamptz DEFAULT now()
);

-- Table for subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text,
  status text,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Table for security logs
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text,
  details text,
  created_at timestamptz DEFAULT now()
);

-- Add more tables as needed for future modules.
