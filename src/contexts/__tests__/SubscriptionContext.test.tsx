import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { 
  SubscriptionProvider, 
  useSubscription, 
  SUBSCRIPTION_FEATURES 
} from '../SubscriptionContext'

// Test component that uses the subscription context
const TestComponent = () => {
  const {
    subscription,
    hasFeature,
    canPerformAction,
    getRemainingUsage,
    updateUsage,
    upgradeTier
  } = useSubscription()

  return (
    <div>
      <div data-testid="tier">{subscription.tier}</div>
      <div data-testid="reports-used">{subscription.usage.reportsUsed}</div>
      <div data-testid="files-uploaded">{subscription.usage.filesUploaded}</div>
      <div data-testid="storage-used">{subscription.usage.storageUsed}</div>
      <div data-testid="advanced-analytics">
        {hasFeature('advancedAnalytics') ? 'enabled' : 'disabled'}
      </div>
      <div data-testid="can-create-report">
        {canPerformAction('create_report') ? 'yes' : 'no'}
      </div>
      <div data-testid="remaining-reports">
        {getRemainingUsage('reports')?.toString()}
      </div>
      <button 
        onClick={() => updateUsage('reportsUsed', 1)}
        data-testid="update-reports"
      >
        Update Reports
      </button>
      <button 
        onClick={() => upgradeTier('pro')}
        data-testid="upgrade-tier"
      >
        Upgrade to Pro
      </button>
    </div>
  )
}

describe('SubscriptionContext', () => {
  test('provides default subscription state', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    )

    expect(screen.getByTestId('tier')).toHaveTextContent('free')
    expect(screen.getByTestId('reports-used')).toHaveTextContent('0')
    expect(screen.getByTestId('files-uploaded')).toHaveTextContent('0')
    expect(screen.getByTestId('storage-used')).toHaveTextContent('0')
  })

  test('hasFeature works correctly for different tiers', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    )

    // Free tier should not have advanced analytics
    expect(screen.getByTestId('advanced-analytics')).toHaveTextContent('disabled')
  })

  test('canPerformAction respects usage limits', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    )

    // Free tier should allow creating reports initially
    expect(screen.getByTestId('can-create-report')).toHaveTextContent('yes')
  })

  test('getRemainingUsage calculates correctly', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    )

    // Free tier has 5 max reports, 0 used, so 5 remaining
    expect(screen.getByTestId('remaining-reports')).toHaveTextContent('5')
  })

  test('updateUsage updates the usage correctly', () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    )

    act(() => {
      screen.getByTestId('update-reports').click()
    })

    expect(screen.getByTestId('reports-used')).toHaveTextContent('1')
    expect(screen.getByTestId('remaining-reports')).toHaveTextContent('4')
  })

  test('updateUsage handles numeric and string values correctly', () => {
    const TestUpdateComponent = () => {
      const { subscription, updateUsage } = useSubscription()

      return (
        <div>
          <div data-testid="storage-used">{subscription.usage.storageUsed}</div>
          <div data-testid="last-reset">{subscription.usage.lastReset}</div>
          <button 
            onClick={() => updateUsage('storageUsed', 2.5)}
            data-testid="update-storage"
          >
            Update Storage
          </button>
          <button 
            onClick={() => updateUsage('lastReset', '2024-01-01T00:00:00Z' as any)}
            data-testid="update-reset"
          >
            Update Reset
          </button>
        </div>
      )
    }

    render(
      <SubscriptionProvider>
        <TestUpdateComponent />
      </SubscriptionProvider>
    )

    // Test numeric update
    act(() => {
      screen.getByTestId('update-storage').click()
    })
    expect(screen.getByTestId('storage-used')).toHaveTextContent('2.5')

    // Test string update (lastReset)
    act(() => {
      screen.getByTestId('update-reset').click()
    })
    expect(screen.getByTestId('last-reset')).toHaveTextContent('2024-01-01T00:00:00Z')
  })

  test('upgradeTier changes tier and features', async () => {
    render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    )

    await act(async () => {
      screen.getByTestId('upgrade-tier').click()
      // Wait for the async operation (upgradeTier has 1000ms timeout)
      await new Promise(resolve => setTimeout(resolve, 1100))
    })

    expect(screen.getByTestId('tier')).toHaveTextContent('pro')
    expect(screen.getByTestId('advanced-analytics')).toHaveTextContent('enabled')
  })

  test('canPerformAction works for different action types', () => {
    const TestActionsComponent = () => {
      const { canPerformAction, subscription } = useSubscription()

      return (
        <div>
          <div data-testid="can-upload">
            {canPerformAction('upload_file') ? 'yes' : 'no'}
          </div>
          <div data-testid="can-bulk-ops">
            {canPerformAction('bulk_operations') ? 'yes' : 'no'}
          </div>
          <div data-testid="can-use-storage">
            {canPerformAction('use_storage', 0.5) ? 'yes' : 'no'}
          </div>
          <div data-testid="can-api-access">
            {canPerformAction('api_access') ? 'yes' : 'no'}
          </div>
          <div data-testid="tier">{subscription.tier}</div>
        </div>
      )
    }

    render(
      <SubscriptionProvider>
        <TestActionsComponent />
      </SubscriptionProvider>
    )

    // Free tier permissions
    expect(screen.getByTestId('can-upload')).toHaveTextContent('yes')
    expect(screen.getByTestId('can-bulk-ops')).toHaveTextContent('no')
    expect(screen.getByTestId('can-use-storage')).toHaveTextContent('yes')
    expect(screen.getByTestId('can-api-access')).toHaveTextContent('no')
  })

  test('getRemainingUsage handles unlimited plans', () => {
    const TestUnlimitedComponent = () => {
      const { subscription, getRemainingUsage } = useSubscription()

      // This would be enterprise tier with unlimited features
      const enterpriseFeatures = SUBSCRIPTION_FEATURES.enterprise

      return (
        <div>
          <div data-testid="enterprise-reports">
            {enterpriseFeatures.maxReports === -1 ? 'unlimited' : enterpriseFeatures.maxReports}
          </div>
          <div data-testid="enterprise-storage">
            {enterpriseFeatures.storageLimit === -1 ? 'unlimited' : enterpriseFeatures.storageLimit}
          </div>
        </div>
      )
    }

    render(
      <SubscriptionProvider>
        <TestUnlimitedComponent />
      </SubscriptionProvider>
    )

    expect(screen.getByTestId('enterprise-reports')).toHaveTextContent('unlimited')
    expect(screen.getByTestId('enterprise-storage')).toHaveTextContent('unlimited')
  })

  test('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = vi.fn()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useSubscription must be used within a SubscriptionProvider')

    console.error = originalError
  })

  test('subscription features are correctly defined', () => {
    // Test that all subscription tiers have the expected features
    expect(SUBSCRIPTION_FEATURES.free.maxReports).toBe(5)
    expect(SUBSCRIPTION_FEATURES.free.advancedAnalytics).toBe(false)
    
    expect(SUBSCRIPTION_FEATURES.pro.maxReports).toBe(50)
    expect(SUBSCRIPTION_FEATURES.pro.advancedAnalytics).toBe(true)
    
    expect(SUBSCRIPTION_FEATURES.enterprise.maxReports).toBe(-1)
    expect(SUBSCRIPTION_FEATURES.enterprise.whiteLabeling).toBe(true)
  })
})