CREATE INDEX idx_transactions_job_id_alt ON public.transactions(job_id);
        END IF;
    END IF;

    RAISE NOTICE '✅ Indexes created (skipped existing ones)';
END $$;

-- ============================================
-- STEP 4: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bank_accounts') THEN
        ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analysis_results') THEN
        ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_subscriptions') THEN
        ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payment_transactions') THEN
        ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'api_keys') THEN
        ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transactions') THEN
        ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- STEP 5: CREATE RLS POLICIES (IF NOT EXISTS)
-- ============================================

-- Analysis Jobs Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own analysis jobs' AND tablename = 'analysis_jobs') THEN
        CREATE POLICY "Users can view own analysis jobs"
            ON public.analysis_jobs FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own analysis jobs' AND tablename = 'analysis_jobs') THEN
        CREATE POLICY "Users can insert own analysis jobs"
            ON public.analysis_jobs FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own analysis jobs' AND tablename = 'analysis_jobs') THEN
        CREATE POLICY "Users can update own analysis jobs"
            ON public.analysis_jobs FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own analysis jobs' AND tablename = 'analysis_jobs') THEN
        CREATE POLICY "Users can delete own analysis jobs"
            ON public.analysis_jobs FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Bank Transactions Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions' AND tablename = 'bank_transactions') THEN
        CREATE POLICY "Users can view own transactions"
            ON public.bank_transactions FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own transactions' AND tablename = 'bank_transactions') THEN
        CREATE POLICY "Users can insert own transactions"
            ON public.bank_transactions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Documents Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own documents' AND tablename = 'documents') THEN
        CREATE POLICY "Users can view own documents"
            ON public.documents FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own documents' AND tablename = 'documents') THEN
        CREATE POLICY "Users can insert own documents"
            ON public.documents FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- User Dashboard Stats Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own stats' AND tablename = 'user_dashboard_stats') THEN
        CREATE POLICY "Users can view own stats"
            ON public.user_dashboard_stats FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own stats' AND tablename = 'user_dashboard_stats') THEN
        CREATE POLICY "Users can update own stats"
            ON public.user_dashboard_stats FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own stats' AND tablename = 'user_dashboard_stats') THEN
        CREATE POLICY "Users can insert own stats"
            ON public.user_dashboard_stats FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- User Activities Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own activities' AND tablename = 'user_activities') THEN
        CREATE POLICY "Users can view own activities"
            ON public.user_activities FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own activities' AND tablename = 'user_activities') THEN
        CREATE POLICY "Users can insert own activities"
            ON public.user_activities FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- STEP 6: CREATE UPDATE TRIGGERS
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (DROP first to avoid duplicates)
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

-- ============================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================

-- Update user stats on job creation
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

-- ============================================
-- FINAL VERIFICATION
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
    missing_created_at INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO missing_created_at
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.column_name = 'created_at'
        AND c.table_schema = 'public'
    );

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ INCREMENTAL SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total tables: %', table_count;
    RAISE NOTICE 'Tables missing created_at: %', missing_created_at;

    IF missing_created_at = 0 THEN
        RAISE NOTICE '🎉 All tables have created_at column!';
        RAISE NOTICE '✅ Database is ready!';
    ELSE
        RAISE WARNING '⚠️ Some tables still missing created_at';
    END IF;
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- DONE! ✅
-- ============================================
-- This script safely added only missing items
-- No duplicate errors, no conflicts
-- ============================================
-- ============================================
-- INCREMENTAL SCHEMA - ONLY MISSING ITEMS
-- ============================================
-- This adds ONLY what's missing from your database
-- Safe to run - uses IF NOT EXISTS and IF EXISTS checks
-- ============================================

