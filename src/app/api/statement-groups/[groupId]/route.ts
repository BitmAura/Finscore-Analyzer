/**
 * Individual Statement Group API
 * Manage specific statement groups and their consolidated analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import MultiStatementConsolidationService from '@/lib/analysis/multi-statement-consolidation';

export async function GET(
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

    // Get consolidated analysis
    const consolidationService = new MultiStatementConsolidationService();
    const consolidatedAnalysis = await consolidationService.getConsolidatedAnalysis(groupId);

    return NextResponse.json({
      success: true,
      statementGroup: group,
      consolidatedAnalysis
    });

  } catch (error: any) {
    console.error('Statement Group GET API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consolidated analysis', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { groupName, status } = body;

    // Verify group ownership
    const { data: existingGroup, error: groupError } = await supabase
      .from('statement_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', userId)
      .single();

    if (groupError || !existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Statement group not found' },
        { status: 404 }
      );
    }

    // Update group
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (groupName) updateData.group_name = groupName;
    if (status) updateData.status = status;

    const { data: updatedGroup, error: updateError } = await supabase
      .from('statement_groups')
      .update(updateData)
      .eq('id', groupId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update statement group:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update statement group' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      statementGroup: updatedGroup
    });

  } catch (error: any) {
    console.error('Statement Group PUT API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update statement group', details: error.message },
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

    // Verify group ownership
    const { data: existingGroup, error: groupError } = await supabase
      .from('statement_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', userId)
      .single();

    if (groupError || !existingGroup) {
      return NextResponse.json(
        { success: false, error: 'Statement group not found' },
        { status: 404 }
      );
    }

    // Delete group members first (cascade will handle this, but being explicit)
    const { error: membersError } = await supabase
      .from('statement_group_members')
      .delete()
      .eq('group_id', groupId);

    if (membersError) {
      console.error('Failed to delete group members:', membersError);
    }

    // Delete the group
    const { error: deleteError } = await supabase
      .from('statement_groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Failed to delete statement group:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete statement group' },
        { status: 500 }
      );
    }

    console.log(`[Statement Groups] Deleted group: ${groupId} for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Statement group deleted successfully'
    });

  } catch (error: any) {
    console.error('Statement Group DELETE API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete statement group', details: error.message },
      { status: 500 }
    );
  }
}