/**
 * Advanced Fraud Detection Engine
 * Detects statement tampering, income manipulation, and forgery
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

export interface BalanceContinuityCheck {
  passed: boolean;
  mismatches: Array<{
    date: string;
    expectedBalance: number;
    actualBalance: number;
    difference: number;
  }>;
}

export interface CircularTransaction {
  outgoingDate: string;
  incomingDate: string;
  amount: number;
  description: string;
  daysBetween: number;
}

export interface TemporaryCredit {
  creditDate: string;
  creditAmount: number;
  debitDate: string;
  debitAmount: number;
  hoursBetween: number;
  description: string;
}

export interface LoanStackingIndicator {
  nbfcName: string;
  transactionDate: string;
  amount: number;
  type: 'disbursement' | 'emi';
}

export interface FraudEvidence {
  category: 'Statement Tampering' | 'Income Manipulation' | 'High-Risk Activity' | 'Forgery';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  finding: string;
  details: string;
  impact: string;
}

export interface AdvancedFraudAnalysis {
  // Statement Tampering
  balanceContinuityCheck: BalanceContinuityCheck;
  calculationErrors: number;
  transactionGaps: string[]; // Missing date ranges

  // Income Manipulation
  circularTransactions: CircularTransaction[];
  cashInflationDetected: boolean;
  cashDepositRatio: number;
  temporaryCredits: TemporaryCredit[];
  friendsFamilyTransfers: number;

  // High-Risk Activities
  loanStackingDetected: boolean;
  nbfcLenders: LoanStackingIndicator[];
  paydayLoanUsage: boolean;
  p2pLendingDetected: boolean;
  cryptoTradingDetected: boolean;
  gamblingTransactions: Transaction[];

  // Overall Assessment
  fraudScore: number; // 0-100
  fraudLevel: 'No Risk' | 'Low' | 'Medium' | 'High' | 'Confirmed Fraud';
  fraudEvidences: FraudEvidence[];

  // Recommendations
  recommendations: string[];
  requiresManualReview: boolean;
}

// NBFC and lending app databases
const NBFC_LENDERS = [
  'bajaj finserv', 'bajaj finance', 'fullerton', 'tata capital', 'mahindra finance',
  'cholamandalam', 'shriram', 'muthoot', 'manappuram', 'iifl', 'indiabulls',
  'aditya birla', 'hero fincorp', 'l&t finance', 'pnb housing', 'lic housing'
];

const PAYDAY_LOAN_APPS = [
  'moneytap', 'earlysalary', 'paysense', 'cashe', 'kissht', 'zestmoney',
  'lazypay', 'simpl', 'flexsalary', 'salary advance', 'creditt', 'instacred'
];

const P2P_LENDING = [
  'lendenclub', 'faircent', 'i2ifunding', 'lendbox', '12%club', 'indialends'
];

const CRYPTO_EXCHANGES = [
  'wazirx', 'coinswitch', 'coindcx', 'binance', 'zebpay', 'unocoin',
  'buyucoin', 'bitbns', 'koinex'
];

/**
 * Check balance continuity (each transaction should correctly update balance)
 */
function checkBalanceContinuity(transactions: Transaction[]): BalanceContinuityCheck {
  const mismatches: BalanceContinuityCheck['mismatches'] = [];

  for (let i = 1; i < transactions.length; i++) {
    const prev = transactions[i - 1];
    const current = transactions[i];

    // Calculate expected balance
    let expectedBalance = prev.balance || 0;

    if (getTransactionType(current) === 'credit') {
      expectedBalance += getTransactionAmount(current);
    } else {
      expectedBalance -= getTransactionAmount(current);
    }

    const actualBalance = current.balance || 0;
    const difference = Math.abs(actualBalance - expectedBalance);

    // Allow 1 rupee difference for rounding
    if (difference > 1) {
      mismatches.push({
        date: current.date,
        expectedBalance,
        actualBalance,
        difference
      });
    }
  }

  return {
    passed: mismatches.length === 0,
    mismatches
  };
}

/**
 * Detect missing dates (transaction gaps)
 */
function detectTransactionGaps(transactions: Transaction[]): string[] {
  const gaps: string[] = [];

  for (let i = 1; i < transactions.length; i++) {
    const prevDate = new Date(transactions[i - 1].date);
    const currentDate = new Date(transactions[i].date);

    const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    // If gap > 10 days, flag it
    if (daysDiff > 10) {
      gaps.push(`${transactions[i - 1].date} to ${transactions[i].date} (${Math.floor(daysDiff)} days)`);
    }
  }

  return gaps;
}

/**
 * Detect circular transactions (money going out and coming back)
 */
