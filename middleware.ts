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
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/analytics') ||
                          request.nextUrl.pathname.startsWith('/reports') ||
                          request.nextUrl.pathname.startsWith('/analyst-dashboard');

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/dashboard/:path*', '/analytics/:path*', '/reports/:path*', '/auth/:path*', '/analyst-dashboard/:path*'],
};
