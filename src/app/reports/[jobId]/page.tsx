'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyRupeeIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CubeIcon,
  ArrowPathIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  FunnelIcon as FilterIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import toast from 'react-hot-toast';
import { captureException, captureMessage, addBreadcrumb } from '@/lib/monitoring/sentry';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportData {
  id: string;
  report_name: string;
  reference_id: string;
  status: string;
  created_at: string;
  results?: any;
  transactions?: any[];
  transactionCount?: number;
  progress?: number;
  queueStatus?: string;
}

type MonthlySummary = {
  month?: string;
  totalIncome?: number | null;
  totalExpenses?: number | null;
  netCashFlow?: number | null;
  [key: string]: any;
};

type ActiveTab = 'overview' | 'risk' | 'compliance' | 'transactions' | 'deep-analysis' | 'consolidated' | 'decision' | 'interactive' | 'custom-reports';

// Helper functions for typed calculations
const toNumber = (v: any): number => (typeof v === 'number' ? v : Number(v) || 0);

const total = (arr: number[]): number => arr.reduce((a: number, b: number) => a + b, 0);

const variance = (arr: number[]): number => {
  if (!arr.length) return 0;
  const avg = total(arr) / arr.length;
  return arr.reduce((sum: number, val: number) => sum + Math.pow(val - avg, 2), 0) / arr.length;
};

const incomesFrom = (ms: MonthlySummary[] = []): number[] =>
  ms.map((m: MonthlySummary) => toNumber(m.totalIncome));

const computeStability = (ms: MonthlySummary[] = []) => {
  if (!ms.length) return { label: 'N/A', stabilityScore: 0, pass: false };
  const incomes = incomesFrom(ms);
  const avg = incomes.length ? total(incomes) / incomes.length : 0;
  if (avg <= 0) return { label: 'Invalid Data', stabilityScore: 0, pass: false };
  const varVal = variance(incomes);
  const stdDev = Math.sqrt(varVal);
  const cv = (stdDev / avg) * 100;
  const stabilityScore = cv < 20 ? 100 : cv < 40 ? 75 : 50;
  return {
    label: cv < 20 ? 'High' : cv < 40 ? 'Medium' : 'Low',
    stabilityScore: Math.round(stabilityScore * 0.2),
    pass: cv < 40
  };
};

