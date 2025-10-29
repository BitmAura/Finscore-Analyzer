/**
 * Statement Group Members API
 * Add and manage individual statements within a group
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import MultiStatementConsolidationService from '@/lib/analysis/multi-statement-consolidation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
// Check authentication
const cookieStore = cookies();
const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { groupId } = await params;

    // Parse request body
    const body = await request.json();
    const {
      analysisJobId,
      accountIdentifier,
      bankName,
      accountType,
      periodStart,
      periodEnd,
      openingBalance,
      closingBalance
    } = body;

    if (!analysisJobId || !accountIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Analysis job ID and account identifier are required' },
        { status: 400 }
      );
    }

    // Verify group ownership
    const { data: group, error: groupError } = await supabase
      .from('statement_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', userId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: 'Statement group not found' },
        { status: 404 }
      );
    }

    // Verify analysis job ownership and completion
    const { data: analysisJob, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', analysisJobId)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .single();

    if (jobError || !analysisJob) {
      return NextResponse.json(
        { success: false, error: 'Analysis job not found or not completed' },
        { status: 404 }
      );
    }

    // Check if this job is already in the group
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('statement_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('analysis_job_id', analysisJobId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'This analysis job is already in the statement group' },
        { status: 400 }
      );
    }

    // Add statement to group
    const consolidationService = new MultiStatementConsolidationService();
    await consolidationService.addStatementToGroup(
      groupId,
      analysisJobId,
      accountIdentifier,
      bankName,
      accountType,
      periodStart ? new Date(periodStart) : undefined,
      periodEnd ? new Date(periodEnd) : undefined,
      openingBalance,
      closingBalance
    );

    console.log(`[Statement Groups] Added job ${analysisJobId} to group ${groupId}`);

    return NextResponse.json({
      success: true,
      message: 'Statement added to group successfully'
    });

  } catch (error: any) {
    console.error('Statement Group Members POST API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add statement to group', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
try {
  // Check authentication
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { groupId } = await params;

    // Verify group ownership
    const { data: group, error: groupError } = await supabase
      .from('statement_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', userId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: 'Statement group not found' },
        { status: 404 }
      );
    }

    // Get group members with analysis job details
    const { data: members, error: membersError } = await supabase
      .from('statement_group_members')
      .select(`
        *,
        analysis_jobs (
          id,
          report_name,
          status,
          created_at,
          metadata
        )
      `)
      .eq('group_id', groupId)
      .order('added_at', { ascending: false });

    if (membersError) {
      console.error('Failed to fetch group members:', membersError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch group members' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      members: members || []
    });

  } catch (error: any) {
    console.error('Statement Group Members GET API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group members', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    // Check authentication
    const cookieStore = cookies();    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { groupId } = await params;

    // Parse request body
    const body = await request.json();
    const { analysisJobId } = body;

    if (!analysisJobId) {
      return NextResponse.json(
        { success: false, error: 'Analysis job ID is required' },
        { status: 400 }
      );
    }

    // Verify group ownership
    const { data: group, error: groupError } = await supabase
      .from('statement_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', userId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: 'Statement group not found' },
        { status: 404 }
      );
    }

    // Remove member from group
    const { error: deleteError } = await supabase
      .from('statement_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('analysis_job_id', analysisJobId);

    if (deleteError) {
      console.error('Failed to remove member from group:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to remove statement from group' },
        { status: 500 }
      );
    }

    console.log(`[Statement Groups] Removed job ${analysisJobId} from group ${groupId}`);

    return NextResponse.json({
      success: true,
      message: 'Statement removed from group successfully'
    });

  } catch (error: any) {
    console.error('Statement Group Members DELETE API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove statement from group', details: error.message },
      { status: 500 }
    );
  }
}