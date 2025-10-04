'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  valueA: string | number;
  valueB?: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, valueA, valueB, change, icon, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 flex items-center space-x-6"
    >
      <div className={`p-4 rounded-full`} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div className="flex items-baseline space-x-2">
            <p className="text-white text-3xl font-bold">{valueA}</p>
            {valueB && <p className="text-gray-400 text-xl font-medium">vs {valueB}</p>}
        </div>
        {change !== undefined && (
            <div className={`text-lg font-bold ${change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {change > 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
            </div>
        )}
      </div>
    </motion.div>
  );
};

export default KpiCard;