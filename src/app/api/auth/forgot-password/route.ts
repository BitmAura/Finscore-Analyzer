import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This is the URL on our frontend where the user will be sent after clicking the link in the email.
      // We will create this page later.
      redirectTo: `${process.env.NEXTAUTH_URL}/reset-password`,
    });

    if (error) {
      // It's important not to expose specific errors to the client here
      // to prevent email enumeration attacks.
      console.error('Forgot password error:', error);
    }

    // Always return a generic success message.
    return NextResponse.json({ message: 'If an account with this email exists, a password reset link has been sent.' });

  } catch (err) {
    console.error('Forgot password API error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
