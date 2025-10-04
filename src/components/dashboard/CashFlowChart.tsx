'use client'

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface Transaction {
  date: string;
  amount: number;
}

interface CashFlowChartProps {
  dataA: Transaction[];
  dataB?: Transaction[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ dataA, dataB }) => {
  const processData = (transactions: Transaction[]) => {
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });

      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }

      if (tx.amount > 0) {
        monthlyData[month].income += tx.amount;
      } else {
        monthlyData[month].expenses += Math.abs(tx.amount);
      }
    });

    return Object.keys(monthlyData).map(month => ({
      month,
      ...monthlyData[month],
    })).reverse(); // Reverse to show most recent months first
  };

  const chartDataA = processData(dataA);
  const chartDataB = dataB ? processData(dataB) : null;

  // Combine data for comparison chart
  const combinedData = chartDataA.map(a => {
    const b = chartDataB?.find(b => b.month === a.month);
    return {
      month: a.month,
      incomeA: a.income,
      expensesA: a.expenses,
      incomeB: b?.income,
      expensesB: b?.expenses,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Cash Flow Trend</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="month" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}
            labelStyle={{ color: '#CBD5E0' }}
          />
          <Legend wrapperStyle={{ color: '#CBD5E0' }} />
          <Line type="monotone" dataKey="incomeA" stroke="#48BB78" strokeWidth={2} name="Income (A)" />
          <Line type="monotone" dataKey="expensesA" stroke="#F56565" strokeWidth={2} name="Expenses (A)" />
          {chartDataB && <Line type="monotone" dataKey="incomeB" stroke="#81E6D9" strokeDasharray="5 5" name="Income (B)" />}
          {chartDataB && <Line type="monotone" dataKey="expensesB" stroke="#FEB2B2" strokeDasharray="5 5" name="Expenses (B)" />}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default CashFlowChart;
