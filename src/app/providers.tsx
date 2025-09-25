'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <SubscriptionProvider>
        {children}
      </SubscriptionProvider>
    </SessionContextProvider>
  );
}