function detectCircularTransactions(transactions: Transaction[]): CircularTransaction[] {
  const circular: CircularTransaction[] = [];

  for (let i = 0; i < transactions.length - 1; i++) {
    const debit = transactions[i];
    if (getTransactionType(debit) !== 'debit' || getTransactionAmount(debit) < 5000) continue;

    // Look for matching credit within 15 days
    for (let j = i + 1; j < transactions.length && j < i + 30; j++) {
      const credit = transactions[j];
      if (getTransactionType(credit) !== 'credit') continue;

      const daysBetween = (new Date(credit.date).getTime() - new Date(debit.date).getTime()) / (1000 * 60 * 60 * 24);
      const amountDiff = Math.abs(getTransactionAmount(credit) - getTransactionAmount(debit));

      // If similar amount comes back within 15 days
      if (daysBetween <= 15 && amountDiff < 500) {
        circular.push({
          outgoingDate: debit.date,
          incomingDate: credit.date,
          amount: getTransactionAmount(debit),
          description: `${debit.description} → ${credit.description}`,
          daysBetween: Math.floor(daysBetween)
        });
        break;
      }
    }
  }

  return circular;
}

/**
 * Detect temporary credits (inflating balance before loan application)
 */
function detectTemporaryCredits(transactions: Transaction[]): TemporaryCredit[] {
  const temporary: TemporaryCredit[] = [];

  for (let i = 0; i < transactions.length - 1; i++) {
    const credit = transactions[i];
    if (getTransactionType(credit) !== 'credit' || getTransactionAmount(credit) < 20000) continue;

    // Check if withdrawn within 72 hours
    for (let j = i + 1; j < transactions.length && j < i + 5; j++) {
      const debit = transactions[j];
      if (getTransactionType(debit) !== 'debit') continue;

      const hoursBetween = (new Date(debit.date).getTime() - new Date(credit.date).getTime()) / (1000 * 60 * 60);
      const amountDiff = Math.abs(getTransactionAmount(debit) - getTransactionAmount(credit));

      if (hoursBetween <= 72 && amountDiff < 1000) {
        temporary.push({
          creditDate: credit.date,
          creditAmount: getTransactionAmount(credit),
          debitDate: debit.date,
          debitAmount: getTransactionAmount(debit),
          hoursBetween: Math.floor(hoursBetween),
          description: `₹${getTransactionAmount(credit).toLocaleString()} in → out in ${Math.floor(hoursBetween)}hrs`
        });
        break;
      }
    }
  }

  return temporary;
}

/**
 * Calculate cash deposit ratio
 */
function calculateCashDepositRatio(transactions: Transaction[]): number {
  const cashKeywords = ['cash dep', 'cash deposit', 'cdn', 'cash cr', 'atm dep'];

  const cashDeposits = transactions.filter(t => {
    if (getTransactionType(t) !== 'credit') return false;
    const desc = t.description.toLowerCase();
    return cashKeywords.some(k => desc.includes(k));
  });

  const totalCredits = transactions.filter(t => getTransactionType(t) === 'credit').reduce((sum, t) => sum + getTransactionAmount(t), 0);
  const totalCash = cashDeposits.reduce((sum, t) => sum + getTransactionAmount(t), 0);

  return totalCredits > 0 ? (totalCash / totalCredits) * 100 : 0;
}

/**
 * Detect friends/family transfers (UPI, IMPS to individuals)
 */
function detectFriendsFamilyTransfers(transactions: Transaction[]): number {
  const keywords = ['upi', 'imps', 'neft', 'google pay', 'phonepe', 'paytm'];

  return transactions.filter(t => {
    if (getTransactionType(t) !== 'credit') return false;
    const desc = t.description.toLowerCase();

    // Check if it's a person-to-person transfer
    const isP2P = keywords.some(k => desc.includes(k));
    const notSalary = !desc.includes('salary');
    const notBusiness = !desc.includes('pvt') && !desc.includes('ltd') && !desc.includes('company');

    return isP2P && notSalary && notBusiness;
  }).length;
}

/**
 * Detect loan stacking (multiple NBFC loans)
 */
function detectLoanStacking(transactions: Transaction[]): {
  detected: boolean;
  lenders: LoanStackingIndicator[];
} {
  const lenders: LoanStackingIndicator[] = [];

  transactions.forEach(t => {
    const desc = t.description.toLowerCase();

    // Check for NBFC names
    for (const nbfc of NBFC_LENDERS) {
      if (desc.includes(nbfc)) {
        // Detect if it's disbursement or EMI
        const isDisbursement = getTransactionType(t) === 'credit' && getTransactionAmount(t) > 10000;
        const isEMI = getTransactionType(t) === 'debit' && (desc.includes('emi') || desc.includes('loan'));

        if (isDisbursement || isEMI) {
          lenders.push({
            nbfcName: nbfc.toUpperCase(),
            transactionDate: t.date,
            amount: getTransactionAmount(t),
            type: isDisbursement ? 'disbursement' : 'emi'
          });
        }
      }
    }
  });

  // If multiple disbursements within 60 days, it's loan stacking
  const disbursements = lenders.filter(l => l.type === 'disbursement');
  const detected = disbursements.length > 1;

  return { detected, lenders };
}

