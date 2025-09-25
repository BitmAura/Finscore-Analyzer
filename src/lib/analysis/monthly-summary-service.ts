import { Transaction } from '../parsing/transaction-parser';

export interface MonthlySummary {
  month: string; // e.g., "2024-09"
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  transactionCount: number;
}

export const calculateMonthlySummaries = (transactions: Transaction[]): MonthlySummary[] => {
  if (transactions.length === 0) {
    return [];
  }

  const monthlyData: { [key: string]: { totalIncome: number; totalExpenses: number; transactionCount: number } } = {};

  transactions.forEach(t => {
    try {
      // Basic date parsing, assumes DD/MM/YYYY, DD-MM-YYYY, DD-Mon-YY, etc.
      // This can be made more robust with a dedicated date library if needed.
      const dateStr = t.date.split(/[-\/]/).reverse().join('-');
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthKey = `${year}-${month}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };
      }

      if (t.credit) {
        monthlyData[monthKey].totalIncome += t.credit;
      }
      if (t.debit) {
        monthlyData[monthKey].totalExpenses += t.debit;
      }
      monthlyData[monthKey].transactionCount++;
    } catch (e) {
        // Ignore transactions with unparseable dates
        console.error(`Could not parse date: ${t.date}`);
    }
  });

  const summaries: MonthlySummary[] = Object.keys(monthlyData).map(monthKey => {
    const data = monthlyData[monthKey];
    return {
      month: monthKey,
      totalIncome: data.totalIncome,
      totalExpenses: data.totalExpenses,
      netCashFlow: data.totalIncome - data.totalExpenses,
      transactionCount: data.transactionCount,
    };
  });

  // Sort summaries by month
  return summaries.sort((a, b) => a.month.localeCompare(b.month));
};
