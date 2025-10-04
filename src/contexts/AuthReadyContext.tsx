'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

interface AuthReadyContextValue {
  isAuthReady: boolean;
}

const AuthReadyContext = createContext<AuthReadyContextValue>({ isAuthReady: false });

export const AuthReadyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
      } catch (err) {
        console.error('[AuthReady] getSession error:', err);
      } finally {
        if (mounted) setIsAuthReady(true);
      }
    };

    init();

    // Listen to auth changes and ensure readiness remains true after init
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthReady(true);
    });

    return () => {
      mounted = false;
      try {
        listener?.subscription?.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <AuthReadyContext.Provider value={{ isAuthReady }}>
      {children}
    </AuthReadyContext.Provider>
  );
};

export const useAuthReady = () => useContext(AuthReadyContext);
