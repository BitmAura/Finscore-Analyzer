'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';
import CreateNewReportModal from '@/components/dashboard/CreateNewReportModal';

interface AnalysisJob {
  id: string;
  report_name: string;
  reference_id: string;
  report_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  document_name: string;
  created_at: string;
  completed_at?: string;
  metadata?: {
    fileCount?: number;
    detectedBanks?: string[];
    bankAccounts?: Array<{
      bankName: string;
      accountNumber: string;
      accountHolder?: string;
      startDate?: string;
      endDate?: string;
      currency?: string;
    }>;
  };
}

interface BankStatement {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  account_type: string;
  start_date?: string;
  end_date?: string;
  document_id?: string;
}

const MyReportsPage: React.FC = () => {
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  // store bank statements as a flat array for the user
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchJobs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setIsLoading(true);
        // Fetch analysis jobs
        const { data: jobsData, error: jobsError } = await supabase.from('analyses').select('*').eq('user_id', session.user.id);
        if (jobsError) throw jobsError;
        setJobs(jobsData || []);
        // Fetch uploaded documents
        const { data: docsData, error: docsError } = await supabase.from('documents').select('*').eq('user_id', session.user.id);
        if (docsError) throw docsError;
        setBankStatements(docsData || []);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reports');
        setIsLoading(false);
      }
    };
    checkAuthAndFetchJobs();
  }, [router]);

  const handleRefresh = () => {
    setIsLoading(true);
    setJobs([]);
    setBankStatements([]);

    // Re-run the effect to fetch data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1 animate-pulse"></span>
          Processing
        </span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>You are not logged in. Please log in to view your reports.</p>
        </div>
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <CreateNewReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefresh}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-1">View and manage your financial analysis reports</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Analysis
        </button>
      </div>

      {jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-12 text-center"
        >
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No reports yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Start by creating a new financial analysis report to get insights into your bank statements.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Report
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold text-gray-900">{job.report_name}</h2>
                      <span className="ml-3">{renderStatusBadge(job.status)}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex items-center">
                      <span className="mr-3">Ref: {job.reference_id}</span>
                      <span className="mr-3">•</span>
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      {job.completed_at && (
                        <>
                          <span className="mx-3">•</span>
                          <span>Completed: {new Date(job.completed_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {job.status === 'completed' && (
                    <Link
                      href={`/reports/${job.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                    >
                      View Report
                    </Link>
                  )}
                </div>
              </div>

              <div className="px-6 py-4">
                {/* Bank accounts section */}
                <h3 className="font-medium text-gray-900 mb-3">Bank Accounts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {job.metadata?.bankAccounts && job.metadata.bankAccounts.length > 0 ? (
                    job.metadata.bankAccounts.map((statement, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="font-semibold text-blue-800">{statement.bankName?.substring(0,1)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{statement.bankName}</p>
                            <p className="text-sm text-gray-600">{statement.accountNumber.length > 8 ? `XXXX${statement.accountNumber.slice(-4)}` : statement.accountNumber}</p>
                          </div>
                        </div>

                        {(statement.startDate || statement.endDate) && (
                          <div className="text-xs text-gray-500 mt-2">
                            Period: {statement.startDate || 'Unknown'} to {statement.endDate || 'Unknown'}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // Fallback: show uploaded documents (bankStatements) as available
                    bankStatements && bankStatements.length > 0 ? (
                      bankStatements.map((statement) => (
                        <div key={statement.id} className="border rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="font-semibold text-blue-800">{statement.bank_name?.substring(0,1)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{statement.bank_name}</p>
                              <p className="text-sm text-gray-600">{statement.account_number ? (statement.account_number.length > 8 ? `XXXX${statement.account_number.slice(-4)}` : statement.account_number) : 'N/A'}</p>
                            </div>
                          </div>

                          {(statement.start_date || statement.end_date) && (
                            <div className="text-xs text-gray-500 mt-2">
                              Period: {statement.start_date || 'Unknown'} to {statement.end_date || 'Unknown'}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full border border-dashed rounded-lg p-4 text-center text-gray-500">
                        {job.status === 'pending' || job.status === 'processing' ? (
                          <p>Bank account information will appear here once processing is complete.</p>
                        ) : (
                          <p>No bank account information available for this report.</p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    {job.metadata?.fileCount ? (
                      <span>Based on {job.metadata.fileCount} uploaded document{job.metadata.fileCount !== 1 ? 's' : ''}</span>
                    ) : (
                      <span>{job.document_name || 'Multiple documents'}</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {job.status === 'completed' && (
                      <Link href={`/reports/${job.id}`} className="text-blue-600 hover:text-blue-800">
                        View Detailed Analysis
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
