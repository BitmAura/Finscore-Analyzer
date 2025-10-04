-- Moved all SQL schema files from root to /sql folder for better organization
-- Supabase-compatible schema for storing bank account metadata
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    job_id uuid REFERENCES public.analysis_jobs(id) ON DELETE CASCADE,
    bank_name text NOT NULL,
    account_number text NOT NULL,
    account_holder text,
    account_type text,
    created_at timestamp with time zone DEFAULT now()
);
