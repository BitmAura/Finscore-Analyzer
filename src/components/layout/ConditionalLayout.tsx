'use client';

import { usePathname } from 'next/navigation';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';
import Navigation from './Navigation';
import React from 'react';
import { useAuthReady } from '@/contexts/AuthReadyContext';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { isAuthReady, isAuthenticated } = useAuthReady();

  // Pages that should NOT have sidebar/header (landing page, auth pages)
  const noLayoutPages = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth-simple',
    '/minimal-auth',
    '/direct-login'
  ];

  // Check if current page should have the dashboard layout
  const shouldShowLayout = !noLayoutPages.includes(pathname);

  // For public pages (no layout), don't wait for auth - render immediately
  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  // For protected pages, show loading state while checking auth
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldShowLayout && !isAuthenticated) {
    return null; // Let the middleware handle redirection
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowLayout ? (
        <>
          <Navigation />
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              <Header />
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
