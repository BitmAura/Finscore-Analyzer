import { FinancialSummary } from './analysis/summary-service';
import { RedAlert } from './analysis/red-alert-service';
import { MonthlySummary } from './analysis/monthly-summary-service';
import { Counterparty } from './analysis/counterparty-service';
import { RiskAssessment } from './analysis/risk-service';
import { Transaction } from './parsing/transaction-parser';
import { aiService } from './services/ai-service';

export async function generateExecutiveSummary(
  summary: FinancialSummary,
  redAlerts: RedAlert[],
  monthlySummaries: MonthlySummary[],
  categorizedTransactions: Transaction[],
  counterparties: Counterparty[],
  riskAssessment: RiskAssessment
): Promise<string> {
  return aiService.generateExecutiveSummary(
    summary,
    redAlerts,
    monthlySummaries,
    categorizedTransactions,
    counterparties,
    riskAssessment
  );
}

export async function detectFraud(transactions: Transaction[]): Promise<any> {
  return aiService.detectFraud(transactions);
}

export async function predictCashFlow(monthlySummaries: MonthlySummary[]): Promise<any> {
  return aiService.predictCashFlow(monthlySummaries);
}