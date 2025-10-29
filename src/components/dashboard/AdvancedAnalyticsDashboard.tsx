"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  PieChart,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

interface AdvancedAnalyticsProps {
  userId: string;
}

interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  burnRate: number;
  cashFlowVelocity: number;
  riskScore: number;
  liquidityRatio: number;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: number;
  }>;
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    impact: number;
    recommendation: string;
  }>;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsProps> = ({ userId }) => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Simulated real-time data (in production, this would connect to WebSocket)
  useEffect(() => {
    const fetchAdvancedMetrics = async () => {
      try {
        // Simulate API call with sophisticated financial calculations
        const mockData: FinancialMetrics = {
          totalIncome: 125000,
          totalExpenses: 89500,
          netSavings: 35500,
          savingsRate: 28.4,
          burnRate: 7450, // Monthly burn rate
          cashFlowVelocity: 1.4, // How fast money moves
          riskScore: 23, // Lower is better
          liquidityRatio: 3.2, // Liquidity health
          monthlyTrend: [
            { month: 'Jan', income: 10200, expenses: 7800, savings: 2400 },
            { month: 'Feb', income: 9800, expenses: 7200, savings: 2600 },
            { month: 'Mar', income: 11500, expenses: 8100, savings: 3400 },
            { month: 'Apr', income: 10800, expenses: 7900, savings: 2900 },
            { month: 'May', income: 12200, expenses: 8500, savings: 3700 },
            { month: 'Jun', income: 10500, expenses: 7600, savings: 2900 },
          ],
          categoryBreakdown: [
            { category: 'Housing', amount: 32000, percentage: 35.8, trend: -2.1 },
            { category: 'Transportation', amount: 18500, percentage: 20.7, trend: 4.3 },
            { category: 'Food', amount: 15200, percentage: 17.0, trend: -1.8 },
            { category: 'Healthcare', amount: 8900, percentage: 9.9, trend: 12.4 },
            { category: 'Entertainment', amount: 7800, percentage: 8.7, trend: -5.2 },
            { category: 'Utilities', amount: 7100, percentage: 7.9, trend: 2.1 },
          ],
          riskFactors: [
            {
              factor: 'High Healthcare Spending Trend',
              severity: 'medium',
              impact: 12.4,
              recommendation: 'Consider increasing health savings account contributions'
            },
            {
              factor: 'Transportation Cost Volatility',
              severity: 'low',
              impact: 4.3,
              recommendation: 'Monitor fuel costs and consider carpooling options'
            }
          ]
        };

        setMetrics(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch advanced metrics:', error);
        setIsLoading(false);
      }
    };

    fetchAdvancedMetrics();

    // Real-time updates simulation
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        // Update metrics with small variations to simulate real-time data
        setMetrics(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            cashFlowVelocity: prev.cashFlowVelocity + (Math.random() - 0.5) * 0.1,
            riskScore: Math.max(0, prev.riskScore + (Math.random() - 0.5) * 2)
          };
        });
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [userId, realTimeUpdates, selectedTimeframe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-red-600 p-8">
        Failed to load analytics data. Please try again.
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-8 p-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600 mt-2">AI-powered financial insights and predictions</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedTimeframe === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Real-time Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={realTimeUpdates}
              onChange={(e) => setRealTimeUpdates(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Real-time</span>
            <Zap className={`w-4 h-4 ${realTimeUpdates ? 'text-green-500' : 'text-gray-400'}`} />
          </label>
        </div>
      </div>

      {/* Advanced KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Cash Flow Velocity</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.cashFlowVelocity.toFixed(2)}x</p>
              <p className="text-blue-600 text-xs mt-1">Money circulation rate</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Liquidity Ratio</p>
              <p className="text-2xl font-bold text-green-900">{metrics.liquidityRatio.toFixed(1)}</p>
              <p className="text-green-600 text-xs mt-1">Financial flexibility</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Risk Score</p>
              <p className="text-2xl font-bold text-red-900">{metrics.riskScore.toFixed(0)}/100</p>
              <p className="text-red-600 text-xs mt-1">Lower is better</p>
            </div>
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Burn Rate</p>
              <p className="text-2xl font-bold text-purple-900">${(metrics.burnRate / 1000).toFixed(1)}k</p>
              <p className="text-purple-600 text-xs mt-1">Monthly spending rate</p>
            </div>
            <TrendingDown className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cash Flow Trend Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Cash Flow Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metrics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="Expenses"
              />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Net Savings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown with Trends */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Spending Categories</h3>
          <div className="space-y-4">
            {metrics.categoryBreakdown.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{category.category}</p>
                    <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${category.amount.toLocaleString()}
                  </p>
                  <div className={`flex items-center text-sm ${
                    category.trend > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {category.trend > 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(category.trend).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI-Powered Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200"
      >
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-semibold text-gray-900">AI Risk Analysis</h3>
        </div>

        <div className="space-y-4">
          {metrics.riskFactors.map((risk, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{risk.factor}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                  risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {risk.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{risk.recommendation}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Impact:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      risk.impact > 10 ? 'bg-red-500' :
                      risk.impact > 5 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(risk.impact, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{risk.impact.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
