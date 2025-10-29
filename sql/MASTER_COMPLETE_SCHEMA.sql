-- ============================================
-- FINSCORE ANALYZER - MASTER COMPLETE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- This is the definitive, consolidated schema for production
-- Version: 1.0
-- Date: 2025-10-15
-- ============================================

-- ============================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================
-- STEP 2: CREATE CORE TABLES
-- ============================================

-- Analysis Jobs Table (Primary table for all financial analysis jobs)
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_name TEXT NOT NULL,
    reference_id TEXT,
    report_type TEXT DEFAULT 'bank-statement',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    document_name TEXT,
    error TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    result JSONB DEFAULT '{}'::jsonb,
    ai_executive_summary TEXT,
    trends JSONB,
    anomalies JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Documents Table (Uploaded files and their metadata)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    mime_type TEXT,
    bank_name TEXT,
    account_number TEXT,
    account_holder TEXT,
    account_type TEXT,
    is_password_protected BOOLEAN DEFAULT false,
    detected_bank TEXT,
    status TEXT DEFAULT 'uploaded',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Accounts Table (Bank account metadata from statements)
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder TEXT,
    account_type TEXT CHECK (account_type IN ('savings', 'current', 'loan', 'credit-card', 'other')),
    currency TEXT DEFAULT 'INR',
    opening_balance NUMERIC(15,2),
    closing_balance NUMERIC(15,2),
    statement_period_start DATE,
    statement_period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Transactions Table (Individual transactions from statements)
CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    debit NUMERIC(15,2),
    credit NUMERIC(15,2),
    balance NUMERIC(15,2) NOT NULL,
    category TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis Results Table (Detailed analysis results)
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID UNIQUE NOT NULL REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    summary JSONB DEFAULT '{}'::jsonb,
    cash_flow JSONB DEFAULT '{}'::jsonb,
    income_sources JSONB DEFAULT '{}'::jsonb,
    expense_categories JSONB DEFAULT '{}'::jsonb,
    risk_indicators JSONB DEFAULT '{}'::jsonb,
    trends JSONB DEFAULT '{}'::jsonb,
    anomalies JSONB DEFAULT '{}'::jsonb,
    recommendations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Dashboard Stats Table (User-specific dashboard metrics)
CREATE TABLE IF NOT EXISTS public.user_dashboard_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_analyses INTEGER DEFAULT 0,
    this_month INTEGER DEFAULT 0,
    processing_queue INTEGER DEFAULT 0,
    avg_processing_time TEXT DEFAULT '0 min',
    system_health NUMERIC(5,2) DEFAULT 98.5,
    storage_used NUMERIC(10,2) DEFAULT 0,
    active_users INTEGER DEFAULT 1,
    risk_alerts_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activities Table (Activity log for each user)
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions Table (Subscription management)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'professional', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    price NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions Table (Payment history)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT UNIQUE,
    provider TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys Table (For API access management)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table (Security and compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Logs Table
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Analysis Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_id ON public.analysis_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON public.analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created_at ON public.analysis_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_reference_id ON public.analysis_jobs(reference_id);

-- Documents Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON public.documents(job_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Bank Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_job_id ON public.bank_accounts(job_id);

-- Bank Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user_id ON public.bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_job_id ON public.bank_transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_category ON public.bank_transactions(category);

-- User Activities Indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ============================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

-- Analysis Jobs Policies
DROP POLICY IF EXISTS "Users can view own analysis jobs" ON public.analysis_jobs;
CREATE POLICY "Users can view own analysis jobs"
    ON public.analysis_jobs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analysis jobs" ON public.analysis_jobs;
CREATE POLICY "Users can insert own analysis jobs"
    ON public.analysis_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own analysis jobs" ON public.analysis_jobs;
CREATE POLICY "Users can update own analysis jobs"
    ON public.analysis_jobs FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own analysis jobs" ON public.analysis_jobs;
CREATE POLICY "Users can delete own analysis jobs"
    ON public.analysis_jobs FOR DELETE
    USING (auth.uid() = user_id);

-- Documents Policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- Bank Accounts Policies
DROP POLICY IF EXISTS "Users can view own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can view own bank accounts"
    ON public.bank_accounts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can insert own bank accounts"
    ON public.bank_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can update own bank accounts"
    ON public.bank_accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- Bank Transactions Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.bank_transactions;
CREATE POLICY "Users can view own transactions"
    ON public.bank_transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.bank_transactions;
CREATE POLICY "Users can insert own transactions"
    ON public.bank_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.bank_transactions;
CREATE POLICY "Users can update own transactions"
    ON public.bank_transactions FOR UPDATE
    USING (auth.uid() = user_id);

-- Analysis Results Policies
DROP POLICY IF EXISTS "Users can view own results" ON public.analysis_results;
CREATE POLICY "Users can view own results"
    ON public.analysis_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.analysis_jobs
            WHERE analysis_jobs.id = analysis_results.job_id
            AND analysis_jobs.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own results" ON public.analysis_results;
CREATE POLICY "Users can insert own results"
    ON public.analysis_results FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.analysis_jobs
            WHERE analysis_jobs.id = analysis_results.job_id
            AND analysis_jobs.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own results" ON public.analysis_results;
CREATE POLICY "Users can update own results"
    ON public.analysis_results FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.analysis_jobs
            WHERE analysis_jobs.id = analysis_results.job_id
            AND analysis_jobs.user_id = auth.uid()
        )
    );

-- User Dashboard Stats Policies
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_dashboard_stats;
CREATE POLICY "Users can view own stats"
    ON public.user_dashboard_stats FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON public.user_dashboard_stats;
