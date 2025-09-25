import React, { useState, useRef } from 'react';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (analysisId: string) => void;
}

export default function NewAnalysisModal({ isOpen, onClose, onSuccess }: NewAnalysisModalProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async () => {
    if (!files || files.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/analysis/bank-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: Array.from(files).map(file => file.name) }),
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      const result = await response.json();
      onSuccess(result.analysisId);
      onClose();
    } catch (error) {
      console.error('Error starting analysis:', error);
      alert('An error occurred while starting the analysis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Start New Analysis</h2>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Upload Bank Statements</h3>
          <p className="text-sm text-gray-600 mb-2">Select one or more PDF files to analyze.</p>
          <input
            ref={fileInputRef}
            className="w-full border p-2 rounded"
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Analyzing...' : 'Analyse'}
          </button>
        </div>
      </div>
    </div>
  );
}
