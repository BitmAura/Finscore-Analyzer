-- Schema for Financial Analysis Platform
-- This schema creates the necessary tables for storing analysis jobs, documents, and user data

-- Bank Statements Table
CREATE TABLE IF NOT EXISTS public.bank_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT,
  account_number TEXT,
  account_type TEXT,
  currency TEXT DEFAULT 'INR',
  start_date DATE,
  end_date DATE,
  document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis Jobs Table
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  report_type TEXT DEFAULT 'bank-statement',
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  document_name TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank Transactions Table
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  debit DECIMAL(15, 2),
  credit DECIMAL(15, 2),
  balance DECIMAL(15, 2) NOT NULL,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table to track uploaded files
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  is_password_protected BOOLEAN DEFAULT FALSE,
  detected_bank TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Dashboard Stats Table
CREATE TABLE IF NOT EXISTS public.user_dashboard_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_analyses INTEGER DEFAULT 0,
  this_month INTEGER DEFAULT 0,
  processing_queue INTEGER DEFAULT 0,
  avg_processing_time TEXT DEFAULT '0 min',
  system_health DECIMAL(5,2) DEFAULT 98.5,
  storage_used DECIMAL(5,2) DEFAULT 0,
  active_users INTEGER DEFAULT 1,
  risk_alerts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activities Table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis Results Table
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID UNIQUE NOT NULL REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  cash_flow JSONB DEFAULT '{}'::jsonb,
  income_sources JSONB DEFAULT '{}'::jsonb,
  expense_categories JSONB DEFAULT '{}'::jsonb,
  risk_indicators JSONB DEFAULT '{}'::jsonb,
  trends JSONB DEFAULT '{}'::jsonb,
  recommendations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security (RLS) Policies
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view their own bank statements"
ON public.bank_statements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analysis jobs"
ON public.analysis_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own bank transactions through jobs"
ON public.bank_transactions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.analysis_jobs
  WHERE public.analysis_jobs.id = public.bank_transactions.job_id
  AND public.analysis_jobs.user_id = auth.uid()
));

CREATE POLICY "Users can view their own documents"
ON public.documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own dashboard stats"
ON public.user_dashboard_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activities"
ON public.user_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analysis results"
ON public.analysis_results FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.analysis_jobs
  WHERE public.analysis_jobs.id = public.analysis_results.job_id
  AND public.analysis_jobs.user_id = auth.uid()
));

-- Trigger to update timestamps automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bank_statements_timestamp
BEFORE UPDATE ON public.bank_statements
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_analysis_jobs_timestamp
BEFORE UPDATE ON public.analysis_jobs
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_dashboard_stats_timestamp
BEFORE UPDATE ON public.user_dashboard_stats
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_analysis_results_timestamp
BEFORE UPDATE ON public.analysis_results
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
