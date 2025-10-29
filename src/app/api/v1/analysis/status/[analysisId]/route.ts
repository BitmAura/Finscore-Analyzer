import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const { analysisId } = await params;
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch analysis job
    const { data: job, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching analysis job:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Return job status
    return NextResponse.json({
      status: job.status,
      data: job.result,
      error: job.error_message,
      createdAt: job.created_at,
      completedAt: job.completed_at
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in GET /api/v1/analysis/status:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
