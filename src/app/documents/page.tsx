'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase-client';
import AdvancedFileUpload from '@/components/upload/AdvancedFileUpload';
import { saveAs } from 'file-saver'; // Import file-saver for exporting files
import { useAuthReady } from '@/contexts/AuthReadyContext';

// Define proper interfaces for document types
interface Document {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  created_at: string;
  bank_name?: string;
  account_number?: string;
  is_password_protected: boolean;
  status: 'pending' | 'processed' | 'error';
}

const DocumentsPage: React.FC = () => {
  const router = useRouter();
  const user = useUser();
  const { isAuthReady, isAuthenticated } = useAuthReady();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If authenticated, fetch documents
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, isAuthenticated]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('documents').select('*');
      if (error) {
        console.error('Failed to fetch documents:', error.message); // Log error instead of notification
        setDocuments([]);
      } else {
        setDocuments(data as Document[]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a reference ID based on user and timestamp
  useEffect(() => {
    if (user?.id) {
      const shortId = user.id.slice(0, 8).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      setReferenceId(`DOC-${shortId}-${timestamp}`);
    }
  }, [user]);

  const handleDelete = async () => {
    if (!selectedDocuments.length) return;

    setIsLoading(true);
    try {
      // Delete from storage
      for (const docId of selectedDocuments) {
        const doc = documents.find(d => d.id === docId);
        if (doc) {
          // Delete from storage bucket
          await supabase.storage.from('documents').remove([doc.file_path]);
          // Delete from documents table
          await supabase.from('documents').delete().eq('id', docId);
        }
      }
      // Refresh document list
      await fetchDocuments();
      setSelectedDocuments([]);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting documents:', err);
      setError('Failed to delete selected documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDocument = (id: string) => {
    setSelectedDocuments(prev =>
      prev.includes(id)
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.id));
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Upload Documents</h1>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Upload bank statements (6-8 months recommended) for comprehensive financial analysis.
          </p>
        </header>
        
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
          {user?.id ? (
            <AdvancedFileUpload
              reportName="Financial Document Analysis"
              referenceId={referenceId}
              reportType="bank-statement"
              maxFiles={10}
              onUploadComplete={async () => {
                console.log('Upload process complete, navigating to my-reports.');
                // Optionally, you can fetch documents again here to refresh the list
                await fetchDocuments();
                router.push('/my-reports');
              }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Please log in to upload documents.</p>
            </div>
          )}
        </div>

        {/* Document List Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
            <div className="space-x-2">
              {selectedDocuments.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Selected
                </button>
              )}
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                {selectedDocuments.length === documents.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-lg text-gray-600">No documents uploaded yet.</p>
              <p className="mt-2 text-gray-500">Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left"></th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => handleSelectDocument(doc.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        {doc.is_password_protected && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Password Protected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doc.bank_name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{doc.account_number || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {doc.status === 'processed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Processed
                          </span>
                        ) : doc.status === 'error' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Processing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedDocuments.length} selected document{selectedDocuments.length > 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;

