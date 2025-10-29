import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Auth callback error:', error);
      const errorUrl = new URL('/login', request.url);
      errorUrl.searchParams.set('error', 'Failed to sign in with Google.');
      return NextResponse.redirect(errorUrl);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
