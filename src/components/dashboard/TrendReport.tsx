'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Trend } from '@/lib/analysis/trend-service';

interface TrendReportProps {
  trends: Trend[];
}

const TrendReport: React.FC<TrendReportProps> = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return null; // Don't render anything if there are no trends
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Spending Trends</h3>
      <div className="space-y-4">
        {trends.map((trend, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">{trend.category}</p>
              <p className="text-sm text-gray-400">
                Current: ${trend.currentMonthSpending.toLocaleString()} | Avg: ${trend.averageSpending.toLocaleString()}
              </p>
            </div>
            <div className={`text-lg font-bold ${trend.changePercentage > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {trend.changePercentage > 0 ? '▲' : '▼'} {Math.abs(trend.changePercentage).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrendReport;
