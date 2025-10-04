"use client";

import { supabase } from '../../lib/supabase-client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NewAnalysisModal from '../../components/dashboard/CreateNewReportModal';
import { motion } from 'framer-motion';

// Add proper types for activities and jobs
interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  status?: string;
}

interface AnalysisJob {
  id: string;
  created_at: string;
  status: string;
  document_name?: string;
  report_name: string;
}

interface UserStats {
  totalAnalyses: number;
  thisMonth: number;
  processingQueue: number;
  avgProcessingTime: string;
  systemHealth: number;
  storageUsed: number;
  activeUsers: number;
  riskAlertsCount: number;
}

const AnalystDashboardPage: React.FC = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<UserStats>({
    totalAnalyses: 0,
    thisMonth: 0,
    processingQueue: 0,
    avgProcessingTime: '0 min',
    systemHealth: 98.5,
    storageUsed: 0,
    activeUsers: 1,
    riskAlertsCount: 0
  });
  const [currentUserName, setCurrentUserName] = useState<string>('User');
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user name and stats
  const fetchUserNameAndStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login if no session
        router.push('/login');
        return;
      }

      const { user } = session;

      // Set user name
      if (user && user.user_metadata && user.user_metadata.name) {
        setCurrentUserName(user.user_metadata.name);
      } else if (user && user.email) {
        setCurrentUserName(user.email.split('@')[0]);
      }

      // Fetch user-specific dashboard stats from Supabase
      const { data: stats, error: statsError } = await supabase
        .from('user_dashboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        // PGRST116 is "no rows found" - not an error for new users
        console.error('Failed to fetch user stats:', statsError);
      }

      if (stats) {
        setDashboardData({
          totalAnalyses: stats.total_analyses || 0,
          thisMonth: stats.this_month || 0,
          processingQueue: stats.processing_queue || 0,
          avgProcessingTime: stats.avg_processing_time || '0 min',
          systemHealth: stats.system_health || 98.5,
          storageUsed: stats.storage_used || 0,
          activeUsers: stats.active_users || 1,
          riskAlertsCount: stats.risk_alerts_count || 0
        });
      }

      // Fetch recent user activities
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error('Failed to fetch user activities:', activitiesError);
      }

      // Fetch recent analysis jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('analysis_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (jobsError) {
        console.error('Failed to fetch analysis jobs:', jobsError);
      }

      // Combine activities and jobs to show in recent activities section
      const combinedActivities: Activity[] = [];

      if (activities) {
        combinedActivities.push(...activities);
      }

      if (jobs) {
        setAnalysisJobs(jobs);

        const jobActivities = jobs.map(job => ({
          id: `job-${job.id}`,
          type: 'analysis',
          description: `${job.report_name || 'Analysis'} (${job.status})`,
          created_at: job.created_at,
          status: job.status
        }));

        combinedActivities.push(...jobActivities);
      }

      // Sort by creation date and set to state
      combinedActivities.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecentActivities(combinedActivities.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNameAndStats();
  }, [router]);

  const handleModalClose = () => {
    setShowNewAnalysisModal(false);
    // Refresh data when modal closes
    fetchUserNameAndStats();
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Processing</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-lg mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800">Error</h2>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={fetchUserNameAndStats}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <NewAnalysisModal
        isOpen={showNewAnalysisModal}
        onClose={handleModalClose}
        onSuccess={fetchUserNameAndStats}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back, {currentUserName}! Here is what is happening with your financial analysis platform.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalAnalyses}</p>
                {dashboardData.totalAnalyses > 0 && (
                  <p className="text-xs text-green-600">+{Math.min(dashboardData.thisMonth, dashboardData.totalAnalyses)} this month</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-8 0h8m0 0v8a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reports Created</p>
                <p className="text-2xl font-bold text-gray-900">{analysisJobs.filter(job => job.status === 'completed').length}</p>
                {analysisJobs.length > 0 && (
                  <p className="text-xs text-green-600">Latest: {new Date(analysisJobs[0]?.created_at || Date.now()).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing Queue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisJobs.filter(job => job.status === 'pending' || job.status === 'processing').length}
                </p>
                <p className="text-xs text-blue-600">Avg: {dashboardData.avgProcessingTime}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Risk Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.riskAlertsCount}</p>
                {dashboardData.riskAlertsCount > 0 ? (
                  <p className="text-xs text-red-600">Needs attention</p>
                ) : (
                  <p className="text-xs text-green-600">All clear</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setShowNewAnalysisModal(true)}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-700">New Analysis</span>
            </button>

            <Link href="/my-reports" className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">My Reports</span>
            </Link>

            <Link href="/documents" className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Manage Files</span>
            </Link>

            <Link href="/analytics" className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">View Analytics</span>
            </Link>

            <Link href="/subscription" className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Subscription</span>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Health</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">{dashboardData.systemHealth}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: `${dashboardData.systemHealth}%` }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="text-sm font-medium text-blue-600">{dashboardData.storageUsed}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${dashboardData.storageUsed}%` }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium text-purple-600">{dashboardData.activeUsers}</span>
                </div>

                <div className="pt-4 border-t">
                  <Link href="/security" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003.05 7.984V12a9 9 0 0018 0V7.984z" />
                    </svg>
                    <span>Security Center</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>

              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No activities yet. Start by creating your first analysis!</p>
                  <button
                    onClick={() => setShowNewAnalysisModal(true)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 p-1">
                        {activity.type === 'analysis' ? (
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3 flex-grow">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</span>
                          {activity.status && (
                            <span className="ml-2">
                              {renderStatusBadge(activity.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 text-center">
                    <Link href="/my-reports" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View All Activities →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                <Link href="/my-reports" className="text-sm text-blue-600 hover:text-blue-800">
                  View All
                </Link>
              </div>

              {analysisJobs.length === 0 ? (
                <div className="text-center py-12 px-6 text-gray-500">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No reports yet</p>
                  <p className="mb-6">Start analyzing your financial documents to generate insightful reports.</p>
                  <button
                    onClick={() => setShowNewAnalysisModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Report
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Report Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {job.report_name || 'Untitled Report'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {job.document_name || 'Multiple documents'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(job.created_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(job.created_at).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(job.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {job.status === 'completed' ? (
                              <Link href={`/reports/${job.id}`} className="text-blue-600 hover:text-blue-900">
                                View Report
                              </Link>
                            ) : (
                              <span className="text-gray-400 cursor-not-allowed">
                                View Report
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalystDashboardPage;
