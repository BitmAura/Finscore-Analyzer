/**
 * Individual Loan Application Detail Page
 * Complete application view with analysis and workflow
 */

'use client'

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface LoanApplication {
  id: string;
  application_id: string;
  loan_amount: number;
  loan_purpose: string;
  tenure_months: number;
  status: string;
  priority: string;
  created_at: string;
  applicant: {
    full_name: string;
    email: string;
    phone: string;
    pan_number: string;
    aadhaar_number: string;
    date_of_birth: string;
    address: string;
    employment_type: string;
    monthly_income: number;
  };
  co_applicants: any[];
  guarantors: any[];
  analysis_jobs: any[];
}

export default function LoanApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/loan-applications/${applicationId}`);

      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      } else {
        toast.error('Application not found');
        router.push('/loan-applications');
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
      toast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId, fetchApplication]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/loan-applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Application status updated to ${newStatus}`);
        fetchApplication(); // Refresh data
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Application not found</p>
          <button
            onClick={() => router.push('/loan-applications')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      disbursed: { color: 'bg-purple-100 text-purple-800', icon: CheckCircleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/loan-applications')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{application.application_id}</h1>
                <p className="text-sm text-gray-600">
                  {application.applicant.full_name} • {new Date(application.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge(application.status)}

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/loan-applications/${application.id}/edit`)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <PencilIcon className="w-4 h-4 inline mr-2" />
                  Edit
                </button>

                {application.status === 'draft' && (
                  <button
                    onClick={() => handleStatusUpdate('submitted')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Application
                  </button>
                )}

                {application.status === 'submitted' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('under_review')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Start Review
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {['overview', 'applicant', 'documents', 'analysis'].map((tab) => (
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Loan Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹{application.loan_amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purpose</p>
                  <p className="font-medium text-gray-900">{application.loan_purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tenure</p>
                  <p className="font-medium text-gray-900">{application.tenure_months} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    application.priority === 'high' ? 'bg-red-100 text-red-800' :
                    application.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {application.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Applicant Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Applicant</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{application.applicant.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{application.applicant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{application.applicant.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Income</p>
                  <p className="font-medium text-gray-900">₹{application.applicant.monthly_income.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Actions</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  {getStatusBadge(application.status)}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/loan-applications/${application.id}/upload`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Upload Documents
                  </button>

                  <button
                    onClick={() => router.push(`/loan-applications/${application.id}/analysis`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    View Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applicant Tab */}
        {activeTab === 'applicant' && (
          <div className="space-y-6">
            {/* Primary Applicant */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Applicant Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{application.applicant.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{application.applicant.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{application.applicant.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">{application.applicant.date_of_birth}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                    <p className="mt-1 text-sm text-gray-900">{application.applicant.pan_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                    <p className="mt-1 text-sm text-gray-900">{application.applicant.aadhaar_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                    <p className="mt-1 text-sm text-gray-900">{application.applicant.employment_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
                    <p className="mt-1 text-sm text-gray-900">₹{application.applicant.monthly_income.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{application.applicant.address}</p>
              </div>
            </div>

            {/* Co-applicants */}
            {application.co_applicants && application.co_applicants.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Co-applicants</h3>
                <div className="space-y-4">
                  {application.co_applicants.map((coApp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Co-applicant {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{coApp.full_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium">{coApp.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 font-medium">{coApp.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Relationship:</span>
                          <span className="ml-2 font-medium">{coApp.relationship}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantors */}
            {application.guarantors && application.guarantors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guarantors</h3>
                <div className="space-y-4">
                  {application.guarantors.map((guarantor, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Guarantor {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{guarantor.full_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium">{guarantor.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 font-medium">{guarantor.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Relationship:</span>
                          <span className="ml-2 font-medium">{guarantor.relationship}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
              <button
                onClick={() => router.push(`/loan-applications/${application.id}/upload`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
                Upload Documents
              </button>
            </div>

            {application.analysis_jobs && application.analysis_jobs.length > 0 ? (
              <div className="space-y-3">
                {application.analysis_jobs.map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{job.report_name}</p>
                        <p className="text-sm text-gray-600">
                          {job.document_name} • {new Date(job.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.status}
                      </span>
                      <button
                        onClick={() => router.push(`/reports/${job.id}`)}
                        className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No documents uploaded yet</p>
                <p className="text-sm text-gray-500">Upload bank statements to start analysis</p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Risk Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Risk Score</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                  <p className="text-xs text-gray-500">Calculated after document analysis</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">FOIR Score</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                  <p className="text-xs text-gray-500">Fixed Obligation to Income Ratio</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Banking Behavior</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                  <p className="text-xs text-gray-500">Account behavior score</p>
                </div>
              </div>
            </div>

            {/* Analysis Jobs */}
            {application.analysis_jobs && application.analysis_jobs.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Reports</h3>
                <div className="space-y-3">
                  {application.analysis_jobs.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{job.report_name}</p>
                        <p className="text-sm text-gray-600">
                          Status: {job.status} • Created: {new Date(job.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/reports/${job.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        View Full Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No analysis available</p>
                <p className="text-sm text-gray-500">Upload bank statements to generate analysis reports</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