-- ============================================
-- STEP 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add missing columns to analysis_jobs (if they don't exist)
DO $$
BEGIN
    -- Check and add user_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'user_id' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Check and add report_name if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'report_name' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN report_name TEXT;
    END IF;

    -- Check and add reference_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'reference_id' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN reference_id TEXT DEFAULT ('REF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)));
    END IF;

    -- Check and add report_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'report_type' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN report_type TEXT DEFAULT 'bank-statement';
    END IF;

    -- Check and add error if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'error' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN error TEXT;
    END IF;

    -- Check and add metadata if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'metadata' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Check and add result if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'result' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN result JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Check and add ai_executive_summary if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'ai_executive_summary' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN ai_executive_summary TEXT;
    END IF;

    -- Check and add trends if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'trends' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN trends JSONB;
    END IF;

    -- Check and add anomalies if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'anomalies' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN anomalies JSONB;
    END IF;

    -- Check and add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'created_at' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Check and add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Check and add completed_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'analysis_jobs' AND column_name = 'completed_at' AND table_schema = 'public') THEN
        ALTER TABLE public.analysis_jobs ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;

    RAISE NOTICE '✅ analysis_jobs columns checked/added';
END $$;

-- Add missing columns to bank_transactions
DO $$
BEGIN
    -- Check and add user_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bank_transactions' AND column_name = 'user_id' AND table_schema = 'public') THEN
        ALTER TABLE public.bank_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Check and add transaction_date if missing (but keep 'date' column as well)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bank_transactions' AND column_name = 'transaction_date' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bank_transactions' AND column_name = 'date' AND table_schema = 'public') THEN
            -- Just use the existing 'date' column, don't add transaction_date
            RAISE NOTICE 'bank_transactions already has date column, skipping transaction_date';
        ELSE
            ALTER TABLE public.bank_transactions ADD COLUMN transaction_date DATE;
        END IF;
    END IF;

    -- Check and add category if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bank_transactions' AND column_name = 'category' AND table_schema = 'public') THEN
        ALTER TABLE public.bank_transactions ADD COLUMN category TEXT;
    END IF;

    -- Check and add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'bank_transactions' AND column_name = 'created_at' AND table_schema = 'public') THEN
        ALTER TABLE public.bank_transactions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    RAISE NOTICE '✅ bank_transactions columns checked/added';
END $$;

-- Add missing columns to user_dashboard_stats
DO $$
BEGIN
    -- Check and add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_dashboard_stats' AND column_name = 'created_at' AND table_schema = 'public') THEN
        ALTER TABLE public.user_dashboard_stats ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Check and add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_dashboard_stats' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE public.user_dashboard_stats ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    RAISE NOTICE '✅ user_dashboard_stats columns checked/added';
END $$;

-- Add missing columns to documents
DO $$
BEGIN
    -- Check and add user_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'documents' AND column_name = 'user_id' AND table_schema = 'public') THEN
        ALTER TABLE public.documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Check and add job_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'documents' AND column_name = 'job_id' AND table_schema = 'public') THEN
        ALTER TABLE public.documents ADD COLUMN job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE;
    END IF;

    -- Check and add original_name if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'documents' AND column_name = 'original_name' AND table_schema = 'public') THEN
        ALTER TABLE public.documents ADD COLUMN original_name TEXT;
    END IF;

    -- Check and add file_path if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'documents' AND column_name = 'file_path' AND table_schema = 'public') THEN
        ALTER TABLE public.documents ADD COLUMN file_path TEXT;
    END IF;

    -- Check and add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'documents' AND column_name = 'created_at' AND table_schema = 'public') THEN
        ALTER TABLE public.documents ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Check and add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'documents' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE public.documents ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    RAISE NOTICE '✅ documents columns checked/added';
END $$;

-- ============================================
-- STEP 2: CREATE MISSING TABLES
-- ============================================

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder TEXT,
    account_type TEXT,
    currency TEXT DEFAULT 'INR',
    opening_balance NUMERIC(15,2),
    closing_balance NUMERIC(15,2),
    statement_period_start DATE,
    statement_period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, bank_name, account_number)
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

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL DEFAULT 'free',
    status TEXT DEFAULT 'active',
    billing_cycle TEXT DEFAULT 'monthly',
    price NUMERIC(10,2),
    currency TEXT DEFAULT 'INR',
    reports_used INTEGER DEFAULT 0,
    reports_limit INTEGER DEFAULT 5,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id),
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    payment_id TEXT UNIQUE,
    order_id TEXT,
    provider TEXT DEFAULT 'razorpay',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    ip_address INET,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Logs Table
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address INET,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Accounts Table
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table (alternative)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.financial_accounts(id),
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    balance NUMERIC(15,2),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: CREATE MISSING INDEXES (SAFE)
-- ============================================

