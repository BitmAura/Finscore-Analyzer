-- FinScore Analyzer - Quick Setup Fix
-- Run this ONLY if tables are missing or have issues

-- This will ADD missing tables without dropping existing ones
-- Safe to run - uses CREATE TABLE IF NOT EXISTS

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Analysis Jobs Table
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    report_name text NOT NULL,
    reference_id text,
    report_type text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    document_name text,
    result jsonb,
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- 2. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    name text NOT NULL,
    original_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint,
    mime_type text,
    bank_name text,
    account_number text,
    account_holder text,
    account_type text,
    is_password_protected boolean DEFAULT false,
    uploaded_at timestamptz DEFAULT now()
);

-- 3. Bank Accounts Table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    bank_name text NOT NULL,
    account_number text NOT NULL,
    account_holder text,
    account_type text CHECK (account_type IN ('savings', 'current', 'loan', 'credit-card', 'other')),
    opening_balance numeric(15,2),
    closing_balance numeric(15,2),
    statement_period_start date,
    statement_period_end date,
    created_at timestamptz DEFAULT now()
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES public.analysis_jobs(id) ON DELETE CASCADE NOT NULL,
    bank_account_id uuid REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    transaction_date date NOT NULL,
    description text,
    debit numeric(15,2),
    credit numeric(15,2),
    balance numeric(15,2),
    category text,
    created_at timestamptz DEFAULT now()
);

-- 5. User Dashboard Stats
CREATE TABLE IF NOT EXISTS public.user_dashboard_stats (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_analyses integer DEFAULT 0,
    this_month integer DEFAULT 0,
    processing_queue integer DEFAULT 0,
    avg_processing_time text DEFAULT '0 min',
    system_health numeric DEFAULT 98.5,
    storage_used numeric DEFAULT 0,
    active_users integer DEFAULT 1,
    risk_alerts_count integer DEFAULT 0,
    last_updated timestamptz DEFAULT now()
);

-- 6. User Activities
CREATE TABLE IF NOT EXISTS public.user_activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES public.analysis_jobs(id) ON DELETE SET NULL,
    type text NOT NULL,
    description text NOT NULL,
    status text,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);

-- 7. Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan text NOT NULL CHECK (plan IN ('free', 'basic', 'professional', 'enterprise')),
    status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    started_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    auto_renew boolean DEFAULT true
);

-- 8. Security Logs
CREATE TABLE IF NOT EXISTS public.security_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    ip_address inet,
    user_agent text,
    details jsonb,
    created_at timestamptz DEFAULT now()
);

-- Create Indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_id ON public.analysis_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON public.analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created_at ON public.analysis_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON public.documents(job_id);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_job_id ON public.bank_accounts(job_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_job_id ON public.transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (with IF NOT EXISTS equivalent using DO block)
DO $$
BEGIN
    -- Analysis Jobs Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own analysis jobs') THEN
        CREATE POLICY "Users can view own analysis jobs" ON public.analysis_jobs FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own analysis jobs') THEN
        CREATE POLICY "Users can insert own analysis jobs" ON public.analysis_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own analysis jobs') THEN
        CREATE POLICY "Users can update own analysis jobs" ON public.analysis_jobs FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own analysis jobs') THEN
        CREATE POLICY "Users can delete own analysis jobs" ON public.analysis_jobs FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Documents Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own documents') THEN
        CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own documents') THEN
        CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own documents') THEN
        CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Bank Accounts Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own bank accounts') THEN
        CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own bank accounts') THEN
        CREATE POLICY "Users can insert own bank accounts" ON public.bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Transactions Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions') THEN
        CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own transactions') THEN
        CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- User Dashboard Stats Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own stats') THEN
        CREATE POLICY "Users can view own stats" ON public.user_dashboard_stats FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own stats') THEN
        CREATE POLICY "Users can update own stats" ON public.user_dashboard_stats FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own stats') THEN
        CREATE POLICY "Users can insert own stats" ON public.user_dashboard_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- User Activities Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own activities') THEN
        CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own activities') THEN
        CREATE POLICY "Users can insert own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Subscriptions Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own subscription') THEN
        CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Security Logs Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own security logs') THEN
        CREATE POLICY "Users can view own security logs" ON public.security_logs FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create Triggers
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_dashboard_stats (user_id, total_analyses, this_month)
    VALUES (NEW.user_id, 1, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_analyses = user_dashboard_stats.total_analyses + 1,
        this_month = CASE
            WHEN date_trunc('month', user_dashboard_stats.last_updated) = date_trunc('month', now())
            THEN user_dashboard_stats.this_month + 1
            ELSE 1
        END,
        last_updated = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_stats_on_job_creation ON public.analysis_jobs;
CREATE TRIGGER update_stats_on_job_creation
AFTER INSERT ON public.analysis_jobs
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

-- Success message
SELECT '✅ Setup complete! All tables, indexes, RLS policies, and triggers are ready.' as status;

