'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../../lib/supabase-client';

export default function Header() {
  const router = useRouter();
  const user = useUser();

  // Try to display a friendly name if available
  const userName = (user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || null;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
      }
      // Force hard navigation to login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">FS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FinScore Analyzer</h1>
        </div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700">Welcome back{userName ? `, ${userName}` : '!'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
