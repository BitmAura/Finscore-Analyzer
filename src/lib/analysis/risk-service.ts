import { Transaction } from '../parsing/transaction-parser';
import { CategorizedTransaction } from './categorization-service';

// Internal interfaces (not exported)
interface ChequeReturn {
  date: Date;
  amount: number;
  reason: string;
  partyName?: string;
  frequency: number;
}

interface MonthlyTrend {
  month: string;
  credits: number;
  debits: number;
  netFlow: number;
  endBalance: number;
}

interface CashflowAnalysis {
  monthlyTrends: MonthlyTrend[];
  netCashflow: number;
  positiveMonths: number;
  negativeMonths: number;
  volatility: number;
}

interface RiskFactor {
  factor: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  impact: number; // 0-100
}

export interface RiskAssessment {
  overallRiskScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskFactors: RiskFactor[];
  recommendations: string[];
  financialHealthScore: number; // 0-100
  creditworthinessScore: number; // 0-100
}

/**
 * Analyzes transaction patterns for high-risk indicators
 * @param transactions Array of transactions to analyze
 * @returns RiskAssessment object with overall risk score and factors
 * @internal Used by analysis-worker.ts
 */
export function analyzeTransactionPatterns(transactions: Transaction[]): RiskAssessment {
    const highRiskKeywords = ['bet', 'casino', 'gambling', 'lottery'];
    const highRiskTransactions = transactions.filter(t => {
        const description = t.description.toLowerCase();
        return highRiskKeywords.some(keyword => description.includes(keyword));
    });

    // Create a basic risk assessment
    let riskScore = 0;
    const riskFactors: RiskFactor[] = [];
    const recommendations: string[] = [];

    if (highRiskTransactions.length > 0) {
        riskFactors.push({
            factor: 'High-Risk Transactions',
            severity: highRiskTransactions.length > 5 ? 'High' : 'Medium',
            description: `${highRiskTransactions.length} high-risk transactions detected`,
            impact: Math.min(highRiskTransactions.length * 5, 30)
        });
        riskScore += riskFactors[riskFactors.length - 1].impact;
        recommendations.push('Review high-risk transactions for legitimacy');
    }

    return {
        overallRiskScore: Math.min(riskScore, 100),
        riskLevel: riskScore > 70 ? 'Critical' : riskScore > 50 ? 'High' : riskScore > 30 ? 'Medium' : 'Low',
        riskFactors,
        recommendations,
        financialHealthScore: Math.max(100 - riskScore, 0),
        creditworthinessScore: Math.max(100 - (riskScore * 0.8), 0)
    };
}

/**
 * Comprehensive risk assessment for categorized transactions
 * @param transactions Array of categorized transactions to assess
 * @param summary Financial summary object with totals and metrics
 * @returns Complete RiskAssessment with factors and recommendations
 * @internal Helper function for detailed risk analysis
 */
