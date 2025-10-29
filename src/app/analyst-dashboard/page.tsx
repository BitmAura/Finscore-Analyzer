"use client";

import supabase from '@/lib/supabase';
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NewAnalysisModal from '../../components/dashboard/CreateNewReportModal';
import DashboardHeader from '../../components/dashboard/shared/DashboardHeader';

import { motion } from 'framer-motion';
import { useUser } from '@supabase/auth-helpers-react';
import { useAuthReady } from '@/contexts/AuthReadyContext';

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
  const user = useUser();
  const { isAuthReady, isAuthenticated } = useAuthReady();
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);
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
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch user name and stats using the provided userId
  const fetchUserNameAndStats = useCallback(async (userId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!userId) {
        throw new Error('No user id available');
      }

      // Set user name
      if (user?.user_metadata?.name) {
        setCurrentUserName(user.user_metadata.name);
      } else if (user?.email) {
        setCurrentUserName(user.email.split('@')[0]);
      }

      // Fetch user-specific dashboard stats from Supabase
      const { data: stats, error: statsError } = await supabase
        .from('user_dashboard_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Failed to fetch user stats:', statsError);
      }

      if (stats) {
        setDashboardData(prev => ({
          ...prev,
          totalAnalyses: stats.total_analyses || prev.totalAnalyses,
          thisMonth: stats.this_month || prev.thisMonth,
          processingQueue: stats.processing_queue || prev.processingQueue,
          avgProcessingTime: stats.avg_processing_time || prev.avgProcessingTime,
          systemHealth: stats.system_health || prev.systemHealth,
          storageUsed: stats.storage_used || prev.storageUsed,
          activeUsers: stats.active_users || prev.activeUsers,
          riskAlertsCount: stats.risk_alerts_count || prev.riskAlertsCount
        }));
      }

      // Fetch recent user activities
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error('Failed to fetch user activities:', activitiesError);
      }

      // Fetch recent analysis jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('analysis_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (jobsError) {
        console.error('Failed to fetch analysis jobs:', jobsError);
      }

      const combinedActivities: Activity[] = [];

      if (activities) {
        combinedActivities.push(...activities);
      }

      if (jobs) {
        setAnalysisJobs(jobs);

        const jobActivities = jobs.map((job: any) => ({
          id: `job-${job.id}`,
          type: 'analysis',
          description: `${job.report_name || 'Analysis'} (${job.status})`,
          created_at: job.created_at,
          status: job.status
        }));

        combinedActivities.push(...jobActivities);
      }

      combinedActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentActivities(combinedActivities.slice(0, 5));
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      fetchUserNameAndStats(user.id);
    }
  }, [isAuthReady, isAuthenticated, user, router, fetchUserNameAndStats]);



  const handleModalClose = () => {
    setShowNewAnalysisModal(false);
    // Refresh data when modal closes
    if (user?.id) {
      fetchUserNameAndStats(user.id);
    }
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

  // prepare activities render nodes to avoid complex inline JSX that may confuse the parser
  const activitiesNodes = recentActivities.length === 0 ? (
    <p className="text-center text-gray-500 text-sm py-4">No recent activities found.</p>
  ) : (
    recentActivities.map(activity => (
      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
          <p className="text-xs text-gray-500 truncate">{new Date(activity.created_at).toLocaleString()}</p>
        </div>
        <div>
          {activity.status && renderStatusBadge(activity.status)}
        </div>
      </div>
    ))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-lg text-gray-700">Loading dashboard...</p>
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
            onClick={() => user?.id && fetchUserNameAndStats(user.id)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-700">Dashboard content will go here.</p>
    </div>
  );
};

export default AnalystDashboardPage;
