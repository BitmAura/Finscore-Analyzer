'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Anomaly } from '@/lib/analysis/trend-service';

interface AnomalyReportProps {
  anomalies: Anomaly[];
}

const AnomalyReport: React.FC<AnomalyReportProps> = ({ anomalies }) => {
  if (!anomalies || anomalies.length === 0) {
    return null; // Don't render anything if there are no anomalies
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Anomalies Detected</h3>
      <div className="space-y-4">
        {anomalies.map((anomaly, index) => {
          // Compute amount from debit/credit fields (Transaction uses debit/credit)
          const amt = anomaly.transaction.debit ?? anomaly.transaction.credit ?? 0;
          const sign = anomaly.transaction.debit ? '-' : '+';
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
              <div>
                <p className="font-semibold text-white">{anomaly.transaction.description}</p>
                <p className="text-sm text-gray-400">
                  {new Date(anomaly.transaction.date).toLocaleDateString()} - <span className="font-medium text-red-400">{anomaly.message}</span>
                </p>
              </div>
              <div className="text-lg font-bold text-white">
                {sign}${Math.abs(amt).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AnomalyReport;
