'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { AuthReadyProvider } from '@/contexts/AuthReadyContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AuthReadyProvider>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </AuthReadyProvider>
    </SessionContextProvider>
  );
}
