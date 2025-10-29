'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon, LightBulbIcon } from '@heroicons/react/24/outline'

interface AIInsight {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'risk' | 'anomaly' | 'trend'
  confidence: number
  impact: 'high' | 'medium' | 'low'
  relatedMetrics?: string[]
  recommendations?: string[]
  dataPoints?: number[]
}

export function AIInsightsEngine({ accountId }: { accountId: string }) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    // In a production environment, this would fetch from your AI service
    // For now, we'll simulate the response
    const fetchInsights = async () => {
      setIsLoading(true)
      try {
        // This would be replaced with an actual API call
        // const response = await fetch(`/api/accounts/${accountId}/ai-insights`)
        // const data = await response.json()

        // Simulated data for demonstration
        const mockInsights: AIInsight[] = [
          {
            id: '1',
            title: 'Recurring Revenue Opportunity',
            description: 'We have detected stable cash inflows that could be formalized as recurring revenue, potentially increasing valuation by 4-5x compared to one-time income.',
            type: 'opportunity',
            confidence: 0.89,
            impact: 'high',
            dataPoints: [42, 45, 43, 46, 48, 47, 49, 50, 52],
            recommendations: [
              'Transition 3 identified customers to subscription models',
              'Implement automated billing for recurring payments'
            ]
          },
          {
            id: '2',
            title: 'Cash Flow Risk',
            description: 'Based on current expense patterns, we predict a potential cash flow constraint in Q4 2025.',
            type: 'risk',
            confidence: 0.78,
            impact: 'high',
            dataPoints: [70, 65, 60, 55, 50, 45, 40, 35, 30],
            recommendations: [
              'Accelerate accounts receivable by 15 days',
              'Renegotiate payment terms with top 3 vendors',
              'Consider invoice factoring for large outstanding payments'
            ]
          },
          {
            id: '3',
            title: 'Expense Anomaly Detected',
            description: 'Unusual transaction pattern detected in operational expenses, 127% increase over 30-day baseline.',
            type: 'anomaly',
            confidence: 0.92,
            impact: 'medium',
            dataPoints: [25, 26, 24, 27, 65, 28, 29, 27],
            recommendations: [
              'Review recent operational expenses',
              'Verify authorization for transactions dated Oct 5-8, 2025'
            ]
          },
          {
            id: '4',
            title: 'Growth Trend Identified',
            description: 'Consistent 12% month-over-month growth in B2B segment revenues over the past quarter.',
            type: 'trend',
            confidence: 0.85,
            impact: 'medium',
            dataPoints: [100, 112, 125, 140, 157],
            recommendations: [
              'Increase sales capacity for B2B segment',
              'Develop targeted marketing campaign for highest-converting industry'
            ]
          }
        ]

        setInsights(mockInsights)
      } catch (error) {
        console.error('Failed to fetch AI insights:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [accountId])

  const filteredInsights = activeTab === 'all'
    ? insights
    : insights.filter((insight: AIInsight) => insight.type === activeTab)

  const getIconByType = (type: string) => {
    switch(type) {
      case 'opportunity':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
      case 'risk':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'anomaly':
        return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
      case 'trend':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-blue-500" />
      default:
        return <LightBulbIcon className="w-5 h-5 text-purple-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-amber-100 text-amber-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSparklineColor = (type: string) => {
    switch(type) {
      case 'opportunity':
        return '#22c55e'
      case 'risk':
        return '#ef4444'
      case 'anomaly':
        return '#f59e0b'
      case 'trend':
        return '#3b82f6'
      default:
        return '#8b5cf6'
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI-Powered Insights</h2>
        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          Powered by FinScore AI
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="opportunity">Opportunities</TabsTrigger>
          <TabsTrigger value="risk">Risks</TabsTrigger>
          <TabsTrigger value="anomaly">Anomalies</TabsTrigger>
          <TabsTrigger value="trend">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="space-y-4">
            {filteredInsights.map((insight: AIInsight) => (
              <div
                key={insight.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getIconByType(insight.type)}
                    <h3 className="font-medium text-lg text-gray-900">{insight.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                      {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {Math.round(insight.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{insight.description}</p>

                {insight.dataPoints && (
                  <div className="h-12 mb-4">
                    <Sparklines data={insight.dataPoints} margin={6}>
                      <SparklinesLine color={getSparklineColor(insight.type)} />
                      <SparklinesSpots />
                    </Sparklines>
                  </div>
                )}

                {insight.recommendations && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      {insight.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

