import { Transaction } from '../parsing/transaction-parser';

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  highestBalance: number;
  lowestBalance: number;
  topExpenseCategories: { category: string; amount: number }[];
  largestTransaction: { amount: number; description: string; date: string };
  savingsRate: number;
  transactionCount: number;
}

export interface MonthlySummariesResult {
  monthlySummaries: MonthlySummary[];
  trends: {
    incomeTrend: 'increasing' | 'decreasing' | 'stable';
    expenseTrend: 'increasing' | 'decreasing' | 'stable';
    savingsTrend: 'increasing' | 'decreasing' | 'stable';
  };
  insights: string[];
}

/**
 * Generates monthly summaries from transactions
 */
export function generateMonthlySummaries(transactions: Transaction[]): MonthlySummariesResult {
  const monthlyData: { [monthKey: string]: Transaction[] } = {};

  // Group transactions by month
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = [];
    }
    monthlyData[monthKey].push(tx);
  });

  const monthlySummaries: MonthlySummary[] = [];

  // Process each month
  Object.keys(monthlyData)
    .sort()
    .forEach(monthKey => {
      const monthTransactions = monthlyData[monthKey];

      let totalIncome = 0;
      let totalExpenses = 0;
      let balances: number[] = [];
      let largestTransaction = { amount: 0, description: '', date: '' };

      // Process transactions
      monthTransactions.forEach(tx => {
        const amount = tx.credit || 0;
        const expense = tx.debit || 0;

        if (amount > 0) {
          totalIncome += amount;
        }
        if (expense > 0) {
          totalExpenses += expense;
        }

        // Track balance if available
        if (tx.balance !== undefined) {
          balances.push(tx.balance);
        }

        // Track largest transaction
        const transactionAmount = Math.max(amount, expense);
        if (transactionAmount > largestTransaction.amount) {
          largestTransaction = {
            amount: transactionAmount,
            description: tx.description,
            date: tx.date
          };
        }
      });

      const netCashFlow = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

      // Calculate expense categories
      const categoryTotals: { [category: string]: number } = {};
      monthTransactions.forEach(tx => {
        if (tx.debit && tx.debit > 0) {
          const category = (tx as any).category || 'Uncategorized';
          categoryTotals[category] = (categoryTotals[category] || 0) + tx.debit;
        }
      });

      const topExpenseCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      monthlySummaries.push({
        month: formatMonthKey(monthKey),
        totalIncome,
        totalExpenses,
        netCashFlow,
        highestBalance: balances.length > 0 ? Math.max(...balances) : 0,
        lowestBalance: balances.length > 0 ? Math.min(...balances) : 0,
        topExpenseCategories,
        largestTransaction,
        savingsRate,
        transactionCount: monthTransactions.length
      });
    });

  // Calculate trends
  const trends = calculateTrends(monthlySummaries);

  // Generate insights
  const insights = generateInsights(monthlySummaries);

  return {
    monthlySummaries,
    trends,
    insights
  };
}

/**
 * Calculate trends across months
 */
function calculateTrends(summaries: MonthlySummary[]) {
  if (summaries.length < 2) {
    return {
      incomeTrend: 'stable' as const,
      expenseTrend: 'stable' as const,
      savingsTrend: 'stable' as const
    };
  }

  const recent = summaries.slice(-3); // Last 3 months
  const older = summaries.slice(0, -3); // Earlier months

  const recentAvgIncome = recent.reduce((sum, m) => sum + m.totalIncome, 0) / recent.length;
  const olderAvgIncome = older.length > 0 ? older.reduce((sum, m) => sum + m.totalIncome, 0) / older.length : recentAvgIncome;

  const recentAvgExpenses = recent.reduce((sum, m) => sum + m.totalExpenses, 0) / recent.length;
  const olderAvgExpenses = older.length > 0 ? older.reduce((sum, m) => sum + m.totalExpenses, 0) / older.length : recentAvgExpenses;

  const recentAvgSavings = recent.reduce((sum, m) => sum + m.netCashFlow, 0) / recent.length;
  const olderAvgSavings = older.length > 0 ? older.reduce((sum, m) => sum + m.netCashFlow, 0) / older.length : recentAvgSavings;

  const calculateTrend = (recent: number, older: number): 'increasing' | 'decreasing' | 'stable' => {
    const change = ((recent - older) / older) * 100;
    if (change > 10) return 'increasing' as const;
    if (change < -10) return 'decreasing' as const;
    return 'stable' as const;
  };

  return {
    incomeTrend: calculateTrend(recentAvgIncome, olderAvgIncome),
    expenseTrend: calculateTrend(recentAvgExpenses, olderAvgExpenses),
    savingsTrend: calculateTrend(recentAvgSavings, olderAvgSavings)
  };
}

/**
 * Generate insights from monthly data
 */
function generateInsights(summaries: MonthlySummary[]): string[] {
  const insights: string[] = [];

  if (summaries.length === 0) return insights;

  // Savings rate insights
  const avgSavingsRate = summaries.reduce((sum, m) => sum + m.savingsRate, 0) / summaries.length;
  if (avgSavingsRate > 20) {
    insights.push(`Excellent savings rate of ${avgSavingsRate.toFixed(1)}% - you're building wealth effectively`);
  } else if (avgSavingsRate < 0) {
    insights.push(`Negative savings rate detected - consider reducing expenses or increasing income`);
  }

  // Expense trend insights
  const recentSummaries = summaries.slice(-3);
  if (recentSummaries.length >= 2) {
    const expenseGrowth = recentSummaries[recentSummaries.length - 1].totalExpenses - recentSummaries[0].totalExpenses;
    if (expenseGrowth > 0) {
      insights.push(`Expenses have increased by ₹${expenseGrowth.toLocaleString('en-IN')} recently`);
    }
  }

  // Balance insights
  const balances = summaries.filter(m => m.highestBalance > 0);
  if (balances.length > 0) {
    const avgBalance = balances.reduce((sum, m) => sum + m.highestBalance, 0) / balances.length;
    insights.push(`Average highest monthly balance: ₹${avgBalance.toLocaleString('en-IN')}`);
  }

  return insights;
}

/**
 * Format month key to readable format
 */
function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}