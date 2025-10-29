/**
 * FOIR (Fixed Obligation to Income Ratio) Analysis Service
 * Critical for loan underwriting - calculates debt serviceability
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

export interface ExistingLoan {
  loanType: 'home' | 'personal' | 'auto' | 'credit-card' | 'business' | 'education' | 'other';
  lenderName: string;
  monthlyEMI: number;
  detectedFrom: string; // Transaction description
  confidence: number; // 0-100
}

export interface FOIRAnalysis {
  // Income
  averageMonthlyIncome: number;
  salaryCredits: number[];
  otherIncome: number;
  totalMonthlyIncome: number;
  incomeCalculationMethod: string;
  
  // Obligations
  homeLoanEMI: number;
  personalLoanEMI: number;
  autoLoanEMI: number;
  creditCardPayments: number;
  otherEMIs: number;
  totalObligations: number;
  
  // FOIR Calculation
  foir: number; // Percentage
  foirStatus: 'Excellent' | 'Good' | 'Borderline' | 'High Risk' | 'Unacceptable';
  
  // Loan Eligibility
  maxEligibleEMI: number; // Based on FOIR < 50%
  maxLoanAmount: number; // Assuming 10-year tenure at 10% interest
  remainingCapacity: number;
  
  // Detailed Breakdown
  existingLoans: ExistingLoan[];
  
  // Recommendations
  recommendations: string[];
  warnings: string[];
  
  // Industry Standards
  industryStandardFOIR: number; // 50% for most loans
  borrowerStatus: string;
}

// FOIR Thresholds (Industry Standard)
const FOIR_THRESHOLDS = {
  EXCELLENT: 25, // FOIR < 25%
  GOOD: 40,      // FOIR 25-40%
  BORDERLINE: 50, // FOIR 40-50%
  HIGH_RISK: 60,  // FOIR 50-60%
  UNACCEPTABLE: 60 // FOIR > 60%
};

// Common EMI/Loan keywords
const LOAN_KEYWORDS: { [key: string]: { type: string; lenders: string[] } } = {
  home: {
    type: 'home',
    lenders: ['hdfc', 'icici', 'sbi', 'axis', 'kotak', 'lic housing', 'pnb housing', 'indiabulls', 'dewan housing']
  },
  personal: {
    type: 'personal',
    lenders: ['bajaj finserv', 'fullerton', 'tata capital', 'moneytap', 'earlysalary', 'paysense', 'cashe']
  },
  auto: {
    type: 'auto',
    lenders: ['hdfc bank auto', 'icici auto', 'sbi auto', 'mahindra finance', 'cholamandalam', 'shriram transport']
  },
  creditCard: {
    type: 'credit-card',
    lenders: ['credit card payment', 'cc payment', 'card payment', 'cc bill']
  },
  business: {
    type: 'business',
    lenders: ['business loan', 'working capital', 'msme loan', 'mudra']
  },
  education: {
    type: 'education',
    lenders: ['education loan', 'student loan', 'avanse', 'credila']
  }
};

/**
 * Detect salary credits from transactions
 */
function detectSalaryCredits(transactions: Transaction[]): number[] {
  const salaryKeywords = ['salary', 'sal cr', 'payroll', 'wages', 'remuneration', 'gross pay'];
  
  const salaryTransactions = transactions.filter(t => {
    if (getTransactionType(t) !== 'credit') return false;
    const desc = t.description.toLowerCase();
    return salaryKeywords.some(keyword => desc.includes(keyword));
  });
  
  // Sort by date and get amounts
  return salaryTransactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(t => getTransactionAmount(t));
}

/**
 * Detect EMI and loan payments
 */
