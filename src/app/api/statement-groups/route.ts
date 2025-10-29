/**
 * Statement Groups API - Multi-Statement Consolidation
 * Create and manage groups of bank statements for consolidated analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import MultiStatementConsolidationService from '@/lib/analysis/multi-statement-consolidation';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { groupName, groupType, referenceId } = body;

    if (!groupName || !groupType) {
      return NextResponse.json(
        { success: false, error: 'Group name and type are required' },
        { status: 400 }
      );
    }

    // Validate group type
    const validTypes = ['single_account', 'multi_account', 'loan_application'];
    if (!validTypes.includes(groupType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid group type' },
        { status: 400 }
      );
    }

    // Create statement group
    const consolidationService = new MultiStatementConsolidationService();
    const statementGroup = await consolidationService.createStatementGroup(
      userId,
      groupName,
      groupType as 'single_account' | 'multi_account' | 'loan_application',
      referenceId
    );

    console.log(`[Statement Groups] Created group: ${statementGroup.id} for user: ${userId}`);

    return NextResponse.json({
      success: true,
      statementGroup
    });

  } catch (error: any) {
    console.error('Statement Groups API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create statement group', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's statement groups
    const { data: groups, error } = await supabase
      .from('statement_groups')
      .select(`
        *,
        statement_group_members (
          id,
          analysis_job_id,
          account_identifier,
          bank_name,
          account_type,
          statement_period_start,
          statement_period_end,
          opening_balance,
          closing_balance,
          analysis_jobs (
            id,
            status,
            report_name,
            created_at,
            metadata
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch statement groups:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch statement groups' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      statementGroups: groups || []
    });

  } catch (error: any) {
    console.error('Statement Groups GET API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statement groups', details: error.message },
      { status: 500 }
    );
  }
}