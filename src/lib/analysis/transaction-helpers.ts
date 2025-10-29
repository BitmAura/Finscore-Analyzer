/**
 * Transaction Helper Utilities
 * Converts between different transaction formats
 */

import { Transaction } from '../parsing/transaction-parser';

export interface NormalizedTransaction extends Transaction {
  type: 'credit' | 'debit';
  amount: number;
}

/**
 * Normalize transactions to include type and amount fields
 * This allows backward compatibility with new analysis services
 */
export function normalizeTransactions(transactions: Transaction[]): NormalizedTransaction[] {
  return transactions.map(tx => {
    // Determine type and amount
    const isCredit = (tx.credit !== null && tx.credit > 0);
    const type: 'credit' | 'debit' = isCredit ? 'credit' : 'debit';
    const amount = isCredit ? (tx.credit || 0) : (tx.debit || 0);

    return {
      ...tx,
      type,
      amount
    };
  });
}

/**
 * Convert normalized transaction back to standard format
 */
export function denormalizeTransaction(tx: NormalizedTransaction): Transaction {
  const { type, amount, ...rest } = tx;

  return {
    ...rest,
    debit: type === 'debit' ? amount : null,
    credit: type === 'credit' ? amount : null
  };
}

