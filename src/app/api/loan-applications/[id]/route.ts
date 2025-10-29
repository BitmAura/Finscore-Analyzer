/**
 * Individual Loan Application API
 * GET, PUT, DELETE operations for specific loan applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/loan-applications/[id] - Get specific application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
  // Supabase client
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch application with related data
    const { data: application, error: appError } = await supabase
      .from('loan_applications')
      .select(`
        *,
        applicants (*),
        co_applicants (*),
        guarantors (*),
        analysis_jobs (
          id,
          report_name,
          document_name,
          status,
          created_at
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });

  } catch (error) {
    console.error('Fetch application error:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

// PUT /api/loan-applications/[id] - Update application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
  // Supabase client
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, priority, loanData, applicantData } = body;

    // Update application
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (loanData) {
      if (loanData.amount) updateData.loan_amount = loanData.amount;
      if (loanData.purpose) updateData.loan_purpose = loanData.purpose;
      if (loanData.tenure) updateData.tenure_months = loanData.tenure;
    }

    const { error: appError } = await supabase
      .from('loan_applications')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (appError) {
      console.error('Error updating application:', appError);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    // Update applicant if data provided
    if (applicantData) {
      const { error: applicantError } = await supabase
        .from('applicants')
        .update({
          full_name: applicantData.fullName,
          email: applicantData.email,
          phone: applicantData.phone,
          pan_number: applicantData.pan,
          aadhaar_number: applicantData.aadhaar,
          date_of_birth: applicantData.dob,
          address: applicantData.address,
          employment_type: applicantData.employmentType,
          monthly_income: applicantData.monthlyIncome,
          updated_at: new Date().toISOString()
        })
        .eq('loan_application_id', id);

      if (applicantError) {
        console.error('Error updating applicant:', applicantError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully'
    });

  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

// DELETE /api/loan-applications/[id] - Delete application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
  // Supabase client
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete application (cascade will handle related records)
    const { error } = await supabase
      .from('loan_applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting application:', error);
      return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}