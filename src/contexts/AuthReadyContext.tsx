'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { signOut as signOutHelper } from '@/lib/supabase-helpers';

interface AuthReadyContextValue {
  isAuthReady: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthReadyContext = createContext<AuthReadyContextValue>({
  isAuthReady: false,
  isAuthenticated: false,
  logout: async () => {},
});

export const AuthReadyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('[AuthReady] getSession error:', err);
        // Even on error, mark as ready so app doesn't hang
      } finally {
        setIsAuthReady(true);
      }
    };

    // Add a safety timeout - if auth check takes too long, proceed anyway
    const timeoutId = setTimeout(() => {
      if (!isAuthReady) {
        console.warn('[AuthReady] Auth check timed out after 5s, proceeding anyway');
        setIsAuthReady(true);
      }
    }, 5000);

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);

      if (event === 'SIGNED_IN') {
        router.push('/dashboard');
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        router.push('/login');
        router.refresh();
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [router, isAuthReady]);

  const logout = async () => {
    try {
      // Use centralized helper to ensure server-side session cookies are cleared as well
      await signOutHelper();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthReadyContext.Provider value={{ isAuthReady, isAuthenticated, logout }}>
      {children}
    </AuthReadyContext.Provider>
  );
};

export const useAuthReady = () => useContext(AuthReadyContext);
