"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, MagnifyingGlassIcon, ArrowPathIcon, DocumentChartBarIcon, ClockIcon, CircleStackIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';
import CreateNewReportModal from '../../components/dashboard/CreateNewReportModal';
import KpiCard from '../../components/dashboard/KpiCard';
import { useFinancialAnalysis } from '../../hooks/useFinancialAnalysis';
import { useUser } from '@supabase/auth-helpers-react';

import Link from 'next/link';

export default function MyReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { getAnalysisJobs, getKpis } = useFinancialAnalysis();
  const { user } = useUser();

  const [hoveredReportId, setHoveredReportId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        if (user?.id) {
            const [fetchedReports, fetchedKpis] = await Promise.all([
                getAnalysisJobs(user.id),
                getKpis(user.id)
            ]);
            if (fetchedReports) setReports(fetchedReports);
            if (fetchedKpis) setKpis(fetchedKpis);
        }
    }
    fetchData();
  }, [user, getAnalysisJobs, getKpis]);

  const filteredReports = useMemo(() => {
    return reports
      .filter(report => statusFilter === 'all' || report.status === statusFilter)
      .filter(report => 
        report.report_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reference_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [reports, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <CreateNewReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Reports Dashboard</h1>
          <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Report</span>
            </button>
        </div>

        {kpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard title="Total Reports Analyzed" value={kpis.totalReports} icon={<DocumentChartBarIcon className="w-6 h-6 text-blue-500" />} />
                <KpiCard title="Documents Processed" value={kpis.documentsProcessed} icon={<CircleStackIcon className="w-6 h-6 text-blue-500" />} />
                <KpiCard title="Avg. Turnaround Time" value={`${(kpis.avgTurnaroundTime / 1000).toFixed(2)}s`} icon={<ClockIcon className="w-6 h-6 text-blue-500" />} />
                <KpiCard title="Most Common Red Flag" value={kpis.mostCommonRedFlag} icon={<ExclamationCircleIcon className="w-6 h-6 text-blue-500" />} />
            </div>
        )}

        <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 bg-white hover:bg-gray-100">
                    <ArrowPathIcon className="w-5 h-5 text-gray-600" />
                    <span>Refresh</span>
                </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                    <tr 
                        key={report.id}
                        onMouseEnter={() => setHoveredReportId(report.id)}
                        onMouseLeave={() => setHoveredReportId(null)}
                        className="relative hover:bg-gray-50"
                    >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                        <Link href={`/reports/${report.id}`}>{report.report_name}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reference_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">...</td>
                    {hoveredReportId === report.id && (
                        <div className="absolute z-10 left-full top-1/2 -translate-y-1/2 ml-4 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                            <h3 className="font-bold text-gray-900 mb-2">Quick View: {report.report_name}</h3>
                            <p className="text-sm text-gray-700">Status: <span className={`${getStatusColor(report.status)} px-1 rounded`}>{report.status}</span></p>
                            {report.summary?.net_cash_flow !== undefined && (
                                <p className="text-sm text-gray-700">Net Cash Flow: ${report.summary.net_cash_flow.toFixed(2)}</p>
                            )}
                            {report.risk_assessment?.score !== undefined && (
                                <p className="text-sm text-gray-700">Risk Score: {report.risk_assessment.score}</p>
                            )}
                        </div>
                    )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
