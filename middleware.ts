import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Create a Supabase client specific for this middleware
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Handle authentication for protected routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                    request.nextUrl.pathname.startsWith('/signup') ||
                    request.nextUrl.pathname.startsWith('/forgot-password') ||
                    request.nextUrl.pathname.startsWith('/reset-password');

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/analyst-dashboard') ||
                          request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/analytics') ||
                          request.nextUrl.pathname.startsWith('/my-reports') ||
                          request.nextUrl.pathname.startsWith('/documents') ||
                          request.nextUrl.pathname.startsWith('/profile') ||
                          request.nextUrl.pathname.startsWith('/subscription') ||
                          request.nextUrl.pathname.startsWith('/security') ||
                          request.nextUrl.pathname.startsWith('/reports');

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/analyst-dashboard', request.url));
  }

  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/analyst-dashboard/:path*',
    '/dashboard/:path*',
    '/analytics/:path*',
    '/my-reports/:path*',
    '/documents/:path*',
    '/profile/:path*',
    '/subscription/:path*',
    '/security/:path*',
    '/reports/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ],
};
