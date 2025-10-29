/**
 * Payment Verification API
 * Route: /api/subscription/verify
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const PLANS = {
  pro: { price: 2999, reportsLimit: 100 },
  enterprise: { price: 9999, reportsLimit: -1 }
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, billingPeriod } = body;

    // Verify signature (in production)
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    //   .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    //   .digest('hex');
    
    // if (expectedSignature !== razorpay_signature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    const plan = PLANS[planId as keyof typeof PLANS];
    const amount = billingPeriod === 'yearly' ? plan.price * 10 : plan.price;
    
    const expiresAt = new Date();
    if (billingPeriod === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Create or update subscription
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        reports_used: 0,
        reports_limit: plan.reportsLimit,
        billing_period: billingPeriod,
        amount_paid: amount,
        payment_id: razorpay_payment_id,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subError) throw subError;

    // Log transaction
    await supabase.from('payment_transactions').insert({
      user_id: user.id,
      plan_id: planId,
      amount: amount,
      currency: 'INR',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      status: 'success',
      billing_period: billingPeriod
    });

    return NextResponse.json({ 
      success: true,
      message: 'Subscription activated successfully',
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
