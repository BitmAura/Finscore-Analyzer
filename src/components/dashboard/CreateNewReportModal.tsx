'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { useFinancialAnalysis } from '@/hooks/useFinancialAnalysis';
import { useUser } from '@supabase/auth-helpers-react';
import RealTimeBankDetection from '@/components/upload/RealTimeBankDetection';

interface CreateNewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: string;
  metadata?: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    accountType: string;
    statementPeriod: {
      start: string;
      end: string;
    };
    confidence: number;
  };
}

interface DetectedBankInfo {
  bankCode: string;
  bankName: string;
  bankColor: string;
  accountNumber: string;
  accountName: string;
  ifsc?: string;
  startDate?: string;
  endDate?: string;
  confidence: number;
  processingStatus: 'processing' | 'completed' | 'error';
}

const CreateNewReportModal: React.FC<CreateNewReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [reportName, setReportName] = useState('');
  const [referenceId, setReferenceId] = useState(`REF-${Date.now()}`);
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [filePasswords, setFilePasswords] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validFilesCount, setValidFilesCount] = useState(0);
  const [totalBanksDetected, setTotalBanksDetected] = useState(0);

  const { analyzeDocuments, isAnalyzing, isLoading } = useFinancialAnalysis();
  const user = useUser();
  const userId = user?.id;

  useEffect(() => {
    // Update stats when detected banks change
    const validFiles = uploadedFiles.filter(f => f.metadata);
    setValidFilesCount(validFiles.length);

    const uniqueBanks = new Set(
      validFiles
        .map(f => f.metadata?.bankName)
        .filter(name => name && name !== 'Unknown Bank')
    );
    setTotalBanksDetected(uniqueBanks.size);
  }, [uploadedFiles]);

  const resetModal = () => {
    setStep(1);
    setReportName('');
    setReferenceId(`REF-${Date.now()}`);
    setAnalysisType('comprehensive');
    setUploadedFiles([]);
    setFilePasswords({});
    setIsSubmitting(false);
    setError('');
    setValidFilesCount(0);
    setTotalBanksDetected(0);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!reportName) {
        setError('Please enter a report name');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (uploadedFiles.length === 0) {
        setError('Please upload at least one file');
        return;
      }

      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handlePasswordChange = (fileId: string, password: string) => {
    setFilePasswords(prev => ({
      ...prev,
      [fileId]: password
    }));
  };

  const handleBankDetectionComplete = (detectedInfo: DetectedBankInfo[]) => {
    // Update the uploadedFiles with metadata from bank detection
    setUploadedFiles(prev =>
      prev.map((file, idx) => {
        if (idx < detectedInfo.length && detectedInfo[idx].processingStatus === 'completed') {
          return {
            ...file,
            metadata: {
              bankName: detectedInfo[idx].bankName,
              bankCode: detectedInfo[idx].bankCode,
              accountNumber: detectedInfo[idx].accountNumber,
              accountHolder: detectedInfo[idx].accountName,
              accountType: detectedInfo[idx].bankCode === 'UNKNOWN' ? 'Unknown' : 'Checking',
              statementPeriod: {
                start: detectedInfo[idx].startDate || 'Not detected',
                end: detectedInfo[idx].endDate || 'Not detected'
              },
              confidence: detectedInfo[idx].confidence
            }
          };
        }
        return file;
      })
    );
  };

  const handleStartAnalysis = async () => {
    if (!userId) return;

    setIsSubmitting(true);
    setError('');
    setStep(4);

    try {
      const files = uploadedFiles.map(f => f.file);
      const passwords = Object.values(filePasswords);

      await analyzeDocuments(files, passwords, userId, reportName, referenceId, analysisType);

      resetModal();
      onClose();
      onSuccess?.();
    } catch (err: any) {
      console.error('Error submitting analysis:', err);
      setError(err.message || 'An error occurred while submitting the analysis');
      setStep(3); // Go back to bank detection step on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSimpleFiles = () => {
    return uploadedFiles.map(f => f.file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          open={isOpen}
          onClose={() => {
            if (!isSubmitting) onClose();
          }}
        >
          <div className="min-h-screen px-4 flex items-center justify-center">
            <Dialog.Overlay
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Create New Analysis Report
                </Dialog.Title>

                <div className="flex items-center space-x-2">
                  {step > 1 && step < 4 && (
                    <span className="text-sm text-gray-500">Step {step} of 3</span>
                  )}
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Progress steps */}
                <div className="flex mb-8 justify-center">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        s < step ? 'bg-green-600 text-white' : 
                        s === step ? 'bg-blue-600 text-white' : 
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {s < step ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          s
                        )}
                      </div>
                      {s < 3 && (
                        <div className={`w-24 h-1 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Step 1: Report Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="report-name" className="block text-sm font-medium text-gray-700">Report Name</label>
                      <input
                        type="text"
                        id="report-name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="Q3 Financial Analysis"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">Provide a name for your analysis report</p>
                    </div>

                    <div>
                      <label htmlFor="reference-id" className="block text-sm font-medium text-gray-700">Reference ID</label>
                      <input
                        type="text"
                        id="reference-id"
                        value={referenceId}
                        onChange={(e) => setReferenceId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">Optional: Use your own reference code or keep the auto-generated one</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Analysis Type</label>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          className={`border rounded-lg p-4 cursor-pointer ${
                            analysisType === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setAnalysisType('basic')}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                              analysisType === 'basic' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}></div>
                            <div>
                              <h3 className="font-medium text-gray-900">Basic Analysis</h3>
                              <p className="text-sm text-gray-500">Simple overview of transactions and balances</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border rounded-lg p-4 cursor-pointer ${
                            analysisType === 'comprehensive' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setAnalysisType('comprehensive')}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                              analysisType === 'comprehensive' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}></div>
                            <div>
                              <h3 className="font-medium text-gray-900">Comprehensive Analysis</h3>
                              <p className="text-sm text-gray-500">Full financial profile with insights and trends</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload Files */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Upload Bank Statements</h2>
                      <span className="text-sm text-gray-500">We support PDF, CSV, and Excel formats</span>
                    </div>

                    <input
                      type="file"
                      id="file-upload"
                      data-testid="file-upload-input"
                      className="sr-only"
                      multiple
                      accept=".pdf,.csv,.xlsx,.xls"
                      onChange={(e) => {
                        if (!e.target.files) return;
                        const files = Array.from(e.target.files).map(file => ({
                          id: `${Date.now()}-${file.name}`,
                          file,
                          progress: 0,
                          status: 'pending'
                        }));
                        setUploadedFiles(prev => [...prev, ...files]);
                      }}
                    />

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="space-y-4">
                        <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                          <p className="text-gray-600">Drag and drop bank statements here, or</p>
                          <label
                            htmlFor="file-upload"
                            className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                          >
                            Browse Files
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          Upload 6-8 months of statements from one or more bank accounts
                        </p>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-3">Uploaded Files ({uploadedFiles.length})</h3>
                        <div className="space-y-2">
                          {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between border rounded-lg p-3">
                              <div className="flex items-center">
                                <svg className="w-8 h-8 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="password"
                                  placeholder="Password (if protected)"
                                  className="px-3 py-1 text-sm border border-gray-300 rounded"
                                  onChange={(e) => handlePasswordChange(file.id, e.target.value)}
                                />
                                <button
                                  onClick={() => {
                                    setUploadedFiles(files => files.filter(f => f.id !== file.id));
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Bank Detection & Confirm */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Review & Confirm</h2>
                      <p className="text-gray-600">Our AI has analyzed your documents and detected the following bank accounts.</p>
                    </div>

                    <div className="hidden">
                      <RealTimeBankDetection
                        files={getSimpleFiles()}
                        passwords={filePasswords}
                        onDetectionComplete={handleBankDetectionComplete}
                      />
                    </div>

                    {/* Report Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h3 className="font-medium mb-3">Report Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Report Name</p>
                          <p className="font-medium">{reportName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Reference ID</p>
                          <p className="font-medium">{referenceId || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Analysis Type</p>
                          <p className="font-medium capitalize">{analysisType.replace('-', ' ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detected Bank Accounts Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                      <h4 className="font-semibold mb-3">Detected Bank Accounts</h4>
                      <div className="space-y-3">
                        {uploadedFiles.filter(f => f.metadata).map((file) => (
                          <div key={file.id} className="bg-white p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{file.metadata?.bankName === 'Unknown Bank' ? '🏦' : '✓'}</span>
                                <div>
                                  <p className="font-semibold">{file.metadata?.bankName}</p>
                                  <p className="text-sm text-gray-600">
                                    A/C: {file.metadata?.accountNumber}
                                    {file.metadata?.accountHolder !== 'Not detected' && (
                                      <span className="ml-2">• {file.metadata?.accountHolder}</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {file.metadata?.statementPeriod.start} to {file.metadata?.statementPeriod.end}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                                {file.metadata?.accountType}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                        <span className="text-gray-600">Total Files:</span>
                        <span className="font-semibold">{validFilesCount} statement(s)</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Unique Banks:</span>
                        <span className="font-semibold">{totalBanksDetected}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800">
                        <strong>✨ AI-Powered Analysis:</strong> Our system will analyze all uploaded statements,
                        extract transactions, categorize expenses, detect anomalies, and generate a comprehensive report.
                        Estimated time: 2-5 minutes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 4: Processing */}
                {step === 4 && (
                  <div className="text-center py-8">
                    {isAnalyzing || isLoading ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
                        <h3 className="text-lg font-medium">Processing Your Documents</h3>
                        <p className="text-gray-600">This may take a few minutes depending on the number of statements.</p>

                        <div className="mt-6 max-w-md mx-auto">
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">Documents uploaded</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">Bank accounts detected</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">Extracting transactions...</p>
                              </div>
                            </div>
                            <div className="flex items-center opacity-50">
                              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">Generating insights</p>
                              </div>
                            </div>
                            <div className="flex items-center opacity-50">
                              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">Creating report</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium">Analysis Complete!</h3>
                        <p className="text-gray-600">Your report has been created successfully.</p>

                        <div className="pt-4">
                          <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            View My Reports
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-between">
                <button
                  type="button"
                  onClick={step > 1 && step < 4 ? handleBack : onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {step > 1 && step < 4 ? 'Back' : 'Cancel'}
                </button>

                {step < 4 && (
                  <button
                    type="button"
                    onClick={step === 3 ? handleStartAnalysis : handleNext}
                    disabled={isSubmitting}
                    className={`px-4 py-2 ${
                      step === 3 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {step === 3
                      ? (isSubmitting ? 'Starting Analysis...' : 'Start Analysis')
                      : 'Next'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default CreateNewReportModal;
