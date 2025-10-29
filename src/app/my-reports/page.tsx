/**
 * My Reports Page - All User Reports Dashboard
 * Production-ready with filters, search, and sorting
 */

'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  report_name: string;
  reference_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  metadata?: any;
  document_name?: string;
  file_type?: string;
  // Enhanced metadata fields
  bankName?: string;
  accountType?: 'personal' | 'business' | 'joint' | 'unknown';
  transactionCount?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  totalIncome?: number;
  totalExpenses?: number;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  foirScore?: number;
  fraudScore?: number;
  processingTime?: number;
}

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analysis-jobs');

      if (response.ok) {
        const data = await response.json();
        setReports(data.jobs || []);
      } else {
        toast.error('Failed to load reports');
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/analysis-jobs/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Report deleted successfully');
        fetchReports();
      } else {
        toast.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-5 h-5";
    if (status === 'completed') return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
    if (status === 'failed') return <XCircleIcon className={`${iconClass} text-red-500`} />;
    if (status === 'processing') return <ArrowPathIcon className={`${iconClass} text-blue-500 animate-spin`} />;
    return <ClockIcon className={`${iconClass} text-yellow-500`} />;
  };

  // Filter and sort reports
  const filteredReports = reports
    .filter(report => {
      const matchesSearch = report.report_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.reference_id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.report_name.localeCompare(b.report_name);
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your reports...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
              <p className="text-gray-600 mt-1">Manage and view all your financial analysis reports</p>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
            >
              <DocumentTextIcon className="w-5 h-5" />
              New Report
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Reports</p>
                <p className="text-3xl font-bold text-blue-900">{reports.length}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mt-2">All time reports</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-3xl font-bold text-green-900">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              {reports.length > 0 ? Math.round((reports.filter(r => r.status === 'completed').length / reports.length) * 100) : 0}% success rate
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Transactions</p>
                <p className="text-3xl font-bold text-purple-900">
                  {reports.filter(r => r.transactionCount).reduce((sum, r) => sum + (r.transactionCount || 0), 0).toLocaleString('en-IN')}
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-2">Across all reports</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Processing</p>
                <p className="text-3xl font-bold text-orange-900">
                  {reports.filter(r => r.processingTime).length > 0
                    ? Math.round(reports.filter(r => r.processingTime).reduce((sum, r) => sum + (r.processingTime || 0), 0) / reports.filter(r => r.processingTime).length / 1000)
                    : 0}s
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-orange-600 mt-2">Average time</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or reference ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchReports}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              Refresh
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No reports found' : 'No reports yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Upload your first bank statement to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  Create First Report
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank & Account
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Analysis Summary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                      {/* Report Details */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{report.report_name}</p>
                          <p className="text-xs text-gray-500">{report.reference_id}</p>
                          {report.transactionCount && (
                            <p className="text-xs text-blue-600 mt-1">
                              {report.transactionCount.toLocaleString('en-IN')} transactions
                            </p>
                          )}
                          {report.dateRange && (
                            <p className="text-xs text-gray-500">
                              {new Date(report.dateRange.start).toLocaleDateString('en-IN')} - {new Date(report.dateRange.end).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Bank & Account */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {report.bankName && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-900">{report.bankName}</span>
                            </div>
                          )}
                          {report.accountType && (
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              report.accountType === 'business' ? 'bg-purple-100 text-purple-800' :
                              report.accountType === 'personal' ? 'bg-blue-100 text-blue-800' :
                              report.accountType === 'joint' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.accountType}
                            </span>
                          )}
                          <p className="text-xs text-gray-500">
                            {report.file_type?.toUpperCase() || 'Unknown'} • {report.document_name || 'N/A'}
                          </p>
                        </div>
                      </td>

                      {/* Analysis Summary */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {report.status === 'completed' && (
                            <>
                              {report.totalIncome && report.totalExpenses && (
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-green-600">
                                    +₹{(report.totalIncome / 1000).toFixed(0)}k
                                  </span>
                                  <span className="text-red-600">
                                    -₹{(report.totalExpenses / 1000).toFixed(0)}k
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                {report.riskScore !== undefined && (
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      report.riskLevel === 'low' ? 'bg-green-500' :
                                      report.riskLevel === 'medium' ? 'bg-yellow-500' :
                                      report.riskLevel === 'high' ? 'bg-orange-500' :
                                      'bg-red-500'
                                    }`}></div>
                                    <span className="text-xs text-gray-600">
                                      Risk: {report.riskScore}/100
                                    </span>
                                  </div>
                                )}

                                {report.foirScore !== undefined && (
                                  <span className="text-xs text-blue-600">
                                    FOIR: {report.foirScore}%
                                  </span>
                                )}

                                {report.fraudScore !== undefined && report.fraudScore > 30 && (
                                  <span className="text-xs text-red-600">
                                    Fraud: {report.fraudScore}%
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          {report.status !== 'completed' && (
                            <p className="text-xs text-gray-500">
                              {report.status === 'processing' ? 'Analyzing transactions...' :
                               report.status === 'failed' ? 'Analysis failed' :
                               'Waiting to process'}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        {report.processingTime && report.status === 'completed' && (
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round(report.processingTime / 1000)}s
                          </p>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(report.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {report.status === 'completed' && (
                            <>
                              <button
                                onClick={() => router.push(`/reports/${report.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Full Report"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/api/reports/${report.id}/export?format=pdf`, '_blank')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download PDF"
                              >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/api/reports/${report.id}/export?format=excel`, '_blank')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Download Excel"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => router.push(`/reports/${report.id}`)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="View Charts"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </button>
                            </>
                          )}

                          {report.status === 'failed' && (
                            <button
                              onClick={() => router.push('/dashboard')}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Retry Upload"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination (if needed in future) */}
        {filteredReports.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredReports.length}</span> of{' '}
              <span className="font-semibold">{reports.length}</span> reports
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
