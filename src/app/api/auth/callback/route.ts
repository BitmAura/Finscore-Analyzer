import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Auth callback error:', error);
      // Redirect to an error page or login page with an error message
      const errorUrl = new URL('/login', request.url);
      errorUrl.searchParams.set('error', 'Failed to sign in with Google.');
      return NextResponse.redirect(errorUrl);
    }
  }

  // URL to redirect to after the sign-in process completes
  return NextResponse.redirect(`${requestUrl.origin}/analyst-dashboard`);
}
