/**
 * User Stats API - Dashboard Statistics
 * Route: /api/user/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Fix: Properly await cookies() and pass it synchronously
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription info
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Count total reports
    const { count: totalReports } = await supabase
      .from('analysis_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Count this month's reports
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonth } = await supabase
      .from('analysis_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    // Count processing queue
    const { count: processingQueue } = await supabase
      .from('analysis_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing']);

    const stats = {
      totalReports: totalReports || 0,
      thisMonth: thisMonth || 0,
      processingQueue: processingQueue || 0,
      reportsUsed: subscription?.reports_used || 0,
      reportsLimit: subscription?.reports_limit || 5,
      planId: subscription?.plan_id || 'free',
      planStatus: subscription?.status || 'active'
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
