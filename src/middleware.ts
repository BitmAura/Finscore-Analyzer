import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // If the user is not logged in and tries to access a protected route, redirect to login.
  if (!session && pathname.startsWith('/analyst-dashboard')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If the user is logged in and tries to access a public auth page (like login/signup), redirect to the dashboard.
  if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password')) {
    const url = req.nextUrl.clone();
    url.pathname = '/analyst-dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}

// Configure the middleware to run on specific paths.
export const config = {
  matcher: [
    '/analyst-dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