export function assessRisk(
  transactions: CategorizedTransaction[],
  summary: any
): RiskAssessment {
  const riskFactors: RiskFactor[] = [];
  let totalRiskScore = 0;

  // 1. Check for low balance
  if (summary.lowestBalance < 10000) {
    const severity = summary.lowestBalance < 1000 ? 'Critical' :
                     summary.lowestBalance < 5000 ? 'High' : 'Medium';
    riskFactors.push({
      factor: 'Low Account Balance',
      severity,
      description: `Lowest balance of ₹${summary.lowestBalance.toFixed(2)} indicates potential cash flow issues`,
      impact: severity === 'Critical' ? 25 : severity === 'High' ? 15 : 10
    });
    totalRiskScore += riskFactors[riskFactors.length - 1].impact;
  }

  // 2. Check for high expense ratio
  const expenseRatio = summary.totalIncome > 0 ?
    (summary.totalExpenses / summary.totalIncome) * 100 : 0;

  if (expenseRatio > 90) {
    const severity = expenseRatio > 110 ? 'Critical' :
                     expenseRatio > 100 ? 'High' : 'Medium';
    riskFactors.push({
      factor: 'High Expense Ratio',
      severity,
      description: `Expenses are ${expenseRatio.toFixed(1)}% of income - very high burn rate`,
      impact: severity === 'Critical' ? 20 : severity === 'High' ? 15 : 10
    });
    totalRiskScore += riskFactors[riskFactors.length - 1].impact;
  }

  // 3. Check for frequent ATM withdrawals (potential gambling/cash business)
  const atmTransactions = transactions.filter(tx =>
    tx.description.toLowerCase().includes('atm') ||
    tx.description.toLowerCase().includes('withdrawal')
  );

  if (atmTransactions.length > 20) {
    const atmAmount = atmTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const atmRatio = (atmAmount / summary.totalExpenses) * 100;

    if (atmRatio > 30) {
      riskFactors.push({
        factor: 'High ATM Usage',
        severity: atmRatio > 50 ? 'High' : 'Medium',
        description: `${atmTransactions.length} ATM withdrawals (${atmRatio.toFixed(1)}% of expenses) - potential red flag`,
        impact: atmRatio > 50 ? 15 : 10
      });
      totalRiskScore += riskFactors[riskFactors.length - 1].impact;
    }
  }

  // 4. Check for bounced cheques
  const bouncedCheques = transactions.filter(tx =>
    tx.description.toLowerCase().includes('bounce') ||
    tx.description.toLowerCase().includes('dishonor') ||
    tx.description.toLowerCase().includes('return')
  );

  if (bouncedCheques.length > 0) {
    riskFactors.push({
      factor: 'Bounced Cheques/Payments',
      severity: bouncedCheques.length > 3 ? 'Critical' : 'High',
      description: `${bouncedCheques.length} bounced payment(s) detected - serious credit risk`,
      impact: bouncedCheques.length > 3 ? 30 : 20
    });
    totalRiskScore += riskFactors[riskFactors.length - 1].impact;
  }

  // 5. Check for loan EMIs
  const loanTransactions = transactions.filter(tx =>
    tx.description.toLowerCase().includes('emi') ||
    tx.description.toLowerCase().includes('loan')
  );

  if (loanTransactions.length > 0) {
    const loanAmount = loanTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
    const loanRatio = (loanAmount / summary.totalIncome) * 100;

    if (loanRatio > 40) {
      riskFactors.push({
        factor: 'High Debt Burden',
        severity: loanRatio > 60 ? 'High' : 'Medium',
        description: `Loan EMIs are ${loanRatio.toFixed(1)}% of income - high debt burden`,
        impact: loanRatio > 60 ? 15 : 10
      });
      totalRiskScore += riskFactors[riskFactors.length - 1].impact;
    }
  }

  // 6. Check for gambling transactions
  const gamblingKeywords = ['casino', 'bet', 'lottery', 'gambling', 'poker', 'rummy'];
  const gamblingTransactions = transactions.filter(tx =>
    gamblingKeywords.some(keyword => tx.description.toLowerCase().includes(keyword))
  );

  if (gamblingTransactions.length > 0) {
    riskFactors.push({
      factor: 'Gambling Activity',
      severity: 'High',
      description: `${gamblingTransactions.length} gambling-related transaction(s) detected`,
      impact: 20
    });
    totalRiskScore += 20;
  }

  // 7. Check for irregular income (freelancers/gig workers)
  const salaryTransactions = transactions.filter(tx =>
    tx.category === 'Salary & Income' && (tx.credit || 0) > 10000
  );

  if (salaryTransactions.length < 3 && transactions.length > 30) {
    riskFactors.push({
      factor: 'Irregular Income Pattern',
      severity: 'Medium',
      description: 'No consistent salary deposits detected - income instability',
      impact: 10
    });
    totalRiskScore += 10;
  }

  // Calculate risk level
  const overallRiskScore = Math.min(totalRiskScore, 100);
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';

  if (overallRiskScore < 25) riskLevel = 'Low';
  else if (overallRiskScore < 50) riskLevel = 'Medium';
  else if (overallRiskScore < 75) riskLevel = 'High';
  else riskLevel = 'Critical';

  // Calculate financial health score (inverse of risk)
  const financialHealthScore = Math.max(0, 100 - overallRiskScore);

  // Calculate creditworthiness
  let creditworthinessScore = 100;
  creditworthinessScore -= (bouncedCheques.length * 15);
  creditworthinessScore -= (expenseRatio > 100 ? 20 : 0);
  creditworthinessScore -= (summary.lowestBalance < 1000 ? 15 : 0);
  creditworthinessScore = Math.max(0, Math.min(100, creditworthinessScore));

  // Generate recommendations
  const recommendations: string[] = [];

  if (summary.savingsRate < 10) {
    recommendations.push('Increase savings rate to at least 20% of income');
  }
  if (expenseRatio > 80) {
    recommendations.push('Reduce discretionary spending - expenses are too high');
  }
  if (bouncedCheques.length > 0) {
    recommendations.push('Maintain sufficient balance to avoid payment bounces');
  }
  if (atmTransactions.length > 15) {
    recommendations.push('Use digital payments instead of cash withdrawals');
  }
  if (summary.lowestBalance < 5000) {
    recommendations.push('Build emergency fund of at least 3 months expenses');
  }

  // If low risk, add positive recommendations
  if (riskLevel === 'Low') {
    recommendations.push('Excellent financial discipline - maintain this pattern');
    recommendations.push('Consider increasing investments for wealth building');
  }

  return {
    overallRiskScore,
    riskLevel,
    riskFactors,
    recommendations,
    financialHealthScore,
    creditworthinessScore
  };
}

