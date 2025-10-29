/**
 * Income Verification Engine
 * Detects income manipulation, verifies consistency, and flags suspicious patterns
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

export interface SalaryCredit {
  date: Date;
  amount: number;
  description: string;
  dayOfMonth: number;
  employerName?: string;
}

export interface IncomeSource {
  type: 'salary' | 'business' | 'rental' | 'investment' | 'freelance' | 'other';
  description: string;
  monthlyAverage: number;
  frequency: 'regular' | 'irregular';
  percentage: number; // % of total income
}

export interface IncomeVerificationResult {
  // Salary Analysis (for salaried)
  isSalaried: boolean;
  employerName?: string;
  salaryAccount: boolean;
  salaryCredits: SalaryCredit[];
  averageSalary: number;
  salaryDay?: number; // Consistent day of month
  salaryConsistency: number; // 0-100 score
  salaryTrend: 'Increasing' | 'Stable' | 'Decreasing' | 'Irregular';
  
  // Income Breakdown
  incomeSources: IncomeSource[];
  totalMonthlyIncome: number;
  primaryIncomePercentage: number;
  incomeDiversificationScore: number; // 0-100
  
  // Verification
  declaredIncome?: number;
  bankDetectedIncome: number;
  incomeVariance?: number; // Percentage
  verificationStatus: 'Verified' | 'Mismatch' | 'Suspicious' | 'Needs Review';
  
  // Red Flags
  redFlags: string[];
  suspicionScore: number; // 0-100
  
  // Self-employed specific
  businessTransactionsCount?: number;
  cashDepositRatio?: number;
  
  // Recommendations
  recommendations: string[];
}

/**
 * Detect salary credits and extract employer name
 */