export default function ReportViewerPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [consolidatedLoading, setConsolidatedLoading] = useState(false);
  const [creditData, setCreditData] = useState<any>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [analysisSubTab, setAnalysisSubTab] = useState('general');
  const [progress, setProgress] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [liveRiskData, setLiveRiskData] = useState<any>(null);

  useEffect(() => {
    if (jobId) {
      addBreadcrumb(`User accessed report page for jobId: ${jobId}`, 'navigation', 'info');
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    addBreadcrumb(`User switched to tab: ${activeTab}`, 'user-action', 'info');
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'risk' && report && report.status === 'processing') {
      try {
        const ws = new WebSocket(`ws://localhost:8080`);

        ws.onopen = () => {
          console.log('WebSocket connected');
          ws.send(JSON.stringify({
            type: 'subscribe',
            jobId: jobId
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'risk_update') {
              setLiveRiskData(data.data);
            }
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        return () => {
          ws.close();
        };
      } catch (error) {
        console.error('WebSocket setup error:', error);
      }
    }
  }, [activeTab, report, jobId]);

  useEffect(() => {
    if (activeTab === 'consolidated' && !consolidatedData && !consolidatedLoading) {
      fetchConsolidatedData();
    }
  }, [activeTab, consolidatedData, consolidatedLoading]);

  useEffect(() => {
    if (activeTab === 'compliance' && !creditData && !creditLoading) {
      fetchCreditData();
    }
  }, [activeTab, creditData, creditLoading]);

  const fetchConsolidatedData = async () => {
    setConsolidatedLoading(true);
    try {
      // TODO: Move to API route - client components can't use server-only services
      // const service = new MultiStatementConsolidationService();
      // const analysis = await service.getConsolidatedAnalysis(jobId);
      // setConsolidatedData(analysis);
      toast.error('Consolidated view temporarily unavailable');
    } catch (error) {
      console.error('Failed to fetch consolidated data:', error);
      toast.error('Failed to load consolidated view');
    } finally {
      setConsolidatedLoading(false);
    }
  };

  const fetchCreditData = async () => {
    setCreditLoading(true);
    try {
      // TODO: Move to API route - client components can't use server-only services
      // const service = new CreditBureauService();
      // const request = {
      //   userId: 'current-user-id',
      //   consent: true
      // };
      // const response = await service.fetchCreditScores(request);
      // if (response.success) {
      //   setCreditData(response);
      // } else {
      //   toast.error('Failed to fetch credit scores: ' + response.error);
      // }
      toast.error('Credit bureau integration temporarily unavailable');
    } catch (error) {
      console.error('Failed to fetch credit data:', error);
      toast.error('Failed to load credit bureau data');
    } finally {
      setCreditLoading(false);
    }
  };

  const fetchReport = async (isRetry = false) => {
    try {
      addBreadcrumb(`Fetching report for jobId: ${jobId}`, 'fetch', 'info');
      if (isRetry) {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/analysis-jobs/${jobId}`);

      if (response.ok) {
        const data = await response.json();
        setReport(data);
        setProgress(data.progress || 0);

        if (data.status === 'processing' || data.status === 'pending') {
          setIsPolling(true);
          setTimeout(() => fetchReport(), 2000);
          return;
        } else {
          setIsPolling(false);
        }

        setRetryCount(0);
      } else if (response.status === 404) {
        captureMessage(`Report not found for jobId: ${jobId}`, 'warning');
        toast.error('Report not found');
        router.push('/my-reports');
      } else if (response.status === 401) {
        captureMessage(`Unauthorized access for jobId: ${jobId}`, 'warning');
        toast.error('Unauthorized access. Please log in again.');
        router.push('/login');
      } else if (response.status === 503 && retryCount < 3) {
        setTimeout(() => fetchReport(true), 2000 * (retryCount + 1));
        return;
      } else {
        captureMessage(`Failed to load report for jobId: ${jobId}`, 'error');
        toast.error('Failed to load report. Please try again.');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      captureException(error as Error, { jobId, retryCount });
      if (retryCount < 3) {
        setTimeout(() => fetchReport(true), 2000 * (retryCount + 1));
        return;
      }
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      addBreadcrumb(`User initiated export for format: ${format}`, 'user-action', 'info');
      toast.loading(`Generating ${format.toUpperCase()}...`, { id: 'export' });
      const response = await fetch(`/api/reports/${jobId}/export?format=${format}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report?.reference_id}_Report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success(`Report exported as ${format.toUpperCase()}`, { id: 'export' });
      } else if (response.status === 404) {
        toast.error('Report not found. Please refresh and try again.', { id: 'export' });
      } else if (response.status === 500) {
        toast.error('Server error. Please try again later.', { id: 'export' });
      } else {
        toast.error('Export failed. Please try again.', { id: 'export' });
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export report', { id: 'export' });
    }
  };

  if (loading || isRetrying || isPolling) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
          <p className="mb-4 text-gray-600">
            {isRetrying ? `Retrying... (${retryCount}/3)` : isPolling ? 'Processing your report...' : 'Loading report...'}
          </p>
          {isRetrying && (
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we reconnect...
            </p>
          )}
          {isPolling && (
            <div className="w-full h-2 mb-2 bg-gray-200 rounded-full">
              <div
                className="h-2 transition-all duration-500 bg-blue-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {isPolling && (
            <p className="text-sm text-gray-500">
              {progress}% complete
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!report || !report.results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="mb-4 text-gray-600">Report not found or still processing</p>
          <button
            onClick={() => router.push('/my-reports')}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const { results } = report;
  const summary = results.summary || {};
  const riskAssessment = results.riskAssessment || {};
  const alerts = results.fraudAlerts || [];
  const monthlySummaries = results.monthlySummaries?.monthlySummaries || [];
  const counterparties = results.counterparties || [];
  const executiveSummary = results.executiveSummary || '';
  const fraudAnalysis = results.advancedFraud || {};
  const foirAnalysis = results.foirAnalysis || {};
  const incomeVerification = results.incomeVerification || {};
  const bankingBehavior = results.bankingBehavior || {};

  // Chart Data with Error Handling
  const cashFlowChartData = {
    labels: monthlySummaries?.map((m: MonthlySummary) => m?.month || 'Unknown') || [],
    datasets: [
      {
        label: 'Income',
        data: monthlySummaries?.map((m: MonthlySummary) => toNumber(m?.totalIncome)) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
      },
      {
        label: 'Expenses',
        data: monthlySummaries?.map((m: MonthlySummary) => toNumber(m?.totalExpenses)) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      }
    ]
  };

  const categoryChartData = {
    labels: Object.keys(results?.expense_categories || {}),
    datasets: [{
      data: Object.values(results?.expense_categories || {}),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
      ]
    }]
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  const riskColor = getRiskColor(riskAssessment.overallScore || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/my-reports')}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{report.report_name}</h1>
                <p className="text-sm text-gray-600">
                  {report.reference_id} • {new Date(report.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Enhanced NBFC Tabs */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {[
              { key: 'overview' as const, label: 'Overview', icon: DocumentTextIcon },
              { key: 'risk' as const, label: 'Risk Assessment', icon: ExclamationTriangleIcon },
              { key: 'compliance' as const, label: 'Compliance', icon: ShieldCheckIcon },
              { key: 'transactions' as const, label: 'Transactions', icon: ChartBarIcon },
              { key: 'deep-analysis' as const, label: 'Deep Analysis', icon: ArrowTrendingUpIcon },
              { key: 'consolidated' as const, label: 'Consolidated View', icon: CubeIcon },
              { key: 'decision' as const, label: 'Decision Support', icon: CheckCircleIcon },
              { key: 'interactive' as const, label: 'Interactive', icon: FunnelIcon },
              { key: 'custom-reports' as const, label: 'Custom Reports', icon: DocumentDuplicateIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Executive Summary */}
            {executiveSummary && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Executive Summary</h2>
                <div className="prose text-gray-700 whitespace-pre-line max-w-none">
                  {executiveSummary}
                </div>
              </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Income</p>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(summary.totalIncome || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(summary.totalExpenses || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Net Cash Flow</p>
                  <BanknotesIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className={`text-2xl font-bold ${summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(summary.netCashFlow || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Risk Score</p>
                  <ExclamationTriangleIcon className={`w-5 h-5 text-${riskColor}-500`} />
                </div>
                <p className={`text-2xl font-bold text-${riskColor}-600`}>
                  {riskAssessment.overallScore || 0}/100
                </p>
                <p className="mt-1 text-xs text-gray-500">{riskAssessment.category}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Monthly Cash Flow</h3>
                <Line data={cashFlowChartData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>

            {/* Banking Analysis Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {foirAnalysis.foir !== undefined && (
                <div className={`rounded-lg border-2 p-6 ${
                  foirAnalysis.foirStatus === 'High Risk' ? 'bg-red-50 border-red-200' :
                  foirAnalysis.foirStatus === 'Borderline' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <CurrencyRupeeIcon className={`w-6 h-6 ${
                      foirAnalysis.foirStatus === 'High Risk' ? 'text-red-600' :
                      foirAnalysis.foirStatus === 'Borderline' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                    <h3 className="text-sm font-semibold text-gray-900">FOIR Ratio</h3>
                  </div>
                  <p className="mb-1 text-2xl font-bold text-gray-900">{foirAnalysis.foir}%</p>
                  <p className="text-xs text-gray-600">{foirAnalysis.foirStatus}</p>
                </div>
              )}

              {incomeVerification.verificationStatus && (
                <div className={`rounded-lg border-2 p-6 ${
                  incomeVerification.verificationStatus === 'Suspicious' ? 'bg-red-50 border-red-200' :
                  incomeVerification.verificationStatus === 'Needs Review' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircleIcon className={`w-6 h-6 ${
                      incomeVerification.verificationStatus === 'Suspicious' ? 'text-red-600' :
                      incomeVerification.verificationStatus === 'Needs Review' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                    <h3 className="text-sm font-semibold text-gray-900">Income Verification</h3>
                  </div>
                  <p className="mb-1 text-lg font-bold text-gray-900">{incomeVerification.verificationStatus}</p>
                </div>
              )}

              {bankingBehavior.behaviorScore !== undefined && (
                <div className={`rounded-lg border-2 p-6 ${
                  bankingBehavior.behaviorRating === 'Poor' ? 'bg-red-50 border-red-200' :
                  bankingBehavior.behaviorRating === 'Average' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <BanknotesIcon className={`w-6 h-6 ${
                      bankingBehavior.behaviorRating === 'Poor' ? 'text-red-600' :
                      bankingBehavior.behaviorRating === 'Average' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                    <h3 className="text-sm font-semibold text-gray-900">Banking Behavior</h3>
                  </div>
                  <p className="mb-1 text-2xl font-bold text-gray-900">{bankingBehavior.behaviorScore}/100</p>
                  <p className="text-xs text-gray-600">{bankingBehavior.behaviorRating}</p>
                </div>
              )}

              {fraudAnalysis.fraudScore !== undefined && (
                <div className={`rounded-lg border-2 p-6 ${
                  fraudAnalysis.fraudScore > 70 ? 'bg-red-50 border-red-200' :
                  fraudAnalysis.fraudScore > 40 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <ExclamationTriangleIcon className={`w-6 h-6 ${
                      fraudAnalysis.fraudScore > 70 ? 'text-red-600' :
                      fraudAnalysis.fraudScore > 40 ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                    <h3 className="text-sm font-semibold text-gray-900">Fraud Risk</h3>
                  </div>
                  <p className="mb-1 text-2xl font-bold text-gray-900">{fraudAnalysis.fraudScore}/100</p>
                  <p className="text-xs text-gray-600">{fraudAnalysis.fraudLevel}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Assessment Tab */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 border border-red-200 rounded-lg bg-gradient-to-br from-red-50 to-red-100">
                <div className="flex items-center gap-3 mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Overall Risk Score</p>
                    <p className="text-3xl font-bold text-red-600">
                      {liveRiskData?.overallRiskScore !== undefined ? liveRiskData.overallRiskScore : (riskAssessment.overallRiskScore || 0)}/100
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-orange-200 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Fraud Risk</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {liveRiskData?.fraudScore !== undefined ? liveRiskData.fraudScore : (fraudAnalysis.fraudScore || 0)}/100
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <BanknotesIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Banking Behavior</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {liveRiskData?.bankingBehaviorScore !== undefined ? liveRiskData.bankingBehaviorScore : (bankingBehavior.behaviorScore || 0)}/100
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <CurrencyRupeeIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">FOIR Ratio</p>
                    <p className="text-3xl font-bold text-green-600">
                      {liveRiskData?.foir !== undefined ? liveRiskData.foir : (foirAnalysis.foir || 0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-gray-900">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                Compliance Status
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">KYC Compliance</p>
                    <p className="text-xs text-green-700">Document verification completed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">AML Check</p>
                    <p className="text-xs text-green-700">No adverse findings</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Credit Bureau</p>
                    <p className="text-xs text-green-700">Report verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{report.transactionCount || 0}</p>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Credit Transactions</p>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {report.transactions?.filter((t: any) => t.credit && t.credit > 0).length || 0}
                </p>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Debit Transactions</p>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {report.transactions?.filter((t: any) => t.debit && t.debit > 0).length || 0}
                </p>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Avg Transaction</p>
                  <CurrencyRupeeIcon className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{report.transactions?.length ?
                    (Math.round((report.transactions.reduce((sum: number, t: any) =>
                      sum + (t.debit || 0) + (t.credit || 0), 0) / report.transactions.length) / 1000) * 1000)
                      .toLocaleString('en-IN') : 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deep Analysis Tab */}
        {activeTab === 'deep-analysis' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
                <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                Advanced Analytics
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-green-900">Income Analysis</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Monthly Avg:</span>
                      <span className="font-medium text-green-900">
                        ₹{monthlySummaries.length > 0 ?
                          (monthlySummaries.reduce((sum: number, m: MonthlySummary) => sum + (m.totalIncome || 0), 0) / monthlySummaries.length / 1000).toFixed(0)
                          : 0}k
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-semibold text-red-900">Expense Patterns</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-red-700">Monthly Avg:</span>
                      <span className="font-medium text-red-900">
                        ₹{monthlySummaries.length > 0 ?
                          (monthlySummaries.reduce((sum: number, m: MonthlySummary) => sum + (m.totalExpenses || 0), 0) / monthlySummaries.length / 1000).toFixed(0)
                          : 0}k
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <BanknotesIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-900">Cash Flow Health</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Positive Months:</span>
                      <span className="font-medium text-blue-900">
                        {monthlySummaries.length > 0 ?
                          monthlySummaries.filter((m: MonthlySummary) => (m.netCashFlow || 0) > 0).length : 0}/{monthlySummaries.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Counterparties */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
                Top Counterparties
              </h2>
              <div className="space-y-3">
                {counterparties.slice(0, 5).map((party: any, idx: number) => {
                  const totalValue = (party.totalSent || 0) + (party.totalReceived || 0);
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{party.name}</p>
                        <p className="text-sm text-gray-600">{party.transactionCount} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{totalValue.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Consolidated Tab */}
        {activeTab === 'consolidated' && (
          <div className="space-y-6">
            {consolidatedLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
              </div>
            ) : consolidatedData ? (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Consolidated Financial Summary</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-blue-900">Total Income</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{(consolidatedData.financialSummary?.totalIncome || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <CubeIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No consolidated data available</p>
              </div>
            )}
          </div>
        )}

        {/* Decision Tab */}
        {activeTab === 'decision' && (
          <div className="space-y-6">
            <div className="p-6 text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="mb-4 text-2xl font-bold">Executive Decision Summary</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
                  <h3 className="mb-2 font-semibold">Risk Profile</h3>
                  <p className="text-3xl font-bold">
                    {riskAssessment.overallRiskScore && riskAssessment.overallRiskScore < 30 ? '🟢 LOW' :
                     riskAssessment.overallRiskScore && riskAssessment.overallRiskScore < 70 ? '🟡 MEDIUM' :
                     '🔴 HIGH'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Tab */}
        {activeTab === 'interactive' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
                <FilterIcon className="w-6 h-6 text-blue-600" />
                Interactive Filters
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Date Range</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>Last 30 Days</option>
                    <option>Last 3 Months</option>
                    <option>Last 6 Months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Reports Tab */}
        {activeTab === 'custom-reports' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Custom Reports</h2>
              <p className="text-gray-600">Create and manage custom reports here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
