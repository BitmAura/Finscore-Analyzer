
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-lg shadow-sm border p-6"
  >
    <div className="flex items-center">
      <div className="p-3 bg-blue-100 rounded-lg">{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && <p className="text-xs text-green-600">{change}</p>}
      </div>
    </div>
  </motion.div>
);

interface DashboardHeaderProps {
  title: string;
  description: string;
  metrics: MetricCardProps[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, description, metrics }) => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;
