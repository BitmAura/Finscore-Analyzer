"use client";

import React, { useState } from 'react';
import AdvancedFileUpload, { UploadFile } from '../upload/AdvancedFileUpload';
import { useFinancialAnalysis } from '../../hooks/useFinancialAnalysis';

interface CreateNewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateNewReportModal({ isOpen, onClose }: CreateNewReportModalProps) {
  const [step, setStep] = useState(1);
  const [reportName, setReportName] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [analysisType, setAnalysisType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const { analyzeDocuments, isLoading } = useFinancialAnalysis();

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleStartAnalysis = async () => {
    // This is where you would get the real user ID
    const userId = 'demo-user-1'; 
    const files = uploadedFiles.map(f => f.file);
    const passwords = uploadedFiles.map(f => (f as any).password || '');
    await analyzeDocuments(files, passwords, userId, reportName, referenceId, analysisType);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setReportName('');
    setReferenceId('');
    setAnalysisType('');
    setUploadedFiles([]);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Create New Report</h2>
            <div className="text-sm font-medium text-gray-500">Step {step} of 3</div>
        </div>

        {step === 1 && (
            <>
                <p className="text-gray-600 mb-6">Start by giving your report a name, a unique reference ID, and selecting the type of analysis you want to perform.</p>
                <div className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="reportName" className="block text-sm font-medium text-gray-700">Report Name</label>
                        <input type="text" id="reportName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Enter report name" />
                    </div>
                    <div>
                        <label htmlFor="referenceId" className="block text-sm font-medium text-gray-700">Reference ID</label>
                        <input type="text" id="referenceId" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} placeholder="Enter reference ID" />
                    </div>
                    <div>
                        <label htmlFor="analysisType" className="block text-sm font-medium text-gray-700">Select Analysis Type</label>
                        <select id="analysisType" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={analysisType} onChange={(e) => setAnalysisType(e.target.value)}>
                            <option value="">Select Analysis Type</option>
                            <option value="bank-statement-analysis">Bank Statement Analysis</option>
                            <option value="gst-analysis">GST Analysis</option>
                            <option value="itr-analysis">ITR Analysis</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Cancel</button>
                    <button type="button" onClick={handleNext} disabled={!reportName || !referenceId || !analysisType} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">Next</button>
                </div>
            </>
        )}

        {step === 2 && (
            <>
                <AdvancedFileUpload onFilesChange={setUploadedFiles} />
                <div className="flex justify-between mt-6">
                    <button type="button" onClick={handleBack} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Back</button>
                    <button type="button" onClick={handleNext} disabled={uploadedFiles.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">Next</button>
                </div>
            </>
        )}

        {step === 3 && (
            <>
                <h3 className="text-lg font-medium text-gray-800">Summary</h3>
                <div className="mt-4 space-y-2">
                    <p><span className="font-semibold">Report Name:</span> {reportName}</p>
                    <p><span className="font-semibold">Reference ID:</span> {referenceId}</p>
                    <p><span className="font-semibold">Analysis Type:</span> {analysisType}</p>
                    <p className="font-semibold">Files to be analyzed:</p>
                    <ul className="list-disc list-inside">
                        {uploadedFiles.map(f => <li key={f.id}>{f.file.name}</li>)}
                    </ul>
                </div>
                <div className="flex justify-between mt-6">
                    <button type="button" onClick={handleBack} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">Back</button>
                    <button type="button" onClick={handleStartAnalysis} disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">
                        {isLoading ? 'Analyzing...' : 'Start Analysis'}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}

