/**
 * Enhanced Upload Zone Component
 * Shows bank detection, account type identification, and step-by-step progress
 */

'use client'

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';
import { detectBankDetails, detectBankFromFilename } from '@/lib/services/bank-detection-service';
import toast from 'react-hot-toast';

interface UploadProgress {
  stage: 'idle' | 'uploading' | 'detecting' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  bankName?: string;
  accountType?: string;
  transactionCount?: number;
  requiresPassword?: boolean;
  passwordHint?: string;
}

interface EnhancedUploadZoneProps {
  onUploadComplete: (result: any) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
}

export default function EnhancedUploadZone({
  onUploadComplete,
  onUploadError,
  disabled = false
}: EnhancedUploadZoneProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to upload'
  });
  const [detectedFile, setDetectedFile] = useState<File | null>(null);
  const [bankDetection, setBankDetection] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Reset state when component mounts
  useEffect(() => {
    setUploadProgress({
      stage: 'idle',
      progress: 0,
      message: 'Ready to upload'
    });
    setDetectedFile(null);
    setBankDetection(null);
    setPassword('');
    setShowPasswordInput(false);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setDetectedFile(file);

    // Stage 1: File validation and basic detection
    setUploadProgress({
      stage: 'detecting',
      progress: 20,
      message: 'Detecting file type and content...'
    });

    try {
      // Read file content for analysis
      const text = await readFileContent(file);

      // Detect bank from filename first
      const filenameDetection = detectBankFromFilename(file.name);

      // Detect bank from content
      const contentDetection = detectBankDetails(text);

      // Combine detections
      const finalDetection = {
        bankName: contentDetection.confidence > filenameDetection.confidence
          ? contentDetection.bankName
          : filenameDetection.bankName,
        confidence: Math.max(contentDetection.confidence, filenameDetection.confidence),
        accountType: contentDetection.accountType,
        accountNumber: contentDetection.accountNumber,
        ifsc: contentDetection.ifsc,
        branch: contentDetection.branch,
        isBusinessAccount: contentDetection.isBusinessAccount,
        businessIndicators: contentDetection.businessIndicators,
        personalIndicators: contentDetection.personalIndicators,
        fileSize: file.size,
        fileType: file.type,
        filename: file.name
      };

      setBankDetection(finalDetection);

      // Check if PDF is password protected
      if (file.type === 'application/pdf' && !text.trim()) {
        setShowPasswordInput(true);
        setUploadProgress({
          stage: 'idle',
          progress: 0,
          message: 'PDF appears to be password protected',
          requiresPassword: true,
          passwordHint: 'Try: DOB (DDMMYYYY), PAN number, or account number'
        });
        return;
      }

      // Stage 2: Upload file
      setUploadProgress({
        stage: 'uploading',
        progress: 40,
        message: 'Uploading file to server...'
      });

      await uploadFile(file, text, finalDetection);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadProgress({
        stage: 'failed',
        progress: 0,
        message: error.message || 'Upload failed'
      });
      onUploadError(error.message || 'Upload failed');
    }
  }, []);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      if (file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        // For PDF, we'll try to extract text (basic implementation)
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          // For now, return empty string for PDF
          // In real implementation, this would use PDF parsing
          resolve('');
        };
      }
    });
  };

  const uploadFile = async (file: File, text: string, detection: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportName', `Analysis - ${detection.bankName || 'Unknown Bank'}`);
    formData.append('referenceId', `REF-${Date.now()}`);

    if (password && file.type === 'application/pdf') {
      formData.append('password', password);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();

    if (result.success) {
      setUploadProgress({
        stage: 'completed',
        progress: 100,
        message: 'Analysis completed successfully!',
        bankName: detection.bankName,
        accountType: detection.accountType,
        transactionCount: result.summary?.transactionCount
      });

      onUploadComplete(result);
      toast.success('File uploaded and analyzed successfully!');
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password || !detectedFile) return;

    setUploadProgress({
      stage: 'uploading',
      progress: 30,
      message: 'Trying password and uploading...'
    });

    try {
      const text = await readFileContent(detectedFile);
      await uploadFile(detectedFile, text, bankDetection);
    } catch (error: any) {
      setUploadProgress({
        stage: 'failed',
        progress: 0,
        message: error.message || 'Password incorrect or upload failed'
      });
      toast.error('Password incorrect or file corrupted');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    disabled,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getStageIcon = () => {
    switch (uploadProgress.stage) {
      case 'idle':
        return <CloudArrowUpIcon className="w-12 h-12 text-gray-400" />;
      case 'detecting':
        return <MagnifyingGlassIcon className="w-12 h-12 text-blue-500 animate-pulse" />;
      case 'uploading':
        return <ArrowPathIcon className="w-12 h-12 text-blue-500 animate-spin" />;
      case 'processing':
        return <ArrowPathIcon className="w-12 h-12 text-purple-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-12 h-12 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />;
      default:
        return <CloudArrowUpIcon className="w-12 h-12 text-gray-400" />;
    }
  };

  const getProgressColor = () => {
    switch (uploadProgress.stage) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
      case 'uploading':
        return 'bg-blue-500';
      case 'detecting':
        return 'bg-purple-500';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />

        {uploadProgress.stage === 'idle' && (
          <>
            <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Bank Statement
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV or PDF file here, or click to browse
            </p>
            <div className="text-sm text-gray-500">
              <p>Supported formats: CSV, PDF (password protected)</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </>
        )}

        {(uploadProgress.stage !== 'idle' && uploadProgress.stage !== 'completed') && (
          <>
            {getStageIcon()}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
              {uploadProgress.message}
            </h3>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>

            <p className="text-sm text-gray-600">
              {uploadProgress.progress}% complete
            </p>
          </>
        )}

        {uploadProgress.stage === 'completed' && (
          <>
            {getStageIcon()}
            <h3 className="text-lg font-semibold text-green-900 mb-2 mt-4">
              Upload Successful!
            </h3>
            <p className="text-green-700 mb-4">
              Your bank statement has been analyzed successfully
            </p>

            {bankDetection && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Detection Results</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-green-700">Bank:</span>
                    <span className="ml-2 font-medium">{bankDetection.bankName}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Account:</span>
                    <span className={`ml-2 font-medium ${
                      bankDetection.accountType === 'business' ? 'text-purple-700' :
                      bankDetection.accountType === 'personal' ? 'text-blue-700' :
                      'text-gray-700'
                    }`}>
                      {bankDetection.accountType}
                    </span>
                  </div>
                  {uploadProgress.transactionCount && (
                    <div className="col-span-2">
                      <span className="text-green-700">Transactions:</span>
                      <span className="ml-2 font-medium">{uploadProgress.transactionCount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {uploadProgress.stage === 'failed' && (
          <>
            {getStageIcon()}
            <h3 className="text-lg font-semibold text-red-900 mb-2 mt-4">
              Upload Failed
            </h3>
            <p className="text-red-700 mb-4">
              {uploadProgress.message}
            </p>
            <button
              onClick={() => {
                setUploadProgress({ stage: 'idle', progress: 0, message: 'Ready to upload' });
                setDetectedFile(null);
                setBankDetection(null);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {/* Password Input for Protected PDFs */}
      {showPasswordInput && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <LockClosedIcon className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">Password Required</h3>
          </div>

          <p className="text-yellow-700 mb-4">
            This PDF appears to be password protected. Please enter the password to continue.
          </p>

          {uploadProgress.passwordHint && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Hint:</strong> {uploadProgress.passwordHint}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter PDF password"
              className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={handlePasswordSubmit}
              disabled={!password}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LockOpenIcon className="w-5 h-5 inline mr-2" />
              Unlock & Upload
            </button>
          </div>

          <p className="text-xs text-yellow-600 mt-2">
            Common passwords: Date of birth (DDMMYYYY), PAN card number, last 4 digits of account number
          </p>
        </div>
      )}

      {/* Bank Detection Results */}
      {bankDetection && uploadProgress.stage !== 'completed' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Bank Detection Results</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Bank Detected:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium text-blue-900">{bankDetection.bankName}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  bankDetection.confidence > 70 ? 'bg-green-100 text-green-800' :
                  bankDetection.confidence > 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {bankDetection.confidence}% confidence
                </span>
              </div>
            </div>

            <div>
              <span className="text-blue-700">Account Type:</span>
              <div className="flex items-center gap-2 mt-1">
                {bankDetection.accountType === 'business' ? (
                  <BuildingOfficeIcon className="w-4 h-4 text-purple-600" />
                ) : (
                  <UserIcon className="w-4 h-4 text-blue-600" />
                )}
                <span className={`font-medium ${
                  bankDetection.accountType === 'business' ? 'text-purple-700' :
                  bankDetection.accountType === 'personal' ? 'text-blue-700' :
                  'text-gray-700'
                }`}>
                  {bankDetection.accountType}
                </span>
              </div>
            </div>

            {bankDetection.accountNumber && (
              <div className="col-span-2">
                <span className="text-blue-700">Account Number:</span>
                <span className="ml-2 font-mono text-blue-900">{bankDetection.accountNumber}</span>
              </div>
            )}

            {bankDetection.ifsc && (
              <div className="col-span-2">
                <span className="text-blue-700">IFSC Code:</span>
                <span className="ml-2 font-mono text-blue-900">{bankDetection.ifsc}</span>
              </div>
            )}
          </div>

          {/* Indicators */}
          {bankDetection.businessIndicators.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-purple-700 mb-1">Business indicators detected:</p>
              <div className="flex flex-wrap gap-1">
                {bankDetection.businessIndicators.slice(0, 3).map((indicator: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Upload Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Supported formats: CSV, PDF (including password-protected)</li>
          <li>• Maximum file size: 10MB</li>
          <li>• For password-protected PDFs, try: DOB (DDMMYYYY), PAN number, or account number</li>
          <li>• Ensure the file contains transaction data in a standard format</li>
        </ul>
      </div>
    </div>
  );
}