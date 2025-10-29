/**
 * Advanced Upload Zone - Production Ready with Instant Results
 * Shows bank details, analysis summary, and supports multiple accounts
 */

'use client'

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CreditCardIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdvancedUploadZoneProps {
  onUploadComplete?: (jobId: string) => void;
}

interface AnalysisResult {
  jobId: string;
  status: string;
  transactionCount: number;
  bankInfo?: {
    name: string;
    type: string;
    accountPattern: string;
  };
  summary?: {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    riskLevel: string;
  };
  dateRange?: {
    start: string;
    end: string;
  };
}

export default function AdvancedUploadZone({ onUploadComplete }: AdvancedUploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reportName, setReportName] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Analysis results state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);

      // Auto-generate report name from filename
      const fileName = uploadedFile.name.replace(/\.[^/.]+$/, '');
      setReportName(fileName);

      // Auto-generate reference ID with timestamp
      setReferenceId(`REF-${Date.now()}`);

      // Check if it's a PDF (might be password protected)
      if (uploadedFile.type === 'application/pdf') {
        setShowPasswordField(true);
      }

      // Validate file size on selection
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (uploadedFile.size > maxSize) {
        toast.error('File is too large. Maximum size is 10MB.');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(uploadedFile.type)) {
        toast.error('Invalid file type. Please select PDF, CSV, or Excel files.');
        return;
      }

      toast.success(`File selected: ${uploadedFile.name}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload PDF, CSV, or Excel files.');
      } else {
        toast.error('File upload failed. Please try again.');
      }
    },
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }

    // Enhanced file validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, CSV, or Excel files only.');
      return;
    }

    // Validate report name length
    if (reportName.length > 100) {
      toast.error('Report name is too long. Please keep it under 100 characters.');
      return;
    }

    // Validate reference ID if provided
    if (referenceId && referenceId.length > 50) {
      toast.error('Reference ID is too long. Please keep it under 50 characters.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportName', reportName.trim());
      formData.append('referenceId', referenceId.trim() || `REF-${Date.now()}`);
      if (password) {
        formData.append('password', password);
      }

      setUploadProgress(30);

      toast.loading('Uploading and analyzing...', { id: 'upload' });

      // Upload to API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setUploadProgress(70);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || 'Upload failed');
      }

      setUploadProgress(100);

      toast.success('File analyzed successfully!', {
        id: 'upload',
        duration: 3000,
        icon: '✅',
      });

      // Detect bank name from transactions or filename
      const detectedBank = detectBankName(file.name);

      // Determine file type display
      let fileTypeDisplay = 'Unknown';
      if (file.type === 'text/csv') fileTypeDisplay = 'CSV Statement';
      else if (file.type === 'application/pdf') fileTypeDisplay = 'PDF Statement';
      else if (file.type.includes('excel') || file.type.includes('spreadsheet')) fileTypeDisplay = 'Excel Statement';

      // Show analysis results immediately
      setAnalysisResult({
        jobId: data.jobId,
        status: data.status,
        transactionCount: data.transactionCount || 0,
        bankInfo: {
          name: detectedBank,
          type: fileTypeDisplay,
          accountPattern: 'XXXX' + Math.random().toString().slice(-4)
        },
        summary: data.summary,
        dateRange: data.dateRange
      });

      setShowResults(true);
      setUploading(false);
      setUploadProgress(0);

      // Auto-redirect to report after 3 seconds
      setTimeout(() => {
        if (onUploadComplete && data.jobId) {
          onUploadComplete(data.jobId);
        }
      }, 3000);

    } catch (error: any) {
      console.error('Upload error:', error);

      // Handle different error types
      if (error.name === 'AbortError') {
        toast.error('Upload timed out. Please try again with a smaller file.', { id: 'upload' });
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection and try again.', { id: 'upload' });
      } else {
        toast.error(error.message || 'Failed to upload file. Please try again.', { id: 'upload' });
      }

      setUploadProgress(0);
      setUploading(false);
    }
  };

  // Detect bank name from filename or content
  const detectBankName = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('hdfc')) return 'HDFC Bank';
    if (lower.includes('icici')) return 'ICICI Bank';
    if (lower.includes('sbi') || lower.includes('state bank')) return 'State Bank of India';
    if (lower.includes('axis')) return 'Axis Bank';
    if (lower.includes('kotak')) return 'Kotak Mahindra Bank';
    if (lower.includes('idfc')) return 'IDFC First Bank';
    if (lower.includes('yes')) return 'Yes Bank';
    if (lower.includes('pnb')) return 'Punjab National Bank';
    if (lower.includes('bob') || lower.includes('baroda')) return 'Bank of Baroda';
    return 'Bank Statement';
  };

  const removeFile = () => {
    setFile(null);
    setReportName('');
    setReferenceId('');
    setUploadProgress(0);
    setPassword('');
    setShowPasswordField(false);
    setShowResults(false);
    setAnalysisResult(null);
  };

  const uploadAnother = () => {
    removeFile();
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Show Results After Upload */}
      {showResults && analysisResult ? (
        <div className="p-6 space-y-6 bg-white border border-gray-200 shadow-lg rounded-xl">
          {/* Success Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Analysis Complete!</h3>
                <p className="text-sm text-gray-600">Your bank statement has been processed</p>
              </div>
            </div>
            <button
              onClick={uploadAnother}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Upload Another →
            </button>
          </div>

          {/* Bank Information Card */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <BanknotesIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Bank</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{analysisResult.bankInfo?.name}</p>
              <p className="mt-1 text-xs text-blue-700">{analysisResult.bankInfo?.type}</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Transactions</span>
              </div>
              <p className="text-lg font-bold text-purple-900">{analysisResult.transactionCount}</p>
              <p className="mt-1 text-xs text-purple-700">entries processed</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Risk Level</span>
              </div>
              <p className={`text-lg font-bold ${getRiskColor(analysisResult.summary?.riskLevel).split(' ')[0]}`}>
                {analysisResult.summary?.riskLevel || 'Analyzing...'}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          {analysisResult.summary && (
            <div className="p-4 rounded-lg bg-gray-50">
              <h4 className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
                <ChartBarIcon className="w-5 h-5 text-gray-600" />
                Financial Summary
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Total Income</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{analysisResult.summary.totalIncome.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Expenses</p>
                  <p className="text-lg font-bold text-red-600">
                    ₹{analysisResult.summary.totalExpenses.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Net Cash Flow</p>
                  <p className={`text-lg font-bold ${analysisResult.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{analysisResult.summary.netCashFlow.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onUploadComplete && onUploadComplete(analysisResult.jobId)}
              className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <DocumentTextIcon className="w-5 h-5" />
              View Full Report
            </button>
            <button
              onClick={uploadAnother}
              className="px-6 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Upload Another Statement
            </button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Report ID: {analysisResult.jobId.slice(0, 8)}... • Redirecting to full report in 3 seconds...
          </p>
        </div>
      ) : (
        /* Upload Form */
        <div className="space-y-4">
          {/* File Upload Area */}
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-lg font-semibold text-gray-700">
                {isDragActive ? 'Drop your bank statement here' : 'Upload Bank Statement'}
              </p>
              <p className="mb-4 text-sm text-gray-500">
                Drag & drop or click to browse • CSV, PDF, Excel supported • Max 10MB
              </p>
              <p className="text-xs text-gray-400">
                Supports: HDFC, ICICI, SBI, Axis, Kotak, and most Indian banks
              </p>
            </div>
          ) : (
            /* File Selected */
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-10 h-10 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB • {file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                  disabled={uploading}
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-center text-gray-600">
                    {uploadProgress < 40 ? 'Uploading...' : uploadProgress < 80 ? 'Processing...' : 'Almost done...'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Report Details Form */}
          {file && !uploading && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Report Name *
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., HDFC Savings Jan 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Reference ID (Optional)
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {showPasswordField && (
                <div>
                  <label className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                    <LockClosedIcon className="w-4 h-4" />
                    PDF Password (if protected)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter PDF password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading || !reportName.trim()}
                className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Upload & Analyze
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
