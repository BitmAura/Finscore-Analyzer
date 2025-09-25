
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerAuth, getUserId } from '@/lib/auth-server';

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // First, verify that the user has access to the analysis job
  const { data: job, error: jobError } = await supabase
    .from('analysis_jobs')
    .select('id')
    .eq('id', params.jobId)
    .eq('user_id', userId)
    .single();

  if (jobError || !job) {
    return new NextResponse('Analysis job not found or access denied', { status: 404 });
  }

  // Now, fetch the transactions for that job
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('job_id', params.jobId);

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}
