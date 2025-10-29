import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';
import { useAuthReady } from '@/contexts/AuthReadyContext';

const Header: React.FC = () => {
  const router = useRouter();
  const user = useUser();
  const { logout } = useAuthReady();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">Welcome back, {userName}!</h1>
        </div>
        <nav>
          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
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
};

export default Header;
