
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerAuth, getUserId } from '@/lib/auth-server';
import { getProfile, updateProfile } from '@/lib/supabase-helpers';

export async function GET(request: NextRequest) {
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const profile = await getProfile(userId);

  if (!profile) {
    return new NextResponse('Profile not found', { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest) {
  const session = await getServerAuth(request);
  const userId = getUserId(session);

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const updates = await request.json();
  const updatedProfile = await updateProfile(userId, updates);

  if (!updatedProfile) {
    return new NextResponse('Error updating profile', { status: 500 });
  }

  return NextResponse.json(updatedProfile);
}
