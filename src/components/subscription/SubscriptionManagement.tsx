'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useSubscription, SubscriptionTier, SUBSCRIPTION_FEATURES } from '@/contexts/SubscriptionContext'

interface PricingPlan {
  tier: SubscriptionTier
  name: string
  price: {
    monthly: number
    yearly: number
  }
  description: string
  popular?: boolean
  features: string[]
  limitations: string[]
}

const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for getting started with basic financial analysis',
    features: [
      'Up to 5 reports per month',
      'Basic file upload (5MB max)',
      'PDF export',
      'Standard email support',
      '1GB storage'
    ],
    limitations: [
      'No advanced analytics',
      'No collaboration features',
      'Limited export formats',
      'No API access'
    ]
  },
  {
    tier: 'pro',
    name: 'Professional',
    price: { monthly: 49, yearly: 490 },
    description: 'Advanced features for growing businesses and professionals',
    popular: true,
    features: [
      'Up to 50 reports per month',
      'Advanced file upload (25MB max)',
      'All export formats (PDF, Excel, CSV, Word)',
      'Advanced analytics dashboard',
      'Collaboration features',
      'Priority email support',
      'API access',
      'Custom branding',
      'Bulk operations',
      'AI-powered insights',
      '10GB storage'
    ],
    limitations: [
      'No white-labeling',
      'No dedicated account manager'
    ]
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 199, yearly: 1990 },
    description: 'Complete solution for large organizations',
    features: [
      'Unlimited reports',
      'Unlimited file uploads (100MB max)',
      'All export formats + PowerPoint',
      'Advanced analytics dashboard',
      'Full collaboration suite',
      'Dedicated account manager',
      'API access with higher limits',
      'White-labeling',
      'Custom branding',
      'Bulk operations',
      'AI-powered insights',
      'Unlimited storage',
      'SLA guarantee',
      'Custom integrations'
    ],
    limitations: []
  }
]

const SubscriptionManagement: React.FC = () => {
  const { subscription, upgradeTier, getRemainingUsage } = useSubscription()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === subscription.tier) return
    
    setIsUpgrading(true)
    setSelectedTier(tier)
    
    try {
      const success = await upgradeTier(tier)
      if (success) {
        // Show success message
        console.log('Subscription upgraded successfully!')
      } else {
        // Show error message
        console.error('Failed to upgrade subscription')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsUpgrading(false)
      setSelectedTier(null)
    }
  }

  const formatUsage = (value: number | 'unlimited'): string => {
    return value === 'unlimited' ? '∞' : value.toString()
  }

  const getTotalLimit = (metric: 'reports' | 'files' | 'storage'): number | 'unlimited' => {
    switch (metric) {
      case 'reports':
        return subscription.features.maxReports === -1 ? 'unlimited' : subscription.features.maxReports
      case 'files':
        return subscription.features.maxFileUploads === -1 ? 'unlimited' : subscription.features.maxFileUploads
      case 'storage':
        return subscription.features.storageLimit === -1 ? 'unlimited' : subscription.features.storageLimit
      default:
        return 0
    }
  }

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Current Plan</h3>
            <p className="text-gray-400">Manage your subscription and usage</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white capitalize">{subscription.tier}</div>
            <div className="text-sm text-gray-400">
              Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Reports Used</span>
              <span className="text-white">
                {subscription.usage.reportsUsed} / {formatUsage(getTotalLimit('reports'))}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getUsagePercentage(
                    subscription.usage.reportsUsed,
                    subscription.features.maxReports
                  )}%`
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Files Uploaded</span>
              <span className="text-white">
                {subscription.usage.filesUploaded} / {formatUsage(getTotalLimit('files'))}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getUsagePercentage(
                    subscription.usage.filesUploaded,
                    subscription.features.maxFileUploads
                  )}%`
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Storage Used</span>
              <span className="text-white">
                {subscription.usage.storageUsed.toFixed(1)}GB / {formatUsage(getTotalLimit('storage'))}GB
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getUsagePercentage(
                    subscription.usage.storageUsed,
                    subscription.features.storageLimit
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-gray-800/50 border border-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              billingPeriod === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              billingPeriod === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly <span className="text-green-400 text-xs ml-1">(Save 17%)</span>
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PRICING_PLANS.map((plan, index) => (
          <motion.div
            key={plan.tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 bg-gray-800/50 backdrop-blur-sm border rounded-xl transition-all duration-300 hover:border-gray-600/50 ${
              plan.popular
                ? 'border-blue-500/50 ring-2 ring-blue-500/20'
                : 'border-gray-700/50'
            } ${
              plan.tier === subscription.tier
                ? 'ring-2 ring-green-500/20 border-green-500/50'
                : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}

            {plan.tier === subscription.tier && (
              <div className="absolute -top-3 right-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-white mb-1">
                ${plan.price[billingPeriod] === 0 ? '0' : plan.price[billingPeriod]}
                {plan.price[billingPeriod] > 0 && (
                  <span className="text-lg text-gray-400">
                    /{billingPeriod === 'yearly' ? 'year' : 'month'}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-white">Features:</h4>
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}

              {plan.limitations.length > 0 && (
                <>
                  <h4 className="font-medium text-white mt-4">Limitations:</h4>
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-400 text-sm">{limitation}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUpgrade(plan.tier)}
              disabled={plan.tier === subscription.tier || isUpgrading}
              className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${
                plan.tier === subscription.tier
                  ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-not-allowed'
                  : isUpgrading && selectedTier === plan.tier
                  ? 'bg-blue-600/50 text-white cursor-not-allowed'
                  : plan.popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
              }`}
            >
              {plan.tier === subscription.tier
                ? 'Current Plan'
                : isUpgrading && selectedTier === plan.tier
                ? 'Upgrading...'
                : plan.tier === 'free'
                ? 'Downgrade to Free'
                : 'Upgrade to ' + plan.name
              }
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Feature Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-300">Feature</th>
                <th className="text-center py-3 text-gray-300">Free</th>
                <th className="text-center py-3 text-blue-400">Pro</th>
                <th className="text-center py-3 text-purple-400">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Monthly Reports', values: ['5', '50', 'Unlimited'] },
                { feature: 'File Uploads', values: ['10', '100', 'Unlimited'] },
                { feature: 'Max File Size', values: ['5MB', '25MB', '100MB'] },
                { feature: 'Storage', values: ['1GB', '10GB', 'Unlimited'] },
                { feature: 'Export Formats', values: ['PDF', 'PDF, Excel, CSV, Word', 'All Formats'] },
                { feature: 'Advanced Analytics', values: ['❌', '✅', '✅'] },
                { feature: 'API Access', values: ['❌', '✅', '✅'] },
                { feature: 'Collaboration', values: ['❌', '✅', '✅'] },
                { feature: 'Custom Branding', values: ['❌', '✅', '✅'] },
                { feature: 'White Labeling', values: ['❌', '❌', '✅'] },
                { feature: 'Support', values: ['Email', 'Priority Email', 'Dedicated Manager'] },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-3 text-white font-medium">{row.feature}</td>
                  <td className="py-3 text-center text-gray-300">{row.values[0]}</td>
                  <td className="py-3 text-center text-gray-300">{row.values[1]}</td>
                  <td className="py-3 text-center text-gray-300">{row.values[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default SubscriptionManagement