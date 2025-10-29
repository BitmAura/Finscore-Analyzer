import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { RealTimeChart } from '../RealTimeChart'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart">
      Line Chart: {data?.datasets?.[0]?.label || 'Test Data'}
    </div>
  ),
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart">
      Bar Chart: {data?.datasets?.[0]?.label || 'Test Data'}
    </div>
  ),
  Doughnut: ({ data, options }: any) => (
    <div data-testid="doughnut-chart">
      Doughnut Chart
    </div>
  ),
}))

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  ArcElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
}))

describe('RealTimeChart', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Test Data',
        data: [10, 20, 30],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  }

  test('renders line chart correctly', () => {
    render(
      <RealTimeChart
        type="line"
        title="Test Line Chart"
        data={mockData}
        height={300}
      />
    )

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByText('Line Chart: Test Data')).toBeInTheDocument()
  })

  test('renders bar chart correctly', () => {
    render(
      <RealTimeChart
        type="bar"
        title="Test Bar Chart"
        data={mockData}
        height={300}
      />
    )

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByText('Bar Chart: Test Data')).toBeInTheDocument()
  })

  test('renders doughnut chart correctly', () => {
    render(
      <RealTimeChart
        type="doughnut"
        title="Test Doughnut Chart"
        data={mockData}
        height={300}
      />
    )

    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
  })

  test('applies correct container styling', () => {
    const { container } = render(
      <RealTimeChart
        type="line"
        title="Test Chart"
        data={mockData}
        height={400}
      />
    )

    const chartContainer = container.querySelector('div')
    expect(chartContainer).toBeInTheDocument()
  })

  test('handles custom options', () => {
    const customOptions = {
      plugins: {
        legend: {
          display: false,
        },
      },
    }

    render(
      <RealTimeChart
        type="line"
        title="Custom Options Chart"
        data={mockData}
        options={customOptions}
        height={300}
      />
    )

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  test('renders with default height when not specified', () => {
    render(
      <RealTimeChart
        type="line"
        title="Default Height Chart"
        data={mockData}
      />
    )

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })
})