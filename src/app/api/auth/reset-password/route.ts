import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { newPassword } = await request.json();
    
    // This creates a Supabase client that can be used in Server Components and Route Handlers.
    // It securely reads the session from the request cookies.
    const supabase = createRouteHandlerClient({ cookies });

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // The user's session is automatically inferred from the cookies.
    // When the user clicks the reset link, Supabase sets a temporary session cookie.
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Reset password error:', error);
      return NextResponse.json({ error: 'Failed to update password. The reset link may have expired.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password has been reset successfully.' });

  } catch (err) {
    console.error('Reset password API error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
