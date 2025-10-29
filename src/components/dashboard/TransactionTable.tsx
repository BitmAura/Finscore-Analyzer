"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDashboard, Transaction } from '@/contexts/DashboardContext';

// A new component to handle the category selection dropdown for a single transaction
const CategorySelector = ({ transaction }: { transaction: Transaction }) => {
  const { categories, updateTransaction } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = event.target.value;
    const originalTransaction = { ...transaction };

    // Optimistic UI update
    updateTransaction({ ...transaction, category: newCategory });
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/transactions/${transaction.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: newCategory }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      // The API response should be the updated transaction, so we can update the state again
      // to be perfectly in sync with the database.
      const updatedFromServer = await response.json();
      updateTransaction(updatedFromServer);

    } catch (error) {
      console.error('Reverting optimistic update due to error:', error);
      // If the API call fails, revert the change in the UI
      updateTransaction(originalTransaction);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select
      value={transaction.category}
      onChange={handleCategoryChange}
      disabled={isLoading}
      className={`bg-transparent border-none rounded-md p-1 text-left w-full appearance-none cursor-pointer ${isLoading ? 'text-gray-500' : 'text-gray-400'}`}
    >
      {categories.map(cat => (
        <option key={cat} value={cat} className="bg-gray-800 text-white">
          {cat}
        </option>
      ))}
    </select>
  );
};

const TransactionTable: React.FC = () => {
  const { filteredTransactions: transactionsFromContext } = useDashboard();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'ascending' | 'descending' } | null>(null);

  const sortedTransactions = useMemo(() => {
    let sortableItems = [...transactionsFromContext];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transactionsFromContext, sortConfig]);

  const filteredBySearch = sortedTransactions.filter(tx =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('date')}>Date</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('description')}>Description</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('category')}>Category</th>
              <th scope="col" className="px-6 py-3 cursor-pointer text-right" onClick={() => requestSort('amount')}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredBySearch.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-white">{tx.description}</td>
                <td className="px-6 py-4">
                  <CategorySelector transaction={tx} />
                </td>
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