function detectEMIPayments(transactions: Transaction[]): ExistingLoan[] {
  const emiKeywords = ['emi', 'loan', 'instalment', 'installment', 'repayment'];
  const loans: ExistingLoan[] = [];
  
  // Group transactions by description pattern
  const emiTransactions = transactions.filter(t => {
    if (getTransactionType(t) !== 'debit') return false;
    const desc = t.description.toLowerCase();
    return emiKeywords.some(keyword => desc.includes(keyword));
  });
  
  // Analyze each EMI transaction
  for (const transaction of emiTransactions) {
    const desc = transaction.description.toLowerCase();
    const amount = getTransactionAmount(transaction);

    // Detect loan type and lender
    let loanType: ExistingLoan['loanType'] = 'other';
    let lenderName = 'Unknown Lender';
    let confidence = 50;
    
    // Check for home loan
    if (desc.includes('home') || desc.includes('housing') || desc.includes('mortgage')) {
      loanType = 'home';
      confidence = 80;
      
      for (const lender of LOAN_KEYWORDS.home.lenders) {
        if (desc.includes(lender)) {
          lenderName = lender.toUpperCase();
          confidence = 95;
          break;
        }
      }
    }
    // Check for personal loan
    else if (desc.includes('personal')) {
      loanType = 'personal';
      confidence = 80;
      
      for (const lender of LOAN_KEYWORDS.personal.lenders) {
        if (desc.includes(lender)) {
          lenderName = lender.toUpperCase();
          confidence = 95;
          break;
        }
      }
    }
    // Check for auto loan
    else if (desc.includes('auto') || desc.includes('car') || desc.includes('vehicle')) {
      loanType = 'auto';
      confidence = 80;
      
      for (const lender of LOAN_KEYWORDS.auto.lenders) {
        if (desc.includes(lender)) {
          lenderName = lender.toUpperCase();
          confidence = 95;
          break;
        }
      }
    }
    // Check for credit card
    else if (desc.includes('credit card') || desc.includes('cc payment') || desc.includes('card payment')) {
      loanType = 'credit-card';
      confidence = 90;
      lenderName = 'Credit Card';
      
      // Extract bank name if present
      const banks = ['hdfc', 'icici', 'sbi', 'axis', 'citi', 'amex', 'standard chartered'];
      for (const bank of banks) {
        if (desc.includes(bank)) {
          lenderName = `${bank.toUpperCase()} Credit Card`;
          break;
        }
      }
    }
    
    // Add to loans array (avoid duplicates by checking if similar loan exists)
    const existingSimilar = loans.find(l => 
      l.loanType === loanType && 
      Math.abs(l.monthlyEMI - amount) < 100
    );
    
    if (!existingSimilar) {
      loans.push({
        loanType,
        lenderName,
        monthlyEMI: amount,
        detectedFrom: transaction.description,
        confidence
      });
    }
  }
  
  return loans;
}

/**
 * Calculate average monthly income
 */
function calculateAverageIncome(salaryCredits: number[]): number {
  if (salaryCredits.length === 0) return 0;
  
  // Use last 3-6 months
  const recentSalaries = salaryCredits.slice(-6);
  const sum = recentSalaries.reduce((acc, val) => acc + val, 0);
  return sum / recentSalaries.length;
}

/**
 * Detect other regular income sources
 */
function detectOtherIncome(transactions: Transaction[]): number {
  const incomeKeywords = ['rent received', 'dividend', 'interest credited', 'freelance', 'consulting fee', 'commission'];
  
  const incomeTransactions = transactions.filter(t => {
    if (getTransactionType(t) !== 'credit') return false;
    const desc = t.description.toLowerCase();
    
    // Exclude salary
    if (desc.includes('salary') || desc.includes('payroll')) return false;
    
    return incomeKeywords.some(keyword => desc.includes(keyword));
  });
  
  if (incomeTransactions.length === 0) return 0;
  
  // Calculate average monthly other income
  const totalMonths = 6;
  const totalOtherIncome = incomeTransactions.reduce((sum, t) => sum + getTransactionAmount(t), 0);
  return totalOtherIncome / totalMonths;
}

/**
 * Calculate max loan eligibility based on FOIR
 */
function calculateMaxLoanAmount(maxEligibleEMI: number, tenureMonths: number = 120, annualInterestRate: number = 10): number {
  // EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
  // Rearranging: P = EMI x [(1+R)^N-1] / [R x (1+R)^N]
  
  const monthlyRate = annualInterestRate / 12 / 100;
  const denominator = monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const numerator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  
  const principal = maxEligibleEMI * (numerator / denominator);
  return Math.floor(principal);
}

/**
 * Main FOIR Analysis Function
 */
