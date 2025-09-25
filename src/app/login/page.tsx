'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase-client'; // Updated to use the unified client
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  console.log('Supabase URL from client:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Key from client:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Supabase login error:", error); // Log the full error object
          setError(`Login Failed: ${error.message}`);
          setIsLoading(false);
          return;
        }

        console.log("Supabase login data:", data); // Log the full data object

        if (data.session) {
            router.push('/analyst-dashboard');
            router.refresh();
        } else {
            setError('Login did not return a session. Please check your credentials and try again.');
            setIsLoading(false);
        }

    } catch (err: any) {
        console.error("Login form submission error:", err);
        setError(`An unexpected error occurred: ${err.message}`);
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This URL will handle the user session after they return from Google.
        // We will need to create this route.
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });
    if (error) {
        setError(error.message);
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600">Welcome back to FinScore Analyzer</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="text-sm text-right">
            <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">Forgot your password?</Link>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
        </div>

        <div>
          <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 400.2 0 261.8 0 123.8 111.8 12.8 244 12.8c70.3 0 129.8 27.8 174.3 71.9l-64.4 64.4c-23-21.5-55.2-34.6-90.1-34.6-69.5 0-126.3 56.8-126.3 126.3s56.8 126.3 126.3 126.3c76.3 0 110.5-52.7 114.9-79.5H244v-96h244z"></path></svg>
            Sign In with Google
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account? <Link href="/signup" className="font-medium text-blue-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
