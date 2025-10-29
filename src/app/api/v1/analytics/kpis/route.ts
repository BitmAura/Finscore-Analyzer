import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch KPIs from user_dashboard_stats
    const { data: stats, error } = await supabase
      .from('user_dashboard_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching KPIs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no stats exist, return defaults
    if (!stats) {
      return NextResponse.json({
        totalAnalyses: 0,
        thisMonth: 0,
        processingQueue: 0,
        avgProcessingTime: '0 min',
        systemHealth: 98.5,
        storageUsed: 0,
        activeUsers: 1,
        riskAlertsCount: 0
      }, { status: 200 });
    }

    return NextResponse.json({
      totalAnalyses: stats.total_analyses || 0,
      thisMonth: stats.this_month || 0,
      processingQueue: stats.processing_queue || 0,
      avgProcessingTime: stats.avg_processing_time || '0 min',
      systemHealth: stats.system_health || 98.5,
      storageUsed: stats.storage_used || 0,
      activeUsers: stats.active_users || 1,
      riskAlertsCount: stats.risk_alerts_count || 0
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in GET /api/v1/analytics/kpis:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
