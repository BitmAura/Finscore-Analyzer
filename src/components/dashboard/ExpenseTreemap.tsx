'use client'

import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface Transaction {
  category: string;
  amount: number;
}

interface ExpenseTreemapProps {
  transactionsA: Transaction[];
  transactionsB?: Transaction[];
}

const ExpenseTreemap: React.FC<ExpenseTreemapProps> = ({ transactionsA, transactionsB }) => {
  const processData = (transactions: Transaction[]) => {
    const categorySpending: { [key: string]: number } = {};

    transactions.forEach(tx => {
      if (tx.amount < 0) { // Only consider expenses
        const category = tx.category || 'Uncategorized';
        if (!categorySpending[category]) {
          categorySpending[category] = 0;
        }
        categorySpending[category] += Math.abs(tx.amount);
      }
    });

    return Object.keys(categorySpending).map(category => ({
      name: category,
      size: categorySpending[category],
    }));
  };

  const treemapDataA = processData(transactionsA);
  const treemapDataB = transactionsB ? processData(transactionsB) : null;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#ffc0cb'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/80 p-2 border border-gray-700 rounded-lg">
          <p className="text-white">{`${payload[0].payload.name}: $${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Expense Breakdown</h3>
      <div className={`grid ${treemapDataB ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
        <div className="w-full h-[400px]">
            <h4 className="text-center text-white mb-2">Period A</h4>
            <ResponsiveContainer width="100%" height="100%">
                <Treemap
                data={treemapDataA}
                dataKey="size"
                stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent colors={COLORS} />}
                >
                <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </div>
        {treemapDataB && (
            <div className="w-full h-[400px]">
                <h4 className="text-center text-white mb-2">Period B</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                    data={treemapDataB}
                    dataKey="size"
                    stroke="#fff"
                    fill="#8884d8"
                    content={<CustomizedContent colors={COLORS} />}
                    >
                    <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        )}
      </div>
    </motion.div>
  );
};

const CustomizedContent = ({ root, depth, x, y, width, height, index, colors, name }: any) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
          {name}
        </text>
      ) : null}
    </g>
  );
};

export default ExpenseTreemap;
