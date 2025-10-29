"use client";

import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useDashboard } from '@/contexts/DashboardContext';

// This component no longer needs to accept transactions as a prop.
// It will get all data directly from the DashboardContext.
const ExpenseTreemap: React.FC = () => {
  const { allTransactions, selectCategory, selectedCategory } = useDashboard();

  const processData = (transactions: typeof allTransactions) => {
    const categorySpending: { [key: string]: number } = {};

    transactions.forEach(tx => {
      if (tx.type === 'expense') { // Only consider expenses
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

  const treemapData = processData(allTransactions);

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
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent colors={COLORS} selectCategory={selectCategory} selectedCategory={selectedCategory} />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const CustomizedContent = (props: any) => {
  const {
    root, depth, x, y, width, height, index, colors, name, 
    // Get the filter functions from props passed by the Treemap content prop
    selectCategory, selectedCategory 
  } = props;

  const isSelected = name === selectedCategory;

  const handleClick = () => {
    // If the clicked category is already the selected one, pass null to clear the filter.
    // Otherwise, select the new category.
    selectCategory(isSelected ? null : name);
  };

  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: isSelected ? '#38B2AC' : '#fff', // Highlight color for stroke
          strokeWidth: isSelected ? 4 : 2 / (depth + 1e-10),
          strokeOpacity: isSelected ? 1 : 1 / (depth + 1e-10),
          filter: isSelected ? `drop-shadow(0 0 5px #38B2AC)` : 'none',
          transition: 'all 0.2s ease-in-out',
        }}
      />
      {depth === 1 ? (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14} style={{ pointerEvents: 'none' }}>
          {name}
        </text>
      ) : null}
    </g>
  );
};

export default ExpenseTreemap;
