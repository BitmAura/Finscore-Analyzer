/**
 * Admin Dashboard - User Management & System Monitoring
 * For administrators to manage users, view analytics, and monitor system
 */

'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalReports: number;
  totalApplications: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivity: any[];
  revenue: {
    monthly: number;
    total: number;
    growth: number;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in: string;
  subscription_status: string;
  reports_count: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (health: string) => {
    const config = {
      healthy: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      warning: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
      critical: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
    };

    const { color, icon: Icon } = config[health as keyof typeof config] || config.healthy;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {health.toUpperCase()}
      </span>
    );
  };

  const getSubscriptionBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      trial: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.inactive}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                System monitoring and user management
              </p>
            </div>
            <div className="flex items-center gap-3">
              {stats && getHealthBadge(stats.systemHealth)}
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {['overview', 'users', 'reports', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <UsersIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-1">Registered users</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <DocumentTextIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-1">Generated reports</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Applications</p>
                  <DocumentTextIcon className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-1">Loan applications</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <CurrencyRupeeIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.monthly.toLocaleString('en-IN')}</p>
                <p className={`text-xs mt-1 ${stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth}% from last month
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'user_signup' ? 'bg-green-500' :
                        activity.type === 'report_generated' ? 'bg-blue-500' :
                        activity.type === 'payment' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-600">{activity.user}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Reports
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Last Sign In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getSubscriptionBadge(user.subscription_status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.reports_count || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString('en-IN') : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <DocumentTextIcon className="w-8 h-8 text-blue-500 mb-2" />
                <h4 className="font-medium text-gray-900">User Activity Report</h4>
                <p className="text-sm text-gray-600">Detailed user engagement metrics</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <ChartBarIcon className="w-8 h-8 text-green-500 mb-2" />
                <h4 className="font-medium text-gray-900">Revenue Report</h4>
                <p className="text-sm text-gray-600">Financial performance and trends</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mb-2" />
                <h4 className="font-medium text-gray-900">Error Report</h4>
                <p className="text-sm text-gray-600">System errors and issues</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <ArrowTrendingUpIcon className="w-8 h-8 text-purple-500 mb-2" />
                <h4 className="font-medium text-gray-900">Performance Report</h4>
                <p className="text-sm text-gray-600">System performance metrics</p>
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Configure email service settings</p>
                  </div>
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                    Configure
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Payment Gateway</p>
                    <p className="text-sm text-gray-600">Manage Razorpay and Stripe settings</p>
                  </div>
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                    Configure
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Error Monitoring</p>
                    <p className="text-sm text-gray-600">Sentry configuration and alerts</p>
                  </div>
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}