function detectSalaryCredits(transactions: Transaction[]): SalaryCredit[] {
  const salaryKeywords = [
    'salary', 'sal cr', 'sal credit', 'payroll', 'wages', 'remuneration', 
    'gross pay', 'net salary', 'monthly salary', 'sal-', 'salary credit'
  ];
  
  const salaryTransactions = transactions
    .filter(t => {
      if (getTransactionType(t) !== 'credit') return false;
      const desc = t.description.toLowerCase();
      return salaryKeywords.some(keyword => desc.includes(keyword));
    })
    .map(t => {
      const date = new Date(t.date);
      
      // Try to extract employer name
      let employerName: string | undefined;
      const desc = t.description;
      
      // Common patterns: "SAL FROM COMPANY NAME" or "COMPANY NAME SALARY"
      const salaryMatch = desc.match(/SAL(?:ARY)?\s+(?:FROM|CR|CREDIT)\s+([A-Z\s&]+)/i);
      if (salaryMatch) {
        employerName = salaryMatch[1].trim();
      } else {
        // Check if company name comes before salary
        const beforeSalary = desc.match(/([A-Z\s&]+)\s+SAL(?:ARY)?/i);
        if (beforeSalary) {
          employerName = beforeSalary[1].trim();
        }
      }
      
      return {
        date,
        amount: getTransactionAmount(t),
        description: t.description,
        dayOfMonth: date.getDate(),
        employerName
      };
    });
  
  return salaryTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculate salary consistency score
 */
function calculateSalaryConsistency(salaryCredits: SalaryCredit[]): {
  consistencyScore: number;
  salaryDay?: number;
  trend: 'Increasing' | 'Stable' | 'Decreasing' | 'Irregular';
} {
  if (salaryCredits.length < 2) {
    return { consistencyScore: 0, trend: 'Irregular' };
  }
  
  // Check day consistency (salary should come on similar dates)
  const days = salaryCredits.map(s => s.dayOfMonth);
  const dayVariance = calculateVariance(days);
  const dayConsistency = dayVariance < 5 ? 100 : dayVariance < 10 ? 70 : dayVariance < 15 ? 40 : 20;
  
  // Find most common salary day
  const dayFrequency: { [key: number]: number } = {};
  days.forEach(day => {
    dayFrequency[day] = (dayFrequency[day] || 0) + 1;
  });
  const salaryDay = parseInt(Object.keys(dayFrequency).reduce((a, b) => 
    dayFrequency[parseInt(a)] > dayFrequency[parseInt(b)] ? a : b
  ));
  
  // Check amount consistency
  const amounts = salaryCredits.map(s => s.amount);
  const avgAmount = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  const amountVariances = amounts.map(amt => Math.abs((amt - avgAmount) / avgAmount) * 100);
  const avgVariance = amountVariances.reduce((sum, val) => sum + val, 0) / amountVariances.length;
  
  const amountConsistency = avgVariance < 5 ? 100 : avgVariance < 10 ? 80 : avgVariance < 20 ? 60 : 30;
  
  // Determine trend
  let trend: 'Increasing' | 'Stable' | 'Decreasing' | 'Irregular';
  if (amounts.length >= 3) {
    const firstThird = amounts.slice(0, Math.floor(amounts.length / 3));
    const lastThird = amounts.slice(-Math.floor(amounts.length / 3));
    
    const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;
    
    const change = ((lastAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) trend = 'Increasing';
    else if (change < -10) trend = 'Decreasing';
    else if (avgVariance < 15) trend = 'Stable';
    else trend = 'Irregular';
  } else {
    trend = 'Irregular';
  }
  
  // Overall consistency score
  const consistencyScore = Math.round((dayConsistency * 0.4) + (amountConsistency * 0.6));
  
  return { consistencyScore, salaryDay, trend };
}

/**
 * Helper: Calculate variance
 */
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
  const squaredDiffs = numbers.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / numbers.length;
  return Math.sqrt(variance);
}

/**
 * Detect all income sources
 */
function detectIncomeSources(transactions: Transaction[]): IncomeSource[] {
  const sources: IncomeSource[] = [];
  
  // Salary
  const salaryKeywords = ['salary', 'payroll', 'wages'];
  const salaryTxns = transactions.filter(t => 
    getTransactionType(t) === 'credit' && salaryKeywords.some(k => t.description.toLowerCase().includes(k))
  );
  if (salaryTxns.length > 0) {
    const monthlyAvg = salaryTxns.reduce((sum, t) => sum + getTransactionAmount(t), 0) / 6; // Assume 6 months
    sources.push({
      type: 'salary',
      description: 'Regular salary income',
      monthlyAverage: monthlyAvg,
      frequency: 'regular',
      percentage: 0 // Will calculate later
    });
  }
  
  // Rental income
  const rentalKeywords = ['rent received', 'rental income', 'rent cr'];
  const rentalTxns = transactions.filter(t => 
    getTransactionType(t) === 'credit' && rentalKeywords.some(k => t.description.toLowerCase().includes(k))
  );
  if (rentalTxns.length > 0) {
    const monthlyAvg = rentalTxns.reduce((sum, t) => sum + getTransactionAmount(t), 0) / 6;
    sources.push({
      type: 'rental',
      description: 'Rental income',
      monthlyAverage: monthlyAvg,
      frequency: 'regular',
      percentage: 0
    });
  }
  
  // Investment income
  const investmentKeywords = ['dividend', 'interest credited', 'mutual fund', 'capital gain'];
  const investmentTxns = transactions.filter(t => 
    getTransactionType(t) === 'credit' && investmentKeywords.some(k => t.description.toLowerCase().includes(k))
  );
  if (investmentTxns.length > 0) {
    const monthlyAvg = investmentTxns.reduce((sum, t) => sum + getTransactionAmount(t), 0) / 6;
    sources.push({
      type: 'investment',
      description: 'Investment returns',
      monthlyAverage: monthlyAvg,
      frequency: 'irregular',
      percentage: 0
    });
  }
  
  // Freelance/consulting
  const freelanceKeywords = ['freelance', 'consulting', 'professional fee', 'service charge'];
  const freelanceTxns = transactions.filter(t => 
    getTransactionType(t) === 'credit' && freelanceKeywords.some(k => t.description.toLowerCase().includes(k))
  );
  if (freelanceTxns.length > 0) {
    const monthlyAvg = freelanceTxns.reduce((sum, t) => sum + getTransactionAmount(t), 0) / 6;
    sources.push({
      type: 'freelance',
      description: 'Freelance/consulting income',
      monthlyAverage: monthlyAvg,
      frequency: 'irregular',
      percentage: 0
    });
  }
  
  // Calculate percentages
  const totalIncome = sources.reduce((sum, s) => sum + s.monthlyAverage, 0);
  sources.forEach(s => {
    s.percentage = (s.monthlyAverage / totalIncome) * 100;
  });
  
  return sources;
}

/**
 * Detect red flags for income manipulation
 */
function detectIncomeRedFlags(transactions: Transaction[], salaryCredits: SalaryCredit[]): {
  redFlags: string[];
  suspicionScore: number;
} {
  const redFlags: string[] = [];
  let suspicionScore = 0;
  
  // 1. Weekend salary credits (highly suspicious)
  const weekendSalaries = salaryCredits.filter(s => {
    const day = s.date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  });
  if (weekendSalaries.length > 0) {
    redFlags.push(`⚠️ ${weekendSalaries.length} salary credit(s) on weekend - highly unusual`);
    suspicionScore += 30;
  }
  
  // 2. Salary amount highly variable
  if (salaryCredits.length >= 3) {
    const amounts = salaryCredits.map(s => s.amount);
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    const variability = ((max - min) / min) * 100;
    
    if (variability > 30) {
      redFlags.push(`Salary varies by ${variability.toFixed(0)}% - potential income inflation`);
      suspicionScore += 20;
    }
  }
  
  // 3. Multiple salary credits in same month
  const monthlyCredits: { [key: string]: number } = {};
  salaryCredits.forEach(s => {
    const monthKey = `${s.date.getFullYear()}-${s.date.getMonth()}`;
    monthlyCredits[monthKey] = (monthlyCredits[monthKey] || 0) + 1;
  });
  
  const multipleInMonth = Object.values(monthlyCredits).some(count => count > 1);
  if (multipleInMonth) {
    redFlags.push('Multiple salary credits in same month detected');
    suspicionScore += 25;
  }
  
  // 4. High cash deposits (potential manipulation)
  const cashKeywords = ['cash dep', 'cash deposit', 'cdn', 'cash'];
  const cashDeposits = transactions.filter(t => 
    getTransactionType(t) === 'credit' && cashKeywords.some(k => t.description.toLowerCase().includes(k))
  );
  
  const totalCredits = transactions.filter(t => getTransactionType(t) === 'credit').reduce((sum, t) => sum + getTransactionAmount(t), 0);
  const totalCash = cashDeposits.reduce((sum, t) => sum + getTransactionAmount(t), 0);
  const cashRatio = (totalCash / totalCredits) * 100;
  
  if (cashRatio > 30) {
    redFlags.push(`High cash deposits detected (${cashRatio.toFixed(1)}% of credits) - potential income manipulation`);
    suspicionScore += 35;
  }
  
  // 5. Circular transactions (money out then back in)
  const circularTransactions = detectCircularTransactions(transactions);
  if (circularTransactions.length > 0) {
    redFlags.push(`${circularTransactions.length} circular transaction patterns detected - money moved out and back`);
    suspicionScore += 40;
  }
  
  // 6. Round number salaries (unusual)
  const roundNumberSalaries = salaryCredits.filter(s => s.amount % 10000 === 0);
  if (roundNumberSalaries.length > salaryCredits.length * 0.5) {
    redFlags.push('Frequent round number salaries - potentially fabricated');
    suspicionScore += 15;
  }
  
  // 7. Temporary credits (large credit followed by immediate debit)
  const temporaryCredits = detectTemporaryCredits(transactions);
  if (temporaryCredits.length > 0) {
    redFlags.push(`${temporaryCredits.length} temporary credit(s) detected - large credit followed by immediate withdrawal`);
    suspicionScore += 30;
  }
  
  return { redFlags, suspicionScore: Math.min(100, suspicionScore) };
}

/**
 * Detect circular transactions (amount goes out and comes back)
 */
function detectCircularTransactions(transactions: Transaction[]): Transaction[] {
  const circular: Transaction[] = [];
  
  for (let i = 0; i < transactions.length - 1; i++) {
    const current = transactions[i];
    if (getTransactionType(current) !== 'debit') continue;

    // Look for matching credit within 7 days
    for (let j = i + 1; j < transactions.length && j < i + 20; j++) {
      const next = transactions[j];
      if (getTransactionType(next) !== 'credit') continue;

      const daysDiff = Math.abs(new Date(next.date).getTime() - new Date(current.date).getTime()) / (1000 * 60 * 60 * 24);
      const amountDiff = Math.abs(getTransactionAmount(next) - getTransactionAmount(current));

      // If same amount returns within 7 days
      if (daysDiff <= 7 && amountDiff < 100) {
        circular.push(current);
        break;
      }
    }
  }
  
  return circular;
}

/**
 * Detect temporary credits (inflating balance temporarily)
 */
function detectTemporaryCredits(transactions: Transaction[]): Transaction[] {
  const temporary: Transaction[] = [];
  
  for (let i = 0; i < transactions.length - 1; i++) {
    const current = transactions[i];
    if (getTransactionType(current) !== 'credit' || getTransactionAmount(current) < 10000) continue;

    // Check if withdrawn within 3 days
    for (let j = i + 1; j < transactions.length && j < i + 10; j++) {
      const next = transactions[j];
      if (getTransactionType(next) !== 'debit') continue;

      const hoursDiff = (new Date(next.date).getTime() - new Date(current.date).getTime()) / (1000 * 60 * 60);
      const amountDiff = Math.abs(getTransactionAmount(next) - getTransactionAmount(current));

      if (hoursDiff <= 72 && amountDiff < 1000) {
        temporary.push(current);
        break;
      }
    }
  }
  
  return temporary;
}

/**
 * Main Income Verification Function
 */
export function verifyIncome(
  transactions: Transaction[], 
  declaredIncome?: number
): IncomeVerificationResult {
  
  // Detect salary credits
  const salaryCredits = detectSalaryCredits(transactions);
  const isSalaried = salaryCredits.length >= 2;
  
  // Calculate salary metrics
  const { consistencyScore, salaryDay, trend } = calculateSalaryConsistency(salaryCredits);
  
  const averageSalary = salaryCredits.length > 0
    ? salaryCredits.reduce((sum, s) => sum + s.amount, 0) / salaryCredits.length
    : 0;
  
  // Detect employer
  const employerNames = salaryCredits
    .map(s => s.employerName)
    .filter(name => name && name.length > 3);
  
  const employerName = employerNames.length > 0 ? employerNames[0] : undefined;
  
  // Check if salary account (regular salary credits)
  const salaryAccount = salaryCredits.length >= 3 && consistencyScore > 60;
  
  // Detect all income sources
  const incomeSources = detectIncomeSources(transactions);
  const totalMonthlyIncome = incomeSources.reduce((sum, s) => sum + s.monthlyAverage, 0);
  const primaryIncomePercentage = incomeSources.length > 0 
    ? Math.max(...incomeSources.map(s => s.percentage))
    : 0;
  
  // Income diversification (higher = more sources, lower risk)
  const incomeDiversificationScore = Math.min(100, incomeSources.length * 20 + (100 - primaryIncomePercentage));
  
  // Detect red flags
  const { redFlags, suspicionScore } = detectIncomeRedFlags(transactions, salaryCredits);
  
  // Verification status
  let verificationStatus: IncomeVerificationResult['verificationStatus'] = 'Verified';
  let incomeVariance: number | undefined;
  
  if (declaredIncome) {
    incomeVariance = ((totalMonthlyIncome - declaredIncome) / declaredIncome) * 100;
    
    if (Math.abs(incomeVariance) < 5) {
      verificationStatus = 'Verified';
    } else if (Math.abs(incomeVariance) < 15) {
      verificationStatus = 'Needs Review';
      redFlags.push(`Income variance: ${incomeVariance.toFixed(1)}% from declared amount`);
    } else {
      verificationStatus = 'Mismatch';
      redFlags.push(`⚠️ Significant mismatch: Bank shows ${incomeVariance > 0 ? 'higher' : 'lower'} income than declared`);
    }
  }
  
  if (suspicionScore > 50) {
    verificationStatus = 'Suspicious';
  }
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (isSalaried && salaryAccount && consistencyScore > 70) {
    recommendations.push('✓ Strong income verification - consistent salary credits detected');
  }
  
  if (!isSalaried) {
    recommendations.push('Self-employed detected - additional income proof required (ITR, GST)');
  }
  
  if (redFlags.length > 0) {
    recommendations.push('⚠️ Manual verification recommended due to red flags');
  }
  
  if (incomeSources.length > 2) {
    recommendations.push('Multiple income sources provide income stability');
  }
  
  return {
    isSalaried,
    employerName,
    salaryAccount,
    salaryCredits,
    averageSalary,
    salaryDay,
    salaryConsistency: consistencyScore,
    salaryTrend: trend,
    
    incomeSources,
    totalMonthlyIncome,
    primaryIncomePercentage,
    incomeDiversificationScore,
    
    declaredIncome,
    bankDetectedIncome: totalMonthlyIncome,
    incomeVariance,
    verificationStatus,
    
    redFlags,
    suspicionScore,
    
    recommendations
  };
}
