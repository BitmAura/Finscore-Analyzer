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

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/analyst-dashboard',
    '/my-reports',
    '/documents',
    '/profile',
    '/security'
  ];

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (session && publicRoutes.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/analyst-dashboard';
    return NextResponse.redirect(url);
  }

  // If user is not logged in and tries to access protected routes, redirect to login
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/dashboard/:path*',
    '/analyst-dashboard/:path*',
    '/my-reports/:path*',
    '/documents/:path*',
    '/profile/:path*',
    '/security/:path*'
  ],
};
