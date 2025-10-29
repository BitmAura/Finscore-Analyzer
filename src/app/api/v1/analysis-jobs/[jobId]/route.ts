'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Define the proper types for the route params
type RouteParams = {
  params: {
    jobId: string;
  };
};

export const GET: any = async (request: NextRequest, context: any) => {
  // Support both sync and async params depending on Next version
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }

  const jobId = params?.jobId || request.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400 });
  }

  // Initialize Supabase server client
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

  try {
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError) {
      console.error('Error fetching job:', jobError);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify the user has access to this job
    if (job.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch bank statements related to this job
    const { data: bankStatements, error: bankError } = await supabase
      .from('bank_statements')
      .select('*')
      .eq('user_id', user.id);

    if (bankError) {
      console.error('Error fetching bank statements:', bankError);
    }

    // Fetch transactions for this job
    const { data: transactions, error: txError } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('job_id', jobId)
      .order('date', { ascending: false });

    if (txError) {
      console.error('Error fetching transactions:', txError);
    }

    // Fetch analysis results
    const { data: results, error: resultsError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (resultsError && resultsError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" - not an error for new jobs
      console.error('Error fetching analysis results:', resultsError);
    }

    return NextResponse.json({
      job,
      bankStatements: bankStatements || [],
      transactions: transactions || [],
      results: results || null
    });

  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
};
