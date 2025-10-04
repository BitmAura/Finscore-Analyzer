'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const passwords = formData.getAll('passwords') as string[];
    const userId = formData.get('userId') as string;
    const reportName = formData.get('reportName') as string || 'Financial Analysis Report';
    const referenceId = formData.get('referenceId') as string || `REF-${Date.now()}`;
    const reportType = formData.get('reportType') as string || 'bank-statement';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 401 });
    }

    // First, detect bank details from the files
    // We'll forward the request to our bank detection API
    const bankDetectionUrl = new URL('/api/v1/bank-detection', request.url);
    const detectionFormData = new FormData();
    files.forEach(file => detectionFormData.append('files', file));

    const detectionResponse = await fetch(bankDetectionUrl, {
      method: 'POST',
      body: detectionFormData,
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    const detectionResult = await detectionResponse.json();

    if (!detectionResult.success) {
      return NextResponse.json({ error: 'Failed to detect bank details' }, { status: 500 });
    }

    // Create a new analysis job
    const { data: analysisJob, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert({
        user_id: userId,
        report_name: reportName,
        reference_id: referenceId,
        report_type: reportType,
        status: 'pending',
        document_name: files.length === 1 ? files[0].name : `${files.length} documents`,
        metadata: {
          fileCount: files.length,
          detectedBanks: detectionResult.accounts.map((account: any) => account.bank_name),
          passwords: passwords.map(pwd => pwd ? 'Yes' : 'No')
        }
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating analysis job:', jobError);
      return NextResponse.json({ error: 'Failed to create analysis job' }, { status: 500 });
    }

    // Now store the detected bank accounts
    const bankStatements = [];
    for (let i = 0; i < detectionResult.accounts.length; i++) {
      const account = detectionResult.accounts[i];
      const { data: statement, error: statementError } = await supabase
        .from('bank_statements')
        .insert({
          user_id: userId,
          bank_name: account.bank_name,
          account_name: account.account_name,
          account_number: account.account_number,
          account_type: 'Checking', // Default, can be refined with better detection
          currency: account.currency || 'INR',
          document_id: account.documentId
        })
        .select()
        .single();

      if (statementError) {
        console.error('Error storing bank statement:', statementError);
      } else {
        bankStatements.push(statement);
      }
    }

    // Update the user's dashboard stats
    await supabase.rpc('increment_user_analyses', { user_id: userId });

    // Log user activity
    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        type: 'analysis_started',
        description: `Started analysis of ${files.length} document${files.length > 1 ? 's' : ''}`,
        metadata: {
          job_id: analysisJob.id,
          report_name: reportName
        }
      });

    // In a real implementation, we would now queue the analysis job for processing
    // For this example, we'll update the job status to simulate processing
    setTimeout(async () => {
      await supabase
        .from('analysis_jobs')
        .update({
          status: 'processing'
        })
        .eq('id', analysisJob.id);

      // After "processing", we'd update to completed
      setTimeout(async () => {
        await supabase
          .from('analysis_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', analysisJob.id);

        // Create dummy analysis results
        await supabase
          .from('analysis_results')
          .insert({
            job_id: analysisJob.id,
            summary: {
              totalTransactions: Math.floor(Math.random() * 100) + 50,
              totalInflow: Math.floor(Math.random() * 100000) + 10000,
              totalOutflow: Math.floor(Math.random() * 50000) + 5000,
              balanceTrend: 'positive',
              riskLevel: 'low'
            }
          });

        // Log completion activity
        await supabase
          .from('user_activities')
          .insert({
            user_id: userId,
            type: 'analysis_completed',
            description: `Completed analysis of ${files.length} document${files.length > 1 ? 's' : ''}`,
            metadata: {
              job_id: analysisJob.id,
              report_name: reportName
            }
          });
      }, 10000); // 10 seconds to "complete" the analysis
    }, 5000); // 5 seconds to move to "processing"

    return NextResponse.json({
      success: true,
      analysisId: analysisJob.id,
      detectedAccounts: detectionResult.accounts
    });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
