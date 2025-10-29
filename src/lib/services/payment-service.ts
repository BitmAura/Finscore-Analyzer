/**
 * Payment Gateway Service
 * Handles Razorpay and Stripe integrations
 */

import Razorpay from 'razorpay';
import Stripe from 'stripe';

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  reportLimit: number;
}

export interface PaymentSession {
  sessionId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}

// Payment plans configuration
export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    currency: 'INR',
    interval: 'month',
    features: ['5 reports/month', 'Basic analysis', 'Email support'],
    reportLimit: 5
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 2999,
    currency: 'INR',
    interval: 'month',
    features: ['50 reports/month', 'Advanced analysis', 'Priority support', 'PDF processing'],
    reportLimit: 50
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    currency: 'INR',
    interval: 'month',
    features: ['Unlimited reports', 'All features', 'Dedicated support', 'Custom integrations'],
    reportLimit: -1 // unlimited
  }
];

// Initialize payment gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt: string,
  notes?: any
): Promise<any> {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error('Razorpay not configured');
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes,
    });

    return order;
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw error;
  }
}

/**
 * Create Stripe payment session
 */
export async function createStripeSession(
  planId: string,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string
): Promise<PaymentSession> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured');
    }

    const plan = PAYMENT_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.features.join(', '),
            },
            unit_amount: plan.price * 100, // Stripe expects amount in cents
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId,
      },
    });

    return {
      sessionId: session.id,
      paymentUrl: session.url || '',
      amount: plan.price,
      currency: plan.currency,
    };
  } catch (error) {
    console.error('Stripe session creation failed:', error);
    throw error;
  }
}

/**
 * Verify Razorpay payment
 */
export async function verifyRazorpayPayment(
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay not configured');
    }

    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Razorpay payment verification failed:', error);
    return false;
  }
}

/**
 * Handle Stripe webhook
 */
export async function handleStripeWebhook(
  signature: string,
  body: string
): Promise<any> {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    return event;
  } catch (error) {
    console.error('Stripe webhook verification failed:', error);
    throw error;
  }
}

/**
 * Update user subscription in database
 */
export async function updateUserSubscription(
  userId: string,
  planId: string,
  paymentProvider: 'razorpay' | 'stripe',
  paymentId: string
): Promise<boolean> {
  try {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const { cookies } = await import('next/headers');

    // Pass cookies helper directly
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

    const plan = PAYMENT_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    // Calculate subscription dates
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + (plan.interval === 'year' ? 12 : 1));

    // Update or insert subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        payment_provider: paymentProvider,
        payment_id: paymentId,
        reports_used: 0,
        reports_limit: plan.reportLimit,
        current_period_start: now.toISOString(),
        current_period_end: expiresAt.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });

    if (error) {
      console.error('Failed to update subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Subscription update failed:', error);
    return false;
  }
}

/**
 * Check if user can perform analysis
 */
export async function canUserPerformAnalysis(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  reportsUsed?: number;
  reportsLimit?: number;
}> {
  try {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const { cookies } = await import('next/headers');

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return {
        allowed: true, // Allow free tier users
        reportsUsed: 0,
        reportsLimit: 5
      };
    }

    const reportsUsed = subscription.reports_used || 0;
    const reportsLimit = subscription.reports_limit || 5;

    if (reportsLimit === -1) {
      // Unlimited plan
      return { allowed: true, reportsUsed, reportsLimit: -1 };
    }

    if (reportsUsed >= reportsLimit) {
      return {
        allowed: false,
        reason: 'Report limit exceeded',
        reportsUsed,
        reportsLimit
      };
    }

    return { allowed: true, reportsUsed, reportsLimit };

  } catch (error) {
    console.error('Failed to check user limits:', error);
    return { allowed: true }; // Default to allowing on error
  }
}

/**
 * Increment user's report count
 */
export async function incrementUserReportCount(userId: string): Promise<boolean> {
  try {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const { cookies } = await import('next/headers');

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

    // Get current subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscription) {
      await supabase
        .from('user_subscriptions')
        .update({
          reports_used: (subscription.reports_used || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
    }

    return true;
  } catch (error) {
    console.error('Failed to increment report count:', error);
    return false;
  }
}

export default {
  PAYMENT_PLANS,
  createRazorpayOrder,
  createStripeSession,
  verifyRazorpayPayment,
  handleStripeWebhook,
  updateUserSubscription,
  canUserPerformAnalysis,
  incrementUserReportCount,
};