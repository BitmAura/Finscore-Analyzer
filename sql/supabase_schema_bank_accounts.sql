-- Bank Accounts Schema for FinScore Analyzer
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number text NOT NULL,
  bank_name text NOT NULL,
  account_type text,
  created_at timestamptz DEFAULT now()
);

