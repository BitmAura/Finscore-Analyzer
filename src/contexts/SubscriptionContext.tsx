'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export interface SubscriptionFeatures {
  maxReports: number
  maxFileUploads: number
  maxFileSize: number // in MB
  advancedAnalytics: boolean
  customBranding: boolean
  apiAccess: boolean
  prioritySupport: boolean
  collaborativeFeatures: boolean
  bulkOperations: boolean
  exportFormats: string[]
  storageLimit: number // in GB
  aiInsights: boolean
  whiteLabeling: boolean
  dedicatedAccount: boolean
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    maxReports: 5,
    maxFileUploads: 10,
    maxFileSize: 5,
    advancedAnalytics: false,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
    collaborativeFeatures: false,
    bulkOperations: false,
    exportFormats: ['PDF'],
    storageLimit: 1,
    aiInsights: false,
    whiteLabeling: false,
    dedicatedAccount: false
  },
  pro: {
    maxReports: 50,
    maxFileUploads: 100,
    maxFileSize: 25,
    advancedAnalytics: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    collaborativeFeatures: true,
    bulkOperations: true,
    exportFormats: ['PDF', 'Excel', 'CSV', 'Word'],
    storageLimit: 10,
    aiInsights: true,
    whiteLabeling: false,
    dedicatedAccount: false
  },
  enterprise: {
    maxReports: -1, // Unlimited
    maxFileUploads: -1, // Unlimited
    maxFileSize: 100,
    advancedAnalytics: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    collaborativeFeatures: true,
    bulkOperations: true,
    exportFormats: ['PDF', 'Excel', 'CSV', 'Word', 'PowerPoint'],
    storageLimit: -1, // Unlimited
    aiInsights: true,
    whiteLabeling: true,
    dedicatedAccount: true
  }
}

export interface SubscriptionUsage {
  reportsUsed: number
  filesUploaded: number
  storageUsed: number // in GB
  lastReset: string
}

export interface SubscriptionState {
  tier: SubscriptionTier
  features: SubscriptionFeatures
  usage: SubscriptionUsage
  billingPeriod: 'monthly' | 'yearly'
  nextBillingDate: string
  isActive: boolean
}

interface SubscriptionContextType {
  subscription: SubscriptionState
  hasFeature: (feature: keyof SubscriptionFeatures) => boolean
  canPerformAction: (action: string, currentUsage?: number) => boolean
  getRemainingUsage: (metric: 'reports' | 'files' | 'storage') => number | 'unlimited'
  upgradeTier: (newTier: SubscriptionTier) => Promise<boolean>
  updateUsage: (metric: keyof SubscriptionUsage, amount: number) => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Default subscription state for new users
const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  tier: 'free',
  features: SUBSCRIPTION_FEATURES.free,
  usage: {
    reportsUsed: 0,
    filesUploaded: 0,
    storageUsed: 0,
    lastReset: new Date().toISOString()
  },
  billingPeriod: 'monthly',
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  isActive: true
}

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionState>(DEFAULT_SUBSCRIPTION)

  const hasFeature = (feature: keyof SubscriptionFeatures): boolean => {
    return subscription.features[feature] as boolean
  }

  const canPerformAction = (action: string, currentUsage?: number): boolean => {
    if (!subscription.isActive) return false

    switch (action) {
      case 'create_report':
        const maxReports = subscription.features.maxReports
        return maxReports === -1 || subscription.usage.reportsUsed < maxReports
      
      case 'upload_file':
        const maxUploads = subscription.features.maxFileUploads
        return maxUploads === -1 || subscription.usage.filesUploaded < maxUploads
      
      case 'use_storage':
        const storageLimit = subscription.features.storageLimit
        const requestedStorage = currentUsage || 0
        return storageLimit === -1 || (subscription.usage.storageUsed + requestedStorage) <= storageLimit
      
      case 'bulk_operations':
        return subscription.features.bulkOperations
      
      case 'advanced_analytics':
        return subscription.features.advancedAnalytics
      
      case 'api_access':
        return subscription.features.apiAccess
      
      default:
        return true
    }
  }

  const getRemainingUsage = (metric: 'reports' | 'files' | 'storage'): number | 'unlimited' => {
    switch (metric) {
      case 'reports':
        const maxReports = subscription.features.maxReports
        return maxReports === -1 ? 'unlimited' : Math.max(0, maxReports - subscription.usage.reportsUsed)
      
      case 'files':
        const maxFiles = subscription.features.maxFileUploads
        return maxFiles === -1 ? 'unlimited' : Math.max(0, maxFiles - subscription.usage.filesUploaded)
      
      case 'storage':
        const maxStorage = subscription.features.storageLimit
        return maxStorage === -1 ? 'unlimited' : Math.max(0, maxStorage - subscription.usage.storageUsed)
      
      default:
        return 0
    }
  }

  const upgradeTier = async (newTier: SubscriptionTier): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubscription(prev => ({
        ...prev,
        tier: newTier,
        features: SUBSCRIPTION_FEATURES[newTier]
      }))
      
      return true
    } catch (error) {
      console.error('Failed to upgrade subscription:', error)
      return false
    }
  }

  const updateUsage = (metric: keyof SubscriptionUsage, amount: number) => {
    setSubscription(prev => {
      const currentValue = prev.usage[metric]
      let newValue: number | string
      
      if (metric === 'lastReset') {
        // lastReset is a string (ISO date), so we update it directly
        newValue = typeof amount === 'string' ? amount : new Date().toISOString()
      } else {
        // For numeric fields, ensure we're adding numbers
        const numericValue = typeof currentValue === 'number' ? currentValue : 0
        newValue = numericValue + amount
      }
      
      return {
        ...prev,
        usage: {
          ...prev.usage,
          [metric]: newValue
        }
      }
    })
  }

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      hasFeature,
      canPerformAction,
      getRemainingUsage,
      upgradeTier,
      updateUsage
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}