// Types for financial analysis data structures used throughout the application

export type Transaction = {
  id: string;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  category?: string;
  bank: string;
};

export type FinancialSummary = {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  startBalance: number;
  endBalance: number;
  transactionCount: number;
  accountsAnalyzed: number;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
};

export type RedAlert = {
  id: string;
  type: string;
  message: string;
  severity: 'High' | 'Medium' | 'Low';
  transactionId?: string;
};

export type MonthlySummary = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

export type Counterparty = {
  name: string;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
};

export type ExpenseCategory = {
  name: string;
  value: number;
};

export type AnalysisResult = {
  summary: FinancialSummary;
  redAlerts: RedAlert[];
  monthlySummary: MonthlySummary[];
  counterparties: Counterparty[];
  transactions: Transaction[];
  expenseBreakdown: ExpenseCategory[];
  balanceHistory: { date: string; balance: number }[];
  riskScore: { score: number; level: 'Low' | 'Medium' | 'High' };
};

export type CustomRiskProfile = {
  id: string;
  name: string;
  description?: string;
  weights: {
    chequeBounces?: number; // Weight for cheque bounce related alerts
    unusualTransactions?: number; // Weight for general unusual transaction alerts
    netCashFlowImpact?: number; // Weight for negative net cash flow
    // Add more risk factors as needed
  };
  thresholds: {
    netCashFlowRatio?: number; // e.g., if net cash flow / total income < threshold, increase risk
    // Add more thresholds as needed
  };
};

export type ApiResponse = {
  summary?: FinancialSummary;
  redAlerts?: RedAlert[];
  monthlySummary?: MonthlySummary[];
  counterparties?: Counterparty[];
  transactions?: Transaction[];
  expenseBreakdown?: ExpenseCategory[];
  balanceHistory?: { date: string; balance: number }[];
  riskScore?: { score: number; level: 'Low' | 'Medium' | 'High' };
  processingErrors?: string[];
  error?: string;
};
