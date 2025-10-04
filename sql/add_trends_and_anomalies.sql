ALTER TABLE public.analysis_jobs
ADD COLUMN IF NOT EXISTS trends jsonb,
ADD COLUMN IF NOT EXISTS anomalies jsonb;
