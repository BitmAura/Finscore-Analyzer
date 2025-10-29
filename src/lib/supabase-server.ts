/**
 * Server-side Supabase client with service role key
 * Use this for admin operations and bypassing RLS
 */
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '❌ Missing Supabase server configuration.\n' +
    'Please check your .env.local file and ensure these are set:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n' +
    '  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...'
  );
}

/**
 * Admin client with service role privileges
 * ⚠️ WARNING: This bypasses Row Level Security
 * Only use on the server-side, never expose to client
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      'x-client-info': 'finscore-analyzer-admin',
    },
  },
});

/**
 * Creates a Supabase client for API routes (Next.js 15+ compatible)
 * Properly handles async cookies()
 * 
 * @example
 * const supabase = await createServerClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  
  return createRouteHandlerClient<Database>({ 
    cookies: (() => cookieStore) as any 
  });
}

export default supabaseAdmin;
