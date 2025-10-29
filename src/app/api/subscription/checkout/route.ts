/**
 * Subscription Management API
 * Route: /api/subscription/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const PLANS = {
  pro: { price: 2999, reportsLimit: 100 },
  enterprise: { price: 9999, reportsLimit: -1 } // unlimited
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, billingPeriod } = await request.json();

    if (!PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    const amount = billingPeriod === 'yearly' ? plan.price * 10 : plan.price; // 20% discount

    // Create Razorpay order (mock for now)
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In production, use actual Razorpay API:
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET
    // });
    // const order = await razorpay.orders.create({
    //   amount: amount * 100,
    //   currency: 'INR',
    //   receipt: `receipt_${user.id}_${Date.now()}`
    // });

    return NextResponse.json({
      orderId,
      amount,
      currency: 'INR',
      checkoutUrl: `/subscription/checkout?orderId=${orderId}`
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
