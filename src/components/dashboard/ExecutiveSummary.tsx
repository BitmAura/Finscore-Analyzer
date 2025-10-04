'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface ExecutiveSummaryProps {
  summary: string;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary }) => {
  if (!summary) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">AI Executive Summary</h3>
      <p className="text-blue-100 whitespace-pre-wrap">{summary}</p>
    </motion.div>
  );
};

export default ExecutiveSummary;
