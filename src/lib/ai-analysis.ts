import { FinancialSummary } from './analysis/summary-service';
import { RedAlert } from './analysis/red-alert-service';
import { MonthlySummary } from './analysis/monthly-summary-service';
import { Counterparty } from './analysis/counterparty-service';
import { RiskAssessment } from './analysis/risk-service';
import { Transaction } from './parsing/transaction-parser';

export async function generateExecutiveSummary(
  summary: FinancialSummary,
  redAlerts: RedAlert[],
  monthlySummaries: MonthlySummary[],
  categorizedTransactions: Transaction[],
  counterparties: Counterparty[],
  riskAssessment: RiskAssessment
): Promise<string> {
  // This is a placeholder for AI integration.
  // In a real scenario, you would call an external AI API here (e.g., Google Gemini, OpenAI GPT).
  // The prompt would be constructed using the provided analysis data.

  const prompt = `
    Generate a concise executive summary based on the following financial analysis data:

    Overall Summary:
    - Total Income: $${summary.totalIncome.toFixed(2)}
    - Total Expenses: $${summary.totalExpenses.toFixed(2)}
    - Net Cash Flow: $${summary.netCashFlow.toFixed(2)}

    Red Alerts:
    ${redAlerts.length > 0 ? redAlerts.map(alert => `- ${alert.type}: ${alert.message}`).join('\n    ') : 'None'}

    Monthly Cash Flow Trends (last 3 months):
    ${monthlySummaries.slice(-3).map(m => `- ${m.month}: Income $${m.totalIncome.toFixed(2)}, Expenses $${m.totalExpenses.toFixed(2)}, Net $${m.netCashFlow.toFixed(2)}`).join('\n    ')}

    Risk Assessment:
    - Score: ${riskAssessment.overallScore}
    - Details: ${riskAssessment.recommendations.join(', ')}

    Key Counterparties (Top 3 by amount):
    ${counterparties.slice(0, 3).map(c => `- ${c.name}: $${(c.totalSent + c.totalReceived).toFixed(2)} (${c.transactionCount} transactions)`).join('\n    ')}

    Based on this data, provide a high-level executive summary, highlighting key financial health indicators, significant trends, and any major risks or opportunities.
    The summary should be professional, objective, and no more than 200 words.
  `;

  // Mock AI response for now
  const mockSummary = `
    The financial analysis indicates a net positive cash flow of $${summary.netCashFlow.toFixed(2)}, driven by a total income of $${summary.totalIncome.toFixed(2)} against total expenses of $${summary.totalExpenses.toFixed(2)}. 
    ${redAlerts.length > 0 ? `Several red alerts were detected, including ${redAlerts.map(a => a.type).join(', ')}, warranting further investigation.` : 'No significant red alerts were identified.'}
    Monthly trends show ${monthlySummaries.length > 0 && monthlySummaries[monthlySummaries.length - 1].netCashFlow > 0 ? 'consistent positive cash flow' : 'fluctuating cash flow'}. 
    The overall risk assessment score is ${riskAssessment.overallScore}, with details indicating ${riskAssessment.recommendations.join(', ')}. 
    Key financial relationships are primarily with ${counterparties.slice(0, 1).map(c => c.name).join(', ') || 'various entities'}. 
    Overall, a financial health appears ${summary.netCashFlow > 0 ? 'sound with areas for optimization' : 'to require attention to improve cash flow and mitigate identified risks'}.
  `;

  return mockSummary;
}