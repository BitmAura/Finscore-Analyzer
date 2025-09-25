'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

const PlanCard = ({ title, price, features, isPopular, isActive }: {
  title: string,
  price: number,
  features: string[],
  isPopular?: boolean,
  isActive?: boolean
}) => {
  return (
    <div className={`relative bg-white rounded-lg shadow-sm ${isPopular ? 'border-2 border-blue-500' : 'border'} p-6`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          MOST POPULAR
        </div>
      )}
      {isActive && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          CURRENT PLAN
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-900">₹{price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-gray-200 text-gray-800 cursor-default'
            : isPopular 
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-800 hover:bg-gray-900 text-white'
        }`}
      >
        {isActive ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
};

const SubscriptionPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <SubscriptionProvider>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Subscription Plans
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Choose the perfect plan for your needs. All plans include core financial analysis features with different levels of advanced capabilities.
            </p>
          </motion.div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-gray-100 rounded-lg">
              <button
                className={`px-4 py-2 rounded-lg ${billingCycle === 'monthly' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${billingCycle === 'annual' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setBillingCycle('annual')}
              >
                Annual <span className="text-sm text-green-600">(Save 20%)</span>
              </button>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <PlanCard
              title="Basic"
              price={billingCycle === 'monthly' ? 999 : 799}
              features={[
                "Upload & analyze up to 10 documents/month",
                "Basic financial insights",
                "Email support",
                "Standard security features",
                "Export to PDF"
              ]}
            />
            <PlanCard
              title="Premium"
              price={billingCycle === 'monthly' ? 2499 : 1999}
              features={[
                "Upload & analyze up to 50 documents/month",
                "Advanced financial insights",
                "Priority email & chat support",
                "Enhanced security features",
                "Export to PDF, Excel, and CSV",
                "Bulk document processing"
              ]}
              isPopular
              isActive={currentPlan === 'premium'}
            />
            <PlanCard
              title="Enterprise"
              price={billingCycle === 'monthly' ? 5999 : 4799}
              features={[
                "Unlimited document analysis",
                "Advanced financial insights & patterns",
                "Dedicated account manager",
                "Enterprise-grade security",
                "API access",
                "Custom integrations",
                "Team management"
              ]}
            />
          </div>

          {/* Current Subscription Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Current Subscription</h2>

            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Premium Plan</h3>
                    <p className="text-sm text-gray-600">Monthly billing cycle</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-12">
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Next billing date:</span> October 24, 2025</p>
                    <p><span className="font-medium">Documents analyzed:</span> 23/50 this month</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel Plan
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "How are documents counted towards my monthly limit?",
                  answer: "Each uploaded file counts as one document. For example, if you upload a 3-month bank statement as a single PDF, it counts as one document against your monthly limit."
                },
                {
                  question: "Can I upgrade or downgrade my plan at any time?",
                  answer: "Yes, you can change your plan at any time. If you upgrade, the new rate will be prorated for the remainder of your billing cycle. If you downgrade, the new rate will apply at the start of your next billing cycle."
                },
                {
                  question: "Do unused document credits roll over to the next month?",
                  answer: "No, document credits reset at the beginning of each billing cycle and do not roll over."
                },
              ].map((faq, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SubscriptionProvider>
  );
}

export default SubscriptionPage