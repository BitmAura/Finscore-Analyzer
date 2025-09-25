// src/lib/supabase-client.ts
// Unified Supabase client implementation for the entire application
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/supabase';

// Create a type-safe client for client components
export const supabase: SupabaseClient<Database> = createClientComponentClient<Database>();

// Export as default for backward compatibility
export default supabase;
