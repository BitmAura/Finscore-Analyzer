/**
 * Subscription Management System with Razorpay Integration
 * Enterprise-ready pricing and billing
 */

'use client'

import { useState } from 'react';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  limits: {
    reportsPerMonth: number;
    storage: string;
    apiAccess: boolean;
    teamMembers: number;
  };
  popular?: boolean;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      '5 reports per month',
      'Basic analysis features',
      '100 MB storage',
      'Email support',
      'Export to PDF'
    ],
    limits: {
      reportsPerMonth: 5,
      storage: '100 MB',
      apiAccess: false,
      teamMembers: 1
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 2999,
    period: 'per month',
    features: [
      '100 reports per month',
      'Advanced AI analysis',
      'Fraud detection',
      '10 GB storage',
      'Priority support',
      'Export to PDF & Excel',
      'API access',
      'Custom templates'
    ],
    limits: {
      reportsPerMonth: 100,
      storage: '10 GB',
      apiAccess: true,
      teamMembers: 5
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    period: 'per month',
    features: [
      'Unlimited reports',
      'Full AI capabilities',
      'Advanced fraud detection',
      'Unlimited storage',
      '24/7 dedicated support',
      'All export formats',
      'Full API access',
      'Custom integrations',
      'White-label options',
      'Team collaboration',
      'SSO & advanced security'
    ],
    limits: {
      reportsPerMonth: -1,
      storage: 'Unlimited',
      apiAccess: true,
      teamMembers: -1
    }
  }
];

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'free') {
      toast.success('You are already on the free plan!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: tierId,
          billingPeriod
        })
      });

      if (!response.ok) throw new Error('Failed to create checkout');

      const { checkoutUrl, orderId } = await response.json();

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
        const amount = tier!.price * (billingPeriod === 'yearly' ? 10 : 1);

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount * 100,
          currency: 'INR',
          name: 'FinScore Analyser',
          description: `${tier!.name} Plan - ${billingPeriod}`,
          order_id: orderId,
          handler: function (response: any) {
            verifyPayment(response, tierId);
          },
          prefill: {
            name: '',
            email: '',
            contact: ''
          },
          theme: {
            color: '#2563EB'
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse: any, planId: string) => {
    try {
      const response = await fetch('/api/subscription/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentResponse,
          planId,
          billingPeriod
        })
      });

      if (response.ok) {
        toast.success('Subscription activated successfully!');
        window.location.href = '/dashboard';
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      toast.error('Payment verification failed. Contact support.');
    }
  };

  const getPrice = (tier: SubscriptionTier) => {
    if (tier.price === 0) return 'Free';
    const price = billingPeriod === 'yearly' ? tier.price * 10 : tier.price;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Start free, scale as you grow
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs text-green-600 font-bold">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {SUBSCRIPTION_TIERS.map(tier => (
          <div
            key={tier.id}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
              tier.popular
                ? 'border-blue-500 scale-105'
                : 'border-gray-200'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <SparklesIcon className="w-4 h-4" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {getPrice(tier)}
                </span>
                {tier.price > 0 && (
                  <span className="text-gray-500 ml-2">/ {billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(tier.id)}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  tier.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {tier.id === 'free' ? 'Current Plan' : loading ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          </div>
        ))}

        {/* Trust Indicators */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>🔒 Secure payment powered by Razorpay • Cancel anytime • No hidden fees</p>
        </div>
      </div>
    </div>
  );
}
