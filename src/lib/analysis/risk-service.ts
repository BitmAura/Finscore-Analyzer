import { Transaction } from '../parsing/transaction-parser';

export interface ChequeReturn {
  date: Date;
  amount: number;
  reason: string;
  partyName?: string;
  frequency: number;
}

export interface MonthlyTrend {
  month: string;
  credits: number;
  debits: number;
  netFlow: number;
  endBalance: number;
}

export interface CashflowAnalysis {
  monthlyTrends: MonthlyTrend[];
  netCashflow: number;
  positiveMonths: number;
  negativeMonths: number;
  volatility: number;
}

export interface RiskFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  score: number;
}

export interface RiskAssessment {
  overallScore: number; // 0-100
  factors: RiskFactor[];
  chequeReturnRisk: number;
  cashflowStability: number;
  transactionPatterns: number;
  recommendations: string[];
}

export function analyzeTransactionPatterns(transactions: Transaction[]): { highRiskTransactions: Transaction[] } {
    const highRiskKeywords = ['bet', 'casino', 'gambling', 'lottery'];
    const highRiskTransactions = transactions.filter(t => {
        const description = t.description.toLowerCase();
        return highRiskKeywords.some(keyword => description.includes(keyword));
    });

    return { highRiskTransactions };
}

export function assessRisk(transactions: Transaction[]): RiskAssessment {
    const factors: RiskFactor[] = [];
    let totalScore = 100;

    // Cheque return risk
    const chequeReturns = detectChequeReturns(transactions);
    const chequeReturnRisk = Math.min(chequeReturns.length * 15, 60);
    if (chequeReturns.length > 0) {
        factors.push({
            factor: 'Cheque Returns',
            impact: chequeReturns.length > 2 ? 'high' : 'medium',
            description: `${chequeReturns.length} cheque returns detected, indicating potential liquidity issues.`,
            score: chequeReturnRisk
        });
        totalScore -= chequeReturnRisk;
    }

    // Cashflow stability
    const cashflow = analyzeCashflow(transactions);
    const volatilityRisk = Math.min(cashflow.volatility / 10000, 40);
    if (cashflow.volatility > 50000) {
        factors.push({
            factor: 'Cashflow Volatility',
            impact: 'high',
            description: 'High volatility in monthly cashflow, suggesting unstable financial situation.',
            score: volatilityRisk
        });
        totalScore -= volatilityRisk;
    }

    // Low balance risk
    const lowBalance = Math.min(...transactions.map(t => t.balance).filter(b => b !== null) as number[]);
    if (lowBalance < 1000) {
        const lowBalanceRisk = 25;
        factors.push({
            factor: 'Low Balance Risk',
            impact: 'high',
            description: 'Account balance frequently drops below a minimum threshold, increasing risk of default.',
            score: lowBalanceRisk
        });
        totalScore -= lowBalanceRisk;
    }

    // Transaction pattern analysis
    const transactionPatterns = analyzeTransactionPatterns(transactions);
    const patternRisk = transactionPatterns.highRiskTransactions.length * 10;
    if (patternRisk > 0) {
        factors.push({
            factor: 'High-Risk Transactions',
            impact: 'medium',
            description: `Detected ${transactionPatterns.highRiskTransactions.length} high-risk transactions (e.g., gambling, large unexplained transfers).`,
            score: patternRisk
        });
        totalScore -= patternRisk;
    }

    const recommendations = generateRiskRecommendations(factors);

    return {
        overallScore: Math.max(0, totalScore),
        factors,
        chequeReturnRisk,
        cashflowStability: 100 - volatilityRisk,
        transactionPatterns: 100 - patternRisk,
        recommendations
    };
}

function generateRiskRecommendations(factors: RiskFactor[]): string[] {
    const recommendations: string[] = [];
    
    factors.forEach(factor => {
        switch (factor.factor) {
            case 'Cheque Returns':
                recommendations.push('Monitor cheque clearing patterns and maintain adequate balance');
                break;
            case 'Cashflow Volatility':
                recommendations.push('Implement cash flow forecasting and maintain higher reserves');
                break;
            case 'Low Balance Risk':
                recommendations.push('Maintain minimum balance to avoid overdraft charges');
                break;
            case 'High-Risk Transactions':
                recommendations.push('Review high-risk spending patterns and consider their impact on financial stability.');
                break;
        }
    });

    if (recommendations.length === 0) {
        recommendations.push('Financial profile appears stable with low risk indicators');
    }

    return recommendations;
}

function detectChequeReturns(transactions: Transaction[]): ChequeReturn[] {
    const chequeReturnKeywords = [
      'cheque return', 'chq ret', 'return cheque', 'bounced cheque',
      'insufficient funds', 'refer to drawer', 'payment stopped'
    ]

    const returns: ChequeReturn[] = []
    
    transactions.forEach(transaction => {
      const description = transaction.description.toLowerCase()
      const isChequeReturn = chequeReturnKeywords.some(keyword => 
        description.includes(keyword.toLowerCase())
      )
      
      if (isChequeReturn) {
        returns.push({
          date: new Date(transaction.date),
          amount: Math.abs(transaction.debit || transaction.credit || 0),
          reason: extractReturnReason(transaction.description),
          partyName: extractPartyName(transaction.description),
          frequency: 1 // Could be enhanced to detect recurring returns
        })
      }
    })

    return returns
}

function analyzeCashflow(transactions: Transaction[]): CashflowAnalysis {
    // Group transactions by month
    const monthlyData = new Map<string, { credits: number; debits: number; endBalance: number }>()
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = monthlyData.get(monthKey) || { credits: 0, debits: 0, endBalance: 0 }
      
      if (t.credit) {
        existing.credits += t.credit
      } else if (t.debit) {
        existing.debits += Math.abs(t.debit)
      }
      existing.endBalance = t.balance || 0
      
      monthlyData.set(monthKey, existing)
    })

    const monthlyTrends: MonthlyTrend[] = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      credits: data.credits,
      debits: data.debits,
      netFlow: data.credits - data.debits,
      endBalance: data.endBalance
    }))

    const netFlows = monthlyTrends.map(t => t.netFlow)
    const positiveMonths = netFlows.filter(f => f > 0).length
    const negativeMonths = netFlows.filter(f => f < 0).length
    
    // Calculate volatility (standard deviation of net flows)
    const avgNetFlow = netFlows.reduce((sum, f) => sum + f, 0) / netFlows.length
    const volatility = Math.sqrt(
      netFlows.reduce((sum, f) => sum + Math.pow(f - avgNetFlow, 2), 0) / netFlows.length
    )

    return {
      monthlyTrends,
      netCashflow: netFlows.reduce((sum, f) => sum + f, 0),
      positiveMonths,
      negativeMonths,
      volatility
    }
}

function extractReturnReason(description: string): string {
    if (description.toLowerCase().includes('insufficient')) return 'Insufficient Funds'
    if (description.toLowerCase().includes('refer')) return 'Refer to Drawer'
    if (description.toLowerCase().includes('stopped')) return 'Payment Stopped'
    return 'Unknown'
}

function extractPartyName(description: string): string {
    // Simple regex to extract party name (could be enhanced)
    const match = description.match(/(?:to|from)\s+([A-Za-z\s]+)/i)
    return match ? match[1].trim() : 'Unknown'
}
