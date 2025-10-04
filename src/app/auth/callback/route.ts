// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('Auth callback received:', { code: !!code, error, errorDescription });

  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/auth/signin?error=${encodeURIComponent(error)}`, request.url));
  }

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        return NextResponse.redirect(new URL('/auth/signin?error=exchange_failed', request.url));
      }

      if (data.session) {
        console.log('Session created successfully');
        return NextResponse.redirect(new URL('/analyst-dashboard', request.url));
      } else {
        console.error('No session created after code exchange');
        return NextResponse.redirect(new URL('/auth/signin?error=no_session', request.url));
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=callback_failed', request.url));
    }
  }

  // No code provided
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}
