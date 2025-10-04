import { Transaction } from '../parsing/transaction-parser';
import { TransactionCategory } from './categorization-service';

export interface Trend {
  category: TransactionCategory;
  changePercentage: number;
  currentMonthSpending: number;
  averageSpending: number;
}

export interface Anomaly {
  transaction: Transaction;
  message: string;
}

// Helper to derive a signed amount from transaction debit/credit fields
const getAmount = (tx: Transaction): number => {
  // Convention used across the codebase: debit -> expense, credit -> income
  if (tx.debit != null) return -Math.abs(tx.debit);
  if (tx.credit != null) return Math.abs(tx.credit);
  return 0;
};

/**
 * Analyzes spending trends by comparing the last month's spending to the average of previous months.
 * @param transactions A list of transactions.
 * @returns An array of identified trends.
 */
export const detectSpendingTrends = (transactions: (Transaction & { category: TransactionCategory })[]): Trend[] => {
  const monthlySpending: { [month: string]: { [category: string]: number } } = {};
  const now = new Date();

  transactions.forEach(tx => {
    const amount = getAmount(tx);
    if (amount < 0) { // Only consider expenses
      const date = new Date(tx.date);
      const month = `${date.getFullYear()}-${date.getMonth()}`;
      const category = tx.category || 'Other';

      if (!monthlySpending[month]) {
        monthlySpending[month] = {};
      }
      if (!monthlySpending[month][category]) {
        monthlySpending[month][category] = 0;
      }
      monthlySpending[month][category] += Math.abs(amount);
    }
  });

  const months = Object.keys(monthlySpending).sort();
  if (months.length < 2) {
    return []; // Not enough data to detect trends
  }

  const lastMonthKey = months[months.length - 1];
  const previousMonthsKeys = months.slice(0, months.length - 1);

  const lastMonthSpending = monthlySpending[lastMonthKey];
  const averageSpending: { [category: string]: number } = {};

  previousMonthsKeys.forEach(monthKey => {
    for (const category in monthlySpending[monthKey]) {
      if (!averageSpending[category]) {
        averageSpending[category] = 0;
      }
      averageSpending[category] += monthlySpending[monthKey][category];
    }
  });

  for (const category in averageSpending) {
    averageSpending[category] /= previousMonthsKeys.length;
  }

  const trends: Trend[] = [];
  for (const category in lastMonthSpending) {
    if (averageSpending[category]) {
      const changePercentage = ((lastMonthSpending[category] - averageSpending[category]) / averageSpending[category]) * 100;
      if (Math.abs(changePercentage) > 20) { // Detect changes of more than 20%
        trends.push({
          category: category as TransactionCategory,
          changePercentage,
          currentMonthSpending: lastMonthSpending[category],
          averageSpending: averageSpending[category],
        });
      }
    }
  }

  return trends;
};

/**
 * Detects anomalous transactions, such as unusually large purchases.
 * @param transactions A list of transactions.
 * @returns An array of identified anomalies.
 */
export const detectAnomalies = (transactions: Transaction[]): Anomaly[] => {
  const expenses = transactions
    .map(tx => ({ tx, amount: getAmount(tx) }))
    .filter(x => x.amount < 0)
    .map(x => Math.abs(x.amount));

  if (expenses.length < 10) {
    return []; // Not enough data for meaningful anomaly detection
  }

  const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length;
  const stdDev = Math.sqrt(expenses.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / expenses.length);

  const anomalies: Anomaly[] = [];
  transactions.forEach(tx => {
    const amt = getAmount(tx);
    if (amt < 0) {
      const expenseAmount = Math.abs(amt);
      if (expenseAmount > mean + 3 * stdDev) { // 3 standard deviations from the mean
        anomalies.push({
          transaction: tx,
          message: `Unusually large expense of $${expenseAmount.toLocaleString()}`,
        });
      }
    }
  });

  return anomalies;
};
