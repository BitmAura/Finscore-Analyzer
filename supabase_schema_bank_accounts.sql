-- FinScore Analyzer - Supabase Database Schema (Bank Accounts)
-- This script defines the table for storing bank account information.

-- ----------------------------------------------------------------
-- TABLE: bank_accounts
-- Stores bank account information linked to a user.
-- ----------------------------------------------------------------
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy: Users can only see and manage their own bank accounts.
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bank accounts" ON public.bank_accounts FOR ALL USING (auth.uid() = user_id);
