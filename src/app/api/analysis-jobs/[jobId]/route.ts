/**
 * Individual Job Status API
 * Route: /api/analysis-jobs/[jobId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { jobId } = await params;

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // If completed, fetch full results
    if (job.status === 'completed') {
      const { data: transactions } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('analysis_job_id', jobId)
        .order('transaction_date', { ascending: false });

      // Extract results from job metadata (where upload API stores them)
      const results = job.metadata || {};

      return NextResponse.json({
        ...job,
        results,
        transactions,
        transactionCount: transactions?.length || 0
      });
    }

    // For non-completed jobs, try to get progress from queue
    try {
      const { JobQueueService } = await import('@/lib/services/job-queue');
      const queueJob = await JobQueueService.getJobStatus(jobId);
      if (queueJob) {
        return NextResponse.json({
          ...job,
          progress: queueJob.progress || 0,
          queueStatus: queueJob.status
        });
      }
    } catch (queueError) {
      console.error('Failed to get queue status:', queueError);
    }

    return NextResponse.json(job);

  } catch (error) {
    console.error('Fetch job error:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { jobId } = await params;

    // Delete job (cascade will handle related records)
    const { error } = await supabase
      .from('analysis_jobs')
      .delete()
      .eq('id', jobId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Job deleted successfully' });

  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update job details
    const { error } = await supabase
      .from('analysis_jobs')
      .update(body)
      .eq('id', jobId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Job updated successfully' });

  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
