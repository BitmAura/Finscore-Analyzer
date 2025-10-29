/**
 * Banking Behavior Score (BBS) Calculator
 * Analyzes account age, balance behavior, and banking discipline
 */

import { Transaction } from '../parsing/transaction-parser';

// Helper to get transaction type
const getTransactionType = (t: Transaction): 'credit' | 'debit' => {
  return (t.credit !== null && t.credit > 0) ? 'credit' : 'debit';
};

// Helper to get transaction amount
const getTransactionAmount = (t: Transaction): number => {
  return (t.credit !== null && t.credit > 0) ? t.credit : (t.debit || 0);
};

export interface AccountVintageAnalysis {
  firstTransactionDate: Date;
  lastTransactionDate: Date;
  accountAgeMonths: number;
  accountAgeStatus: 'New' | 'Regular' | 'Mature' | 'Legacy';
  meetsMinimumAge: boolean; // 6 months minimum for most loans
  minimumRequired: number; // 6 months
}

export interface BalanceBehavior {
  averageMonthlyBalance: number;
  minimumBalanceMaintained: boolean;
  daysWithZeroBalance: number;
  belowMinimumCount: number;
  balanceVolatility: number; // 0-100 (higher = more volatile)
  highestBalance: number;
  lowestBalance: number;
}

export interface TransactionPatterns {
  totalTransactions: number;
  averageTransactionsPerMonth: number;
  digitalTransactionRatio: number; // UPI/NEFT vs cash/cheque
  internationalTransactions: number;
  overdraftUsageCount: number;
  chequeUsage: number;
}

export interface FinancialDiscipline {
  insurancePremiumsPaid: boolean;
  sipInvestments: boolean;
  regularSavings: boolean;
  utilityPaymentsOnTime: boolean;
  emiPaymentsOnTime: boolean;
  disciplineScore: number; // 0-100
}

export interface BankingBehaviorScore {
  // Account Vintage
  accountVintage: AccountVintageAnalysis;

  // Balance Behavior
  balanceBehavior: BalanceBehavior;

  // Transaction Patterns
  transactionPatterns: TransactionPatterns;

  // Financial Discipline
  financialDiscipline: FinancialDiscipline;

  // Cheque Management
  inwardChequeReturns: number;
  outwardChequeReturns: number;
  chequeReturnCharges: number;

  // Overall Score
  behaviorScore: number; // 0-100
  behaviorRating: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor';

