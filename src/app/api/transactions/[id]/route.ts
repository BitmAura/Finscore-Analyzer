import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import supabase from '@/lib/supabase';
import { getServerAuth, getUserId } from '@/lib/auth-server';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { category } = await request.json();

  if (!category) {
    return new NextResponse('Missing category', { status: 400 });
  }

  // Verify that the user has access to the transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('job_id')
    .eq('id', id)
    .single();

  if (transactionError || !transaction) {
    return new NextResponse('Transaction not found', { status: 404 });
  }

  const { data: job, error: jobError } = await supabase
    .from('analysis_jobs')
    .select('id')
    .eq('id', transaction.job_id)
    .eq('user_id', userId)
    .single();

  if (jobError || !job) {
    return new NextResponse('Access denied', { status: 403 });
  }

  // Update the transaction
  const { data, error } = await supabase
    .from('transactions')
    .update({ category })
    .eq('id', id)
    .select();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}
