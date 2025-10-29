'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AIInsightsEngine } from '@/components/analytics/AIInsightsEngine'
import {
  BarChart3,
  Upload,
  FileText,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  CreditCard,
  DollarSign,
  Calendar
} from 'lucide-react'

export default function EnhancedDashboard() {
  const [activeAccount, setActiveAccount] = useState('acc_main')
  const [accountData, setAccountData] = useState({
    balance: 124567.89,
    trend: 'up',
    trendPercentage: 12.3,
    pendingDocuments: 2,
    healthScore: 87,
  })

  // In a real implementation, you'd fetch this data from your API
  const [recentDocuments, setRecentDocuments] = useState([
    { id: 'doc1', name: 'Q3 Bank Statement', status: 'processed', date: '2025-10-12', score: 94 },
    { id: 'doc2', name: 'GST Return Q3', status: 'processed', date: '2025-10-08', score: 88 },
    { id: 'doc3', name: 'Company Credit Card', status: 'pending', date: '2025-10-13', score: null },
  ])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-500">October 13, 2025 · All data refreshed 5 minutes ago</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 flex flex-col">
          <p className="text-sm text-gray-500 mb-1">Current Balance</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">${accountData.balance.toLocaleString()}</p>
            <div className={`flex items-center ${accountData.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{accountData.trendPercentage}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <p className="text-sm text-gray-500 mb-1">Pending Documents</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">{accountData.pendingDocuments}</p>
            <Button size="sm" variant="outline" className="text-xs">
              Process Now
            </Button>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <p className="text-sm text-gray-500 mb-1">Financial Health Score</p>
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">{accountData.healthScore}/100</p>
            </div>
            <Progress value={accountData.healthScore} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <p className="text-sm text-gray-500 mb-1">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="flex items-center justify-center">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center">
              <FileText className="w-4 h-4 mr-2" /> Reports
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <AIInsightsEngine accountId={activeAccount} />
        </div>
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Documents</h2>
              <Button variant="ghost" size="sm" className="text-blue-600 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{doc.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(doc.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    {doc.status === 'processed' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Score: {doc.score}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Cash Flow Forecast</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500">Advanced cash flow visualization coming soon</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="flex items-center mb-1">
                <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-600">Projected Income</span>
              </div>
              <p className="text-xl font-bold">$45,780</p>
            </div>
            <div className="border rounded-lg p-3">
              <div className="flex items-center mb-1">
                <CreditCard className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-gray-600">Projected Expenses</span>
              </div>
              <p className="text-xl font-bold">$32,450</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            <div className="flex items-start p-3 border border-gray-100 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Quarterly Tax Payment Due</p>
                <p className="text-sm text-gray-500">October 15, 2025</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-xs text-amber-600">2 days remaining</span>
                </div>
              </div>
            </div>

            <div className="flex items-start p-3 border border-gray-100 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Annual Financial Review</p>
                <p className="text-sm text-gray-500">October 20, 2025</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-xs text-blue-600">7 days remaining</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full text-blue-600 mt-2">
              View All Events
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
