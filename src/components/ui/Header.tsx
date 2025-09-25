'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase-client'; // Updated to use the unified client
import React, { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? '');
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login');
      router.refresh();
    } else {
      console.error('Error logging out:', error.message);
      // Optionally, display an error message to the user
    }
  };

  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">FinScore Analyzer</h1>
        <nav className="flex items-center space-x-4">
          {userEmail && <span className="text-gray-700">Welcome, {userEmail}</span>}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
