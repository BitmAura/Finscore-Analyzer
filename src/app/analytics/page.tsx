'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase-client';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [hasReports, setHasReports] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock analytics data
  const [mockAnalyticsData] = useState({
    totalAnalyses: 245,
    fraudDetected: 12,
    averageRiskScore: 67,
    processingAccuracy: 96.8,
    avgTurnaroundTime: 3.2,
    totalRevenue: 45600,
    monthlyGrowth: 23.5,
    userSatisfaction: 4.8,
    systemUptime: 99.7,
    dataProcessed: 127.5
  });

  const chartData = [
    { month: 'Jan', analyses: 45, frauds: 2, revenue: 8900 },
    { month: 'Feb', analyses: 52, frauds: 3, revenue: 10400 },
    { month: 'Mar', analyses: 38, frauds: 1, revenue: 7600 },
    { month: 'Apr', analyses: 61, frauds: 4, revenue: 12200 },
    { month: 'May', analyses: 49, frauds: 2, revenue: 9800 }
  ];

  const riskDistribution = [
    { level: 'Low Risk', count: 156, percentage: 64, color: 'bg-green-500' },
    { level: 'Medium Risk', count: 67, percentage: 27, color: 'bg-yellow-500' },
    { level: 'High Risk', count: 22, percentage: 9, color: 'bg-red-500' }
  ];

  const bankAnalytics = [
    { bank: 'HDFC Bank', analyses: 78, avgScore: 84, riskAlerts: 5 },
    { bank: 'State Bank of India', analyses: 65, avgScore: 79, riskAlerts: 8 },
    { bank: 'ICICI Bank', analyses: 45, avgScore: 81, riskAlerts: 3 },
    { bank: 'Axis Bank', analyses: 32, avgScore: 77, riskAlerts: 4 },
    { bank: 'Kotak Mahindra', analyses: 25, avgScore: 88, riskAlerts: 2 }
  ];

  const fraudPatterns = [
    { pattern: 'Unusual Transaction Patterns', detected: 8, severity: 'High' },
    { pattern: 'Circular Transactions', detected: 5, severity: 'Medium' },
    { pattern: 'Salary Credit Irregularities', detected: 12, severity: 'Medium' },
    { pattern: 'Large Cash Deposits', detected: 3, severity: 'High' },
    { pattern: 'Multiple Account Linkages', detected: 7, severity: 'Low' }
  ];

  const handleExportAnalytics = () => {
    setIsLoading(true);
    // addNotification({
    //   title: 'Export Started',
    //   message: 'Generating analytics report...',
    //   type: 'info'
    // });

    setTimeout(() => {
      setIsLoading(false);
    //   addNotification({
    //     title: 'Export Complete',
    //     message: 'Analytics report downloaded successfully',
    //     type: 'success'
    //   });
    }, 2000);
  };

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if user has any completed analyses
        const { data: reports, error } = await supabase
          .from('analysis_reports')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed');
        if (reports && reports.length > 0) {
          setHasReports(true);
          setAnalyticsData(reports);
        } else {
          setHasReports(false);
        }
      }
      setLoading(false);
    }
    fetchReports();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  }

  if (!hasReports) {
    return (
      <div className="p-8 text-center text-gray-400">
        <h2 className="text-2xl font-bold mb-4">No Analytics Available</h2>
        <p className="mb-2">You haven't run any analyses yet.</p>
        <p>Start by uploading and analyzing a bank statement. Analytics will appear here once you have completed your first report.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
            <p className="text-gray-600">Comprehensive financial analysis metrics and fraud detection insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={handleExportAnalytics}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Exporting...' : 'Export Report'}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.totalAnalyses}</p>
                <p className="text-xs text-green-600">+{mockAnalyticsData.monthlyGrowth}% growth</p>
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
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fraud Detected</p>
                <p className="text-2xl font-bold text-red-600">{mockAnalyticsData.fraudDetected}</p>
                <p className="text-xs text-red-600">High priority alerts</p>
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
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-green-600">{mockAnalyticsData.processingAccuracy}%</p>
                <p className="text-xs text-green-600">Industry leading</p>
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                <p className="text-2xl font-bold text-purple-600">{mockAnalyticsData.avgTurnaroundTime}m</p>
                <p className="text-xs text-purple-600">Per document</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-indigo-600">₹{mockAnalyticsData.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-indigo-600">This month</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Analysis Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Trends</h3>
            <div className="h-64 flex items-end justify-between space-x-2 px-4">
              {chartData.map((data, index) => (
                <motion.div
                  key={data.month}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.analyses / 70) * 100}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-blue-500 w-12 rounded-t flex flex-col items-center justify-end pb-2"
                >
                  <span className="text-white text-xs font-medium">{data.analyses}</span>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-4">
              {chartData.map(data => (
                <span key={data.month} className="text-xs text-gray-500">{data.month}</span>
              ))}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <div className="space-y-4">
              {riskDistribution.map((risk, index) => (
                <motion.div
                  key={risk.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${risk.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700">{risk.level}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${risk.percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className={`h-2 rounded-full ${risk.color}`}
                      ></motion.div>
                    </div>
                    <span className="text-sm text-gray-600">{risk.count} ({risk.percentage}%)</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bank Performance Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Performance Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analyses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Alerts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bankAnalytics.map((bank, index) => (
                  <motion.tr
                    key={bank.bank}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium text-sm">{bank.bank.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{bank.bank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bank.analyses}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{bank.avgScore}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${bank.avgScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bank.riskAlerts > 5 ? 'bg-red-100 text-red-800' :
                        bank.riskAlerts > 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bank.riskAlerts} alerts
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {bank.avgScore > 85 ? (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : bank.avgScore > 75 ? (
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fraud Detection Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Pattern Detection</h3>
            <div className="space-y-4">
              {fraudPatterns.map((pattern, index) => (
                <motion.div
                  key={pattern.pattern}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pattern.pattern}</p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pattern.severity === 'High' ? 'bg-red-100 text-red-800' :
                        pattern.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pattern.severity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{pattern.detected}</p>
                    <p className="text-xs text-gray-500">cases detected</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">{mockAnalyticsData.systemUptime}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${mockAnalyticsData.systemUptime}%` }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Processed</span>
                <span className="text-sm font-medium text-blue-600">{mockAnalyticsData.dataProcessed} GB</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Satisfaction</span>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{mockAnalyticsData.userSatisfaction}/5.0</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{mockAnalyticsData.averageRiskScore}</p>
                    <p className="text-xs text-gray-500">Avg Risk Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">8</p>
                    <p className="text-xs text-gray-500">Active Users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Cashflow Analysis</h4>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-2">₹2.4M</p>
            <p className="text-blue-200">Total processed this month</p>
            <div className="mt-4 flex items-center">
              <svg className="w-4 h-4 text-green-300 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-green-300 text-sm">+18% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">EMI Analysis</h4>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-2">₹45,600</p>
            <p className="text-purple-200">Avg monthly EMI detected</p>
            <div className="mt-4 flex items-center">
              <svg className="w-4 h-4 text-green-300 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-300 text-sm">92% accuracy rate</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">GST Insights</h4>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold mb-2">₹1.2M</p>
            <p className="text-green-200">GST transactions analyzed</p>
            <div className="mt-4 flex items-center">
              <svg className="w-4 h-4 text-green-300 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-green-300 text-sm">Tax compliance tracked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
