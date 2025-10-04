'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

import KpiCard from '@/components/dashboard/KpiCard';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import TransactionTable from '@/components/dashboard/TransactionTable';
import ExpenseTreemap from '@/components/dashboard/ExpenseTreemap';
import DownloadPdfButton from '@/components/dashboard/DownloadPdfButton';
import TrendReport from '@/components/dashboard/TrendReport';
import AnomalyReport from '@/components/dashboard/AnomalyReport';
import ExecutiveSummary from '@/components/dashboard/ExecutiveSummary';

// You can create a more specific type for your analysis data
type AnalysisData = any;

const ReportPage: React.FC = () => {
  const params = useParams();
  const analysisId = params.analysisId as string;
  const [analysisData, setAnalysisData] = useState<AnalysisData>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (analysisId) {
      const fetchAnalysisData = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/v1/analysis/status/${analysisId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch analysis data');
          }
          const data = await res.json();
          if (data.status === 'completed') {
            setAnalysisData(data.data);
          } else if (data.status === 'failed') {
            setError(data.error || 'Analysis failed');
          } else {
            setError('Analysis is still in progress.');
          }
        } catch (err: any) {
          setError(err.message || 'An unexpected error occurred');
        } finally {
          setIsLoading(false);
        }
      };

      fetchAnalysisData();
    }
  }, [analysisId]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading report...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!analysisData) {
    return <div className="p-8 text-center">No data available for this report.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Financial Analysis Report</h1>
          <p className="mt-2 text-base sm:text-lg text-gray-400">Analysis ID: {analysisId}</p>
        </div>
        <DownloadPdfButton reportRef={reportRef} fileName={`financial-report-${analysisId}`} />
      </header>

      <div ref={reportRef} className="space-y-8 p-8 bg-gray-900">
        {analysisData.ai_executive_summary && <ExecutiveSummary summary={analysisData.ai_executive_summary} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Total Income" valueA={`$${(analysisData.summary?.totalIncome || 0).toLocaleString()}`} icon={<div />} color="#48BB78" />
          <KpiCard title="Total Expenses" valueA={`$${(analysisData.summary?.totalExpenses || 0).toLocaleString()}`} icon={<div />} color="#F56565" />
          <KpiCard title="Net Savings" valueA={`$${(analysisData.summary?.netSavings || 0).toLocaleString()}`} icon={<div />} color="#4299E1" />
          <KpiCard title="Savings Rate" valueA={`${(analysisData.summary?.savingsRate || 0).toFixed(2)}%`} icon={<div />} color="#ECC94B" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {analysisData.transactions && <CashFlowChart dataA={analysisData.transactions} />}
          {analysisData.transactions && <ExpenseTreemap transactionsA={analysisData.transactions} />}
        </div>

        {analysisData.transactions && <TransactionTable transactions={analysisData.transactions} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {analysisData.trends && <TrendReport trends={analysisData.trends} />}
          {analysisData.anomalies && <AnomalyReport anomalies={analysisData.anomalies} />}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
