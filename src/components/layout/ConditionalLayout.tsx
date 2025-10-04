'use client';

import { usePathname } from 'next/navigation';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';
import React from 'react';
import { useAuthReady } from '@/contexts/AuthReadyContext';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { isAuthReady } = useAuthReady();

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

  // If this is a dashboard/protected page and auth is not yet ready, show a loading placeholder
  if (shouldShowLayout && !isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4 animate-spin">🔄</div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // For pages without sidebar/header (landing page, auth pages)
  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  // For authenticated dashboard pages with sidebar/header
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
