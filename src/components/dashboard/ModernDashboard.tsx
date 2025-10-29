'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  BeakerIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import DashboardSkeleton from './DashboardSkeleton';

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

export default function ModernDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'reports'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, reportsRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/analysis-jobs?limit=10')
      ]);

      if (!statsRes.ok || !reportsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsData = await statsRes.json();
      const { jobs } = await reportsRes.json();

      setStats(statsData);
      setRecentReports(jobs || []);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage = stats
    ? Math.min(Math.round(((stats.reportsUsed || 0) / Math.max(stats.reportsLimit || 1, 1)) * 100), 100)
    : 0;

  // 60+ Analysis Features (India-Only Coverage)
  const analysisCapabilities = [
    { category: 'Transaction Intelligence', count: 10, icon: ChartBarIcon, color: 'blue', description: 'UPI, NEFT, RTGS, IMPS, Cheque - All Indian formats' },
    { category: 'Risk Assessment', count: 8, icon: ShieldCheckIcon, color: 'red', description: 'Credit utilization, debt burden, volatility - RBI compliant' },
    { category: 'Fraud Detection', count: 7, icon: ExclamationTriangleIcon, color: 'orange', description: 'Circular transactions, loan stacking, gambling detection' },
    { category: 'Income Verification', count: 6, icon: BanknotesIcon, color: 'green', description: 'Indian salary patterns, EPF, bonuses, ITR matching' },
    { category: 'Banking Behavior', count: 5, icon: ArrowTrendingUpIcon, color: 'purple', description: 'Account vintage, cheque bounce, cash deposit patterns' },
    { category: 'RBI Compliance', count: 6, icon: CheckCircleIcon, color: 'teal', description: 'FOIR, KYC/AML, PAN verification, high-value alerts' },
    { category: 'Credit Analysis', count: 7, icon: ChartPieIcon, color: 'pink', description: 'EMI detection, CIBIL integration, repayment behavior' },
    { category: 'NBFC Underwriting', count: 6, icon: RocketLaunchIcon, color: 'indigo', description: 'Quick decisioning, alternative data, micro-lending' },
    { category: 'GST & Business', count: 5, icon: SparklesIcon, color: 'violet', description: 'GST payments, business turnover, vendor analysis' },
    { category: 'AI Insights', count: 5, icon: CpuChipIcon, color: 'cyan', description: 'Executive summary, anomaly detection, default prediction' }
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Modern Header with Glassmorphism */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-gray-200 shadow-sm bg-white/80 backdrop-blur-lg"
      >
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  FinScore Analyzer
                </h1>
                <p className="text-sm text-gray-500">World-Class Financial Intelligence</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link href="/my-reports">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                >
                  <CloudArrowUpIcon className="w-5 h-5" />
                  New Analysis
                </motion.button>
              </Link>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 mt-4">
            {['overview', 'reports'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeView === view
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/50 text-gray-600 hover:bg-white'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: 'Total Analyses',
                    value: stats?.totalReports || 0,
                    icon: DocumentTextIcon,
                    gradient: 'from-blue-500 to-blue-600',
                    change: '+12%'
                  },
                  {
                    title: 'This Month',
                    value: stats?.thisMonth || 0,
                    icon: CalendarIcon,
                    gradient: 'from-purple-500 to-purple-600',
                    change: '+8%'
                  },
                  {
                    title: 'Processing',
                    value: stats?.processingQueue || 0,
                    icon: CpuChipIcon,
                    gradient: 'from-orange-500 to-orange-600',
                    change: 'Live'
                  },
                  {
                    title: 'Usage',
                    value: `${usagePercentage}%`,
                    icon: ChartPieIcon,
                    gradient: 'from-green-500 to-green-600',
                    change: `${stats?.reportsUsed}/${stats?.reportsLimit}`
                  }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 transition-shadow bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-3 py-1 text-sm font-semibold text-green-600 rounded-full bg-green-50">
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-medium text-gray-500">{stat.title}</h3>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* 45+ Analysis Capabilities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 mb-8 bg-white border border-gray-100 shadow-lg rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
                      <BeakerIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">60+ Analysis Modules 🇮🇳</h2>
                      <p className="text-sm text-gray-500">India-focused analysis for ALL banks, NBFCs & co-operatives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                    <FlagIcon className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-semibold text-blue-900">150+ Indian Banks</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {analysisCapabilities.map((capability, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="p-5 transition-all border border-gray-200 cursor-pointer bg-gradient-to-br from-gray-50 to-white rounded-xl hover:border-blue-300 hover:shadow-lg"
                    >
                      <capability.icon className={`w-8 h-8 text-${capability.color}-600 mb-3`} />
                      <h3 className="mb-1 text-sm font-bold text-gray-900">{capability.category}</h3>
                      <p className="mb-2 text-xs text-gray-500">{capability.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">{capability.count}</span>
                        <div className="px-2 py-1 text-xs font-semibold text-blue-700 rounded-full bg-blue-50">
                          Active
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Total Count */}
                <div className="p-6 mt-6 text-center text-white bg-gradient-to-r from-orange-500 via-green-600 to-blue-600 rounded-xl">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="mb-1 text-sm font-medium opacity-90">Analysis Points</p>
                      <p className="text-4xl font-bold">60+</p>
                    </div>
                    <div className="border-l border-r border-white/20">
                      <p className="mb-1 text-sm font-medium opacity-90">Indian Banks</p>
                      <p className="text-4xl font-bold">150+</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium opacity-90">NBFCs & Co-ops</p>
                      <p className="text-4xl font-bold">300+</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm opacity-90">🇮🇳 Complete India Coverage - All PSU, Private, Small Finance, Payment Banks, NBFCs & Co-operatives</p>
                </div>
              </motion.div>

              {/* Recent Reports */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-8 bg-white border border-gray-100 shadow-lg rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Analyses</h2>
                  <Link
                    href="/my-reports"
                    className="flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View All
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  </Link>
                </div>

                {recentReports.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <DocumentChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="mb-2 font-medium">No analyses yet</p>
                    <p className="text-sm">Upload your first bank statement to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReports.map((report, idx) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                        onClick={() => router.push(`/reports/${report.id}`)}
                        className="flex items-center justify-between p-4 transition-all border border-transparent cursor-pointer bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200"
                      >
                        <div className="flex items-center gap-4">
                          {report.status === 'completed' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                          {report.status === 'processing' && <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />}
                          {report.status === 'failed' && <XCircleIcon className="w-6 h-6 text-red-500" />}
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.report_name || 'Untitled'}</h3>
                            <p className="text-sm text-gray-500">Ref: {report.reference_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.status}
                          </span>
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeView === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-8 bg-white border border-gray-100 shadow-lg rounded-2xl">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">All Reports</h2>
                {/* Same reports list as overview */}
                {recentReports.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <DocumentChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="mb-2 font-medium">No reports yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReports.map((report, idx) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, x: 10 }}
                        onClick={() => router.push(`/reports/${report.id}`)}
                        className="flex items-center justify-between p-4 transition-all border border-transparent cursor-pointer bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200"
                      >
                        <div className="flex items-center gap-4">
                          {report.status === 'completed' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                          {report.status === 'processing' && <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />}
                          {report.status === 'failed' && <XCircleIcon className="w-6 h-6 text-red-500" />}
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.report_name || 'Untitled'}</h3>
                            <p className="text-sm text-gray-500">Ref: {report.reference_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.status}
                          </span>
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return <ArrowTrendingUpIcon {...props} />;
}