-- Only create indexes that don't exist
DO $$
BEGIN
    -- analysis_jobs indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_jobs_user_id') THEN
        CREATE INDEX idx_analysis_jobs_user_id ON public.analysis_jobs(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_jobs_status') THEN
        CREATE INDEX idx_analysis_jobs_status ON public.analysis_jobs(status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_jobs_created_at') THEN
        CREATE INDEX idx_analysis_jobs_created_at ON public.analysis_jobs(created_at DESC);
    END IF;

    -- bank_transactions indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_user_id') THEN
        CREATE INDEX idx_bank_transactions_user_id ON public.bank_transactions(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_job_id') THEN
        CREATE INDEX idx_bank_transactions_job_id ON public.bank_transactions(job_id);
    END IF;

    -- Only create this if the column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'bank_transactions' AND column_name = 'transaction_date') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_transactions_date') THEN
            CREATE INDEX idx_bank_transactions_date ON public.bank_transactions(transaction_date DESC);
        END IF;
    END IF;

    -- documents indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_user_id') THEN
        CREATE INDEX idx_documents_user_id ON public.documents(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_job_id') THEN
        CREATE INDEX idx_documents_job_id ON public.documents(job_id);
    END IF;

    -- user_activities indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_activities_user_id') THEN
        CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_activities_created_at') THEN
        CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
    END IF;

    -- bank_accounts indexes
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bank_accounts') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bank_accounts_user_id') THEN
            CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
        END IF;
    END IF;

    -- transactions indexes (avoid duplicate)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transactions') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_user_id_alt') THEN
            CREATE INDEX idx_transactions_user_id_alt ON public.transactions(user_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_job_id_alt') THEN
            CREATE INDEX idx_transactions_job_id_alt ON public.transactions(job_id);
        END IF;
    END IF;

    RAISE NOTICE '✅ Missing indexes created (skipped existing ones)';
END $$;

-- ============================================
-- STEP 4: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bank_accounts') THEN
        ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'analysis_results') THEN
        ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_subscriptions') THEN
        ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payment_transactions') THEN
        ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'api_keys') THEN
        ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transactions') THEN
        ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- STEP 5: CREATE RLS POLICIES (IF NOT EXISTS)
-- ============================================

-- Analysis Jobs Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own analysis jobs' AND tablename = 'analysis_jobs') THEN
        CREATE POLICY "Users can view own analysis jobs"
            ON public.analysis_jobs FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own analysis jobs' AND tablename = 'analysis_jobs') THEN
        CREATE POLICY "Users can insert own analysis jobs"
            ON public.analysis_jobs FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own analysis jobs' AND tablename = 'analysis_jobs') THEN
        CREATE POLICY "Users can update own analysis jobs"
            ON public.analysis_jobs FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own analysis jobs' AND tablename = 'analysis_jobs') THEN
        CREATE POLICY "Users can delete own analysis jobs"
            ON public.analysis_jobs FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Bank Transactions Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions' AND tablename = 'bank_transactions') THEN
        CREATE POLICY "Users can view own transactions"
            ON public.bank_transactions FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own transactions' AND tablename = 'bank_transactions') THEN
        CREATE POLICY "Users can insert own transactions"
            ON public.bank_transactions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Documents Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own documents' AND tablename = 'documents') THEN
        CREATE POLICY "Users can view own documents"
            ON public.documents FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own documents' AND tablename = 'documents') THEN
        CREATE POLICY "Users can insert own documents"
            ON public.documents FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- User Dashboard Stats Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own stats' AND tablename = 'user_dashboard_stats') THEN
        CREATE POLICY "Users can view own stats"
            ON public.user_dashboard_stats FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own stats' AND tablename = 'user_dashboard_stats') THEN
        CREATE POLICY "Users can update own stats"
            ON public.user_dashboard_stats FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own stats' AND tablename = 'user_dashboard_stats') THEN
        CREATE POLICY "Users can insert own stats"
            ON public.user_dashboard_stats FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- User Activities Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own activities' AND tablename = 'user_activities') THEN
        CREATE POLICY "Users can view own activities"
            ON public.user_activities FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own activities' AND tablename = 'user_activities') THEN
        CREATE POLICY "Users can insert own activities"
            ON public.user_activities FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- STEP 6: CREATE UPDATE TRIGGERS
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (DROP first to avoid duplicates)
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

-- ============================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================

-- Update user stats on job creation
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

-- ============================================
-- FINAL VERIFICATION
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
    missing_created_at INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO missing_created_at
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.column_name = 'created_at'
        AND c.table_schema = 'public'
    );

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ INCREMENTAL SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total tables: %', table_count;
    RAISE NOTICE 'Tables missing created_at: %', missing_created_at;

    IF missing_created_at = 0 THEN
        RAISE NOTICE '🎉 All tables have created_at column!';
        RAISE NOTICE '✅ Database is ready!';
    ELSE
        RAISE WARNING '⚠️ Some tables still missing created_at';
    END IF;
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- DONE! ✅
-- ============================================
-- This script safely added only missing items
-- No duplicate errors, no conflicts
-- ============================================
