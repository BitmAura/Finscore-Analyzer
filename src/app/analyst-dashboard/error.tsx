"use client";

import { useEffect } from "react";

export default function AnalystDashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("/analyst-dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-6 border border-gray-100 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-600">An unexpected error occurred while loading your dashboard.</p>
        {error?.message && (
          <p className="mt-3 text-xs text-gray-500 break-words">{error.message}</p>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => reset()} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Try again</button>
          <button onClick={() => (window.location.href = "/")} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200">Go home</button>
        </div>
      </div>
    </div>
  );
}
