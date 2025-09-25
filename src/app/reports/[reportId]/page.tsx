"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFinancialAnalysis } from '../../../hooks/useFinancialAnalysis';
import ExecutiveSummary from '../../../components/reporting/ExecutiveSummary';
import MonthlyCashFlowChart from '../../../components/reporting/MonthlyCashFlowChart';
import IncomeVsExpensesChart from '../../../components/reporting/IncomeVsExpensesChart';
import ExpenseCategorizationChart from '../../../components/reporting/ExpenseCategorizationChart';
import RedAlerts from '../../../components/reporting/RedAlerts';
import InteractiveDataTable from '../../../components/reporting/InteractiveDataTable';

export default function ReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const [report, setReport] = useState<any>(null);
  const { getAnalysisJob } = useFinancialAnalysis();

  useEffect(() => {
    if (reportId) {
      const fetchReport = async () => {
        const fetchedReport = await getAnalysisJob(reportId);
        if (fetchedReport) {
          setReport(fetchedReport);
        }
      };
      fetchReport();
    }
  }, [reportId, getAnalysisJob]);

  const handleDownload = () => {
    window.open(`/api/v1/reports/${reportId}/export`);
  };

  if (!report) {
    return <div>Loading...</div>;
  }

  // Dummy data for charts - replace with real data from report
  const monthlyCashFlowData = report.monthly_summary || [];
  const expenseData = Object.entries(report.summary?.categorization || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{report.report_name}</h1>
                <p className="text-gray-500">Reference ID: {report.reference_id}</p>
            </div>
            <button onClick={handleDownload} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Download Excel
            </button>
        </div>

        <ExecutiveSummary summary={report.summary?.executive_summary || 'No summary available.'} />

        <RedAlerts alerts={report.red_alerts || []} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MonthlyCashFlowChart data={monthlyCashFlowData} />
            <IncomeVsExpensesChart data={monthlyCashFlowData} />
        </div>

        <ExpenseCategorizationChart data={expenseData} />

        <InteractiveDataTable data={report.transactions || []} />

      </div>
    </div>
  );
}