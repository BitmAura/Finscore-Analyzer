import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    // @ts-expect-error - cookieStore is already awaited, type mismatch is expected

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { user } = session;

    // Check for existing analysis jobs for the user
    const { count, error: countError } = await supabase
      .from('analysis_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Database error:', countError);
      // Return 200 with empty result instead of throwing
      return NextResponse.json({ hasReports: false, error: 'Database query failed' }, { status: 200 });
    }

    return NextResponse.json({ hasReports: count !== null && count > 0 });

  } catch (error: any) {
    console.error('User status error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'An error occurred while checking user status.', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
