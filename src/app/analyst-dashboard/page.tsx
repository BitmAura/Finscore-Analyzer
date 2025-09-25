"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '../../lib/supabase-client';
import NewAnalysisModal from '../../components/dashboard/NewAnalysisModal';

export default function AnalystDashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalAnalyses: 0, // Set to zero for new users
    thisMonth: 0,     // Set to zero for new users
    processingQueue: 0, // Set to zero for new users
    avgProcessingTime: '0 min', // Set to zero for new users
    systemHealth: 98.5,
    storageUsed: 0, // Set to zero for new users
    activeUsers: 1, // Only the new user
    riskAlertsCount: 0 // Set to zero for new users
  });
  const [currentUserName, setCurrentUserName] = useState<string>('User');
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUserNameAndStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata && user.user_metadata.name) {
        setCurrentUserName(user.user_metadata.name);
      } else if (user && user.email) {
        setCurrentUserName(user.email.split('@')[0]);
      }
      // Fetch user-specific dashboard stats from Supabase
      if (user) {
        const { data: stats } = await supabase
          .from('user_dashboard_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
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
        const { data: userActivities, error: userActivitiesError } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (userActivitiesError) {
          console.error('Failed to fetch user activities:', userActivitiesError.message);
        }
        // Fetch recent analysis jobs for the user
        const { data: analysisJobs, error: analysisJobsError } = await supabase
          .from('analysis_jobs')
          .select('id, created_at, status, document_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (analysisJobsError) {
          console.error('Failed to fetch analysis jobs:', analysisJobsError.message);
        }
        let combinedActivities = [];
        if (userActivities) {
          combinedActivities = [...userActivities];
        }
        if (analysisJobs) {
          const mappedAnalysisJobs = analysisJobs.map(job => ({
            id: `analysis-${job.id}`,
            type: 'analysis',
            description: `Analysis of '${job.document_name || 'a document'}' completed.`,
            created_at: job.created_at,
            status: job.status,
          }));
          combinedActivities = [...combinedActivities, ...mappedAnalysisJobs];
        }
        // Sort all activities by creation date and limit to 5
        combinedActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentActivities(combinedActivities.slice(0, 5));
      }
    }
    fetchUserNameAndStats();
  }, []);

  // Quick action handlers
  const handleQuickAnalysis = async () => {
    setIsLoading(true);
    // ...existing analysis logic...
    await updateStats({ totalAnalyses: dashboardData.totalAnalyses + 1 });
    setIsLoading(false);
  };

  const handleBulkProcess = () => {
  };

  const handleExportReports = () => {
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'analysis':
        return <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      case 'upload':
        return <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
      case 'alert':
        return <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
      case 'user':
        return <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      default:
        return <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  // Example: After analysis/upload, update stats in Supabase and refresh dashboard
  async function updateStats(newStats: Partial<typeof dashboardData>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_dashboard_stats')
        .upsert({ user_id: user.id, ...newStats });
      // Refresh dashboard data
      const { data: stats } = await supabase
        .from('user_dashboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
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
    }
  }

  // Add this to refresh dashboard stats after new analysis
  const refreshDashboardStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: stats } = await supabase
        .from('user_dashboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
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
    }
  };

  return (
    <div className="p-6 space-y-6">
      <NewAnalysisModal
        isOpen={showNewAnalysisModal}
        onClose={() => setShowNewAnalysisModal(false)}
        onSuccess={() => {
          fetchUserNameAndStats();
        }}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back, {currentUserName || 'User'}! Here is what is happening with your financial analysis platform.</p>
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
                <p className="text-xs text-green-600">+12% from last month</p>
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
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.thisMonth}</p>
                <p className="text-xs text-green-600">+8% from last week</p>
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
                <p className="text-2xl font-bold text-gray-900">{dashboardData.processingQueue}</p>
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
                <p className="text-xs text-red-600">Needs attention</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setShowNewAnalysisModal(true)}
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-700">New Analysis</span>
            </button>

            <button
              onClick={handleBulkProcess}
              className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Bulk Process</span>
            </button>

            <button
              onClick={handleExportReports}
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Export Reports</span>
            </button>

            <Link href="/documents" className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Manage Files</span>
            </Link>

            <Link href="/analytics" className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">View Analytics</span>
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
          {/* ...other dashboard content... */}
        </div>
      </div>
    </div>
  );
}
