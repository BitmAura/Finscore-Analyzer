// src/lib/supabase-helpers.ts
import supabase from './supabase';
import { CategorizedTransaction } from './analysis/categorization-service';

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
export async function saveTransactionsLegacy(
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

export async function saveTransactions(jobId: string, transactions: CategorizedTransaction[]): Promise<boolean> {
  const { error } = await supabase
    .from('bank_transactions')
    .insert(
      transactions.map(tx => ({
        job_id: jobId,
        user_id: tx.user_id || '',
        date: tx.date,
        description: tx.description,
        debit: tx.debit,
        credit: tx.credit,
        balance: tx.balance,
        category: tx.category
      }))
    );

  if (error) {
    console.error('Error saving bank transactions:', error);
    return false;
  }

  return true;
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

export async function signUp(email: string, password: string, options?: any) {
  const signUpParams: any = { email, password, options: options || {} };

  const { data, error } = await supabase.auth.signUp(signUpParams);

  if (error) {
    throw error;
  }

  // If signUp returns a session (rare if email confirmations are disabled), sync it with server
  if (data?.session) {
    try {
      await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
        credentials: 'same-origin',
      });
    } catch (err) {
      console.warn('Failed to sync signUp session with server:', err);
    }
  }

  return data;
}

// Rate limiting tracker - uses localStorage for persistence across page reloads
const MAX_ATTEMPTS = 8; // Increased from 5 to reduce false positives
const RATE_LIMIT_WINDOW = 120000; // 2 minutes (120 seconds)

function checkRateLimit(email: string): boolean {
  if (typeof window === 'undefined') return true; // Skip on server-side

  const now = Date.now();
  const storageKey = `login_attempts_${email}`;

  try {
    const stored = localStorage.getItem(storageKey);
    const attempts = stored ? JSON.parse(stored) : null;

    if (!attempts) {
      localStorage.setItem(storageKey, JSON.stringify({ count: 1, lastAttempt: now }));
      return true;
    }

    // Reset if outside window
    if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
      localStorage.setItem(storageKey, JSON.stringify({ count: 1, lastAttempt: now }));
      return true;
    }

    // Check if limit exceeded
    if (attempts.count >= MAX_ATTEMPTS) {
      const waitTime = Math.ceil((RATE_LIMIT_WINDOW - (now - attempts.lastAttempt)) / 1000);
      throw new Error(`Too many login attempts. Please wait ${waitTime} seconds and try again.`);
    }

    // Increment attempts
    attempts.count++;
    attempts.lastAttempt = now;
    localStorage.setItem(storageKey, JSON.stringify(attempts));
    return true;
  } catch (err) {
    console.warn('Rate limit check failed:', err);
    return true; // Allow login if localStorage fails
  }
}

// Clear rate limit for an email (call on successful login)
function clearRateLimit(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`login_attempts_${email}`);
  } catch (err) {
    console.warn('Failed to clear rate limit:', err);
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('🔐 Attempting sign in for:', email);
    // Check client-side rate limit first
    checkRateLimit(email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Supabase auth error:', error);
      // Handle specific error types
      if (error.message.includes('rate limit') || error.message.includes('Email rate limit exceeded')) {
        throw new Error('Too many login attempts from Supabase. Please wait 5-10 minutes and try again.');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email address before logging in.');
      }
      throw error;
    }

    console.log('✅ Sign in successful for:', email);
    // Clear rate limit on successful login
    clearRateLimit(email);

    // Sync session to server so middleware and server-side routes can read it
    if (data?.session) {
      try {
        console.log('🔄 Syncing session to server');
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        });
        console.log('✅ Session synced successfully');
      } catch (err) {
        console.warn('Failed to sync signIn session with server:', err);
      }
    }

    return data;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
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
  try {
    // Client-side sign out to clear local storage/session
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out (client):', error);
      // continue to attempt server-side clear anyway
    }

    // Also call server endpoint to clear server-side session cookies used by middleware
    try {
      const res = await fetch('/api/auth/clear-session', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (!res.ok) {
        let body = null;
        try { body = await res.json(); } catch (e) { /* ignore parse errors */ }
        console.warn('Server clear-session returned non-ok:', res.status, body);
      } else {
        console.log('Server-side session cleared');
      }
    } catch (err) {
      console.warn('Failed to call server clear-session:', err);
    }

    // Redirect to homepage after successful logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }

    return true;
  } catch (err) {
    console.error('Error signing out:', err);
    return false;
  }
}
