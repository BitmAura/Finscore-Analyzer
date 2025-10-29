import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import supabase from '@/lib/supabase';
import { getServerAuth, getUserId } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { bank_name, account_number, account_type } = await request.json();

  if (!bank_name || !account_number || !account_type) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const { data, error } = await supabase
    .from('bank_accounts')
    .insert([{ user_id: userId, bank_name, account_number, account_type }])
    .select();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json(data);
}