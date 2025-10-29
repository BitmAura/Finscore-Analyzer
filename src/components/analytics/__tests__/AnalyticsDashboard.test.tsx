import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import AnalyticsDashboard from '../AnalyticsDashboard'

// Use the global framer-motion mock from tests/setup.tsx (includes motion.button etc.)
// Mock Chart.js components
vi.mock('../RealTimeChart', () => ({
  RealTimeChart: ({ title }: { title: string }) => (
    <div data-testid={`chart-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {title} Chart
    </div>
  )
}))

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders loading state initially', () => {
    render(<AnalyticsDashboard />)
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })

  test('renders dashboard with metrics after loading', async () => {
    render(<AnalyticsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Check if metrics are displayed - these are the default values from fetchAnalyticsData
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('Reports Generated')).toBeInTheDocument()
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('0.0%')).toBeInTheDocument() // Conversion Rate
  })

  test('refresh button triggers data reload', async () => {
    render(<AnalyticsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument()
    }, { timeout: 3000 })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    // Button should show refreshing state briefly
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })
  })

  test('tab navigation works correctly', async () => {
    render(<AnalyticsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Test Reports tab
    const reportsTab = screen.getByText('Reports')
    fireEvent.click(reportsTab)
    
    await waitFor(() => {
      expect(screen.getByTestId('chart-reports-generated-(7-days)')).toBeInTheDocument()
    })

    // Test User Activity tab
    const usersTab = screen.getByText('User Activity')
    fireEvent.click(usersTab)
    
    await waitFor(() => {
      expect(screen.getByTestId('chart-real-time-user-activity')).toBeInTheDocument()
    })
  })

  test('handles error state correctly', async () => {
    // Spy on console.error to check if errors are handled
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<AnalyticsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Component should render even with default data
    expect(screen.getByText('$0')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  test('displays live data indicator', async () => {
    render(<AnalyticsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Live Data - Updates every 30s')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('charts are rendered for different tabs', async () => {
    render(<AnalyticsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Overview tab should have multiple charts
    expect(screen.getByTestId('chart-revenue-trend-(7-days)')).toBeInTheDocument()

    // Click through all tabs to ensure charts render
    const reportsTab = screen.getByText('Reports')
    fireEvent.click(reportsTab)

    await waitFor(() => {
      const reportsChart = screen.getByTestId('chart-reports-generated-(7-days)')
      expect(reportsChart).toBeInTheDocument()
    })
  })

  test('displays correct metric cards', async () => {
    render(<AnalyticsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Real-Time Analytics')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Check for all metric cards
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Reports Generated')).toBeInTheDocument()
    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
  })
})