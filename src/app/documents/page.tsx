'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase-client';
import AdvancedFileUpload from '@/components/upload/AdvancedFileUpload';

const DocumentsPage: React.FC = () => {
  const router = useRouter();
  const user = useUser();
  const [referenceId, setReferenceId] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  // Generate a reference ID based on user and timestamp
  useEffect(() => {
    if (user?.id) {
      const shortId = user.id.slice(0, 8).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      setReferenceId(`DOC-${shortId}-${timestamp}`);
    }
  }, [user]);

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
              onUploadComplete={() => {
                console.log('Upload process complete, navigating to my-reports.');
                router.push('/my-reports');
              }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Please log in to upload documents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;