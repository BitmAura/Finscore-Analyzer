'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ReportViewProps {
  job: any;
  summary: any;
  bankAccounts: any[];
  transactions: any[];
  activeTab: 'summary' | 'accounts' | 'transactions' | 'insights';
  setActiveTab: React.Dispatch<React.SetStateAction<'summary' | 'accounts' | 'transactions' | 'insights'>>;
  handleExportReport: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ job, summary, bankAccounts, transactions, activeTab, setActiveTab, handleExportReport }) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/my-reports" className="text-blue-600 hover:underline flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Reports
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{job.report_name}</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span className="mr-3">Reference ID: {job.reference_id}</span>
            <span className="mr-3">•</span>
            <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
            {job.completed_at && (
              <>
                <span className="mr-3">•</span>
                <span>Completed: {new Date(job.completed_at).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportReport}
            disabled={job.status !== 'completed'}
            className={`px-4 py-2 rounded-lg flex items-center ${
              job.status === 'completed'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mb-6">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              job.status === 'completed' ? 'bg-green-500' :
              job.status === 'processing' ? 'bg-blue-500 animate-pulse' :
              job.status === 'failed' ? 'bg-red-500' :
              'bg-yellow-500'
            }`}
          ></div>
          <span className="font-medium capitalize">{job.status}</span>
          {job.status === 'processing' && (
            <div className="ml-3 h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-progress-indeterminate"></div>
            </div>
          )}
        </div>
      </div>

      {job.status !== 'completed' ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {job.status === 'processing' ? (
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : job.status === 'pending' ? (
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {job.status === 'processing'
              ? 'Your report is being processed'
              : job.status === 'pending'
              ? 'Your report is queued for processing'
              : 'Processing failed'}
          </h2>
          <p className="text-gray-600 mb-6">
            {job.status === 'processing'
              ? 'We are analyzing your financial documents. This may take a few minutes.'
              : job.status === 'pending'
              ? 'Your report is in the queue and will be processed shortly.'
              : 'There was an error processing your report. Please try again.'}
          </p>
          {job.status === 'processing' && (
            <div className="text-sm text-gray-500">
              Analyzing {job.metadata?.fileCount || '1'} document{job.metadata?.fileCount !== 1 ? 's' : ''}
              {job.metadata?.detectedBanks?.length && (
                <span> from {job.metadata.detectedBanks.join(', ')}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="border-b mb-6">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('summary')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'accounts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bank Accounts
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'insights'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Insights
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'summary' && summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Transactions</p>
                      <p className="text-xl font-semibold">{summary.totalTransactions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time Period</p>
                      <p className="text-xl font-semibold">6 months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Inflow</p>
                      <p className="text-xl font-semibold text-green-600">₹{summary.totalInflow.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Outflow</p>
                      <p className="text-xl font-semibold text-red-600">₹{summary.totalOutflow.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Indicators</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Balance Trend</span>
                    <span className={`font-medium ${summary.balanceTrend === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.balanceTrend === 'positive' ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <span className={`font-medium ${
                      summary.riskLevel === 'low' ? 'text-green-600' :
                      summary.riskLevel === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {summary.riskLevel.charAt(0).toUpperCase() + summary.riskLevel.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Credit Score Impact</span>
                    <span className="font-medium text-green-600">Positive</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
                <p className="text-gray-600">
                  This financial analysis report summarizes the banking activities over the past 6 months.
                  The account shows a {summary.balanceTrend} trend with consistent income sources and regular expense patterns.
                  Overall risk assessment is <span className={`font-medium ${
                    summary.riskLevel === 'low' ? 'text-green-600' :
                    summary.riskLevel === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{summary.riskLevel}</span>, indicating a {summary.riskLevel === 'low' ? 'stable' : 'variable'} financial profile.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Key Recommendations:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Continue maintaining regular savings pattern</li>
                    <li>Consider reducing discretionary spending in entertainment category</li>
                    <li>Maintain emergency fund of 3-6 months expenses</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'accounts' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Bank Accounts ({bankAccounts.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bankAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No bank accounts found</td>
                      </tr>
                    ) : (
                      bankAccounts.map((account, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.bank_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.account_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">XXXX{account.account_number.slice(-4)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.account_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.currency}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                <div className="flex items-center gap-2">
                  <select className="text-sm border border-gray-300 rounded px-3 py-1.5">
                    <option>All Categories</option>
                    <option>Income</option>
                    <option>Expenses</option>
                    <option>Transfers</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="text-sm border border-gray-300 rounded px-3 py-1.5 w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No transactions found</td>
                      </tr>
                    ) : (
                      transactions.slice(0, 10).map((tx, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{tx.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                            {tx.debit ? `₹${parseFloat(tx.debit).toLocaleString()}` : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                            {tx.credit ? `₹${parseFloat(tx.credit).toLocaleString()}` : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            ₹{parseFloat(tx.balance).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {transactions.length > 10 && (
                <div className="px-6 py-3 border-t flex justify-between items-center text-sm">
                  <span>Showing 1 - 10 of {transactions.length} transactions</span>
                  <div className="flex gap-2">
                    <button className="border rounded px-3 py-1 hover:bg-gray-50">Previous</button>
                    <button className="border rounded px-3 py-1 bg-blue-50 text-blue-600 border-blue-200">1</button>
                    <button className="border rounded px-3 py-1 hover:bg-gray-50">2</button>
                    <button className="border rounded px-3 py-1 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Salary</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Investments</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Other</span>
                    <span className="font-medium">7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '7%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Housing</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Food & Dining</span>
                    <span className="font-medium">22%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Transportation</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Other</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <div className="h-64 flex items-end justify-between">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const inflow = Math.floor(Math.random() * 50) + 50;
                    const outflow = Math.floor(Math.random() * 40) + 30;
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div className="flex items-end space-x-1">
                          <div className="w-10 bg-green-500 rounded-t" style={{ height: `${inflow}%` }}></div>
                          <div className="w-10 bg-red-500 rounded-t" style={{ height: `${outflow}%` }}></div>
                        </div>
                        <span className="mt-2 text-xs text-gray-600">Month {i+1}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Income</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

export default ReportView;