CREATE POLICY "Users can update own stats"
    ON public.user_dashboard_stats FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_dashboard_stats;
CREATE POLICY "Users can insert own stats"
    ON public.user_dashboard_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User Activities Policies
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities"
    ON public.user_activities FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
CREATE POLICY "Users can insert own activities"
    ON public.user_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User Subscriptions Policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription"
    ON public.user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription"
    ON public.user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscription"
    ON public.user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Payment Transactions Policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_transactions;
CREATE POLICY "Users can view own payments"
    ON public.payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert payment records" ON public.payment_transactions;
CREATE POLICY "Users can insert payment records"
    ON public.payment_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- API Keys Policies
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
CREATE POLICY "Users can view own API keys"
    ON public.api_keys FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert API keys" ON public.api_keys;
CREATE POLICY "Users can insert API keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own API keys" ON public.api_keys;
CREATE POLICY "Users can update own API keys"
    ON public.api_keys FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own API keys" ON public.api_keys;
CREATE POLICY "Users can delete own API keys"
    ON public.api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- Audit Logs Policies (Read-only for users)
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Security Logs Policies
DROP POLICY IF EXISTS "Users can view own security logs" ON public.security_logs;
CREATE POLICY "Users can view own security logs"
    ON public.security_logs FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_timestamp trigger to relevant tables
DROP TRIGGER IF EXISTS update_analysis_jobs_timestamp ON public.analysis_jobs;
CREATE TRIGGER update_analysis_jobs_timestamp
    BEFORE UPDATE ON public.analysis_jobs
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_documents_timestamp ON public.documents;
CREATE TRIGGER update_documents_timestamp
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_user_dashboard_stats_timestamp ON public.user_dashboard_stats;
CREATE TRIGGER update_user_dashboard_stats_timestamp
    BEFORE UPDATE ON public.user_dashboard_stats
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_analysis_results_timestamp ON public.analysis_results;
CREATE TRIGGER update_analysis_results_timestamp
    BEFORE UPDATE ON public.analysis_results
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_user_subscriptions_timestamp ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_timestamp
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_api_keys_timestamp ON public.api_keys;
CREATE TRIGGER update_api_keys_timestamp
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Function to auto-update user stats when analysis job is created
CREATE OR REPLACE FUNCTION update_user_stats_on_job_create()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_dashboard_stats (user_id, total_analyses, this_month, processing_queue)
    VALUES (NEW.user_id, 1, 1, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_analyses = user_dashboard_stats.total_analyses + 1,
        this_month = CASE
            WHEN date_trunc('month', user_dashboard_stats.updated_at) = date_trunc('month', NOW())
            THEN user_dashboard_stats.this_month + 1
            ELSE 1
        END,
        processing_queue = user_dashboard_stats.processing_queue + 1,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_stats_on_job_create ON public.analysis_jobs;
CREATE TRIGGER trigger_update_stats_on_job_create
    AFTER INSERT ON public.analysis_jobs
    FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_job_create();

-- Function to update stats when job is completed
CREATE OR REPLACE FUNCTION update_user_stats_on_job_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE public.user_dashboard_stats
        SET processing_queue = GREATEST(0, processing_queue - 1),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_stats_on_job_complete ON public.analysis_jobs;
CREATE TRIGGER trigger_update_stats_on_job_complete
    AFTER UPDATE ON public.analysis_jobs
    FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_job_complete();

-- ============================================
-- STEP 7: CREATE STORED PROCEDURES
-- ============================================

-- Procedure to increment user analyses count
CREATE OR REPLACE FUNCTION public.increment_user_analyses(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_dashboard_stats (user_id, total_analyses, this_month)
    VALUES (p_user_id, 1, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_analyses = user_dashboard_stats.total_analyses + 1,
        this_month = user_dashboard_stats.this_month + 1,
        updated_at = NOW();
END;
$$;

-- Procedure to get user analytics
CREATE OR REPLACE FUNCTION public.get_user_analytics(p_user_id UUID)
RETURNS TABLE (
    total_jobs BIGINT,
    completed_jobs BIGINT,
    failed_jobs BIGINT,
    total_transactions BIGINT,
    total_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(aj.id) as total_jobs,
        COUNT(CASE WHEN aj.status = 'completed' THEN 1 END) as completed_jobs,
        COUNT(CASE WHEN aj.status = 'failed' THEN 1 END) as failed_jobs,
        COUNT(bt.id) as total_transactions,
        COALESCE(SUM(COALESCE(bt.credit, 0) + COALESCE(bt.debit, 0)), 0) as total_amount
    FROM public.analysis_jobs aj
    LEFT JOIN public.bank_transactions bt ON bt.job_id = aj.id
    WHERE aj.user_id = p_user_id;
END;
$$;

-- ============================================
-- STEP 8: GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after the schema to verify everything is set up correctly:

SELECT
    'Tables Created' as check_type,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
UNION ALL
SELECT
    'RLS Enabled Tables' as check_type,
    COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
UNION ALL
SELECT
    'Policies Created' as check_type,
    COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT
    'Indexes Created' as check_type,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT
    'Functions Created' as check_type,
    COUNT(*) as count
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace;

-- ============================================
-- SCHEMA SETUP COMPLETE
-- ============================================
-- Next Steps:
-- 1. Set up Storage Bucket (see STORAGE_SETUP.sql)
-- 2. Configure Authentication (see AUTH_SETUP.md)
-- 3. Run seed data (see seed_sample_data.sql if needed)
-- ============================================

