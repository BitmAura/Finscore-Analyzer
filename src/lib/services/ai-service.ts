/**
 * AI Service - OpenAI Integration for Financial Analysis
 * Provides AI-powered insights, executive summaries, and fraud detection
 */

import OpenAI from 'openai';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
    });
  }

  async generateExecutiveSummary(
    summary: any,
    redAlerts: any[],
    monthlySummaries: any[],
    categorizedTransactions: any[],
    counterparties: any[],
    riskAssessment: any
  ): Promise<string> {
    try {
      const prompt = `
        Generate a professional executive summary for a bank statement analysis:

        Financial Summary:
        - Total Income: ₹${summary.totalIncome || 0}
        - Total Expenses: ₹${summary.totalExpenses || 0}
        - Net Cash Flow: ₹${summary.netCashFlow || 0}
        - Risk Level: ${riskAssessment?.riskLevel || 'Unknown'}

        Key Insights:
        - ${redAlerts?.length || 0} red alerts identified
        - ${monthlySummaries?.length || 0} months of data analyzed
        - ${categorizedTransactions?.length || 0} transactions categorized
        - ${counterparties?.length || 0} counterparties identified

        Please provide a concise, professional summary highlighting the key financial health indicators and any concerns.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Unable to generate summary at this time.';
    } catch (error) {
      console.error('AI Summary Generation Error:', error);
      return `Financial Analysis Summary: Total income ₹${summary.totalIncome || 0}, expenses ₹${summary.totalExpenses || 0}. ${redAlerts?.length || 0} alerts identified.`;
    }
  }

  async detectFraud(transactions: any[]): Promise<any> {
    try {
      const suspiciousPatterns: string[] = [];

      const largeRoundNumbers = transactions.filter((tx: any) =>
        (tx.debit > 50000 || tx.credit > 50000) &&
        ((tx.debit || 0) % 1000 === 0 || (tx.credit || 0) % 1000 === 0)
      );

      if (largeRoundNumbers.length > 0) {
        suspiciousPatterns.push(`${largeRoundNumbers.length} large round number transactions`);
      }

      const smallTransactions = transactions.filter((tx: any) =>
        ((tx.debit || 0) > 0 && (tx.debit || 0) < 100) || ((tx.credit || 0) > 0 && (tx.credit || 0) < 100)
      );

      if (smallTransactions.length > transactions.length * 0.3) {
        suspiciousPatterns.push('High frequency of small transactions');
      }

      const fraudScore = Math.min(suspiciousPatterns.length * 15, 100);
      const fraudLevel = fraudScore > 70 ? 'High' : fraudScore > 30 ? 'Medium' : 'Low';

      return {
        fraudScore,
        fraudLevel,
        suspiciousPatterns,
        recommendations: fraudScore > 50 ? ['Manual review recommended', 'Verify transaction authenticity'] : ['No immediate concerns']
      };
    } catch (error) {
      console.error('Fraud Detection Error:', error);
      return { fraudScore: 0, fraudLevel: 'Low', suspiciousPatterns: [], recommendations: [] };
    }
  }

  async predictCashFlow(monthlySummaries: any[]): Promise<any> {
    try {
      if (!monthlySummaries || monthlySummaries.length < 2) {
        return { prediction: 'Insufficient data for prediction', confidence: 0 };
      }

      const recentMonths = monthlySummaries.slice(-3);
      const avgCashFlow = recentMonths.reduce((sum: number, month: any) => sum + (month.netCashFlow || 0), 0) / recentMonths.length;

      const trend = avgCashFlow > 0 ? 'positive' : 'negative';
      const confidence = Math.min(monthlySummaries.length * 20, 80);

      return {
        prediction: `Cash flow trend is ${trend} with average monthly flow of ₹${avgCashFlow.toFixed(0)}`,
        confidence,
        averageMonthlyFlow: avgCashFlow,
        trend
      };
    } catch (error) {
      console.error('Cash Flow Prediction Error:', error);
      return { prediction: 'Unable to predict cash flow', confidence: 0 };
    }
  }
}

export const aiService = new AIService();