export function calculateFOIR(transactions: Transaction[]): FOIRAnalysis {
  // Step 1: Detect Income
  const salaryCredits = detectSalaryCredits(transactions);
  const averageMonthlyIncome = calculateAverageIncome(salaryCredits);
  const otherIncome = detectOtherIncome(transactions);
  const totalMonthlyIncome = averageMonthlyIncome + otherIncome;
  
  // Step 2: Detect Existing Loans
  const existingLoans = detectEMIPayments(transactions);
  
  // Step 3: Calculate Total Obligations
  let homeLoanEMI = 0;
  let personalLoanEMI = 0;
  let autoLoanEMI = 0;
  let creditCardPayments = 0;
  let otherEMIs = 0;
  
  existingLoans.forEach(loan => {
    switch (loan.loanType) {
      case 'home':
        homeLoanEMI += loan.monthlyEMI;
        break;
      case 'personal':
        personalLoanEMI += loan.monthlyEMI;
        break;
      case 'auto':
        autoLoanEMI += loan.monthlyEMI;
        break;
      case 'credit-card':
        creditCardPayments += loan.monthlyEMI;
        break;
      default:
        otherEMIs += loan.monthlyEMI;
    }
  });
  
  const totalObligations = homeLoanEMI + personalLoanEMI + autoLoanEMI + creditCardPayments + otherEMIs;
  
  // Step 4: Calculate FOIR
  const foir = totalMonthlyIncome > 0 ? (totalObligations / totalMonthlyIncome) * 100 : 0;
  
  // Step 5: Determine FOIR Status
  let foirStatus: FOIRAnalysis['foirStatus'];
  if (foir < FOIR_THRESHOLDS.EXCELLENT) {
    foirStatus = 'Excellent';
  } else if (foir < FOIR_THRESHOLDS.GOOD) {
    foirStatus = 'Good';
  } else if (foir < FOIR_THRESHOLDS.BORDERLINE) {
    foirStatus = 'Borderline';
  } else if (foir < FOIR_THRESHOLDS.HIGH_RISK) {
    foirStatus = 'High Risk';
  } else {
    foirStatus = 'Unacceptable';
  }
  
  // Step 6: Calculate Loan Eligibility (assuming 50% FOIR limit)
  const maxEligibleEMI = Math.max(0, (totalMonthlyIncome * 0.50) - totalObligations);
  const maxLoanAmount = calculateMaxLoanAmount(maxEligibleEMI);
  const remainingCapacity = maxEligibleEMI;
  
  // Step 7: Generate Recommendations
  const recommendations: string[] = [];
  const warnings: string[] = [];
  
  if (foirStatus === 'Excellent') {
    recommendations.push('Excellent debt-to-income ratio. Strong borrowing capacity.');
    recommendations.push(`Can comfortably take additional loan with EMI up to ₹${maxEligibleEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month`);
  } else if (foirStatus === 'Good') {
    recommendations.push('Good debt serviceability. Moderate borrowing capacity available.');
    recommendations.push('Maintain current EMI payment discipline.');
  } else if (foirStatus === 'Borderline') {
    warnings.push('FOIR is at borderline levels. Limited additional borrowing capacity.');
    recommendations.push('Consider increasing income or reducing existing debt before taking new loan.');
  } else if (foirStatus === 'High Risk') {
    warnings.push('High debt burden detected. FOIR exceeds safe limits.');
    warnings.push('New loan approval may be difficult. Focus on debt reduction.');
  } else {
    warnings.push('⚠️ CRITICAL: FOIR exceeds acceptable limits for most lenders.');
    warnings.push('Immediate action required: Consider debt consolidation or income increase.');
    recommendations.push('Not recommended to take additional loans at this time.');
  }
  
  // Additional recommendations
  if (existingLoans.length > 3) {
    warnings.push(`Multiple loans detected (${existingLoans.length}). Consider consolidation.`);
  }
  
  if (creditCardPayments > totalMonthlyIncome * 0.10) {
    warnings.push('Credit card payments exceed 10% of income. High-cost debt detected.');
  }
  
  return {
    averageMonthlyIncome,
    salaryCredits,
    otherIncome,
    totalMonthlyIncome,
    incomeCalculationMethod: `Average of last ${salaryCredits.length} salary credits`,
    
    homeLoanEMI,
    personalLoanEMI,
    autoLoanEMI,
    creditCardPayments,
    otherEMIs,
    totalObligations,
    
    foir: parseFloat(foir.toFixed(2)),
    foirStatus,
    
    maxEligibleEMI: parseFloat(maxEligibleEMI.toFixed(2)),
    maxLoanAmount,
    remainingCapacity: parseFloat(remainingCapacity.toFixed(2)),
    
    existingLoans,
    
    recommendations,
    warnings,
    
    industryStandardFOIR: 50,
    borrowerStatus: foirStatus === 'Excellent' || foirStatus === 'Good' 
      ? 'Strong borrower profile' 
      : foirStatus === 'Borderline'
      ? 'Moderate risk borrower'
      : 'High risk borrower'
  };
}
