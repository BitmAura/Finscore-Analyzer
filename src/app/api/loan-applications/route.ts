/**
 * Loan Applications API - For Banks/NBFCs
 * Complete CRUD operations for loan applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// GET /api/loan-applications - List all applications
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    let query = supabase
      .from('loan_applications')
      .select(`
        *,
        applicants (
          id,
          full_name,
          email,
          phone,
          pan_number,
          aadhaar_number,
          date_of_birth,
          address
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`application_id.ilike.%${search}%,applicants.full_name.ilike.%${search}%`);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    // Transform data for frontend
    const transformedApplications = applications?.map(app => ({
      id: app.id,
      application_id: app.application_id,
      applicant_name: app.applicants?.full_name || 'Unknown',
      applicant_email: app.applicants?.email || '',
      applicant_phone: app.applicants?.phone || '',
      loan_amount: app.loan_amount,
      loan_purpose: app.loan_purpose,
      tenure_months: app.tenure_months,
      status: app.status,
      priority: app.priority,
      created_at: app.created_at,
      updated_at: app.updated_at,
      assigned_to: app.assigned_to,
      risk_score: app.risk_score,
      foir_score: app.foir_score,
      documents_count: app.documents_count || 0
    })) || [];

    return NextResponse.json({ applications: transformedApplications });

  } catch (error) {
    console.error('Loan applications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/loan-applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      applicantData,
      loanData,
      coApplicants = [],
      guarantors = []
    } = body;

    // Generate application ID
    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Start transaction
    const { data: application, error: appError } = await supabase
      .from('loan_applications')
      .insert({
        id: uuidv4(),
        application_id: applicationId,
        user_id: user.id,
        loan_amount: loanData.amount,
        loan_purpose: loanData.purpose,
        tenure_months: loanData.tenure,
        status: 'draft',
        priority: loanData.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (appError) {
      console.error('Error creating application:', appError);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    // Create applicant
    const { data: applicant, error: applicantError } = await supabase
      .from('applicants')
      .insert({
        id: uuidv4(),
        loan_application_id: application.id,
        full_name: applicantData.fullName,
        email: applicantData.email,
        phone: applicantData.phone,
        pan_number: applicantData.pan,
        aadhaar_number: applicantData.aadhaar,
        date_of_birth: applicantData.dob,
        address: applicantData.address,
        employment_type: applicantData.employmentType,
        monthly_income: applicantData.monthlyIncome,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (applicantError) {
      console.error('Error creating applicant:', applicantError);
      return NextResponse.json({ error: 'Failed to create applicant' }, { status: 500 });
    }

    // Create co-applicants if any
    if (coApplicants.length > 0) {
      const coApplicantData = coApplicants.map((coApp: any) => ({
        id: uuidv4(),
        loan_application_id: application.id,
        full_name: coApp.fullName,
        email: coApp.email,
        phone: coApp.phone,
        pan_number: coApp.pan,
        aadhaar_number: coApp.aadhaar,
        date_of_birth: coApp.dob,
        address: coApp.address,
        relationship: coApp.relationship,
        created_at: new Date().toISOString()
      }));

      const { error: coAppError } = await supabase
        .from('co_applicants')
        .insert(coApplicantData);

      if (coAppError) {
        console.error('Error creating co-applicants:', coAppError);
      }
    }

    // Create guarantors if any
    if (guarantors.length > 0) {
      const guarantorData = guarantors.map((guarantor: any) => ({
        id: uuidv4(),
        loan_application_id: application.id,
        full_name: guarantor.fullName,
        email: guarantor.email,
        phone: guarantor.phone,
        pan_number: guarantor.pan,
        aadhaar_number: guarantor.aadhaar,
        address: guarantor.address,
        relationship: guarantor.relationship,
        created_at: new Date().toISOString()
      }));

      const { error: guarantorError } = await supabase
        .from('guarantors')
        .insert(guarantorData);

      if (guarantorError) {
        console.error('Error creating guarantors:', guarantorError);
      }
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application created successfully'
    });

  } catch (error) {
    console.error('Create application API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}