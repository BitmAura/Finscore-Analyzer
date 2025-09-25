'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, subDays, subHours } from 'date-fns'
import { RealTimeChart } from './RealTimeChart'

// Data fetching service - replace with actual API calls
const fetchAnalyticsData = async () => {
  // TODO: Replace with actual API calls
  // This is a placeholder structure for real data
  const now = new Date()
  
  return {
    metrics: {
      totalRevenue: 0,
      reportsGenerated: 0,
      activeUsers: 0,
      conversionRate: 0
    },
    hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
      time: format(subHours(now, 23 - i), 'HH:mm'),
      value: 0
    })),
    weeklyReports: Array.from({ length: 7 }, (_, i) => ({
      day: format(subDays(now, 6 - i), 'MMM dd'),
      reports: 0,
      revenue: 0
    })),
    userSegments: {
      activeUsers: 0,
      newSignups: 0,
      premiumUsers: 0
    }
  }
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users'>('overview')

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        loadData(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isRefreshing])

  const loadData = async (silent = false) => {
    if (!silent) {
      setIsLoading(true)
    }
    
    try {
      const analyticsData = await fetchAnalyticsData()
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
  }

  // Prepare chart data
  const revenueData = data ? {
    labels: data.weeklyReports.map((d: any) => d.day),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.weeklyReports.map((d: any) => d.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  } : null

  const reportsData = data ? {
    labels: data.weeklyReports.map((d: any) => d.day),
    datasets: [
      {
        label: 'Reports Generated',
        data: data.weeklyReports.map((d: any) => d.reports),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  } : null

  const userActivityData = data ? {
    labels: ['Active Users', 'New Signups', 'Premium Users'],
    datasets: [
      {
        data: [
          data.userSegments.activeUsers,
          data.userSegments.newSignups,
          data.userSegments.premiumUsers
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  } : null

  const activityData = data ? {
    labels: data.hourlyActivity.map((h: any) => h.time),
    datasets: [
      {
        label: 'Active Users',
        data: data.hourlyActivity.map((h: any) => h.value),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  } : null

  const metrics = data ? [
    {
      title: 'Total Revenue',
      value: '$' + data.metrics.totalRevenue.toLocaleString(),
      change: '+0%', // TODO: Calculate from historical data
      trend: 'neutral' as 'up' | 'down' | 'neutral'
    },
    {
      title: 'Reports Generated',
      value: data.metrics.reportsGenerated.toString(),
      change: '+0%', // TODO: Calculate from historical data
      trend: 'neutral' as 'up' | 'down' | 'neutral'
    },
    {
      title: 'Active Users',
      value: data.metrics.activeUsers.toString(),
      change: '+0%', // TODO: Calculate from historical data
      trend: 'neutral' as 'up' | 'down' | 'neutral'
    },
    {
      title: 'Conversion Rate',
      value: data.metrics.conversionRate.toFixed(1) + '%',
      change: '+0%', // TODO: Calculate from historical data
      trend: 'neutral' as 'up' | 'down' | 'neutral'
    }
  ] : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Real-Time Analytics</h2>
          <p className="mt-1 text-gray-400">Live insights and performance metrics</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-800"
        >
          <svg 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 border bg-gray-800/50 backdrop-blur-sm border-gray-700/50 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{metric.title}</p>
                <p className="mt-1 text-2xl font-bold text-white">{metric.value}</p>
              </div>
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-green-400' : 
                metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                <svg 
                  className={`w-4 h-4 mr-1 ${metric.trend === 'down' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
                {metric.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 space-x-1 border rounded-lg bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'reports', label: 'Reports' },
          { key: 'users', label: 'User Activity' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {activeTab === 'overview' && (
          <>
            <RealTimeChart
              type="line"
              title="24-Hour User Activity"
              data={activityData}
              height={300}
            />
            <RealTimeChart
              type="line"
              title="Revenue Trend (7 Days)"
              data={revenueData}
              height={300}
            />
          </>
        )}
        
        {activeTab === 'reports' && (
          <>
            <RealTimeChart
              type="bar"
              title="Reports Generated (7 Days)"
              data={reportsData}
              height={300}
            />
            <div className="lg:col-span-1">
              <RealTimeChart
                type="doughnut"
                title="User Distribution"
                data={userActivityData}
                height={300}
              />
            </div>
          </>
        )}
        
        {activeTab === 'users' && (
          <>
            <RealTimeChart
              type="line"
              title="Real-Time User Activity"
              data={activityData}
              height={300}
            />
            <RealTimeChart
              type="doughnut"
              title="User Segments"
              data={userActivityData}
              height={300}
            />
          </>
        )}
      </div>

      {/* Live Status Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 border rounded-full bg-green-900/50 border-green-700/50">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-400">Live Data - Updates every 30s</span>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard