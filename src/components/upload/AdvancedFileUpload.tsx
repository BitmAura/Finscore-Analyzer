'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { useFinancialAnalysis } from '../../hooks/useFinancialAnalysis'
import { supabase } from '../../lib/supabase-client';

import { useUser } from '@supabase/auth-helpers-react';

export interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  preview?: string
  accountDetails?: any
  analysisId?: string | null
}

interface AdvancedFileUploadProps {
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  onFilesChange?: (files: UploadFile[]) => void
  onUploadComplete?: (files: UploadFile[], analysisId: string | null) => void
  className?: string
  reportName?: string;
  referenceId?: string;
  reportType?: string;
}

const AdvancedFileUpload: React.FC<AdvancedFileUploadProps> = ({
  maxFiles = 100,
  maxFileSize = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'],
  onFilesChange,
  onUploadComplete,
  className = '',
  reportName = 'Financial Document Analysis',
  referenceId = 'DOC-' + Date.now(),
  reportType = 'bank-statement'
}) => {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const user = useUser();
  const userId = user?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwords, setPasswords] = useState<{[key: string]: string}>({});

  const { 
    isLoading: isAnalyzing, 
    isUploading: isAnalysisUploading, 
    progress: analysisProgress, 
    result: analysisResult, 
    error: analysisError, 
    analysisId,
    analyzeDocuments, 
    reset: resetAnalysis 
  } = useFinancialAnalysis({
    onComplete: (result) => {
      setFiles(prev => {
        const newFiles = [...prev];
        const fileToUpdate = newFiles.find(f => f.status === 'uploading');

        if (fileToUpdate) {
          fileToUpdate.status = 'completed';
          fileToUpdate.progress = 100;
          // The result from the analysis hook is for a single file
          fileToUpdate.accountDetails = result;
        }
        return newFiles;
      });
    },
    onError: (error) => {
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'error', error } : f))
    },
    onProgress: (progress) => {
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, progress } : f))
    }
  })

  useEffect(() => {
    if (analysisId) {
        setFiles(prev => {
            const newFiles = [...prev];
            const fileToUpdate = newFiles.find(f => f.status === 'uploading' && !f.analysisId);
            if (fileToUpdate) {
                fileToUpdate.analysisId = analysisId;
            }
            return newFiles;
        });
    }
  }, [analysisId]);

  const handlePasswordChange = (fileId: string, password: string) => {
    setPasswords(prev => ({...prev, [fileId]: password}));
  }

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }

    return null
  }, [acceptedTypes, maxFileSize])

  const createUploadFile = (file: File): UploadFile => ({
    id: Math.random().toString(36).substring(7),
    file,
    progress: 0,
    status: 'pending'
  })

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: UploadFile[] = []

    fileArray.forEach(file => {
      if (files.length + validFiles.length >= maxFiles) return

      const error = validateFile(file)
      if (error) {
        // Could add error notification here
        console.warn(error)
        return
      }

      validFiles.push(createUploadFile(file))
    })

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles]
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    }
  }, [files, maxFiles, onFilesChange, validateFile])

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
    const newPasswords = {...passwords};
    delete newPasswords[fileId];
    setPasswords(newPasswords);
  }

  const handleUploadFile = async (fileId: string) => {
    if (!userId) {
      console.error("User not logged in");
      return;
    }
    const fileToUpload = files.find(f => f.id === fileId);
    if (!fileToUpload) return;

    const fileObject = fileToUpload.file;
    const passwordValue = passwords[fileToUpload.id] || '';

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading', progress: 0 } : f
    ));

    await analyzeDocuments([fileObject], [passwordValue], userId, reportName, referenceId, reportType);
  }

  const handleAnalyze = () => {
    // This function now simply signals that the upload process is complete.
    // The parent component will handle the navigation.
    if (onUploadComplete) {
        onUploadComplete(files, null);
    }
  }

  // Replace uploadFiles with a proper handler
  const uploadFiles = () => {
    // This function is no longer used
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    addFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'uploading':
        return (
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleRetryParse = async (fileIdx: number) => {
    const file = files[fileIdx];
    const password = passwords[file.id] || '';
    const formData = new FormData();
    formData.append('files', file.file);
    formData.append('passwords', password);
    formData.append('reportName', reportName);
    formData.append('referenceId', referenceId);
    formData.append('reportType', reportType);
    let parsedAccount = {};
    let error = undefined;
    try {
      const res = await fetch('/api/v1/analysis/bank-statement', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.accounts && result.accounts[0]) {
        parsedAccount = result.accounts[0];
      }
      if (result.error) {
        error = 'Parsing failed';
      }
    } catch (err) {
      error = 'Parsing failed';
    }
    const updatedFiles = [...files];
    updatedFiles[fileIdx] = {
      ...file,
      status: error ? 'error' : 'completed',
      accountDetails: parsedAccount,
      error,
    };
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    if (onUploadComplete) onUploadComplete(updatedFiles, null);
  };

  const uploadToSupabase = async (file: File, userId: string, metadata: any) => {
    if (!userId) throw new Error('User ID is required');
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('bank-statements').upload(filePath, file);
    if (error) throw error;
    // Save metadata to documents table
    await supabase.from('documents').insert({
      user_id: userId,
      name: file.name,
      url: data?.path || '',
      bank_name: typeof metadata?.bankName === 'string' ? metadata.bankName : null,
      is_password_protected: !!metadata?.isPasswordProtected
    });
    return data?.path;
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      if (!userId) throw new Error('User not logged in');
      for (const fileObj of files) {
        const metadata = fileObj.accountDetails || {};
        await uploadToSupabase(fileObj.file, userId, metadata);
      }
      setIsUploading(false);
      if (onUploadComplete) onUploadComplete(files, analysisId);
    } catch (err) {
      setIsUploading(false);
      // Handle error
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        data-testid="file-upload-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-400 mt-2">
              Upload up to {maxFiles} files. Maximum {maxFileSize}MB per file.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: {acceptedTypes.join(', ')}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Choose Files
          </motion.button>
        </div>
      </motion.div>

      {/* File Queue */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">
              Upload Queue ({files.length}/{maxFiles})
            </h4>
          </div>

          {/* Success indicator when at least one file completed and none uploading */}
          {files.length > 0 && files.every(f => f.status === 'completed') && (
            <div className="text-green-400 text-sm" data-testid="upload-success">All files uploaded and analyzed.</div>
          )}

          <div className="space-y-2" data-testid="file-queue">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getStatusIcon(file.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {file.file.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatFileSize(file.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {(file.status === 'pending' || file.status === 'error') && (
                      <>
                        <input
                          type="password"
                          placeholder="Password (if any)"
                          value={passwords[file.id] || ''}
                          onChange={(e) => handlePasswordChange(file.id, e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm w-36"
                        />
                        <button
                          onClick={() => handleUploadFile(file.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                        >
                          Upload
                        </button>
                      </>
                    )}
                    {file.status === 'error' && (
                      <button
                        onClick={() => handleRetryParse(index)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded ml-2"
                      >
                        Retry
                      </button>
                    )}
                    {file.status === 'uploading' && (
                      <div className="text-blue-500 text-sm font-medium">
                        {Math.round(file.progress)}%
                      </div>
                    )}
                    {file.status === 'completed' && (
                      <span className="sr-only" data-testid="file-status-completed">completed</span>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${file.progress}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Account Details */}
                {file.accountDetails && (
                  <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-400">
                    <h4 className="font-semibold text-white mb-2">Extracted Details:</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <p><strong>Bank Name:</strong> {file.accountDetails.bank_name || 'N/A'}</p>
                        <p><strong>Account Name:</strong> {file.accountDetails.account_name || 'N/A'}</p>
                        <p><strong>Account Number:</strong> {file.accountDetails.account_number || 'N/A'}</p>
                        <p><strong>Currency:</strong> {file.accountDetails.currency || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {files.length > 0 && files.every(f => f.status === 'completed') && (
            <div className="flex justify-end mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Analyze
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AdvancedFileUpload