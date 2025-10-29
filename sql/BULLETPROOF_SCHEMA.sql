-- ============================================
-- FINSCORE ANALYZER - BULLETPROOF SCHEMA
-- ============================================
-- ✅ 100% Error-proof for Supabase SQL Editor
-- ✅ Checks column existence before creating indexes
-- ✅ Can run multiple times safely
-- ============================================
-- Date: 2025-10-15
-- Version: 3.0 (Bulletproof)
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚀 STARTING DATABASE SETUP';
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- STEP 1: ENABLE EXTENSIONS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '📦 Step 1: Enabling extensions...';
END $$;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

DO $$
BEGIN
    RAISE NOTICE '✅ Extensions enabled';
END $$;

-- ============================================
-- STEP 2: CREATE CORE TABLES
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '📋 Step 2: Creating core tables...';
END $$;

-- Analysis Jobs Table
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_name TEXT NOT NULL DEFAULT 'Untitled Report',
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

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    original_name TEXT,
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

-- Bank Accounts Table
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

-- Bank Transactions Table
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

-- Analysis Results Table
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
    counterparties JSONB DEFAULT '[]'::jsonb,
    ai_insights JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Dashboard Stats Table
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

-- User Activities Table
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

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'professional', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    price NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    reports_used INTEGER DEFAULT 0,
    reports_limit INTEGER DEFAULT 5,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT UNIQUE,
    order_id TEXT,
    provider TEXT DEFAULT 'razorpay',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys Table
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

-- Audit Logs Table
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
    success BOOLEAN DEFAULT true,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    RAISE NOTICE '✅ All tables created';
END $$;

-- ============================================
-- STEP 3: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🔧 Step 3: Adding missing columns...';

    -- Analysis Jobs missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='reference_id') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN reference_id TEXT;
        RAISE NOTICE '  ✓ Added reference_id to analysis_jobs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='report_type') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN report_type TEXT DEFAULT 'bank-statement';
        RAISE NOTICE '  ✓ Added report_type to analysis_jobs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='report_name') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN report_name TEXT NOT NULL DEFAULT 'Untitled Report';
        RAISE NOTICE '  ✓ Added report_name to analysis_jobs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='ai_executive_summary') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN ai_executive_summary TEXT;
        RAISE NOTICE '  ✓ Added ai_executive_summary to analysis_jobs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='trends') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN trends JSONB;
        RAISE NOTICE '  ✓ Added trends to analysis_jobs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='anomalies') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN anomalies JSONB;
        RAISE NOTICE '  ✓ Added anomalies to analysis_jobs';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='completed_at') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE '  ✓ Added completed_at to analysis_jobs';
    END IF;

    -- Documents missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='created_at') THEN
        ALTER TABLE public.documents ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '  ✓ Added created_at to documents';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='updated_at') THEN
        ALTER TABLE public.documents ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '  ✓ Added updated_at to documents';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='original_name') THEN
        ALTER TABLE public.documents ADD COLUMN original_name TEXT;
        RAISE NOTICE '  ✓ Added original_name to documents';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='file_size') THEN
        ALTER TABLE public.documents ADD COLUMN file_size BIGINT;
        RAISE NOTICE '  ✓ Added file_size to documents';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='mime_type') THEN
        ALTER TABLE public.documents ADD COLUMN mime_type TEXT;
        RAISE NOTICE '  ✓ Added mime_type to documents';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='detected_bank') THEN
        ALTER TABLE public.documents ADD COLUMN detected_bank TEXT;
        RAISE NOTICE '  ✓ Added detected_bank to documents';
    END IF;

    -- Bank Transactions missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bank_transactions' AND column_name='bank_account_id') THEN
        ALTER TABLE public.bank_transactions ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE;
        RAISE NOTICE '  ✓ Added bank_account_id to bank_transactions';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bank_transactions' AND column_name='category') THEN
        ALTER TABLE public.bank_transactions ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added category to bank_transactions';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bank_transactions' AND column_name='notes') THEN
        ALTER TABLE public.bank_transactions ADD COLUMN notes TEXT;
        RAISE NOTICE '  ✓ Added notes to bank_transactions';
    END IF;

    -- User Activities missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_activities' AND column_name='job_id') THEN
        ALTER TABLE public.user_activities ADD COLUMN job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE SET NULL;
        RAISE NOTICE '  ✓ Added job_id to user_activities';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_activities' AND column_name='metadata') THEN
        ALTER TABLE public.user_activities ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE '  ✓ Added metadata to user_activities';
    END IF;

    RAISE NOTICE '✅ All missing columns added';
