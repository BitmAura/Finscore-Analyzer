'use client';

import { usePathname } from 'next/navigation';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

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