// Detect suspicious/fraudulent patterns
export interface FraudAlert {
  alertType: string;
  type: string; // Added for compatibility
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  affectedTransactions: string[]; // Transaction IDs
}

export interface FraudAnalysisResult {
  alerts: FraudAlert[];
  fraudScore: number;
  fraudLevel: 'Low' | 'Medium' | 'High';
}

/**
 * Detects fraudulent patterns in transaction history
 * @param transactions Array of categorized transactions to analyze
 * @returns FraudAnalysisResult with alerts, fraudScore and fraudLevel
 * @internal Helper function for fraud detection analysis
 */
export function detectFraudPatterns(transactions: CategorizedTransaction[]): FraudAnalysisResult {
  const alerts: FraudAlert[] = [];

  // 1. Check for duplicate transactions (potential fraud)
  const transactionMap = new Map<string, CategorizedTransaction[]>();

  transactions.forEach(tx => {
    const key = `${tx.date}-${tx.description}-${tx.debit || tx.credit}`;
    if (!transactionMap.has(key)) {
      transactionMap.set(key, []);
    }
    transactionMap.get(key)!.push(tx);
  });

  transactionMap.forEach((txList) => {
    if (txList.length > 1) {
      alerts.push({
        alertType: 'Duplicate Transactions',
        type: 'Duplicate Transactions',
        severity: 'Medium',
        description: `${txList.length} identical transactions found on same date`,
        affectedTransactions: txList.map(tx => tx.job_id)
      });
    }
  });

  // 2. Check for round number transactions (potential fraud)
  const roundNumberTxs = transactions.filter(tx => {
    const amount = tx.debit || tx.credit || 0;
    return amount >= 1000 && amount % 1000 === 0;
  });

  if (roundNumberTxs.length > 10) {
    alerts.push({
      alertType: 'Excessive Round Number Transactions',
      type: 'Excessive Round Number Transactions',
      severity: 'Low',
      description: `${roundNumberTxs.length} transactions with round numbers (e.g., ₹10,000) - unusual pattern`,
      affectedTransactions: roundNumberTxs.map(tx => tx.job_id).slice(0, 5)
    });
  }

  // 3. Check for rapid consecutive transactions
  const sortedTxs = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let rapidCount = 0;
  for (let i = 1; i < sortedTxs.length; i++) {
    const timeDiff = new Date(sortedTxs[i].date).getTime() -
                     new Date(sortedTxs[i-1].date).getTime();
    if (timeDiff < 60000) { // Less than 1 minute apart
      rapidCount++;
    }
  }

  if (rapidCount > 5) {
    alerts.push({
      alertType: 'Rapid Sequential Transactions',
      type: 'Rapid Sequential Transactions',
      severity: 'Medium',
      description: `${rapidCount} transactions occurring within minutes - potential fraud`,
      affectedTransactions: []
    });
  }

  // Calculate fraud score based on alerts
  const fraudScore = alerts.reduce((score, alert) => {
    if (alert.severity === 'High') return score + 30;
    if (alert.severity === 'Medium') return score + 20;
    return score + 10;
  }, 0);

  const fraudLevel: 'Low' | 'Medium' | 'High' =
    fraudScore >= 60 ? 'High' : fraudScore >= 30 ? 'Medium' : 'Low';

  return {
    alerts,
    fraudScore: Math.min(fraudScore, 100),
    fraudLevel
  };
}

/**
 * Detects cheque return transactions in the transaction list
 * @param transactions Array of transactions to analyze
 * @returns Array of detected cheque returns
 */
export function detectChequeReturns(transactions: Transaction[]): ChequeReturn[] {
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

/**
 * Analyzes cashflow patterns from transactions
 * @param transactions Array of transactions to analyze
 * @returns CashflowAnalysis object with monthly trends and metrics
 */
export function analyzeCashflow(transactions: Transaction[]): CashflowAnalysis {
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
