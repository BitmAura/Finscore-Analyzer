import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Use cookies helper directly (Next.js 15 pattern)
    const supabase = createRouteHandlerClient({ cookies });

    // server-side sign out will clear auth cookies used by middleware
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[/api/auth/clear-session] failed to sign out server-side:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[/api/auth/clear-session] server-side sign out successful');
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[/api/auth/clear-session] unexpected error:', err);
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
