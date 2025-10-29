/**
 * Simple Settings Page - Working Version
 */
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-100"
            >
              Subscription
            </button>
            <button
              onClick={() => router.push('/subscription')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