END $$;

-- ============================================
-- STEP 4: CREATE INDEXES (WITH COLUMN CHECKS!)
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '⚡ Step 4: Creating performance indexes...';

    -- Analysis Jobs Indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_jobs_user_id') THEN
        CREATE INDEX idx_analysis_jobs_user_id ON public.analysis_jobs(user_id);
        RAISE NOTICE '  ✓ Created index on analysis_jobs.user_id';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_jobs_status') THEN
        CREATE INDEX idx_analysis_jobs_status ON public.analysis_jobs(status);
        RAISE NOTICE '  ✓ Created index on analysis_jobs.status';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='created_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_jobs_created_at') THEN
            CREATE INDEX idx_analysis_jobs_created_at ON public.analysis_jobs(created_at DESC);
            RAISE NOTICE '  ✓ Created index on analysis_jobs.created_at';
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='reference_id') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_jobs_reference_id') THEN
            CREATE INDEX idx_analysis_jobs_reference_id ON public.analysis_jobs(reference_id);
            RAISE NOTICE '  ✓ Created index on analysis_jobs.reference_id';
        END IF;
    END IF;

    -- Documents Indexes (WITH COLUMN EXISTENCE CHECKS!)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_user_id') THEN
        CREATE INDEX idx_documents_user_id ON public.documents(user_id);
        RAISE NOTICE '  ✓ Created index on documents.user_id';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_job_id') THEN
        CREATE INDEX idx_documents_job_id ON public.documents(job_id);
        RAISE NOTICE '  ✓ Created index on documents.job_id';
    END IF;

    -- CRITICAL: Only create index if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='created_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_created_at') THEN
            CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
            RAISE NOTICE '  ✓ Created index on documents.created_at';
        END IF;
    ELSE
        RAISE NOTICE '  ⚠ Skipped documents.created_at index (column does not exist)';
    END IF;

    -- Bank Accounts Indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_accounts_user_id') THEN
        CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
        RAISE NOTICE '  ✓ Created index on bank_accounts.user_id';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_accounts_job_id') THEN
        CREATE INDEX idx_bank_accounts_job_id ON public.bank_accounts(job_id);
        RAISE NOTICE '  ✓ Created index on bank_accounts.job_id';
    END IF;

    -- Bank Transactions Indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_user_id') THEN
        CREATE INDEX idx_bank_transactions_user_id ON public.bank_transactions(user_id);
        RAISE NOTICE '  ✓ Created index on bank_transactions.user_id';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_job_id') THEN
        CREATE INDEX idx_bank_transactions_job_id ON public.bank_transactions(job_id);
        RAISE NOTICE '  ✓ Created index on bank_transactions.job_id';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_date') THEN
        CREATE INDEX idx_bank_transactions_date ON public.bank_transactions(transaction_date DESC);
        RAISE NOTICE '  ✓ Created index on bank_transactions.transaction_date';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bank_transactions' AND column_name='category') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_category') THEN
            CREATE INDEX idx_bank_transactions_category ON public.bank_transactions(category);
            RAISE NOTICE '  ✓ Created index on bank_transactions.category';
        END IF;
    END IF;

    -- User Activities Indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_activities_user_id') THEN
        CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
        RAISE NOTICE '  ✓ Created index on user_activities.user_id';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_activities' AND column_name='created_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_activities_created_at') THEN
            CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
            RAISE NOTICE '  ✓ Created index on user_activities.created_at';
        END IF;
    END IF;

    -- Audit Logs Indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_user_id') THEN
        CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
        RAISE NOTICE '  ✓ Created index on audit_logs.user_id';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_logs' AND column_name='created_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_created_at') THEN
            CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
            RAISE NOTICE '  ✓ Created index on audit_logs.created_at';
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_action') THEN
        CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
        RAISE NOTICE '  ✓ Created index on audit_logs.action';
    END IF;

    RAISE NOTICE '✅ All indexes created';
