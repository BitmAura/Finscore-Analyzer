
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerAuth, getUserId } from '@/lib/auth-server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  if (!data) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { bank_name, account_number, account_type } = await request.json();

  const { data, error } = await supabase
    .from('bank_accounts')
    .update({ bank_name, account_number, account_type })
    .eq('id', params.id)
    .eq('user_id', userId)
    .select();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { error } = await supabase
    .from('bank_accounts')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