  // Insights
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

/**
 * Analyze account vintage
 */
function analyzeAccountVintage(transactions: Transaction[]): AccountVintageAnalysis {
  if (transactions.length === 0) {
    return {
      firstTransactionDate: new Date(),
      lastTransactionDate: new Date(),
      accountAgeMonths: 0,
      accountAgeStatus: 'New',
      meetsMinimumAge: false,
      minimumRequired: 6
    };
  }

  const firstTransactionDate = new Date(transactions[0].date);
  const lastTransactionDate = new Date(transactions[transactions.length - 1].date);

  const ageInDays = (lastTransactionDate.getTime() - firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24);
  const accountAgeMonths = Math.floor(ageInDays / 30);

  let accountAgeStatus: AccountVintageAnalysis['accountAgeStatus'];
  if (accountAgeMonths < 6) accountAgeStatus = 'New';
  else if (accountAgeMonths < 24) accountAgeStatus = 'Regular';
  else if (accountAgeMonths < 60) accountAgeStatus = 'Mature';
  else accountAgeStatus = 'Legacy';

  const meetsMinimumAge = accountAgeMonths >= 6;

  return {
    firstTransactionDate,
    lastTransactionDate,
    accountAgeMonths,
    accountAgeStatus,
    meetsMinimumAge,
    minimumRequired: 6
  };
}

/**
 * Analyze balance behavior
 */
function analyzeBalanceBehavior(transactions: Transaction[]): BalanceBehavior {
  if (transactions.length === 0) {
    return {
      averageMonthlyBalance: 0,
      minimumBalanceMaintained: false,
      daysWithZeroBalance: 0,
      belowMinimumCount: 0,
      balanceVolatility: 0,
      highestBalance: 0,
      lowestBalance: 0
    };
  }

  const balances = transactions.map(t => t.balance || 0);
  const totalBalance = balances.reduce((sum, b) => sum + b, 0);
  const averageMonthlyBalance = totalBalance / balances.length;

  // Assume minimum balance requirement of ₹10,000 for savings account
  const minimumBalanceRequired = 10000;
  const belowMinimumCount = balances.filter(b => b < minimumBalanceRequired).length;
  const minimumBalanceMaintained = (belowMinimumCount / balances.length) < 0.1; // Less than 10% below

  // Days with zero balance
  const daysWithZeroBalance = balances.filter(b => b === 0).length;

  // Balance volatility (standard deviation)
  const mean = averageMonthlyBalance;
  const squaredDiffs = balances.map(b => Math.pow(b - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / balances.length;
  const stdDev = Math.sqrt(variance);
  const balanceVolatility = Math.min(100, (stdDev / mean) * 100);

  const highestBalance = Math.max(...balances);
  const lowestBalance = Math.min(...balances);

  return {
    averageMonthlyBalance,
    minimumBalanceMaintained,
    daysWithZeroBalance,
    belowMinimumCount,
    balanceVolatility,
    highestBalance,
    lowestBalance
  };
}

/**
 * Analyze transaction patterns
 */
function analyzeTransactionPatterns(transactions: Transaction[]): TransactionPatterns {
  const totalTransactions = transactions.length;

  // Calculate average per month
  const firstDate = new Date(transactions[0]?.date || new Date());
  const lastDate = new Date(transactions[transactions.length - 1]?.date || new Date());
  const monthsCovered = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const averageTransactionsPerMonth = totalTransactions / monthsCovered;

  // Digital transaction ratio
  const digitalKeywords = ['upi', 'imps', 'neft', 'rtgs', 'google pay', 'phonepe', 'paytm', 'online'];
  const digitalTransactions = transactions.filter(t => {
    const desc = t.description.toLowerCase();
    return digitalKeywords.some(keyword => desc.includes(keyword));
  });
  const digitalTransactionRatio = (digitalTransactions.length / totalTransactions) * 100;

  // International transactions
  const internationalKeywords = ['intl', 'international', 'forex', 'usd', 'eur', 'gbp', 'aed'];
  const internationalTransactions = transactions.filter(t => {
    const desc = t.description.toLowerCase();
    return internationalKeywords.some(keyword => desc.includes(keyword));
  }).length;

  // Overdraft usage
  const overdraftTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes('od') ||
    t.description.toLowerCase().includes('overdraft')
  ).length;

  // Cheque usage
  const chequeKeywords = ['cheque', 'chq', 'check'];
  const chequeUsage = transactions.filter(t => {
    const desc = t.description.toLowerCase();
    return chequeKeywords.some(keyword => desc.includes(keyword));
  }).length;

  return {
    totalTransactions,
    averageTransactionsPerMonth,
    digitalTransactionRatio,
    internationalTransactions,
    overdraftUsageCount: overdraftTransactions,
    chequeUsage
  };
}

/**
 * Analyze financial discipline
 */
function analyzeFinancialDiscipline(transactions: Transaction[]): FinancialDiscipline {
  // Insurance premiums
  const insuranceKeywords = ['lic', 'insurance', 'icici pru', 'hdfc life', 'sbi life', 'policy premium'];
  const insurancePremiumsPaid = transactions.some(t => {
    const desc = t.description.toLowerCase();
    return getTransactionType(t) === 'debit' && insuranceKeywords.some(keyword => desc.includes(keyword));
  });

  // SIP investments
  const sipKeywords = ['sip', 'mutual fund', 'mf', 'systematic investment'];
  const sipInvestments = transactions.some(t => {
    const desc = t.description.toLowerCase();
    return getTransactionType(t) === 'debit' && sipKeywords.some(keyword => desc.includes(keyword));
  });

  // Regular savings (recurring deposits)
  const savingsKeywords = ['rd', 'recurring deposit', 'savings plan'];
  const regularSavings = transactions.some(t => {
    const desc = t.description.toLowerCase();
    return getTransactionType(t) === 'debit' && savingsKeywords.some(keyword => desc.includes(keyword));
  });

  // Utility payments on time (no late payment charges)
  const latePaymentKeywords = ['late fee', 'late payment', 'overdue', 'penalty'];
  const utilityPaymentsOnTime = !transactions.some(t => {
    const desc = t.description.toLowerCase();
    return latePaymentKeywords.some(keyword => desc.includes(keyword));
  });

  // EMI payments on time (no EMI bounce)
  const emiBounceKeywords = ['emi return', 'emi bounce', 'loan emi returned'];
  const emiPaymentsOnTime = !transactions.some(t => {
    const desc = t.description.toLowerCase();
    return emiBounceKeywords.some(keyword => desc.includes(keyword));
  });

  // Calculate discipline score
  let disciplineScore = 0;
  if (insurancePremiumsPaid) disciplineScore += 25;
  if (sipInvestments) disciplineScore += 25;
  if (regularSavings) disciplineScore += 20;
  if (utilityPaymentsOnTime) disciplineScore += 15;
  if (emiPaymentsOnTime) disciplineScore += 15;

  return {
    insurancePremiumsPaid,
    sipInvestments,
    regularSavings,
    utilityPaymentsOnTime,
    emiPaymentsOnTime,
    disciplineScore
  };
}

/**
 * Detect cheque returns
 */
function detectChequeReturns(transactions: Transaction[]): {
  inward: number;
  outward: number;
  charges: number;
} {
  const inwardKeywords = ['cheque return inward', 'inward chq return', 'deposited cheque returned'];
  const outwardKeywords = ['cheque return outward', 'outward chq return', 'issued cheque returned', 'chq bounce'];
  const chargeKeywords = ['cheque return charges', 'chq return charge', 'bounce charges'];

  const inwardReturns = transactions.filter(t => {
    const desc = t.description.toLowerCase();
    return inwardKeywords.some(keyword => desc.includes(keyword));
  }).length;

  const outwardReturns = transactions.filter(t => {
    const desc = t.description.toLowerCase();
    return outwardKeywords.some(keyword => desc.includes(keyword));
  }).length;

  const chargeTransactions = transactions.filter(t => {
    const desc = t.description.toLowerCase();
    return getTransactionType(t) === 'debit' && chargeKeywords.some(keyword => desc.includes(keyword));
  });

  const chequeReturnCharges = chargeTransactions.reduce((sum, t) => sum + getTransactionAmount(t), 0);

  return {
    inward: inwardReturns,
    outward: outwardReturns,
    charges: chequeReturnCharges
  };
}

/**
 * Main Banking Behavior Score Calculator
 */
export function calculateBankingBehaviorScore(transactions: Transaction[]): BankingBehaviorScore {
  // Analyze components
  const accountVintage = analyzeAccountVintage(transactions);
  const balanceBehavior = analyzeBalanceBehavior(transactions);
  const transactionPatterns = analyzeTransactionPatterns(transactions);
  const financialDiscipline = analyzeFinancialDiscipline(transactions);
  const chequeReturns = detectChequeReturns(transactions);

  // Calculate overall behavior score
  let behaviorScore = 0;

  // Account age (20 points)
  if (accountVintage.meetsMinimumAge) {
    if (accountVintage.accountAgeStatus === 'Legacy') behaviorScore += 20;
    else if (accountVintage.accountAgeStatus === 'Mature') behaviorScore += 18;
    else if (accountVintage.accountAgeStatus === 'Regular') behaviorScore += 15;
    else behaviorScore += 10;
  } else {
    behaviorScore += 5; // New account, minimal points
  }

  // Balance maintenance (25 points)
  if (balanceBehavior.minimumBalanceMaintained) behaviorScore += 15;
  if (balanceBehavior.daysWithZeroBalance === 0) behaviorScore += 10;
  else if (balanceBehavior.daysWithZeroBalance < 5) behaviorScore += 7;
  else if (balanceBehavior.daysWithZeroBalance < 10) behaviorScore += 4;

  // Balance volatility (lower is better)
  if (balanceBehavior.balanceVolatility < 30) behaviorScore += 0; // Already counted in maintenance

  // Transaction patterns (20 points)
  if (transactionPatterns.digitalTransactionRatio > 70) behaviorScore += 10;
  else if (transactionPatterns.digitalTransactionRatio > 40) behaviorScore += 7;
  else behaviorScore += 4;

  if (transactionPatterns.internationalTransactions > 0) behaviorScore += 5; // Shows financial stability
  if (transactionPatterns.averageTransactionsPerMonth > 10) behaviorScore += 5;

  // Financial discipline (30 points)
  behaviorScore += (financialDiscipline.disciplineScore * 0.3);

  // Cheque returns (penalties)
  if (chequeReturns.outward > 0) behaviorScore -= chequeReturns.outward * 10; // Heavy penalty
  if (chequeReturns.inward > 0) behaviorScore -= chequeReturns.inward * 5;

  // Overdraft usage (small penalty)
  if (transactionPatterns.overdraftUsageCount > 5) behaviorScore -= 5;

  behaviorScore = Math.max(0, Math.min(100, behaviorScore));

  // Determine rating
  let behaviorRating: BankingBehaviorScore['behaviorRating'];
  if (behaviorScore >= 80) behaviorRating = 'Excellent';
  else if (behaviorScore >= 65) behaviorRating = 'Good';
  else if (behaviorScore >= 50) behaviorRating = 'Average';
  else if (behaviorScore >= 30) behaviorRating = 'Poor';
  else behaviorRating = 'Very Poor';

  // Identify strengths
  const strengths: string[] = [];
  if (accountVintage.accountAgeStatus === 'Mature' || accountVintage.accountAgeStatus === 'Legacy') {
    strengths.push(`Long banking relationship (${accountVintage.accountAgeMonths} months)`);
  }
  if (balanceBehavior.minimumBalanceMaintained) {
    strengths.push('Consistent minimum balance maintenance');
  }
  if (transactionPatterns.digitalTransactionRatio > 70) {
    strengths.push('High digital payment adoption');
  }
  if (financialDiscipline.sipInvestments) {
    strengths.push('Regular investment discipline (SIP)');
  }
  if (financialDiscipline.insurancePremiumsPaid) {
    strengths.push('Insurance coverage maintained');
  }
  if (chequeReturns.outward === 0) {
    strengths.push('No cheque bounces - excellent payment discipline');
  }

  // Identify weaknesses
  const weaknesses: string[] = [];
  if (!accountVintage.meetsMinimumAge) {
    weaknesses.push(`Account too new (${accountVintage.accountAgeMonths} months, need 6+)`);
  }
  if (balanceBehavior.daysWithZeroBalance > 10) {
    weaknesses.push(`Frequent zero balance days (${balanceBehavior.daysWithZeroBalance} days)`);
  }
  if (!balanceBehavior.minimumBalanceMaintained) {
    weaknesses.push('Frequent below minimum balance occurrences');
  }
  if (chequeReturns.outward > 0) {
    weaknesses.push(`${chequeReturns.outward} cheque bounce(s) - CRITICAL ISSUE`);
  }
  if (transactionPatterns.digitalTransactionRatio < 30) {
    weaknesses.push('Low digital payment usage - high cash dependency');
  }
  if (!financialDiscipline.sipInvestments && !financialDiscipline.regularSavings) {
    weaknesses.push('No regular savings or investment discipline');
  }

  // Recommendations
  const recommendations: string[] = [];
  if (behaviorRating === 'Excellent') {
    recommendations.push('✓ Strong banking behavior profile - suitable for premium loan products');
  } else if (behaviorRating === 'Good') {
    recommendations.push('Good banking behavior - eligible for standard loan products');
  } else if (behaviorRating === 'Average') {
    recommendations.push('Average profile - may require additional security or co-applicant');
  } else {
    recommendations.push('⚠️ Weak banking behavior - high-risk profile for lending');
  }

  if (weaknesses.length > 0) {
    recommendations.push(`Address ${weaknesses.length} key weakness(es) to improve profile`);
  }

  return {
    accountVintage,
    balanceBehavior,
    transactionPatterns,
    financialDiscipline,
    inwardChequeReturns: chequeReturns.inward,
    outwardChequeReturns: chequeReturns.outward,
    chequeReturnCharges: chequeReturns.charges,
    behaviorScore: Math.round(behaviorScore),
    behaviorRating,
    strengths,
    weaknesses,
    recommendations
  };
}
