/**
 * Enhanced Dashboard - Main User Hub
 * Production-ready with analytics, charts, and quick actions
 */

'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import AdvancedUploadZone from '@/components/upload/AdvancedUploadZone';

interface DashboardStats {
  totalReports: number;
  thisMonth: number;
  processingQueue: number;
  reportsLimit: number;
  reportsUsed: number;
  planId: string;
}

interface RecentReport {
  id: string;
  report_name: string;
  reference_id: string;
  status: string;
  created_at: string;
  metadata?: any;
}

export default function EnhancedDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state on new fetch

      const [statsRes, reportsRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/analysis-jobs?limit=5')
      ]);

      if (!statsRes.ok) {
        throw new Error(`Failed to fetch stats: ${statsRes.statusText}`);
      }
      if (!reportsRes.ok) {
        throw new Error(`Failed to fetch reports: ${reportsRes.statusText}`);
      }

      const statsData = await statsRes.json();
      const { jobs } = await reportsRes.json();

      setStats(statsData);
      setRecentReports(jobs || []);

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'An unknown error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (status === 'failed') return <XCircleIcon className="w-5 h-5 text-red-500" />;
    return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
  };

  // --- 🛡️ BULLETPROOF FIX: Defensively calculate usage to prevent division by zero ---
  const usagePercentage =
    stats && stats.reportsLimit > 0
      ? (stats.reportsUsed / stats.reportsLimit) * 100
      : 0;

  const isNearLimit = usagePercentage >= 80;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // --- 🛡️ BULLETPROOF FIX: Dedicated UI for error state to prevent crashes ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center bg-white p-8 rounded-xl shadow-md border border-red-200">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">
            There was an issue fetching your data. Please check your connection and try again.
          </p>
          <p className="text-xs text-red-700 bg-red-50 p-3 rounded-md mb-6">
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your financial analysis overview</p>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              New Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {showUpload && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upload Bank Statement</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <AdvancedUploadZone
              onUploadComplete={(jobId) => {
                setShowUpload(false);
                router.push(`/reports/${jobId}`);
              }}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalReports || 0}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.thisMonth || 0}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  Active
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ChartBarIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Processing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Processing</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.processingQueue || 0}</p>
                <p className="text-xs text-gray-500 mt-1">In queue</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Usage Limit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Usage Limit</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.reportsUsed || 0}
                  <span className="text-lg text-gray-500">/{stats?.reportsLimit === -1 ? '∞' : stats?.reportsLimit}</span>
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isNearLimit ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
              <div className={`p-3 rounded-lg ${isNearLimit ? 'bg-red-100' : 'bg-purple-100'}`}>
                <ExclamationTriangleIcon className={`w-8 h-8 ${isNearLimit ? 'text-red-600' : 'text-purple-600'}`} />
              </div>
            </div>
            {isNearLimit && stats?.reportsLimit !== -1 && (
              <Link
                href="/subscription"
                className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Upgrade Plan →
              </Link>
            )}
          </div>
        </div>

        {/* Plan Info Banner */}
        {stats?.planId === 'free' && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🚀 Unlock More Power with Pro</h3>
                <p className="text-blue-100 mb-3">
                  Get 100 reports/month, AI analysis, fraud detection, and more!
                </p>
                <Link
                  href="/subscription"
                  className="inline-block px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Upgrade Now - ₹2,999/month
                </Link>
              </div>
              <div className="hidden md:block text-6xl">💎</div>
            </div>
          </div>
        )}

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
            <Link
              href="/my-reports"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {recentReports.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No reports yet. Upload your first statement!</p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create First Report
                </button>
              </div>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(report.status)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {report.report_name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {report.reference_id} • {new Date(report.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/my-reports"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <DocumentTextIcon className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">All Reports</h3>
            <p className="text-sm text-gray-600">View and manage all your analysis reports</p>
          </Link>

          <Link
            href="/subscription"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <ChartBarIcon className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Subscription</h3>
            <p className="text-sm text-gray-600">Manage your plan and billing</p>
          </Link>

          <Link
            href="/settings"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <ExclamationTriangleIcon className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-sm text-gray-600">Configure your account preferences</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

