'''-- Phase 3: The Continuous Account Model
-- Step 1: Create the foundational tables for the new data model.

-- A top-level account for a user to aggregate all their financial data.
-- A user can have multiple accounts (e.g., 'Personal', 'Business').
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    account_type text DEFAULT 'personal' NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- A new, centralized table for all transactions.
-- This table is linked to a financial_account, not a specific analysis_job.
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id uuid REFERENCES public.financial_accounts(id) ON DELETE CASCADE NOT NULL,
    
    transaction_date timestamptz NOT NULL,
    description text NOT NULL,
    amount numeric(15, 2) NOT NULL,
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    category text DEFAULT 'Uncategorized' NOT NULL,
    
    source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL, -- To trace the origin of the transaction
    is_duplicate boolean DEFAULT false, -- To handle overlapping data from multiple uploads
    
    custom_rules jsonb, -- For user-defined categorization rules
    notes text,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_accounts_user_id ON public.financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);

-- Enable Row Level Security
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their own financial accounts" 
ON public.financial_accounts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions" 
ON public.transactions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for financial_accounts
CREATE TRIGGER handle_updated_at_financial_accounts
  BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_timestamp();

-- Trigger for transactions
CREATE TRIGGER handle_updated_at_transactions
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_timestamp();

SELECT 'V1__create_account_model.sql executed successfully.' as status;
'''