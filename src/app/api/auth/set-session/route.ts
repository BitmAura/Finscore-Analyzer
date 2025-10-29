import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body || {};

    console.log('[/api/auth/set-session] called - hasTokens=', !!access_token, !!refresh_token);

    if (!access_token || !refresh_token) {
      console.warn('[/api/auth/set-session] missing tokens');
      return NextResponse.json({ error: 'access_token and refresh_token are required' }, { status: 400 });
    }

    // Fix: Properly handle cookies() for Next.js 15
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );

    const { error } = await supabase.auth.setSession({ 
      access_token, 
      refresh_token 
    });

    if (error) {
      console.error('Failed to set session on server:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[/api/auth/set-session] session set successfully');
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error in set-session route:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
