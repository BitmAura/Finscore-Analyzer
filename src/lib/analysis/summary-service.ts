import { Transaction } from '../parsing/transaction-parser';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  startBalance: number;
  endBalance: number;
  transactionCount: number;
}

export const calculateSummary = (transactions: Transaction[]): FinancialSummary | null => {
  if (transactions.length === 0) {
    return null;
  }

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(t => {
    if (t.credit) {
      totalIncome += t.credit;
    }
    if (t.debit) {
      totalExpenses += t.debit;
    }
  });

  const netCashFlow = totalIncome - totalExpenses;

  // To get the start balance, we take the balance of the first transaction and reverse the transaction's effect.
  const firstTransaction = transactions[0];
  const startBalance = firstTransaction.balance - (firstTransaction.credit || 0) + (firstTransaction.debit || 0);
  
  const endBalance = transactions[transactions.length - 1].balance;

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    startBalance,
    endBalance,
    transactionCount: transactions.length,
  };
};
