'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { AuthReadyProvider } from '@/contexts/AuthReadyContext';
import { Toaster } from 'react-hot-toast';
import CommandPalette from '@/components/ui/CommandPalette';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => {
    try {
      return createClientComponentClient();
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      // Return a minimal client that won't crash
      return null as any;
    }
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during mount to prevent hydration errors
  if (!mounted) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!supabaseClient) {
    return <div style={{ padding: '2rem', color: 'red' }}>
      Error: Failed to initialize Supabase. Please check your environment variables.
      <br/>
      {children}
    </div>;
  }

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <AuthReadyProvider>
        <SubscriptionProvider>
          {/* Global UI utilities */}
          <Toaster position="top-right" />
          <CommandPalette />
          {children}
        </SubscriptionProvider>
      </AuthReadyProvider>
    </SessionContextProvider>
  );
}
