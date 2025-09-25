// src/lib/supabase-helpers.ts
import supabase from './supabase';

// Types based on your Supabase schema
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AnalysisJob {
  id: string;
  user_id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_names: string[];
  summary: FinancialSummary;
  monthly_summary: MonthlySummary[];
  red_alerts: RedAlert[];
  counterparties: Counterparty[];
}

export interface Transaction {
  id: number;
  job_id: string;
  date: string;
  description: string;
  category: string | null;
  debit: number | null;
  credit: number | null;
  balance: number | null;
}

// These interfaces would match your JSONB fields
export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  average_monthly_income: number;
  average_monthly_expenses: number;
  highest_balance: number;
  lowest_balance: number;
  net_cash_flow: number;
  average_transaction_size: number;
  total_transaction_count: number;
  analysis_period_start: string;
  analysis_period_end: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  net: number;
  transaction_count: number;
}

export interface RedAlert {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  amount?: number;
  transaction_ids?: number[];
}

export interface Counterparty {
  name: string;
  transaction_count: number;
  total_incoming: number;
  total_outgoing: number;
  average_transaction: number;
  frequency: string;
  last_transaction_date: string;
}

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

// Analysis Jobs functions
export async function createAnalysisJob(userId: string, fileNames: string[]): Promise<AnalysisJob | null> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .insert({
      user_id: userId,
      status: 'pending',
      file_names: fileNames
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating analysis job:', error);
    return null;
  }

  return data;
}

export async function getAnalysisJobs(userId: string): Promise<AnalysisJob[]> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching analysis jobs:', error);
    return [];
  }

  return data || [];
}

export async function getAnalysisJob(jobId: string): Promise<AnalysisJob | null> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching analysis job:', error);
    return null;
  }

  return data;
}

export async function updateAnalysisJob(
  jobId: string,
  updates: Partial<AnalysisJob>
): Promise<AnalysisJob | null> {
  const { data, error } = await supabase
    .from('analysis_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error updating analysis job:', error);
    return null;
  }

  return data;
}

// Transactions functions
export async function saveTransactions(
  jobId: string,
  transactions: Omit<Transaction, 'id'>[]
): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .insert(
      transactions.map(tx => ({
        job_id: jobId,
        date: tx.date,
        description: tx.description,
        category: tx.category,
        debit: tx.debit,
        credit: tx.credit,
        balance: tx.balance
      }))
    );

  if (error) {
    console.error('Error saving transactions:', error);
    return false;
  }

  return true;
}

export async function getTransactions(jobId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('job_id', jobId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data || [];
}

// Authentication helper functions
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

// Fixed Google Sign-In function with proper redirect handling
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  if (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return false;
  }

  return true;
}
