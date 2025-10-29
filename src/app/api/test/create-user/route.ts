import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const { email, password } = await req.json().catch(() => ({ email: undefined, password: undefined }));

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 });
  }

  try {
    // Check if user exists
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;

    const exists = list.users?.find((u: any) => u.email?.toLowerCase() === String(email).toLowerCase());
    if (exists) {
      return NextResponse.json({ created: false, userId: exists.id, email }, { status: 200 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;

    return NextResponse.json({ created: true, userId: data.user?.id, email }, { status: 201 });
  } catch (err: any) {
    console.error('create-user error', err);
    return NextResponse.json({ error: err?.message || 'unknown error' }, { status: 500 });
  }
}
