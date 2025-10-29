-- ============================================================================
-- FINSCORE ANALYSER - ROW LEVEL SECURITY (RLS) POLICIES
-- Production-Ready Security Policies for Supabase
-- Version: 1.0
-- Date: October 15, 2025
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. Make sure you ran STEP_1_COMPLETE_SCHEMA.sql first!
-- 2. Copy this entire file
-- 3. Go to Supabase Dashboard > SQL Editor
-- 4. Create a new query
-- 5. Paste this content
-- 6. Click "RUN" to execute
--
-- This will enable RLS and create all security policies
-- ============================================================================

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ANALYSIS JOBS POLICIES
-- ============================================================================

-- Users can view their own jobs
DROP POLICY IF EXISTS "Users can view own jobs" ON public.analysis_jobs;
CREATE POLICY "Users can view own jobs"
  ON public.analysis_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own jobs
DROP POLICY IF EXISTS "Users can create own jobs" ON public.analysis_jobs;
CREATE POLICY "Users can create own jobs"
  ON public.analysis_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs
DROP POLICY IF EXISTS "Users can update own jobs" ON public.analysis_jobs;
CREATE POLICY "Users can update own jobs"
  ON public.analysis_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own jobs
DROP POLICY IF EXISTS "Users can delete own jobs" ON public.analysis_jobs;
CREATE POLICY "Users can delete own jobs"
  ON public.analysis_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- BANK TRANSACTIONS POLICIES
-- ============================================================================

-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.bank_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.bank_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = bank_transactions.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

-- Users can insert transactions for their jobs
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.bank_transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.bank_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = bank_transactions.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

-- Users can update their own transactions
DROP POLICY IF EXISTS "Users can update own transactions" ON public.bank_transactions;
CREATE POLICY "Users can update own transactions"
  ON public.bank_transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = bank_transactions.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

-- Users can delete their own transactions
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.bank_transactions;
CREATE POLICY "Users can delete own transactions"
  ON public.bank_transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = bank_transactions.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ANALYSIS RESULTS POLICIES
-- ============================================================================

-- Users can view their own results
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

-- Users can insert their own results
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

-- Users can update their own results
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

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upload documents" ON public.documents;
CREATE POLICY "Users can upload documents"
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

-- ============================================================================
-- BANK STATEMENTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own statements" ON public.bank_statements;
CREATE POLICY "Users can view own statements"
  ON public.bank_statements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own statements" ON public.bank_statements;
CREATE POLICY "Users can insert own statements"
  ON public.bank_statements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own statements" ON public.bank_statements;
CREATE POLICY "Users can update own statements"
  ON public.bank_statements FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own statements" ON public.bank_statements;
CREATE POLICY "Users can delete own statements"
  ON public.bank_statements FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER DASHBOARD STATS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own stats" ON public.user_dashboard_stats;
CREATE POLICY "Users can view own stats"
  ON public.user_dashboard_stats FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_dashboard_stats;
CREATE POLICY "Users can insert own stats"
  ON public.user_dashboard_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON public.user_dashboard_stats;
CREATE POLICY "Users can update own stats"
  ON public.user_dashboard_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USER ACTIVITIES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities"
  ON public.user_activities FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log own activities" ON public.user_activities;
CREATE POLICY "Users can log own activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SUBSCRIPTION POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can create own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PAYMENT TRANSACTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_transactions;
CREATE POLICY "Users can view own payments"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create payment records" ON public.payment_transactions;
CREATE POLICY "Users can create payment records"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- API KEYS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
CREATE POLICY "Users can view own API keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create API keys" ON public.api_keys;
CREATE POLICY "Users can create API keys"
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

-- ============================================================================
-- AUDIT LOGS POLICIES (Read-only for users)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- SERVICE ROLE POLICIES (Backend operations)
-- ============================================================================

-- Service role bypass (for backend processing)
DROP POLICY IF EXISTS "Service role full access jobs" ON public.analysis_jobs;
CREATE POLICY "Service role full access jobs"
  ON public.analysis_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access transactions" ON public.bank_transactions;
CREATE POLICY "Service role full access transactions"
  ON public.bank_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access results" ON public.analysis_results;
CREATE POLICY "Service role full access results"
  ON public.analysis_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STORAGE BUCKET POLICIES
-- ============================================================================

-- Create storage bucket for documents (run this only if bucket doesn't exist)
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

DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
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

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'FinScore Analyser Security Policies Applied Successfully!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'RLS Enabled: 11 tables';
  RAISE NOTICE 'Policies Created: 40+';
  RAISE NOTICE 'Storage Bucket: documents (secured)';
  RAISE NOTICE '';
  RAISE NOTICE 'Your database is now PRODUCTION-READY!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Test authentication in your app';
  RAISE NOTICE '2. Upload a sample bank statement';
  RAISE NOTICE '3. Verify RLS is working (users see only their data)';
  RAISE NOTICE '==================================================';
END $$;

