-- Row Level Security (RLS) Policies - Critical for Production Security

-- Enable RLS on all tables
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Analysis Jobs Policies
CREATE POLICY "Users can view their own jobs"
  ON public.analysis_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs"
  ON public.analysis_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON public.analysis_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON public.analysis_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Bank Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON public.bank_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = bank_transactions.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own transactions"
  ON public.bank_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = bank_transactions.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own transactions"
  ON public.bank_transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = bank_transactions.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

-- Analysis Results Policies
CREATE POLICY "Users can view their own results"
  ON public.analysis_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = analysis_results.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own results"
  ON public.analysis_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_jobs
      WHERE analysis_jobs.id = analysis_results.job_id
      AND analysis_jobs.user_id = auth.uid()
    )
  );

-- Documents Policies
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- User Dashboard Stats Policies
CREATE POLICY "Users can view their own stats"
  ON public.user_dashboard_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.user_dashboard_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_dashboard_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Activities Policies
CREATE POLICY "Users can view their own activities"
  ON public.user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log their own activities"
  ON public.user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Subscription Policies
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Payment Transactions Policies
CREATE POLICY "Users can view their own payments"
  ON public.payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment records"
  ON public.payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- API Keys Policies
CREATE POLICY "Users can view their own API keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create API keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Audit Logs Policies (Read-only for users)
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role can manage all data"
  ON public.analysis_jobs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all transactions"
  ON public.bank_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all results"
  ON public.analysis_results FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Storage Policies (for file uploads)
-- Run these in Supabase Dashboard -> Storage -> Policies

-- Policy for uploading documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for viewing documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

