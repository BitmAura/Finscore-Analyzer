import { Transaction } from '../parsing/transaction-parser';

// Define the possible categories
export type TransactionCategory = 
  | 'Food & Drink'
  | 'Shopping'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Groceries'
  | 'Health & Wellness'
  | 'Salary'
  | 'Transfers'
  | 'Other';

/**
 * Categorizes a single transaction by calling the categorization API.
 * @param transaction The transaction to categorize.
 * @returns The determined category.
 */
export const categorizeTransaction = async (transaction: Transaction): Promise<TransactionCategory> => {
  try {
    // This assumes the API endpoint is running on the same host.
    // In a real-world scenario, you would use a full URL from an environment variable.
    const response = await fetch('http://localhost:3000/api/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: transaction.description }),
    });

    if (!response.ok) {
      console.error('Categorization API call failed with status:', response.status);
      return 'Other';
    }

    const data = await response.json();
    return data.category as TransactionCategory;
  } catch (error) {
    console.error('Error calling categorization API:', error);
    return 'Other';
  }
};

/**
 * Processes a list of transactions and adds a category to each one by calling the categorization API.
 * @param transactions The array of transactions.
 * @returns A new array of transactions, each with a 'category' field.
 */
export const categorizeAllTransactions = async (transactions: Transaction[]): Promise<(Transaction & { category: TransactionCategory })[]> => {
  const categorizedTransactions = await Promise.all(
    transactions.map(async (t) => ({
      ...t,
      category: await categorizeTransaction(t),
    }))
  );
  return categorizedTransactions;
};
