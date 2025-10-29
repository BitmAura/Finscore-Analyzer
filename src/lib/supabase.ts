import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate configuration - only warn in development, don't throw
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Missing Supabase environment variables.\n' +
    'Please check your .env.local file and ensure these are set:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n' +
    '  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...'
  );
  // Create a dummy client that won't crash the app
  // This allows the app to load even if Supabase is not configured
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-client-info': 'finscore-analyzer',
      },
    },
    db: {
      schema: 'public',
    },
  }
);

// Test connection on initialization (client-side only)
// Don't let this block the app from loading
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabase.auth.getSession().catch((error) => {
    console.warn('⚠️ Supabase session check failed (non-blocking):', error.message);
  });
}

export default supabase;
