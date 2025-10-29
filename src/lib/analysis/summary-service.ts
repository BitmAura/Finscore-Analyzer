import { Transaction } from '../parsing/transaction-parser';
import { CategorizedTransaction } from './categorization-service';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  highestBalance: number;
  lowestBalance: number;
  averageBalance: number;
  totalTransactions: number;
  averageTransactionSize: number;
  analysisStartDate: string;
  analysisEndDate: string;
  largestIncome: Transaction | null;
  largestExpense: Transaction | null;
  incomeTransactionCount: number;
  expenseTransactionCount: number;
  savingsRate: number; // Percentage
}

export function analyzeSummary(transactions: CategorizedTransaction[]): FinancialSummary {
  if (transactions.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      averageMonthlyIncome: 0,
      averageMonthlyExpenses: 0,
      highestBalance: 0,
      lowestBalance: 0,
      averageBalance: 0,
      totalTransactions: 0,
      averageTransactionSize: 0,
      analysisStartDate: new Date().toISOString().split('T')[0],
      analysisEndDate: new Date().toISOString().split('T')[0],
      largestIncome: null,
      largestExpense: null,
      incomeTransactionCount: 0,
      expenseTransactionCount: 0,
      savingsRate: 0
    };
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalIncome = 0;
  let totalExpenses = 0;
  let highestBalance = -Infinity;
  let lowestBalance = Infinity;
  let balanceSum = 0;
  let largestIncome: Transaction | null = null;
  let largestExpense: Transaction | null = null;
  let incomeTransactionCount = 0;
  let expenseTransactionCount = 0;

  // Calculate metrics
  sortedTransactions.forEach(tx => {
    const credit = tx.credit || 0;
    const debit = tx.debit || 0;

    if (credit > 0) {
      totalIncome += credit;
      incomeTransactionCount++;
      if (!largestIncome || credit > (largestIncome.credit || 0)) {
        largestIncome = tx;
      }
    }

    if (debit > 0) {
      totalExpenses += debit;
      expenseTransactionCount++;
      if (!largestExpense || debit > (largestExpense.debit || 0)) {
        largestExpense = tx;
      }
    }

    const balance = tx.balance || 0;
    if (balance > highestBalance) highestBalance = balance;
    if (balance < lowestBalance) lowestBalance = balance;
    balanceSum += balance;
  });

  const netCashFlow = totalIncome - totalExpenses;
  const averageBalance = balanceSum / sortedTransactions.length;

  // Calculate date range
  const analysisStartDate = sortedTransactions[0].date;
  const analysisEndDate = sortedTransactions[sortedTransactions.length - 1].date;

  // Calculate months in period
  const startDate = new Date(analysisStartDate);
  const endDate = new Date(analysisEndDate);
  const monthsDiff = Math.max(1,
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth()) + 1
  );

  const averageMonthlyIncome = totalIncome / monthsDiff;
  const averageMonthlyExpenses = totalExpenses / monthsDiff;
  const totalAmount = totalIncome + totalExpenses;
  const averageTransactionSize = totalAmount / sortedTransactions.length;

  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    averageMonthlyIncome,
    averageMonthlyExpenses,
    highestBalance: highestBalance === -Infinity ? 0 : highestBalance,
    lowestBalance: lowestBalance === Infinity ? 0 : lowestBalance,
    averageBalance,
    totalTransactions: sortedTransactions.length,
    averageTransactionSize,
    analysisStartDate,
    analysisEndDate,
    largestIncome,
    largestExpense,
    incomeTransactionCount,
    expenseTransactionCount,
    savingsRate
  };
}

// Get income vs expense breakdown
export interface IncomeExpenseBreakdown {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export function getIncomeExpenseBreakdown(transactions: CategorizedTransaction[]): IncomeExpenseBreakdown[] {
  const monthlyData = new Map<string, IncomeExpenseBreakdown>();

  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        month: monthKey,
        income: 0,
        expenses: 0,
        net: 0
      });
    }

    const data = monthlyData.get(monthKey)!;
    const credit = tx.credit || 0;
    const debit = tx.debit || 0;

    data.income += credit;
    data.expenses += debit;
    data.net += (credit - debit);
  });

  return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
}
