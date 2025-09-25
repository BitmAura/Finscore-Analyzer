// src/lib/export.ts
import * as XLSX from 'xlsx';
import { AnalysisResult } from '../types/analysis';

/**
 * Creates a multi-sheet Excel workbook from analysis data and triggers a download.
 * @param analysisData - The full analysis result object.
 * @param fileName - The desired file name for the downloaded Excel report.
 */
export const exportToExcel = (analysisData: AnalysisResult, fileName: string = 'FinScore_Analysis_Report.xlsx') => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // --- 1. Summary Sheet ---
  const summaryData = [
    { Metric: 'Risk Level', Value: analysisData.riskScore.level },
    { Metric: 'Risk Score', Value: `${analysisData.riskScore.score}/100` },
    { Metric: '---', Value: '---' }, // Separator
    { Metric: 'Total Income', Value: analysisData.summary.totalIncome },
    { Metric: 'Total Expenses', Value: analysisData.summary.totalExpenses },
    { Metric: 'Net Cash Flow', Value: analysisData.summary.netCashFlow },
    { Metric: '---', Value: '---' }, // Separator
    { Metric: 'Average Monthly Income', Value: analysisData.summary.avgMonthlyIncome },
    { Metric: 'Average Monthly Expenses', Value: analysisData.summary.avgMonthlyExpenses },
    { Metric: '---', Value: '---' }, // Separator
    { Metric: 'Start Balance', Value: analysisData.summary.startBalance },
    { Metric: 'End Balance', Value: analysisData.summary.endBalance },
    { Metric: '---', Value: '---' }, // Separator
    { Metric: 'Total Transactions', Value: analysisData.summary.transactionCount },
    { Metric: 'Accounts Analyzed', Value: analysisData.summary.accountsAnalyzed },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });
  // Set column widths for summary
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Analysis Summary');

  // --- 2. Transactions Sheet ---
  const transactionsForSheet = analysisData.transactions.map((tx) => ({
    Date: tx.date,
    Description: tx.description,
    Debit: tx.debit,
    Credit: tx.credit,
    Balance: tx.balance,
    Bank: tx.bank,
    Category: tx.category || 'N/A',
  }));
  const wsTransactions = XLSX.utils.json_to_sheet(transactionsForSheet);
  // Set column widths for transactions
  wsTransactions['!cols'] = [{ wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

  // --- 3. Red Alerts Sheet ---
  const redAlertsForSheet = analysisData.redAlerts.map((alert) => ({
    Severity: alert.severity,
    'Alert Type': alert.type,
    Details: alert.message,
  }));
  const wsRedAlerts = XLSX.utils.json_to_sheet(redAlertsForSheet);
  // Set column widths for red alerts
  wsRedAlerts['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsRedAlerts, 'Red Alerts');

  // --- 4. Counterparties Sheet ---
  const counterpartiesForSheet = analysisData.counterparties.map((cp) => ({
    'Counterparty Name': cp.name,
    'Total Sent (₹)': cp.totalSent,
    'Total Received (₹)': cp.totalReceived,
    'Transaction Count': cp.transactionCount,
  }));
  const wsCounterparties = XLSX.utils.json_to_sheet(counterpartiesForSheet);
  // Set column widths for counterparties
  wsCounterparties['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsCounterparties, 'Counterparties');

  // --- Write and Download Workbook ---
  XLSX.writeFile(wb, fileName);
};
