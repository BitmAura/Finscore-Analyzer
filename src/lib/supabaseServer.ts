import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (NEVER import this into client components)
// Uses the provided project URL and reads a server-side key if available.
const SUPABASE_URL = 'https://gamibloxsvnzmfbbsrjq.supabase.co'

// Prefer service role key for server operations; fall back to SUPABASE_KEY or anon key if needed.
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

if (!SUPABASE_SERVICE_KEY) {
  console.warn('[supabaseServer] No SUPABASE_SERVICE_ROLE_KEY/SUPABASE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY found. Server operations may fail.')
}

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