END $$;

-- ============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🔒 Step 5: Enabling Row Level Security...';
END $$;

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

DO $$
BEGIN
    RAISE NOTICE '✅ RLS enabled on all tables';
END $$;

-- ============================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🛡️ Step 6: Creating security policies...';
END $$;

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

-- Audit Logs Policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Security Logs Policies
DROP POLICY IF EXISTS "Users can view own security logs" ON public.security_logs;
CREATE POLICY "Users can view own security logs"
    ON public.security_logs FOR SELECT
    USING (auth.uid() = user_id);

DO $$
BEGIN
    RAISE NOTICE '✅ All security policies created';
END $$;

-- ============================================
-- STEP 7: CREATE FUNCTIONS AND TRIGGERS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '⚙️ Step 7: Creating functions and triggers...';
END $$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (only if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_jobs' AND column_name='updated_at') THEN
        DROP TRIGGER IF EXISTS update_analysis_jobs_timestamp ON public.analysis_jobs;
        CREATE TRIGGER update_analysis_jobs_timestamp
            BEFORE UPDATE ON public.analysis_jobs
            FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='documents' AND column_name='updated_at') THEN
        DROP TRIGGER IF EXISTS update_documents_timestamp ON public.documents;
        CREATE TRIGGER update_documents_timestamp
            BEFORE UPDATE ON public.documents
            FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_dashboard_stats' AND column_name='updated_at') THEN
        DROP TRIGGER IF EXISTS update_user_dashboard_stats_timestamp ON public.user_dashboard_stats;
        CREATE TRIGGER update_user_dashboard_stats_timestamp
            BEFORE UPDATE ON public.user_dashboard_stats
            FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analysis_results' AND column_name='updated_at') THEN
        DROP TRIGGER IF EXISTS update_analysis_results_timestamp ON public.analysis_results;
        CREATE TRIGGER update_analysis_results_timestamp
            BEFORE UPDATE ON public.analysis_results
            FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_subscriptions' AND column_name='updated_at') THEN
        DROP TRIGGER IF EXISTS update_user_subscriptions_timestamp ON public.user_subscriptions;
        CREATE TRIGGER update_user_subscriptions_timestamp
            BEFORE UPDATE ON public.user_subscriptions
            FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='api_keys' AND column_name='updated_at') THEN
        DROP TRIGGER IF EXISTS update_api_keys_timestamp ON public.api_keys;
        CREATE TRIGGER update_api_keys_timestamp
            BEFORE UPDATE ON public.api_keys
            FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;
END $$;

-- Function to update user stats on job creation
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

-- Function to update user stats on job completion
CREATE OR REPLACE FUNCTION update_user_stats_on_job_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE public.user_dashboard_stats
        SET processing_queue = GREATEST(processing_queue - 1, 0),
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

DO $$
BEGIN
    RAISE NOTICE '✅ All functions and triggers created';
END $$;

-- ============================================
-- STEP 8: STORAGE BUCKET SETUP
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '📦 Step 8: Setting up storage...';
END $$;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket configured';
END $$;

-- ============================================
-- FINAL SUMMARY
-- ============================================
DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';

    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname NOT LIKE '%_pkey';

    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables: % ✓', table_count;
    RAISE NOTICE 'RLS Policies: % ✓', policy_count;
    RAISE NOTICE 'Indexes: % ✓', index_count;
    RAISE NOTICE 'Triggers: % ✓', trigger_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 Your database is production-ready!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '1. ✓ Database schema is complete';
    RAISE NOTICE '2. ✓ Security (RLS) is enabled';
    RAISE NOTICE '3. ✓ Performance indexes created';
    RAISE NOTICE '4. ✓ Automation triggers active';
    RAISE NOTICE '5. ✓ Storage bucket ready';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 You can now use FinScore Analyzer!';
    RAISE NOTICE '========================================';
END $$;

