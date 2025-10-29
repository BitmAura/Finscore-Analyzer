"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// Define the shape of a transaction
export interface Transaction {
  id: string; // Assuming transactions have a unique ID
  date: string; // Should be ISO string
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

// Define the shape of the date range
export interface DateRange {
    from: Date | null;
    to: Date | null;
}

// Define the shape of the context state
interface DashboardContextType {
  allTransactions: Transaction[];
  filteredTransactions: Transaction[];
  selectedCategory: string | null;
  selectCategory: (category: string | null) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  categories: string[];
  updateTransaction: (updatedTransaction: Transaction) => void;
}

// Create the context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Define the props for the provider
interface DashboardProviderProps {
  children: ReactNode;
  initialTransactions: Transaction[];
}

// Create the provider component
export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children, initialTransactions }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(currentTransactions => 
      currentTransactions.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx)
    );
  };

  // Memoize the filtered transactions so it only recalculates when filters change
  const filteredTransactions = useMemo(() => {
    let currentTxs = transactions;

    // Filter by selected category
    if (selectedCategory) {
      currentTxs = currentTxs.filter(t => t.category === selectedCategory);
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from).setHours(0, 0, 0, 0);
        const toDate = new Date(dateRange.to).setHours(23, 59, 59, 999);
        currentTxs = currentTxs.filter(t => {
            const txDate = new Date(t.date).getTime();
            return txDate >= fromDate && txDate <= toDate;
        });
    }

    return currentTxs;
  }, [selectedCategory, dateRange, transactions]);

  // Derive a unique, sorted list of categories
  const categories = useMemo(() => {
    const allCategories = transactions.map(t => t.category || 'Uncategorized');
    return [...new Set(allCategories)].sort();
  }, [transactions]);

  const value = {
    allTransactions: transactions,
    filteredTransactions,
    selectedCategory,
    selectCategory: setSelectedCategory,
    dateRange,
    setDateRange,
    categories,
    updateTransaction,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
