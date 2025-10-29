import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, context: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await context.params;
  const { category } = await request.json();

  if (!transactionId || !category) {
    return new NextResponse(JSON.stringify({ error: 'Missing transactionId or category' }), { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // First, verify the user owns the transaction they are trying to update
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id, user_id')
      .eq('id', transactionId)
      .single();

    if (fetchError || !existingTransaction) {
      return new NextResponse(JSON.stringify({ error: 'Transaction not found' }), { status: 404 });
    }

    if (existingTransaction.user_id !== user.id) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    // Now, update the category
    const { data, error } = await supabase
      .from('transactions')
      .update({ category: category, updated_at: new Date().toISOString() })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update transaction.', details: error.message }),
      { status: 500 }
    );
  }
}
