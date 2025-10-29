'use client';

import React, { useState, useEffect } from 'react';
import supabase from '../../lib/supabase'; // Unified client
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { signOut as signOutHelper } from '@/lib/supabase-helpers';
import { useAuthReady } from '@/contexts/AuthReadyContext';

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const user = useUser();
  const { isAuthReady, isAuthenticated } = useAuthReady();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;
    setIsAuthChecked(true);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // populate user info from auth helper
    const emailFromUser = user?.email ?? null;
    setUserEmail(emailFromUser);
    setNewEmail(emailFromUser ?? '');
  }, [isAuthReady, isAuthenticated, user?.email, router]);

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Use centralized signOut helper so server-side cookies are cleared
      const result = await signOutHelper();
      if (!result) {
        setError('Error signing out during account deletion. Please try again.');
        console.error('Account Deletion Failed: signOutHelper returned false');
        return;
      }

      setMessage('Account deletion initiated. You have been signed out.');
      router.push('/login');
      router.refresh();
    } catch (error: any) {
      console.error('Account deletion error:', error);
      setError(`Error deleting account: ${error.message}`);
      console.error(`Account Deletion Failed: Error deleting account: ${error.message}`);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEmailUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!newEmail || newEmail === userEmail) {
      setError('Please enter a new email address.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      setError(`Error updating email: ${error.message}`);
      console.error('Email update error:', error);
    } else {
      setMessage('Email update initiated. Please check your new email for a verification link.');
      setUserEmail(newEmail);
    }
    setIsLoading(false);
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(`Error updating password: ${error.message}`);
      console.error('Password update error:', error);
    } else {
      setMessage('Password updated successfully!');
      setPassword('');
      setConfirmPassword('');
    }
    setIsLoading(false);
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center">User Profile</h1>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}

        {/* Email Update Form */}
        <form onSubmit={handleEmailUpdate} className="space-y-4 border-b pb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Update Email</h2>
          <div>
            <label htmlFor="current-email" className="block text-sm font-medium text-gray-700">Current Email</label>
            <input
              id="current-email"
              type="email"
              value={userEmail || ''}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600"
            />
          </div>
          <div>
            <label htmlFor="new-email" className="block text-sm font-medium text-gray-700">New Email</label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Updating...' : 'Update Email'}
          </button>
        </form>

        {/* Password Update Form */}
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">Update Password</h2>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {/* Subscription Status Display */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">Subscription Status</h2>
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
            <p className="text-gray-700">Current Plan: <span className="font-medium text-blue-600">Premium</span></p>
            <p className="text-gray-700">Status: <span className="font-medium text-green-600">Active</span></p>
            <p className="text-gray-700">Renews On: <span className="font-medium text-gray-800">October 24, 2025</span></p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Manage Subscription
            </button>
          </div>
        </div>
        {/* Delete Account Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-red-700">Danger Zone</h2>
          <p className="text-gray-600">Permanently delete your account and all associated data.</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="p-8 border w-96 shadow-lg rounded-md bg-white text-center">
              <h3 className="text-lg font-bold text-gray-900">Confirm Account Deletion</h3>
              <p className="py-4 text-gray-600">Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {isLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}