/**
 * Detect payday loan usage
 */
function detectPaydayLoans(transactions: Transaction[]): boolean {
  return transactions.some(t => {
    const desc = t.description.toLowerCase();
    return PAYDAY_LOAN_APPS.some(app => desc.includes(app));
  });
}

/**
 * Detect P2P lending
 */
function detectP2PLending(transactions: Transaction[]): boolean {
  return transactions.some(t => {
    const desc = t.description.toLowerCase();
    return P2P_LENDING.some(platform => desc.includes(platform));
  });
}

/**
 * Detect crypto trading
 */
function detectCryptoTrading(transactions: Transaction[]): boolean {
  return transactions.some(t => {
    const desc = t.description.toLowerCase();
    return CRYPTO_EXCHANGES.some(exchange => desc.includes(exchange)) ||
           desc.includes('crypto') || desc.includes('bitcoin') || desc.includes('btc');
  });
}

/**
 * Detect gambling transactions
 */
function detectGambling(transactions: Transaction[]): Transaction[] {
  const gamblingKeywords = [
    'bet', 'betting', 'casino', 'gamble', 'gambling', 'lottery', 'rummy',
    'poker', 'fantasy', 'dream11', 'my11circle', 'betway', 'bet365'
  ];

  return transactions.filter(t => {
    const desc = t.description.toLowerCase();
    return gamblingKeywords.some(keyword => desc.includes(keyword));
  });
}

/**
 * Generate fraud evidence
 */
function generateFraudEvidences(analysis: Partial<AdvancedFraudAnalysis>): FraudEvidence[] {
  const evidences: FraudEvidence[] = [];

  // Balance mismatches
  if (analysis.balanceContinuityCheck && !analysis.balanceContinuityCheck.passed) {
    evidences.push({
      category: 'Statement Tampering',
      severity: 'Critical',
      finding: `${analysis.balanceContinuityCheck.mismatches.length} balance calculation error(s) detected`,
      details: 'Running balance does not match transaction flow. Statement may be tampered.',
      impact: 'HIGH - Statement authenticity questionable'
    });
  }

  // Circular transactions
  if (analysis.circularTransactions && analysis.circularTransactions.length > 0) {
    evidences.push({
      category: 'Income Manipulation',
      severity: 'High',
      finding: `${analysis.circularTransactions.length} circular transaction pattern(s)`,
      details: 'Money transferred out and returned within short period - potential income inflation.',
      impact: 'HIGH - Income may be artificially inflated'
    });
  }

  // Temporary credits
  if (analysis.temporaryCredits && analysis.temporaryCredits.length > 0) {
    evidences.push({
      category: 'Income Manipulation',
      severity: 'Critical',
      finding: `${analysis.temporaryCredits.length} temporary credit(s) detected`,
      details: 'Large amounts credited and immediately withdrawn - balance manipulation.',
      impact: 'CRITICAL - Applicant may be hiding true financial position'
    });
  }

  // High cash deposits
  if (analysis.cashDepositRatio && analysis.cashDepositRatio > 30) {
    evidences.push({
      category: 'Income Manipulation',
      severity: 'High',
      finding: `High cash deposit ratio: ${analysis.cashDepositRatio.toFixed(1)}%`,
      details: 'Excessive cash deposits can indicate undocumented income or money laundering.',
      impact: 'HIGH - Income source verification required'
    });
  }

  // Loan stacking
  if (analysis.loanStackingDetected) {
    evidences.push({
      category: 'High-Risk Activity',
      severity: 'Critical',
      finding: 'Loan stacking detected - multiple NBFC loans',
      details: `${analysis.nbfcLenders?.length} different lenders identified. Applicant is over-leveraged.`,
      impact: 'CRITICAL - High default risk, already heavily indebted'
    });
  }

  // Payday loans
  if (analysis.paydayLoanUsage) {
    evidences.push({
      category: 'High-Risk Activity',
      severity: 'High',
      finding: 'Payday loan app usage detected',
      details: 'Applicant uses high-interest short-term lending apps - financial distress indicator.',
      impact: 'HIGH - Borrower in financial stress'
    });
  }

  // Gambling
  if (analysis.gamblingTransactions && analysis.gamblingTransactions.length > 0) {
    evidences.push({
      category: 'High-Risk Activity',
      severity: 'Critical',
      finding: `${analysis.gamblingTransactions.length} gambling transaction(s)`,
      details: 'Gambling activity detected - high-risk behavior for lending.',
      impact: 'CRITICAL - Gambling negatively impacts creditworthiness'
    });
  }

  // Crypto trading
  if (analysis.cryptoTradingDetected) {
    evidences.push({
      category: 'High-Risk Activity',
      severity: 'Medium',
      finding: 'Cryptocurrency trading detected',
      details: 'High-volatility investment activity - income stability concern.',
      impact: 'MEDIUM - Income volatility risk'
    });
  }

  return evidences;
}

