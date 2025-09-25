'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useSubscription, SubscriptionTier } from '@/contexts/SubscriptionContext'

interface AccessControlProps {
  feature?: string
  tier?: SubscriptionTier
  action?: string
  fallback?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const AccessControl: React.FC<AccessControlProps> = ({
  feature,
  tier,
  action,
  fallback,
  children,
  className = ''
}) => {
  const { subscription, hasFeature, canPerformAction } = useSubscription()

  // Check if user has required tier
  const hasTierAccess = (): boolean => {
    if (!tier) return true
    
    const tierHierarchy: Record<SubscriptionTier, number> = {
      free: 0,
      pro: 1,
      enterprise: 2
    }
    
    return tierHierarchy[subscription.tier] >= tierHierarchy[tier]
  }

  // Check if user has specific feature access
  const hasFeatureAccess = (): boolean => {
    if (!feature) return true
    return hasFeature(feature as any)
  }

  // Check if user can perform action
  const canPerform = (): boolean => {
    if (!action) return true
    return canPerformAction(action)
  }

  // Check all conditions
  const hasAccess = hasTierAccess() && hasFeatureAccess() && canPerform()

  if (hasAccess) {
    return <div className={className}>{children}</div>
  }

  // Return fallback if provided
  if (fallback) {
    return <div className={className}>{fallback}</div>
  }

  // Default upgrade prompt
  return (
    <div className={`${className}`}>
      <AccessDeniedCard 
        requiredTier={tier}
        requiredFeature={feature}
        action={action}
      />
    </div>
  )
}

interface AccessDeniedCardProps {
  requiredTier?: SubscriptionTier
  requiredFeature?: string
  action?: string
}

const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  requiredTier,
  requiredFeature,
  action
}) => {
  const { subscription } = useSubscription()

  const getUpgradeMessage = (): string => {
    if (requiredTier) {
      return `This feature requires a ${requiredTier} subscription.`
    }
    if (requiredFeature) {
      return `This feature is not available in your current plan.`
    }
    if (action) {
      return `You've reached the limit for this action in your current plan.`
    }
    return 'This feature requires a higher subscription tier.'
  }

  const getRecommendedTier = (): SubscriptionTier => {
    if (requiredTier) return requiredTier
    if (subscription.tier === 'free') return 'pro'
    return 'enterprise'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-yellow-600/20 rounded-full">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">Upgrade Required</h3>
      <p className="text-gray-400 mb-4">{getUpgradeMessage()}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open('/subscription', '_blank')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Upgrade to {getRecommendedTier().charAt(0).toUpperCase() + getRecommendedTier().slice(1)}
        </motion.button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors duration-200">
          Learn More
        </button>
      </div>
    </motion.div>
  )
}

// Convenience component for feature-specific access control
export const FeatureGate: React.FC<{
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ feature, children, fallback }) => (
  <AccessControl feature={feature} fallback={fallback}>
    {children}
  </AccessControl>
)

// Convenience component for tier-based access control
export const TierGate: React.FC<{
  tier: SubscriptionTier
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ tier, children, fallback }) => (
  <AccessControl tier={tier} fallback={fallback}>
    {children}
  </AccessControl>
)

// Convenience component for action-based access control
export const ActionGate: React.FC<{
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ action, children, fallback }) => (
  <AccessControl action={action} fallback={fallback}>
    {children}
  </AccessControl>
)

export default AccessControl