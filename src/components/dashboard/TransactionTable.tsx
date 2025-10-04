'use client'

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Transaction {
  date: string;
  description: string;
  category: string;
  amount: number;
  period?: 'A' | 'B';
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'ascending' | 'descending' } | null>(null);
  const isComparison = transactions.some(tx => tx.period);

  const compareValues = (aVal: any, bVal: any) => {
    // Normalize undefined to empty string
    if (aVal === undefined || aVal === null) aVal = '';
    if (bVal === undefined || bVal === null) bVal = '';

    // Numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    }

    // Dates (ISO strings)
    const dateA = Date.parse(aVal);
    const dateB = Date.parse(bVal);
    if (!isNaN(dateA) && !isNaN(dateB)) {
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    }

    // Fallback to string comparison
    const strA = String(aVal).toLowerCase();
    const strB = String(bVal).toLowerCase();
    if (strA < strB) return -1;
    if (strA > strB) return 1;
    return 0;
  };

  const sortedTransactions = useMemo(() => {
    let sortableItems = [...transactions];
    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      sortableItems.sort((a, b) => {
        const aVal = (a as any)[key];
        const bVal = (b as any)[key];
        const cmp = compareValues(aVal, bVal);
        return direction === 'ascending' ? cmp : -cmp;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  const filteredTransactions = sortedTransactions.filter(tx =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Transactions</h3>
        <input
          type="text"
          placeholder="Search transactions..."
          className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm w-64"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
            <tr>
              {isComparison && <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('period')}>Period</th>}
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('date')}>Date</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('description')}>Description</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('category')}>Category</th>
              <th scope="col" className="px-6 py-3 cursor-pointer text-right" onClick={() => requestSort('amount')}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30">
                {isComparison && <td className="px-6 py-4">{tx.period}</td>}
                <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-white">{tx.description}</td>
                <td className="px-6 py-4">{tx.category}</td>
                <td className={`px-6 py-4 text-right font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TransactionTable;