/**
 * Main Advanced Fraud Detection Function
 */
export function detectAdvancedFraud(transactions: Transaction[]): AdvancedFraudAnalysis {
  // Statement Tampering Checks
  const balanceContinuityCheck = checkBalanceContinuity(transactions);
  const transactionGaps = detectTransactionGaps(transactions);
  const calculationErrors = balanceContinuityCheck.mismatches.length;

  // Income Manipulation Checks
  const circularTransactions = detectCircularTransactions(transactions);
  const temporaryCredits = detectTemporaryCredits(transactions);
  const cashDepositRatio = calculateCashDepositRatio(transactions);
  const cashInflationDetected = cashDepositRatio > 30;
  const friendsFamilyTransfers = detectFriendsFamilyTransfers(transactions);

  // High-Risk Activity Checks
  const { detected: loanStackingDetected, lenders: nbfcLenders } = detectLoanStacking(transactions);
  const paydayLoanUsage = detectPaydayLoans(transactions);
  const p2pLendingDetected = detectP2PLending(transactions);
  const cryptoTradingDetected = detectCryptoTrading(transactions);
  const gamblingTransactions = detectGambling(transactions);

  // Calculate Fraud Score
  let fraudScore = 0;

  if (!balanceContinuityCheck.passed) fraudScore += 35;
  if (circularTransactions.length > 0) fraudScore += circularTransactions.length * 10;
  if (temporaryCredits.length > 0) fraudScore += temporaryCredits.length * 15;
  if (cashInflationDetected) fraudScore += 20;
  if (loanStackingDetected) fraudScore += 30;
  if (paydayLoanUsage) fraudScore += 25;
  if (gamblingTransactions.length > 0) fraudScore += 30;
  if (cryptoTradingDetected) fraudScore += 10;

  fraudScore = Math.min(100, fraudScore);

  // Determine Fraud Level
  let fraudLevel: AdvancedFraudAnalysis['fraudLevel'];
  if (fraudScore < 20) fraudLevel = 'No Risk';
  else if (fraudScore < 40) fraudLevel = 'Low';
  else if (fraudScore < 60) fraudLevel = 'Medium';
  else if (fraudScore < 80) fraudLevel = 'High';
  else fraudLevel = 'Confirmed Fraud';

  // Generate evidences
  const fraudEvidences = generateFraudEvidences({
    balanceContinuityCheck,
    circularTransactions,
    temporaryCredits,
    cashDepositRatio,
    loanStackingDetected,
    nbfcLenders,
    paydayLoanUsage,
    gamblingTransactions,
    cryptoTradingDetected
  });

  // Recommendations
  const recommendations: string[] = [];
  const requiresManualReview = fraudScore > 40;

  if (fraudLevel === 'No Risk') {
    recommendations.push('✓ No fraud indicators detected. Statement appears authentic.');
  } else if (fraudLevel === 'Low') {
    recommendations.push('Minor concerns detected. Proceed with standard verification.');
  } else if (fraudLevel === 'Medium') {
    recommendations.push('⚠️ Multiple red flags detected. Enhanced due diligence recommended.');
    recommendations.push('Request additional documentation and verify income sources.');
  } else if (fraudLevel === 'High') {
    recommendations.push('🚨 Significant fraud indicators. Thorough investigation required.');
    recommendations.push('Consider rejecting application or requesting fresh statements.');
  } else {
    recommendations.push('⛔ CRITICAL: High probability of fraud detected.');
    recommendations.push('DO NOT PROCEED without comprehensive verification.');
    recommendations.push('Consider filing suspicious activity report if required.');
  }

  return {
    balanceContinuityCheck,
    calculationErrors,
    transactionGaps,

    circularTransactions,
    cashInflationDetected,
    cashDepositRatio: parseFloat(cashDepositRatio.toFixed(2)),
    temporaryCredits,
    friendsFamilyTransfers,

    loanStackingDetected,
    nbfcLenders,
    paydayLoanUsage,
    p2pLendingDetected,
    cryptoTradingDetected,
    gamblingTransactions,

    fraudScore,
    fraudLevel,
    fraudEvidences,

    recommendations,
    requiresManualReview
  };
}
